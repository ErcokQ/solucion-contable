// src/modules/auth/infraestructure/services/console-mail.service.ts
import { injectable } from 'tsyringe';
import { MailServicePort } from '@auth/application/ports/mail-service.port';

@injectable()
export class ConsoleMailService implements MailServicePort {
  async sendPasswordReset(email: string, resetUrl: string) {
    console.log(`[MAIL] To: ${email} | Reset: ${resetUrl}`);
  }

  async sendEmailVerification(email: string, verifyUrl: string) {
    console.log(`[MAIL] To: ${email} | Verify: ${verifyUrl}`);
  }
}
