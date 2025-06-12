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

import config from '@/config';
import { User } from '@/entities/User';
import { MyContext } from '@/types/context';
import { GraphQLError } from 'graphql';
import { Repository } from 'typeorm';

type AuthRole = 'admin' | 'user';

export const authorize = async (role: AuthRole[], context: MyContext) => {
  const userID = context.req.userID;
  const userRepository: Repository<User> =
    context.AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOneBy({ id: userID });
    if (!user) {
      throw new GraphQLError('User not found!');
    }

    if (!role.includes(user.role) && config.NODE_ENV === 'production') {
      throw new GraphQLError('Access Denied, Insufficient Permission.');
    }
  } catch (error) {
    throw new GraphQLError(`Error while authorizing: ${error}`);
  }
};
