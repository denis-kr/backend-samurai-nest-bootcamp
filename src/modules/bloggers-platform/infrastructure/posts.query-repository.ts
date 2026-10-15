import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity.js';
import { Post, PostLike } from '../domain/post.entity.js';
import { PostViewDto } from '../dto/post-view.dto.js';
import { GetPostsQueryParams } from '../dto/views.dto.js';
import { SortDirection } from '../../../core/dto/base.query-params.input-dto.js';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto.js';

// Public sortBy values allowed to reach ORDER BY. Anything else falls back to
// createdAt.
const SORT_COLUMNS: (keyof Post)[] = [
  'createdAt',
  'title',
  'shortDescription',
  'content',
  'blogId',
  'blogName',
];

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    return this.getPage(query);
  }

  async getAllByBlogIdOrNotFoundFail(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    const blogExists =
      isUUID(blogId) && (await this.blogsRepository.existsBy({ id: blogId }));

    if (!blogExists) {
      throw new NotFoundException('blog not found');
    }

    return this.getPage(query, { blogId });
  }

  async getByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    const post = isUUID(id)
      ? await this.postsRepository.findOneBy({ id })
      : null;

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return PostViewDto.mapToView(post, await this.getReactions([post.id]));
  }

  private async getPage(
    query: GetPostsQueryParams,
    where?: FindOptionsWhere<Post>,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    const sortColumn = SORT_COLUMNS.includes(query.sortBy as keyof Post)
      ? query.sortBy
      : 'createdAt';
    const sortDirection =
      query.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const [posts, totalCount] = await this.postsRepository.findAndCount({
      where,
      order: { [sortColumn]: sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const likes = await this.getReactions(posts.map((post) => post.id));

    return PaginatedViewDto.mapToView({
      items: posts.map((post) =>
        PostViewDto.mapToView(
          post,
          likes.filter((like) => like.postId === post.id),
        ),
      ),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  // Like/Dislike rows for the given posts, in one query.
  private async getReactions(postIds: string[]): Promise<PostLike[]> {
    if (!postIds.length) {
      return [];
    }

    return this.postLikesRepository.findBy({
      postId: In(postIds),
      status: In(['Like', 'Dislike']),
    });
  }
}
