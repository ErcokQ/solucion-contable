// src/modules/auth/application/dto/reset-password.dto.ts
import { z } from 'zod';

export const ResetPasswordDtoSchema = z.object({
  token: z.string().min(10), // token raw del link
  newPassword: z.string().min(8).max(60),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;
