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

import { Gender, Role, User } from '@/entities/User';
import {
  checkUniqueField,
  isValidEmail,
  UpdateUserResponse,
  validateEnumField,
} from '@/libs/validation';
import { logger } from '@/libs/winston';
import { authenticate } from '@/middleware/authenticate';
import { MyContext } from '@/types/context';
import { GraphQLError } from 'graphql';
import { Repository } from 'typeorm';

export default {
  Query: {
    users: async () => await User.find(),
    user: async (_: any, args: any, context: MyContext) => {
      authenticate(context); // Authenticate Middleware

      const token = context.req.cookies.refreshToken;

      if (!token) {
        throw new GraphQLError('Unauthorized');
      }

      const userRepository: Repository<User> =
        context.AppDataSource.getRepository(User);

      try {
        const userId = context.req.userID;
        return await userRepository.findOneBy({ id: userId });
      } catch (err) {
        throw new GraphQLError(`Error: ${err}`);
      }
    },
  },
  Mutation: {
    updateUser: async (
      _parent: any,
      {
        input,
      }: {
        input: Partial<{
          username: string;
          email: string;
          nickname: string;
          avatar: string;
          role: Role;
          gender: Gender;
          dateofbirth: Date;
        }>;
      },
      context: MyContext,
    ): Promise<UpdateUserResponse> => {
      authenticate(context);
      const { avatar, dateofbirth, email, gender, nickname, role, username } =
        input;
      const userRepository: Repository<User> =
        context.AppDataSource.getRepository(User);

      try {
        // Check if Existing User
        const userId = context.req.userID;

        if (!userId) {
          // Added explicit check for userId after authentication
          logger.warn('Authentication failed: User ID not found in context.');
          return {
            code: 1,
            status: 'Unauthorized',
            msg: 'Authentication required or invalid token.',
          };
        }

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
          logger.warn('User not found!');
          return {
            code: 1,
            status: 'Not Found',
            msg: 'User not found!',
          };
        }

        if (username && username !== user.username) {
          // Only check if username is actually changing
          const usernameCheck = await checkUniqueField(
            userRepository,
            'username',
            username,
          );
          if (usernameCheck) return usernameCheck;
          user.username = username;
        }

        if (email && email !== user.email) {
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
          if (emailCheck) return emailCheck;
          user.email = email;
        }

        // Gender
        if (gender && gender !== user.gender) {
          // Only check if gender is actually changing
          const genderValidation = validateEnumField(Gender, gender, 'Gender');
          if (genderValidation) return genderValidation;
          user.gender = gender;
        }

        // Role
        if (role && role !== user.role) {
          // Only check if role is actually changing
          const roleValidation = validateEnumField(Role, role, 'Role');
          if (roleValidation) return roleValidation;
          user.role = role;
        }

        if (avatar) user.avatar = avatar;
        if (dateofbirth) user.dateofbirth = dateofbirth;
        if (nickname) user.nickname = nickname;

        await userRepository.save(user);

        logger.info(`User ID ${userId} updated successfully.`);

        return {
          code: 0,
          status: 'OK',
          msg: 'User updated successfully.',
        };
      } catch (error) {
        logger.error(`Error while updating user.`, error);
        return {
          code: 1,
          status: 'Internal Server Error',
          msg: 'Error while updating user.',
        };
      }
    },
  },
};
