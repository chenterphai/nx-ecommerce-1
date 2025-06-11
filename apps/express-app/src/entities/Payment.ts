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

// Enum for payment status
export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded',
  Cancelled = 'cancelled',
}

// Enum for payment method (example values)
export enum PaymentMethod {
  CreditCard = 'credit_card',
  PayPal = 'paypal',
  Stripe = 'stripe',
  BankTransfer = 'bank_transfer',
  KHQR = 'khqr',
}

@Entity({ name: 'fa_payments' })
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Many-to-One relationship with Order. A payment belongs to one order.
  @ManyToOne(() => Order, (order) => order.payments, {
    nullable: false, // A payment must always be associated with an order
    onDelete: 'CASCADE', // If an order is deleted, its payments are also deleted
  })
  order!: Order; // This property holds the related Order object

  @Column({ type: 'numeric', precision: 10, scale: 2 }) // Store as numeric for precise decimal values
  amount!: number;

  @Column({ type: 'text' }) // Store payment method as text
  method!: PaymentMethod;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true }) // Transaction ID from payment gateway, can be unique and nullable if not always present
  transactionId!: string | null;

  @Column({ type: 'text', default: PaymentStatus.Pending }) // Store payment status as text
  status!: PaymentStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate!: Date; // The date the payment was made/attempted

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationtime!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatetime!: Date;

  // IMPORTANT: Do NOT store sensitive payment information (like full credit card numbers) here.
  // Use a secure payment gateway (e.g., Stripe, PayPal) to handle and store such data.
  // You might store a tokenized version or reference from the gateway if needed for refunds/retries.
}
