import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './api/users.controller.js';
import { UsersService } from './application/users-service.js';
import { UsersRepository } from './infrastructure/users.repository.js';
import { UsersQueryRepository } from './infrastructure/users.query-repository.js';
import { User } from './domain/user.entity.js';
import { SecurityDevice } from './domain/security-device.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, SecurityDevice])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UserAccountsModule {}
