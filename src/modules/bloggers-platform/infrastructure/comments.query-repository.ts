import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { Comment, CommentLike } from '../domain/comment.entity.js';
import { Post } from '../domain/post.entity.js';
import { CommentViewDto } from '../dto/comment-view.dto.js';
import { GetCommentsQueryParams } from '../dto/views.dto.js';
import { SortDirection } from '../../../core/dto/base.query-params.input-dto.js';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto.js';

// Public sortBy values allowed to reach ORDER BY. Anything else falls back to
// createdAt.
const SORT_COLUMNS: (keyof Comment)[] = ['createdAt', 'content'];

type ReactionCounts = { likesCount: number; dislikesCount: number };

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikesRepository: Repository<CommentLike>,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async getAllByPostIdOrNotFoundFail(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto>> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    const postExists =
      isUUID(postId) && (await this.postsRepository.existsBy({ id: postId }));

    if (!postExists) {
      throw new NotFoundException('post not found');
    }

    const sortColumn = SORT_COLUMNS.includes(query.sortBy as keyof Comment)
      ? query.sortBy
      : 'createdAt';
    const sortDirection =
      query.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const [comments, totalCount] = await this.commentsRepository.findAndCount({
      where: { postId },
      order: { [sortColumn]: sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const counts = await this.getReactionCounts(
      comments.map((comment) => comment.id),
    );

    return PaginatedViewDto.mapToView({
      items: comments.map((comment) => this.toView(comment, counts)),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    const comment = isUUID(id)
      ? await this.commentsRepository.findOneBy({ id })
      : null;

    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    return this.toView(comment, await this.getReactionCounts([comment.id]));
  }

  private toView(
    comment: Comment,
    counts: Map<string, ReactionCounts>,
  ): CommentViewDto {
    const { likesCount, dislikesCount } = counts.get(comment.id) ?? {
      likesCount: 0,
      dislikesCount: 0,
    };

    return CommentViewDto.mapToView(comment, likesCount, dislikesCount);
  }

  // Like/Dislike counts per comment, in one grouped query. Comments without
  // reactions are absent from the map.
  private async getReactionCounts(
    commentIds: string[],
  ): Promise<Map<string, ReactionCounts>> {
    const counts = new Map<string, ReactionCounts>();

    if (!commentIds.length) {
      return counts;
    }

    const rows: { commentId: string; status: string; count: string }[] =
      await this.commentLikesRepository
        .createQueryBuilder('cl')
        .select('cl.commentId', 'commentId')
        .addSelect('cl.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('cl.commentId IN (:...commentIds)', { commentIds })
        .groupBy('cl.commentId')
        .addGroupBy('cl.status')
        .getRawMany();

    for (const row of rows) {
      const entry = counts.get(row.commentId) ?? {
        likesCount: 0,
        dislikesCount: 0,
      };

      // Postgres returns COUNT(*) as a string (bigint).
      if (row.status === 'Like') {
        entry.likesCount = Number(row.count);
      } else if (row.status === 'Dislike') {
        entry.dislikesCount = Number(row.count);
      }

      counts.set(row.commentId, entry);
    }

    return counts;
  }
}
