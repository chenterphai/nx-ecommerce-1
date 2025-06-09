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

// Node Modules
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

// Custom Modules
import config from '@/config';
import { logger } from '@/libs/winston';
import { connectToDatabase } from '@/libs/postgresql';
// import { schema } from '@/graphql';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { userResolvers } from '@/graphql/resolvers/user.resolver';
import { json } from 'body-parser';

export async function startServer() {
  const app = express();

  await connectToDatabase();

  app.use(express.json());

  const typeDefs = fs.readFileSync(
    path.join(__dirname, 'graphql/schemas/user.graphql'),
    'utf8',
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers: userResolvers,
  });
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  app.listen(config.PORT, () => {
    logger.info(`Server is running on port ${config.PORT}`);
  });
}
