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
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';

// Custom Modules
import config from '@/config';
import { logger } from '@/libs/winston';

// Database confiugration
import {
  AppDataSource,
  connectToDatabase,
  distroyFromDatabase,
} from '@/libs/postgresql';

// GraphQL
import { resolvers, typeDefs } from '@/graphql/handler';
import { MyContext } from './types/context';
import limiter from './libs/rate-limit';

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'production' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS Error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS Error: ${origin} is not allowed by CORS`);
    }
  },
};

const app = express();

export async function startServer() {
  try {
    // Initialize Database Connection
    await connectToDatabase();

    // Define GraphQL Server with Apollo
    const server = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
    });

    // Start GraphQL Server
    await server.start();

    app.use(cookieParser());

    // Enable response compression to reduce payload size and improve performance
    app.use(
      compression({
        threshold: 1024, // Only compress responses larger than 1KB
      }),
    );

    // Apply Helmet
    app.use(helmet());

    // Apply Rate kimiting
    app.use(limiter);

    // Apply CORS, and QraphQL Server with ExpressJS
    app.use(
      '/api/v1',
      cors<cors.CorsRequest>(corsOptions),
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
  } catch (err) {
    logger.error(err);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

const handleServerShutdown = async () => {
  try {
    await distroyFromDatabase();
    logger.info(`Server SHUTDOWN!`);
    process.exit(0);
  } catch (error) {
    logger.warn(`Error during server shutdown.`, error);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
