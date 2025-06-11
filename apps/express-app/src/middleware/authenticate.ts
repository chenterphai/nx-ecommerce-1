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

import { verifyAccessToken } from '@/libs/jwt';
import { MyContext } from '@/types/context';
import { GraphQLError } from 'graphql';

interface AuthenticatedUser {
  userID: number;
  username: string;
}

export const authenticate = (context: MyContext): AuthenticatedUser => {
  const authHeader = context.req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new GraphQLError('Unauthorized: Missing Bearer token.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new GraphQLError('Unauthorized: Token not provided.');
  }

  try {
    const jwtPayload = verifyAccessToken(token) as AuthenticatedUser;
    context.req.userID = jwtPayload.userID;
    context.req.username = jwtPayload.username;
    return jwtPayload;
  } catch (error) {
    throw new GraphQLError('Unauthorized: Invalid or expired token.');
  }
};
