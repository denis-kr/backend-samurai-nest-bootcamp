import { Post, PostLike } from '../domain/post.entity.js';
import type { LikeStatus } from '../domain/comment.entity.js';

export class LikeDetailsViewDto {
  addedAt: Date;
  userId: string;
  login: string;
}

export class ExtendedLikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikeDetailsViewDto[];
}

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  // `likes` holds the post's Like/Dislike rows (None rows can be omitted).
  // myStatus stays None until requests carry an authenticated user.
  static mapToView(post: Post, likes: PostLike[]): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    const onlyLikes = likes.filter((like) => like.status === 'Like');
    dto.extendedLikesInfo = {
      likesCount: onlyLikes.length,
      dislikesCount: likes.filter((like) => like.status === 'Dislike').length,
      myStatus: 'None',
      newestLikes: onlyLikes
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)
        .map((like) => ({
          addedAt: like.createdAt,
          userId: like.userId,
          login: like.userLogin,
        })),
    };

    return dto;
  }
}
