// Copyright 2025 chenterphai
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Types
import config from '@/config';
import { Token } from '@/entities/Token';
import { Gender, Role, User } from '@/entities/User';
import { parseAndAddDuration } from '@/libs/date-formatter';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/libs/jwt';
import {
  checkUniqueField,
  isValidEmail,
  validateEnumField,
} from '@/libs/validation';
import { logger } from '@/libs/winston';
import { authenticate } from '@/middleware/authenticate';
import { MyContext } from '@/types/context';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { Repository } from 'typeorm';

export default {
  Query: {
    refreshToken: async (
      _parent: unknown,
      args: any,
      context: MyContext,
    ): Promise<{ accessToken: string }> => {
      const tokenRepository: Repository<Token> =
        context.AppDataSource.getRepository(Token);

      try {
        const token = context.req.cookies.refreshToken;

        if (!token) {
          throw new GraphQLError('Refresh token is required.');
        }

        const tokenExists = await tokenRepository.findOneBy({ token });
        if (!tokenExists) {
          throw new GraphQLError('Unauthorized');
        }

        const jwtPayload = verifyRefreshToken(token) as {
          userID: number;
          username: string;
        };

        // Generate Access Token
        const accessToken = generateAccessToken(
          jwtPayload.userID,
          jwtPayload.username,
        );

        // Generate Refresh Token and Update in Database
        const refreshToken = generateRefreshToken(
          jwtPayload.userID,
          jwtPayload.username,
        );

        const expiresAt = parseAndAddDuration(config.REFRESH_TOKEN_EXPIRY);

        await tokenRepository.update(
          { token: token },
          { token: refreshToken, expiresAt },
        );

        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        return { accessToken };
      } catch (error) {
        throw new GraphQLError(`Error while refreshing token: ${error}`);
      }
    },

    logout: async (_parent: any, args: any, context: MyContext) => {
      authenticate(context); // Authenticate Middleware

      const tokenRepository: Repository<Token> =
        context.AppDataSource.getRepository(Token);

      try {
        const token = context.req.cookies.refreshToken;
        if (token) {
          await tokenRepository.delete({ token });
          logger.info(`User logged out successfully.`);
        }

        context.res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        return {
          code: 0,
          status: 'OK',
          msg: 'User logged out successfully.',
        };
      } catch (error) {
        throw new GraphQLError(`Error while logging out: ${error}`);
      }
    },
  },

  Mutation: {
    signin: async (
      _parent: unknown,
      { input }: { input: { email: string; password: string } },
      context: MyContext,
    ) => {
      const { email, password } = input;
      const userRepository = context.AppDataSource.getRepository(User);
      const tokenRepository = context.AppDataSource.getRepository(Token);
      try {
        const user = await userRepository.findOneBy({ email });
        if (!user) {
          return {
            status: {
              code: 1,
              status: 'Not Found',
              msg: 'User Not Found',
            },
          };
        }
        // TODO: Check password match here with bcrypt.compare()
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return {
            status: {
              code: 1,
              status: '400 Unauthorized',
              msg: 'Incorrect Password.',
            },
          };
        }
        const accessToken = generateAccessToken(user.id, user.username);
        const refreshToken = generateRefreshToken(user.id, user.username);
        const expiresAt = parseAndAddDuration(config.REFRESH_TOKEN_EXPIRY);
        await tokenRepository
          .create({ user: user, token: refreshToken, expiresAt })
          .save();
        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        logger.info('User login successfully.');

        return {
          status: {
            code: 0,
            status: 'OK',
            msg: 'User logged in successfully.',
          },
          content: {
            user,
            accessToken,
          },
        };
      } catch (error) {
        logger.error(`User failed while signin. ${error}`);
        return {
          status: {
            code: 1,
            status: 'Bad Request',
            msg: 'User already logged in!',
          },
        };
      }
    },

    signup: async (
      _parent: unknown,
      {
        input,
      }: {
        input: {
          username: string;
          email: string;
          password: string;
          role?: Role;
          nickname?: string;
          avatar?: string;
          gender?: Gender;
        };
      },
      context: MyContext,
    ) => {
      const { email, password, username, avatar, gender, nickname, role } =
        input;

      const userRepository: Repository<User> =
        context.AppDataSource.getRepository(User);
      const tokenRepository = context.AppDataSource.getRepository(Token);

      try {
        const hashedPassword = await bcrypt.hash(password, 0);

        const userData = {
          avatar: avatar ?? 'avatar-example',
          nickname: nickname ?? username,
          password: hashedPassword,
          creationtime: new Date(),
          updatetime: new Date(),
        } as Partial<{
          gender: Gender;
          role: Role;
          username: string;
          email: string;
        }>;

        if (username) {
          // Only check if username is actually changing
          const usernameCheck = await checkUniqueField(
            userRepository,
            'username',
            username,
          );
          if (usernameCheck) return { status: usernameCheck };
          userData.username = username;
        }

        if (email) {
          if (!isValidEmail(email)) {
            return {
              code: 1,
              status: 'Bad Request',
              msg: 'Invalid email format.',
            };
          }
          // Only check if email is actually changing
          const emailCheck = await checkUniqueField(
            userRepository,
            'email',
            email,
          );
          if (emailCheck) return { status: emailCheck };
          userData.email = email;
        }

        // Gender
        if (gender) {
          // Only check if gender is actually changing
          const genderValidation = validateEnumField(Gender, gender, 'Gender');
          if (genderValidation) return { status: genderValidation };
          userData.gender = gender;
        }

        // Role
        if (role) {
          // Only check if role is actually changing
          const roleValidation = validateEnumField(Role, role, 'Role');
          if (roleValidation) return { status: roleValidation };
          userData.role = role;
        }

        const newUser = userRepository.create(userData);

        await userRepository.save(newUser);

        const accessToken = generateAccessToken(newUser.id, newUser.username);

        const refreshToken = generateRefreshToken(newUser.id, newUser.username);
        const expiresAt = parseAndAddDuration(config.REFRESH_TOKEN_EXPIRY);

        await tokenRepository
          .create({ token: refreshToken, user: newUser, expiresAt })
          .save();
        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        logger.info('User registration successfully.');

        return {
          status: {
            code: 0,
            status: 'OK',
            msg: `User ${newUser.id} registration successfully.`,
          },
          content: {
            user: newUser,
            accessToken,
          },
        };
      } catch (error) {
        return {
          status: {
            code: 1,
            status: 'Internal Server Error',
            msg: `Error while signing up: ${error}`,
          },
        };
      }
    },
  },
};
