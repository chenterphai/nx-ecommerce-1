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

import { Category } from '@/entities/Category';
import { Product } from '@/entities/Product';
import { AppDataSource } from '@/libs/postgresql';
import { logger } from '@/libs/winston';

export default {
  Query: {
    products: async () => {
      const userRepository = AppDataSource.getRepository(Product);
      const products = await userRepository.find({
        relations: ['category'],
      });
      logger.info(`✅ Product fetched successfully!`);
      return products;
    },

    categories: async () => {
      const categoryRepository = AppDataSource.getRepository(Category);
      const categories = await categoryRepository.find({
        relations: ['products'],
      });
      logger.info(`✅ Categories fetched successfully.`);
      return categories;
    },
  },
  Mutation: {
    createProduct: async (
      _: any,
      {
        name,
        description,
        price,
        categoryId,
      }: {
        name: string;
        description: string;
        price: string;
        categoryId: number;
      },
    ) => {
      const productRepo = AppDataSource.getRepository(Product);
      const categoryRepo = AppDataSource.getRepository(Category);

      // Find Available Category
      const category = await categoryRepo.findOneBy({ id: categoryId });

      if (!category) {
        logger.warn('Category Not Found');
        throw new Error('Category Not Found');
      }

      // Prepare Product
      const product = productRepo.create({
        name,
        description,
        price,
        categoryId,
      });

      // Insert Product
      const newProduct = await productRepo.save(product);

      logger.info(`Product has been saved. Product ID is ${newProduct.id}`);
      return product;
    },
  },
};
