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
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User'; // Import User entity
import { Payment } from './Payment'; // Import Payment entity
import { OrderItem } from './OrderItem';

// Enum for order status
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  Refunded = 'refunded',
}

@Entity({ name: 'fa_orders' })
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Many-to-One relationship with User. An order belongs to one user.
  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false, // An order must always have a user
    onDelete: 'CASCADE', // If a user is deleted, their orders are also deleted
  })
  user!: User; // This property holds the related User object

  @Column({ type: 'numeric', precision: 10, scale: 2 }) // Store as numeric for precise decimal values
  totalAmount!: number;

  @Column({ type: 'text', default: OrderStatus.Pending }) // Store order status as text
  status!: OrderStatus;

  @Column({ length: 512 }) // Assuming a simple string for shipping address for now
  shippingAddress!: string;

  // One-to-Many relationship with OrderItem. An order can have many items.
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: ['insert', 'update'], // If order is inserted/updated, its items are also inserted/updated
    eager: true, // Eager load order items when fetching an order (optional, consider performance)
  })
  orderItems!: OrderItem[];

  // One-to-Many relationship with Payment. An order can have multiple payments (e.g., partial, retry).
  @OneToMany(() => Payment, (payment) => payment.order, {
    cascade: ['insert', 'update'], // If order is inserted/updated, its payments are also inserted/updated
  })
  payments!: Payment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  orderDate!: Date; // The date the order was placed

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationtime!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatetime!: Date;
}
