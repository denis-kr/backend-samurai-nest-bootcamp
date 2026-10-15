import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateBlogInputDto } from '../dto/create-blog.dto.js';
import { CreatePostForBlogInputDto } from '../dto/create-post.dto.js';
import { GetBlogsQueryParams, GetPostsQueryParams } from '../dto/views.dto.js';
import { BlogViewDto } from '../dto/blog-view.dto.js';
import { PostViewDto } from '../dto/post-view.dto.js';
import { BlogsService } from '../application/blogs-service.js';
import { PostsService } from '../application/posts-service.js';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository.js';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository.js';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto.js';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: CreateBlogInputDto,
  ): Promise<void> {
    return this.blogsService.updateBlog(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    return this.postsQueryRepository.getAllByBlogIdOrNotFoundFail(
      blogId,
      query,
    );
  }

  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.postsService.createPostForBlog(blogId, body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
