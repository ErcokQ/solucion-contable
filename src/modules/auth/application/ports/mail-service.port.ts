// src/modules/auth/application/ports/mail-service.port.ts
export interface MailServicePort {
  sendPasswordReset(email: string, resetUrl: string): Promise<void>;
  sendEmailVerification(email: string, verifyUrl: string): Promise<void>;
}
