// src/modules/auth/infraestructure/services/resend-mail.service.ts
import { injectable } from 'tsyringe';
import { Resend } from 'resend';
import { MailServicePort } from '@auth/application/ports/mail-service.port';
import { ApiError } from '@shared/error/ApiError';
import { config } from '@shared/config'; // AJUSTA a tu config real

@injectable()
export class ResendMailService implements MailServicePort {
  private client: Resend;

  constructor() {
    const apiKey = config.RESEND_API_KEY; // o config.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is missing');
    this.client = new Resend(apiKey);
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    const from = config.MAIL_FROM; // ej: "SC M3RSYNC <no-reply@...>"
    if (!from) throw new Error('MAIL_FROM is missing');

    const subject = 'Recuperación de contraseña';

    const html = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Recuperación de contraseña</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">

        <!-- Contenedor -->
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;
                 box-shadow:0 8px 28px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f766e;padding:20px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                <div style="font-size:18px;font-weight:700;letter-spacing:.3px;">
                  SC M3RSYNC
                </div>
                <div style="font-size:12px;opacity:.9;margin-top:4px;">
                  Seguridad de tu cuenta
                </div>
              </div>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:28px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">

                <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">
                  Recuperación de contraseña
                </h1>

                <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#374151;">
                  Recibimos una solicitud para cambiar la contraseña de tu cuenta.
                  Para continuar, haz clic en el botón de abajo.
                </p>

                <!-- Botón -->
                <table cellpadding="0" cellspacing="0" style="margin:20px 0;">
                  <tr>
                    <td bgcolor="#0f766e" style="border-radius:10px;">
                      <a href="${resetUrl}"
                        style="display:inline-block;padding:14px 18px;
                               font-family:Arial,Helvetica,sans-serif;
                               font-size:14px;font-weight:700;
                               color:#ffffff;text-decoration:none;">
                        Cambiar contraseña
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 12px;font-size:12px;color:#6b7280;">
                  Este enlace expira en <strong>15 minutos</strong>.
                </p>

                <p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:#6b7280;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                  <br />
                  <a href="${resetUrl}" style="color:#0f766e;word-break:break-all;">
                    ${resetUrl}
                  </a>
                </p>

                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                  Si tú no solicitaste este cambio, puedes ignorar este correo.
                  Tu contraseña permanecerá sin cambios.
                </p>

              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;line-height:1.6;">
                <div style="margin-bottom:6px;">
                  ¿Necesitas ayuda? Escríbenos a
                  <a href="mailto:soporte@m3rsync.com" style="color:#0f766e;">
                    soporte@m3rsync.com
                  </a>
                </div>
                <div style="opacity:.8;">
                  © ${new Date().getFullYear()} SC M3RSYNC. Todos los derechos reservados.
                </div>
              </div>
            </td>
          </tr>

        </table>
        <!-- /Contenedor -->

      </td>
    </tr>
  </table>
</body>
</html>
`;

    try {
      const result = await this.client.emails.send({
        from,
        to: email,
        subject,
        html,
      });

      // si Resend responde con error estructurado
      if (result?.error) {
        throw new Error(result.error.message || 'MAIL_SEND_FAILED');
      }
    } catch (e) {
      // no expongas detalles al cliente
      console.error('ResendMailService error:', e);
      throw new ApiError(500, 'MAIL_SEND_FAILED');
    }
  }

  async sendEmailVerification(email: string, verifyUrl: string): Promise<void> {
    const from = config.MAIL_FROM;
    if (!from) throw new Error('MAIL_FROM is missing');

    const subject = 'Verificacion de correo electronico';

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Verifica tu correo</h2>
        <p>Confirma tu cuenta haciendo clic en el siguiente enlace.</p>
        <p>
          <a href="${verifyUrl}"
             style="display:inline-block;padding:10px 16px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px">
            Verificar correo
          </a>
        </p>
        <p>Este enlace expira en 15 minutos.</p>
      </div>
    `;

    try {
      const result = await this.client.emails.send({
        from,
        to: email,
        subject,
        html,
      });

      if (result?.error) {
        throw new Error(result.error.message || 'MAIL_SEND_FAILED');
      }
    } catch (e) {
      console.error('ResendMailService error:', e);
      throw new ApiError(500, 'MAIL_SEND_FAILED');
    }
  }
}
