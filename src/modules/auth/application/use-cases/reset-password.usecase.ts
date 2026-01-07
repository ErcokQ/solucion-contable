// src/modules/auth/application/use-cases/reset-password.usecase.ts
import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { ApiError } from '@shared/error/ApiError';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { ResetPasswordRepositoryPort } from '@auth/application/ports/reset-password-repository.port';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
import type { ResetPasswordDto } from '@auth/application/dto/reset-password.dto';

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('ResetPasswordRepo') private resets: ResetPasswordRepositoryPort,
    @inject('HashServicePort') private hash: HashServicePort,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ ok: true }> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const reset = await this.resets.findValidByTokenHash(tokenHash);
    if (!reset) throw new ApiError(400, 'INVALID_OR_EXPIRED_TOKEN');

    const user = await this.users.findById(reset.userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND');

    const passwordHash = await this.hash.hash(dto.newPassword); // asumiendo hash(password)
    await this.users.update(user.id, { passwordHash: passwordHash });

    await this.resets.markUsed(reset.id);

    return { ok: true };
  }
}
