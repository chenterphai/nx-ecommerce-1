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
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Token } from './Token';
import { Order } from './Order';

// It's good practice to define enums outside the class if they are used elsewhere,
// or within the class if strictly scoped to that entity.
export enum Role {
  Admin = 'admin',
  User = 'user',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

@Entity({ name: 'fa_users' }) // Table name in snake_case is good.
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' }) // Use bigint for larger IDs, good practice
  id!: number;

  @Column({ unique: true, length: 20 }) // Added length for string columns
  username!: string;

  @Column({ unique: true, length: 50 }) // Added length
  email!: string;

  @Column({ length: 255 }) // Add length
  // IMPORTANT: NEVER store plain passwords directly.
  // This column should store a HASHED and SALTED version of the password.
  password!: string;

  @Column({ length: 50 })
  nickname!: string;

  @Column({ length: 512 })
  avatar!: string;

  @Column('text') // 'text' is fine for storing enum string values in Postgres
  role!: Role;

  @Column({ type: 'text', default: Gender.Other })
  gender!: Gender;

  @Column({ type: 'date', nullable: true }) // Changed to Date type and explicit 'date' for better handling
  dateofbirth!: Date | null; // Use Date type for dates, nullable if it can be empty

  // One-to-One relationship with Token.
  // 'token => token.user' specifies the inverse side of the relationship.
  // The 'user' property on the Token entity points back to this User entity.
  // No @JoinColumn here, as Token is the owning side.
  //
  // 'cascade: ['insert', 'update', 'remove']' ensures that:
  // - If you save a User with a new Token, the Token is also inserted.
  // - If you update a User and its Token, the Token is also updated.
  // - If you remove a User, its associated Token is also removed.
  @OneToOne(() => Token, (token) => token.user, {
    cascade: ['insert', 'update', 'remove'],
    // nullable: false,
    // If you always expect a user to have a token, you could add { nullable: false } here
    // But since Token owns the FK, nullable: false on Token side is sufficient for DB constraint.
  })
  token!: Token; // This property will hold the related Token object

  // --- NEW: One-to-Many relationship with Order ---
  // A User can have many Orders.
  // 'order => order.user' specifies the inverse side,
  // meaning the 'user' property on the Order entity points back here.
  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[]; // This property will hold an array of related Order objects

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  creationtime!: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatetime!: Date;
}
