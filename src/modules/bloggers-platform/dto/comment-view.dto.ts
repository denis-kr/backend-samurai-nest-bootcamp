import { Comment, type LikeStatus } from '../domain/comment.entity.js';

export class CommentatorInfoViewDto {
  userId: string;
  userLogin: string;
}

export class LikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoViewDto;
  createdAt: Date;
  likesInfo: LikesInfoViewDto;

  // myStatus stays None until requests carry an authenticated user.
  static mapToView(
    comment: Comment,
    likesCount: number,
    dislikesCount: number,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = { likesCount, dislikesCount, myStatus: 'None' };

    return dto;
  }
}
