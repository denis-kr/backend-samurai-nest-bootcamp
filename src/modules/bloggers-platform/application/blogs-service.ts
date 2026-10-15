import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogInputDto } from '../dto/create-blog.dto.js';
import { BlogsRepository } from '../infrastructure/blogs.repository.js';
import { PostsRepository } from '../infrastructure/posts.repository.js';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createBlog(dto: CreateBlogInputDto): Promise<string> {
    // createdAt is filled by @CreateDateColumn, isMembership by its default.
    return this.blogsRepository.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });
  }

  async updateBlog(id: string, dto: CreateBlogInputDto): Promise<void> {
    const blog = await this.blogsRepository.findById(id);
    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    await this.blogsRepository.save(blog);
    // Posts keep a copy of the blog's name, so keep them in sync.
    await this.postsRepository.updateBlogName(blog.id, blog.name);
  }

  async deleteBlog(id: string): Promise<void> {
    const deleted = await this.blogsRepository.deleteById(id);

    if (!deleted) {
      throw new NotFoundException('blog not found');
    }
  }
}
