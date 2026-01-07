import { injectable, inject } from 'tsyringe';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { ApiError } from '@shared/error/ApiError';

@injectable()
export class SetAvatarUseCase {
  constructor(@inject('UserRepo') private readonly users: UserRepositoryPort) {}

  async execute(
    userId: number,
    avatarUrl: string,
  ): Promise<{ avatarUrl: string }> {
    const user = await this.users.findById(userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND');

    await this.users.update(userId, { avatar: avatarUrl });
    return { avatarUrl };
  }
}
