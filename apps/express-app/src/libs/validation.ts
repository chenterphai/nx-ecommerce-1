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
export interface UpdateUserResponse {
  code: number;
  status: string;
  msg: string;
}

import { User } from '@/entities/User';
import { Repository } from 'typeorm';

async function checkUniqueField(
  repository: Repository<User>,
  field: keyof User,
  value: string,
): Promise<UpdateUserResponse | null> {
  const existingUser = await repository.findOneBy({ [field]: value } as any); // Type assertion for dynamic key
  if (existingUser) {
    return {
      code: 1,
      status: 'Bad Request',
      msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already taken.`,
    };
  }
  return null;
}

// Validate Enum
function validateEnumField<T>(
  enumObject: T,
  value: any,
  fieldName: string,
): UpdateUserResponse | null {
  if (value && !Object.values(enumObject as any).includes(value)) {
    return {
      code: 1,
      status: 'Bad Request',
      msg: `${fieldName} is invalid!`,
    };
  }
  return null;
}

function isValidEmail(email: string): boolean {
  // A commonly used regex for email validation
  // It's not 100% perfect for all edge cases (RFC-compliant emails are extremely complex),
  // but it's generally sufficient for most applications and prevents common typos.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export { checkUniqueField, validateEnumField, isValidEmail };
