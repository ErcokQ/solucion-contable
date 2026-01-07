import { injectable, inject } from 'tsyringe';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
import { ApiError } from '@shared/error/ApiError';
import { ChangePasswordDto } from '@auth/application/dto/user-profile.dto';

@injectable()
export class ChangePasswordUseCase {
  constructor(
    @inject('UserRepo') private readonly users: UserRepositoryPort,
    @inject('HashServicePort') private readonly hash: HashServicePort,
  ) {}

  async execute(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND');

    const ok = await this.hash.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new ApiError(400, 'INVALID_CURRENT_PASSWORD');

    if (dto.currentPassword === dto.newPassword) {
      throw new ApiError(400, 'PASSWORD_SAME_AS_CURRENT');
    }

    const newHash = await this.hash.hash(dto.newPassword);
    await this.users.update(userId, { passwordHash: newHash });
  }
}
