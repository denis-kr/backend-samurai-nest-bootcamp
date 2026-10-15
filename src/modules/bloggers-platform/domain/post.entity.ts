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
import { Blog } from './blog.entity.js';
import type { LikeStatus } from './comment.entity.js';

// userLogin is stored alongside the like so newestLikes can be built without
// looking users up on every read. Rows are never removed, and createdAt is
// set once on the user's first reaction — later status changes keep it.
@Entity({ name: 'post_likes' })
@Unique(['postId', 'userId'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  postId: string;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Relation<Post>;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  userLogin: string;

  @Column({ type: 'enum', enum: ['None', 'Like', 'Dislike'] })
  status: LikeStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

// `createdAt` and `likes` are set on the way in, not taken from the request
// payload. blogName is denormalized from the blog for cheap reads.
@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Relation<Blog>;

  @Column({ type: 'varchar' })
  blogName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => PostLike, (like) => like.post, { cascade: true })
  likes: Relation<PostLike>[];
}
