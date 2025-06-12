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

import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import path from 'path';

const typesArray = loadFilesSync(path.join(__dirname, './schemas'), {
  extensions: ['graphql'],
});

const resolverArray = loadFilesSync(path.join(__dirname, './resolvers'), {
  extensions: ['ts', 'js'],
  requireMethod: require,
  ignoreIndex: true,
});

const typeDefs = mergeTypeDefs(typesArray);

const resolvers = mergeResolvers(resolverArray);

export { typeDefs, resolvers };
