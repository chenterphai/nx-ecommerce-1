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
import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';

// Custom Modules
import config from '@/config';
import { logger } from '@/libs/winston';

// Database confiugration
import { AppDataSource, connectToDatabase } from '@/libs/postgresql';

// GraphQL
import { resolvers, typeDefs } from '@/graphql/handler';
import { MyContext } from './types/context';

export async function startServer() {
  const app = express();

  // Initialize Database Connection
  await connectToDatabase();

  // Define GraphQL Server with Apollo
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
  });

  // Start GraphQL Server
  await server.start();

  // Apply CORS, and QraphQL Server with ExpressJS
  app.use(
    '/api/v1',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        token: req.headers.token,
        AppDataSource: AppDataSource,
        req: req,
        res: res,
      }),
    }),
  );

  app.listen(config.PORT, () => {
    logger.info(
      `🌍 GraphQL Server is running on http://localhost:${config.PORT}/api/v1`,
    );
  });
}
