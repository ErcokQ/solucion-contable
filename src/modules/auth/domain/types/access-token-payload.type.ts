// src/modules/auth/domain/types/access-token-payload.type.ts
export interface AccessTokenPayload {
  /** ID del usuario (User.id) */
  sub: number;

  /** ID de la cuenta activa en esta sesión (Account.id) */
  accountId: number;

  /** Roles efectivos para esta sesión (plataforma + cuenta), por nombre/código. */
  roles?: string[];

  /** Campos estándar de JWT que jwt.verify añadirá. */
  iat?: number;
  exp?: number;
}
