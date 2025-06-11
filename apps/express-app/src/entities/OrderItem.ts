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
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './Order'; // Import Order entity
import { Product } from './Product'; // Import Product entity

@Entity({ name: 'fa_order_items' })
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Many-to-One relationship with Order. An order item belongs to one order.
  @ManyToOne(() => Order, (order) => order.orderItems, {
    nullable: false,
    onDelete: 'CASCADE', // If an order is deleted, its items are also deleted
  })
  order!: Order; // This property holds the related Order object

  // Many-to-One relationship with Product. An order item refers to one product.
  @ManyToOne(() => Product, (product) => product.orderItems, {
    nullable: false,
    onDelete: 'SET NULL', // If a product is deleted, its order items remain but product link is null
    // Consider 'RESTRICT' or 'NO ACTION' if you want to prevent product deletion if it's in an order.
  })
  product!: Product; // This property holds the related Product object

  @Column()
  quantity!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  // IMPORTANT: Store the price of the product AT THE TIME OF THE ORDER.
  // This prevents issues if the product's main price changes later.
  priceAtOrder!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationtime!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatetime!: Date;
}
