import { Controller, Get, Param } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto.js';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository.js';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }
}
