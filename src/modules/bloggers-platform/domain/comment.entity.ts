import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Post } from './post.entity.js';

export type LikeStatus = 'None' | 'Like' | 'Dislike';

@Entity({ name: 'comment_likes' })
@Unique(['commentId', 'userId'])
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  commentId: string;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commentId' })
  comment: Relation<Comment>;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'enum', enum: ['Like', 'Dislike'] })
  status: Exclude<LikeStatus, 'None'>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

// Embedded: stored as commentatorInfoUserId / commentatorInfoUserLogin
// columns on the comments table.
export class CommentatorInfo {
  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  userLogin: string;
}

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column(() => CommentatorInfo)
  commentatorInfo: CommentatorInfo;

  @Column({ type: 'uuid' })
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Relation<Post>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => CommentLike, (like) => like.comment, { cascade: true })
  likes: Relation<CommentLike>[];
}
