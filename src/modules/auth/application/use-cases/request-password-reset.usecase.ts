// src/modules/auth/application/use-cases/request-password-reset.usecase.ts
import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { ResetPasswordRepositoryPort } from '@auth/application/ports/reset-password-repository.port';
import { MailServicePort } from '@auth/application/ports/mail-service.port';
import type { ForgotPasswordDto } from '@auth/application/dto/forgot-password.dto';
import { config } from '@shared/config';

@injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('ResetPasswordRepo') private resets: ResetPasswordRepositoryPort,
    @inject('MailServicePort') private mail: MailServicePort,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ ok: true }> {
    const login = dto.login.trim().toLowerCase();

    const user = await this.users.findByLogin(login);

    // ✅ SIEMPRE ok (evitar enumeración)
    if (!user) return { ok: true };

    // opcional: si provider !== local, puedes decidir no hacer reset
    // if (user.provider !== 'local') return { ok: true };

    // opcional: invalida tokens anteriores (reduce superficie)
    await this.resets.invalidateUserTokens(user.id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.resets.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${config.URL_FRONTEND}/reset-password?token=${rawToken}`;
    await this.mail.sendPasswordReset(user.email, resetUrl);

    return { ok: true };
  }
}
