// src/modules/auth/application/ports/reset-password-repository.port.ts
import { ResetPasswordOrm } from '@infra/orm/entities/reset-password.orm';

export interface ResetPasswordRepositoryPort {
  create(input: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  findValidByTokenHash(tokenHash: string): Promise<ResetPasswordOrm | null>;

  markUsed(id: number): Promise<void>;

  invalidateUserTokens(userId: number): Promise<void>; // opcional pero útil
}
