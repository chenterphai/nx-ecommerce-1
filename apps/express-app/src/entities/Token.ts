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
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'fa_token' })
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  token!: string;

  // One-to-One relationship with User.
  // 'user => user.token' specifies the inverse side.
  // { nullable: false } means a Token must always be associated with a User.
  @OneToOne(
    () => User,
    (user) => user.token,
    { nullable: false },
    // If deleting a User should delete its Token, consider cascade: ['remove'] on the User side.
    // However, if Token's existence depends solely on User, you can manage this at the DB level (ON DELETE CASCADE)
    // or explicitly in your application logic.
    // cascade: ['insert', 'update'], // Example: If saving a Token also saves a new or updated User.
  )

  // @JoinColumn marks this as the owning side of the relationship.
  // It will create a foreign key column (e.g., 'userId' or 'user_id')
  // in the 'fa_token' table, referencing the 'fa_users' table.
  @JoinColumn()
  user!: User; // This property holds the related User object

  @Column({ type: 'timestamp', nullable: true }) // Added for token expiration
  expiresAt!: Date | null; // Nullable as some tokens might not expire, or get invalidated.

  @Column({ default: false }) // Added for explicit token invalidation (e.g., on logout)
  isRevoked!: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  creationtime!: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatetime!: Date;
}
