import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { ILike, Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity.js';
import { BlogViewDto } from '../dto/blog-view.dto.js';
import { GetBlogsQueryParams } from '../dto/views.dto.js';
import { SortDirection } from '../../../core/dto/base.query-params.input-dto.js';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto.js';

// Public sortBy values allowed to reach ORDER BY. Anything else falls back to
// createdAt.
const SORT_COLUMNS: (keyof Blog)[] = [
  'createdAt',
  'name',
  'description',
  'websiteUrl',
  'isMembership',
];

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto>> {
    const sortColumn = SORT_COLUMNS.includes(query.sortBy as keyof Blog)
      ? query.sortBy
      : 'createdAt';
    const sortDirection =
      query.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const [blogs, totalCount] = await this.blogsRepository.findAndCount({
      where: query.searchNameTerm
        ? { name: ILike(`%${query.searchNameTerm}%`) }
        : undefined,
      order: { [sortColumn]: sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    return PaginatedViewDto.mapToView({
      items: blogs.map((blog) => BlogViewDto.mapToView(blog)),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    const blog = isUUID(id)
      ? await this.blogsRepository.findOneBy({ id })
      : null;

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }
}
