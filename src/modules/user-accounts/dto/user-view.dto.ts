import { User } from '../domain/user.entity.js';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: User): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.email;
    dto.login = user.userName;
    dto.id = user.id;
    dto.createdAt = user.createdAt;

    return dto;
  }
}
