import { IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../core/dto/base.query-params.input-dto.js';

export class GetPostsQueryParams extends BaseQueryParams {}

export class GetCommentsQueryParams extends BaseQueryParams {}

export class GetBlogsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsString()
  searchNameTerm: string | null = null;
}
