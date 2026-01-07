// src/modules/auth/application/use-cases/verify-email.usecase.ts
import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { ApiError } from '@shared/error/ApiError';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { EmailVerificationRepositoryPort } from '@auth/application/ports/email-verification-repository.port';
import type { VerifyEmailDto } from '@auth/application/dto/verify-email.dto';

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('EmailVerificationRepo')
    private verifications: EmailVerificationRepositoryPort,
  ) {}

  async execute(dto: VerifyEmailDto): Promise<{ ok: true }> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const verification =
      await this.verifications.findValidByTokenHash(tokenHash);
    if (!verification) throw new ApiError(400, 'INVALID_OR_EXPIRED_TOKEN');

    const user = await this.users.findById(verification.userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND');

    await this.users.update(user.id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    await this.verifications.markUsed(verification.id);

    return { ok: true };
  }
}
