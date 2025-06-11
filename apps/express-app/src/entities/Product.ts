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

import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany, // Import OneToMany
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './Category';
import { OrderItem } from './OrderItem'; // Import OrderItem entity

@Entity({ name: 'fa_products' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 }) // Add length for string columns
  name!: string;

  @Column({ type: 'text' }) // Use 'text' for potentially long descriptions
  description!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 }) // Store as numeric for precise decimal values
  price!: number; // Changed to number type for calculations

  // Many-to-One relationship with Category.
  // Ensure the foreign key is correctly mapped to the Category entity's ID.
  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false, // A product must always have a category
    onDelete: 'RESTRICT', // Prevent category deletion if products are linked
  })
  category!: Category; // This property should be of type Category, not string

  // The foreign key column will be automatically created by TypeORM if 'category!' is used correctly.
  // You generally don't need to define 'categoryId!' explicitly as a separate column if TypeORM manages it.
  // If you need direct access to the ID, you can do product.category.id after loading.
  // If you want to keep the FK explicitly, make sure it's not managed by TypeORM's relation directly.
  // For simplicity and TypeORM's auto-management, I've removed the explicit categoryId column.

  // --- NEW: One-to-Many relationship with OrderItem ---
  // A Product can be part of many OrderItems.
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationtime!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatetime!: Date;
}
