import { injectable, inject } from 'tsyringe';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { ApiError } from '@shared/error/ApiError';

export interface MeDto {
  id: number;
  email: string;
  fullName: string;
  username: string;
  provider: 'local' | 'google';
  avatar: string | null;
  activo: boolean;
  createdAt: Date;
}

@injectable()
export class GetMeUseCase {
  constructor(@inject('UserRepo') private readonly users: UserRepositoryPort) {}

  async execute(userId: number): Promise<MeDto> {
    const user = await this.users.findById(userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND');

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      provider: user.provider,
      avatar: user.avatar ?? null,
      activo: user.activo,
      createdAt: user.createdAt,
    };
  }
}
