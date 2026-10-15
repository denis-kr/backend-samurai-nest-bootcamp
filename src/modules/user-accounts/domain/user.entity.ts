import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

// @Entity({ name: 'user_refresh_tokens_meta' })
// export class RefreshTokenMeta {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ type: 'uuid' })
//   userId: string;

//   @ManyToOne(() => User, (user) => user.refreshTokensMeta, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'userId' })
//   user: Relation<User>;

//   @Column({ type: 'varchar' })
//   deviceId: string;

//   @Column({ type: 'varchar' })
//   ip: string;

//   @Column({ type: 'varchar' })
//   title: string;

//   @Column({ type: 'timestamptz' })
//   lastActiveDate: Date;
// }

// // Embedded: stored as emailConfirmation* columns on the users table.
// export class EmailConfirmation {
//   @Column({ type: 'varchar', nullable: true })
//   confirmationCode: string | null;

//   @Column({ type: 'timestamptz', nullable: true })
//   expirationDate: Date | null;

//   @Column({ type: 'boolean', default: false })
//   isConfirmed: boolean;
// }

// // Embedded: stored as passwordRecovery* columns on the users table.
// export class PasswordRecovery {
//   @Column({ type: 'varchar', nullable: true })
//   recoveryCode: string | null;

//   @Column({ type: 'timestamptz', nullable: true })
//   expirationDate: Date | null;
// }

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  userName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  // @Column({ type: 'varchar' })
  // passwordHash: string;

  // @Column({ type: 'varchar' })
  // passwordSalt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // @Column(() => EmailConfirmation)
  // emailConfirmation: EmailConfirmation;

  // // Columns are null until the user requests a password recovery; cleared once
  // // the password is reset.
  // @Column(() => PasswordRecovery)
  // passwordRecovery: PasswordRecovery;

  // @OneToMany(() => RefreshTokenMeta, (meta) => meta.user, { cascade: true })
  // refreshTokensMeta: Relation<RefreshTokenMeta>[];
}
