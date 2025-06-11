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
import { User } from '@/entities/User';
import { generateAccessToken, generateRefreshToken } from '@/libs/jwt';
import { AppDataSource } from '@/libs/postgresql';
import bcrypt from 'bcrypt';

export default {
  // Mutation: {
  //   login: async (
  //     _parent: unknown,
  //     { input }: { input: { email: string; password: string } },
  //     context: GraphQLContext,
  //   ) => {
  //     const { email, password } = input;
  //     const userRepository = AppDataSource.getRepository(User);
  //     const tokenRepository = AppDataSource.getRepository(Token);
  //     try {
  //       const user = await userRepository.findOneBy({ email });
  //       if (!user) {
  //         return {
  //           status: {
  //             code: 1,
  //             status: 'Not Found',
  //             msg: 'User Not Found',
  //           },
  //           error: 'User not found',
  //         };
  //       }
  //       // TODO: Check password match here with bcrypt.compare()
  //       const passwordMatch = await bcrypt.compare(password, user.password);
  //       if(!passwordMatch){
  //         return {
  //           status: {
  //             code: 1,
  //             status: 'Unauthorized',
  //             msg: 'Incorrect Password.'
  //           },
  //           error: 'Incorrect Password.'
  //         }
  //       }
  //       const accessToken = generateAccessToken(user.id, user.username);
  //       const refreshToken = generateRefreshToken(user.id, user.username);
  //       tokenRepository.create({token: refreshToken});
  //       context.res.cookie('refreshToken', refreshToken, {
  //         httpOnly: true,
  //         secure: config.NODE_ENV === 'production',
  //         sameSite: 'strict'
  //       });
  //     } catch (error) {}
  //   },
  // },
};
