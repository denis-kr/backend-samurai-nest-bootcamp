import { OmitType } from '@nestjs/swagger';

export class CreatePostInputDto {
  title: string;

  shortDescription: string;

  content: string;

  blogId: string;
}

export class CreatePostForBlogInputDto extends OmitType(CreatePostInputDto, [
  'blogId',
] as const) {}
