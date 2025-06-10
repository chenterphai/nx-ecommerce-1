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

import { User } from '@/entities/User';

export default {
  Query: {
    users: async () => await User.find(),
    user: async (_: any, { id }: { id: number }) =>
      await User.findOneBy({ id }),
  },
  Mutation: {
    createUser: async (
      _: any,
      { username, email }: { username: string; email: string },
    ) => {
      const user = User.create({ username, email });
      return await user.save();
    },
    updateUser: async (
      _: any,
      {
        id,
        username,
        email,
      }: { id: number; username?: string; email?: string },
    ) => {
      const user = await User.findOneBy({ id });
      if (!user) throw new Error('User not found');
      if (username) user.username = username;
      if (email) user.email = email;
      return await user.save();
    },
    deleteUser: async (_: any, { id }: { id: number }) => {
      const result = await User.delete(id);
      return result.affected === 1;
    },
  },
};
