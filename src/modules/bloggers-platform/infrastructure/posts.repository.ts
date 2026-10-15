import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DeepPartial, Repository } from 'typeorm';
import { Post } from '../domain/post.entity.js';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async create(post: DeepPartial<Post>): Promise<string> {
    const created = await this.postsRepository.save(
      this.postsRepository.create(post),
    );
    return created.id;
  }

  async findById(id: string): Promise<Post | null> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    if (!isUUID(id)) {
      return null;
    }

    return this.postsRepository.findOneBy({ id });
  }

  async save(post: Post): Promise<void> {
    await this.postsRepository.save(post);
  }

  async updateBlogName(blogId: string, blogName: string): Promise<void> {
    await this.postsRepository.update({ blogId }, { blogName });
  }

  // Returns false if no post with this id exists.
  async deleteById(id: string): Promise<boolean> {
    if (!isUUID(id)) {
      return false;
    }

    const result = await this.postsRepository.delete({ id });
    return !!result.affected;
  }
}
