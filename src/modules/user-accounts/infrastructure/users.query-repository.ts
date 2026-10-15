import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from '../domain/user.entity.js';
import { UserViewDto } from '../dto/user-view.dto.js';
import {
  GetUsersQueryParams,
  UsersSortBy,
} from '../dto/get-users-query-params.input-dto.js';
import { SortDirection } from '../../../core/dto/base.query-params.input-dto.js';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto.js';

// Maps public sortBy values to entity columns. Anything else falls back to
// createdAt, so user input never reaches ORDER BY directly.
const SORT_COLUMNS: Record<UsersSortBy, keyof User> = {
  [UsersSortBy.CreatedAt]: 'createdAt',
  [UsersSortBy.Login]: 'userName',
  [UsersSortBy.Email]: 'email',
};

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto>> {
    // Login and email terms are OR-ed: an array of conditions in TypeORM's
    // `where` becomes `(...) OR (...)`.
    const where: FindOptionsWhere<User>[] = [];
    if (query.searchLoginTerm) {
      where.push({ userName: ILike(`%${query.searchLoginTerm}%`) });
    }
    if (query.searchEmailTerm) {
      where.push({ email: ILike(`%${query.searchEmailTerm}%`) });
    }

    const sortColumn = SORT_COLUMNS[query.sortBy] ?? 'createdAt';
    const sortDirection =
      query.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const [users, totalCount] = await this.usersRepository.findAndCount({
      where: where.length ? where : undefined,
      order: { [sortColumn]: sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    return PaginatedViewDto.mapToView({
      items: users.map((user) => UserViewDto.mapToView(user)),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    // Postgres rejects a malformed uuid with an error, so treat it as not found.
    const user = isUUID(id)
      ? await this.usersRepository.findOneBy({ id })
      : null;

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }
}
