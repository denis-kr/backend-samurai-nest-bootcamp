import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../domain/user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(user: DeepPartial<User>): Promise<string> {
    const created = await this.usersRepository.save(
      this.usersRepository.create(user),
    );
    return created.id;
  }

  // Returns false if no user with this id exists.
  async deleteById(id: string): Promise<boolean> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    if (!isUUID(id)) {
      return false;
    }

    const result = await this.usersRepository.delete({ id });
    return !!result.affected;
  }
}
