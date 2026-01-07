import { EmailVerificationTokenOrm } from '@infra/orm/entities/email-verification-token.orm';

export interface EmailVerificationRepositoryPort {
  create(input: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findValidByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationTokenOrm | null>;
  markUsed(id: number): Promise<void>;
  invalidateUserTokens(userId: number): Promise<void>;
}
