import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module.js';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module.js';
import { TestingController } from './testing/testing.controller.js';

@Module({
  imports: [
    UserAccountsModule,
    BloggersPlatformModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // type of our database
      host: 'localhost', // database host
      port: 5432, // database host
      username: 'postgres', // username
      password: 'pass123', // user password
      database: 'postgres', // name of our database,
      autoLoadEntities: true, // models will be loaded automatically
      synchronize: true, // your entities will be synced with the database(recommended: disable in prod)
    }),
  ],
  controllers: [AppController, TestingController],
  providers: [AppService],
})
export class AppModule {}
