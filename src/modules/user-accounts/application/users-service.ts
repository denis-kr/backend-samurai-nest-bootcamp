import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, randomUUID, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { CreateUserInputDto } from '../dto/create-user.dto.js';
import { UsersRepository } from '../infrastructure/users.repository.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserInputDto): Promise<string> {
    // createdAt is filled by @CreateDateColumn.
    return this.usersRepository.create({
      userName: dto.login,
      email: dto.email,
    });
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.usersRepository.deleteById(id);

    if (!deleted) {
      throw new NotFoundException('user not found');
    }
  }
}
