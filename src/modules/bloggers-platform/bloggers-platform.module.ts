import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './domain/blog.entity.js';
import { Post, PostLike } from './domain/post.entity.js';
import { Comment, CommentLike } from './domain/comment.entity.js';
import { BlogsService } from './application/blogs-service.js';
import { PostsService } from './application/posts-service.js';
import { PostsController } from './api/posts.controller.js';
import { BlogsController } from './api/blogs.controller.js';
import { CommentsController } from './api/comments.controller.js';
import { PostsRepository } from './infrastructure/posts.repository.js';
import { PostsQueryRepository } from './infrastructure/posts.query-repository.js';
import { BlogsRepository } from './infrastructure/blogs.repository.js';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository.js';
import { CommentsQueryRepository } from './infrastructure/comments.query-repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Post, PostLike, Comment, CommentLike]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    PostsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
  ],
})
export class BloggersPlatformModule {}
