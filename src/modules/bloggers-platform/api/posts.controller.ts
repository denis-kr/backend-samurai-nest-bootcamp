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
import { CreatePostInputDto } from '../dto/create-post.dto.js';
import {
  GetPostsQueryParams,
  GetCommentsQueryParams,
} from '../dto/views.dto.js';
import { PostViewDto } from '../dto/post-view.dto.js';
import { PostsService } from '../application/posts-service.js';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository.js';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository.js';
import { CommentViewDto } from '../dto/comment-view.dto.js';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto.js';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.postsService.createPost(body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: CreatePostInputDto,
  ): Promise<void> {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePost(id);
  }

  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto>> {
    return this.commentsQueryRepository.getAllByPostIdOrNotFoundFail(
      postId,
      query,
    );
  }
}
