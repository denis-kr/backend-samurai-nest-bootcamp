import { BaseQueryParams } from '../../../core/dto/base.query-params.input-dto.js';

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class GetUsersQueryParams extends BaseQueryParams {
  declare sortBy: UsersSortBy;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
