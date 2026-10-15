import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePostForBlogInputDto,
  CreatePostInputDto,
} from '../dto/create-post.dto.js';
import { Blog } from '../domain/blog.entity.js';
import { PostsRepository } from '../infrastructure/posts.repository.js';
import { BlogsRepository } from '../infrastructure/blogs.repository.js';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: CreatePostInputDto): Promise<string> {
    const blog = await this.getBlogOrBadRequestFail(dto.blogId);

    // createdAt is filled by @CreateDateColumn.
    return this.postsRepository.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });
  }

  // blogId comes from the URL here, so a missing blog is a 404.
  async createPostForBlog(
    blogId: string,
    dto: CreatePostForBlogInputDto,
  ): Promise<string> {
    const blog = await this.blogsRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return this.postsRepository.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });
  }

  async updatePost(id: string, dto: CreatePostInputDto): Promise<void> {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException('post not found');
    }

    const blog = await this.getBlogOrBadRequestFail(dto.blogId);

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = blog.id;
    post.blogName = blog.name;

    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    const deleted = await this.postsRepository.deleteById(id);

    if (!deleted) {
      throw new NotFoundException('post not found');
    }
  }

  // blogId comes from the request body, so a missing blog is a 400, not a 404.
  private async getBlogOrBadRequestFail(blogId: string): Promise<Blog> {
    const blog = await this.blogsRepository.findById(blogId);

    if (!blog) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'blog not found', field: 'blogId' }],
      });
    }

    return blog;
  }
}
