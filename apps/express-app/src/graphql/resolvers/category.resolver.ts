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

// import config from '@/config';
import { Category } from '@/entities/Category';
// import { Product } from '@/entities/Product';
import { logger } from '@/libs/winston';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { MyContext } from '@/types/context';
import { Repository } from 'typeorm';

export default {
  Query: {
    categories: async (
      parent: any,
      arg: any,
      context: MyContext,
    ): Promise<Category[]> => {
      if (!context.AppDataSource) {
        throw new Error('AppDataSource is not initialized in context.');
      }
      const categoryRepository: Repository<Category> =
        context.AppDataSource.getRepository(Category);

      const categories = await categoryRepository.find();
      logger.info(`✅ Categories fetched successfully.`);
      return categories;
    },
  },

  Mutation: {
    createCategory: async (
      parent: any,
      arg: { input: { name: string } },
      context: MyContext,
    ): Promise<Category> => {
      authenticate(context);
      await authorize(['admin'], context);

      if (!context.AppDataSource) {
        throw new Error('AppDataSource is not initialized in context.');
      }
      const categoryRepository: Repository<Category> =
        context.AppDataSource.getRepository(Category);

      // Check if category name already exists to prevent duplicates
      const existingCategory = await categoryRepository.findOne({
        where: { name: arg.input.name },
      });
      if (existingCategory) {
        throw new Error(
          `Category with name "${arg.input.name}" already exists.`,
        );
      }

      const newCatagory = categoryRepository.create({
        name: arg.input.name,
        creationtime: new Date(),
        updatetime: new Date(),
      });

      await categoryRepository.save(newCatagory);

      logger.info(`✅ Category created successfully.`);

      return newCatagory;
    },
  },

  //   Category: {
  //     // Resolves the 'products' field on a Category object
  //     products: async (
  //       parent: Category, // 'parent' is the Category object whose 'products' field is being resolved
  //       args: any,
  //       context: MyContext,
  //     ): Promise<Product[]> => {
  //       const productRepository: Repository<Product> =
  //         context.AppDataSource.getRepository(Product);
  //       // If products were already loaded (e.g., by 'relations: ['products']' in parent query), use them.
  //       if (parent.products) {
  //         return parent.products;
  //       }
  //       // Otherwise, fetch products explicitly where their category ID matches the parent category's ID.
  //       return productRepository.find({ where: { category: { id: parent.id } } });
  //     },
  //     // Resolves the 'creationtime' field on a Category object
  //     creationtime: (parent: Category): string => {
  //       // Convert Date object to ISO string format as defined in the GraphQL schema
  //       return parent.creationtime.toISOString();
  //     },
  //     // Resolves the 'updatetime' field on a Category object
  //     updatetime: (parent: Category): string => {
  //       // Convert Date object to ISO string format
  //       return parent.updatetime.toISOString();
  //     },
  //   },
};
