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
import cors from 'cors';

// File system
import fs from 'fs';
import path from 'path';

// Custom Modules
import config from '@/config';
import { logger } from '@/libs/winston';

// Database confiugration
import { connectToDatabase } from '@/libs/postgresql';

// GraphQL
import { userResolvers } from '@/graphql/resolvers/user.resolver';
import { productResolvers } from '@/graphql/resolvers/product.resolver';

export async function startServer() {
  const app = express();

  await connectToDatabase();

  app.use(express.json());

  const userTypeDefs = fs.readFileSync(
    path.join(__dirname, 'graphql/schemas/user.graphql'),
    'utf8',
  );

  const productTypeDefs = fs.readFileSync(
    path.join(__dirname, 'graphql/schemas/product.graphql'),
    'utf8',
  );

  const server = new ApolloServer({
    typeDefs: [userTypeDefs, productTypeDefs],
    resolvers: [userResolvers, productResolvers],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  app.listen(config.PORT, () => {
    logger.info(`Server is running on http://localhost:${config.PORT}/graphql`);
  });
}
