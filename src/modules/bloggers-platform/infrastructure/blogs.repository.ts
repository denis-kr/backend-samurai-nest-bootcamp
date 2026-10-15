import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DeepPartial, Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity.js';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  async create(blog: DeepPartial<Blog>): Promise<string> {
    const created = await this.blogsRepository.save(
      this.blogsRepository.create(blog),
    );
    return created.id;
  }

  async findById(id: string): Promise<Blog | null> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    if (!isUUID(id)) {
      return null;
    }

    return this.blogsRepository.findOneBy({ id });
  }

  async save(blog: Blog): Promise<void> {
    await this.blogsRepository.save(blog);
  }

  // Returns false if no blog with this id exists. The blog's posts go with it
  // via the ON DELETE CASCADE on posts.blogId.
  async deleteById(id: string): Promise<boolean> {
    if (!isUUID(id)) {
      return false;
    }

    const result = await this.blogsRepository.delete({ id });
    return !!result.affected;
  }
}
