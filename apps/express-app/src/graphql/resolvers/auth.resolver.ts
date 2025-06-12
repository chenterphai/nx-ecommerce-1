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
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/libs/jwt';
import { logger } from '@/libs/winston';
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

      const token = context.req.cookies.refreshToken;

      try {
        const tokenExists = await tokenRepository.findOneBy({ token });
        if (!tokenExists) {
          throw new GraphQLError('Unauthorized');
        }

        const jwtPayload = verifyRefreshToken(token) as {
          userID: number;
          username: string;
        };

        const accessToken = generateAccessToken(
          jwtPayload.userID,
          jwtPayload.username,
        );

        return { accessToken };
      } catch (error) {
        throw new GraphQLError(`Error while refreshing token: ${error}`);
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
            error: 'User not found',
          };
        }
        // TODO: Check password match here with bcrypt.compare()
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          throw new GraphQLError(`Incorrect Password!`, {
            extensions: {
              code: 'BAD REQUEST',
              http: { status: 400 },
            },
          });
        }
        const accessToken = generateAccessToken(user.id, user.username);
        const refreshToken = generateRefreshToken(user.id, user.username);
        await tokenRepository
          .create({ token: refreshToken, user: user })
          .save();
        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        logger.info('User login successfully.');

        return {
          user,
          accessToken,
        };
      } catch (error) {
        logger.error(`User failed while signin. ${error}`);
        throw new Error(`Error while signin: ${error}`);
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
      const roleRepository = context.AppDataSource.getRepository('Role');

      try {
        // Check if user already exist
        const existingUser = await userRepository.findOne({
          where: [{ username: username }, { email: email }],
        });
        if (existingUser) {
          throw new Error('Username or Email already in use.');
        }

        const hashedPassword = await bcrypt.hash(password, 0);

        const userData = {
          avatar: avatar ?? 'avatar-example',
          gender: gender ?? Gender.Other,
          nickname: nickname ?? username,
          role: role ?? Role.User,
          password: hashedPassword,
          creationtime: new Date(),
          updatetime: new Date(),
          username,
          email,
        };

        const newUser = userRepository.create(userData);

        await userRepository.save(newUser);

        const accessToken = generateAccessToken(newUser.id, newUser.username);

        const refreshToken = generateRefreshToken(newUser.id, newUser.username);
        tokenRepository.create({ token: refreshToken });
        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        logger.info('User registration successfully.');

        return {
          user: newUser,
          accessToken,
        };
      } catch (error) {
        throw new Error(`Error while signing up: ${error}`);
      }
    },
  },
};
