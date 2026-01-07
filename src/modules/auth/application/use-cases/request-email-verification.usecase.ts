// src/modules/auth/application/use-cases/request-email-verification.usecase.ts
import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { EmailVerificationRepositoryPort } from '@auth/application/ports/email-verification-repository.port';
import { MailServicePort } from '@auth/application/ports/mail-service.port';
import type { RequestEmailVerificationDto } from '@auth/application/dto/request-email-verification.dto';
import { config } from '@shared/config';

@injectable()
export class RequestEmailVerificationUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('EmailVerificationRepo')
    private verifications: EmailVerificationRepositoryPort,
    @inject('MailServicePort') private mail: MailServicePort,
  ) {}

  async execute(dto: RequestEmailVerificationDto): Promise<{ ok: true }> {
    const login = dto.login.trim().toLowerCase();

    const user = await this.users.findByLogin(login);

    // Siempre ok para evitar enumeracion
    if (!user) return { ok: true };

    if (user.emailVerified) return { ok: true };

    await this.verifications.invalidateUserTokens(user.id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.verifications.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const verifyUrl = `${config.URL_FRONTEND}/verify-email?token=${rawToken}`;
    await this.mail.sendEmailVerification(user.email, verifyUrl);

    return { ok: true };
  }
}
