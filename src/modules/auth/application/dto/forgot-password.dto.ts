// src/modules/auth/application/dto/forgot-password.dto.ts
import { z } from 'zod';

export const ForgotPasswordDtoSchema = z.object({
  login: z.string().min(1).max(150),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;
