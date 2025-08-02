import { z } from 'zod';

// src/modules/auth/application/dto/signup.dto.ts
export const SignUpDtoSchema = z.object({
  fullName: z
    .string()
    .min(3, 'FULLNAME_TOO_SHORT')
    .max(120, 'FULLNAME_TOO_LONG'),
  email: z.string().email('INVALID_EMAIL').max(120, 'EMAIL_TOO_LONG'),
  username: z
    .string()
    .min(3, 'USERNAME_TOO_SHORT')
    .max(30, 'USERNAME_TOO_LONG'),
  password: z
    .string()
    .min(8, 'PASSWORD_TOO_SHORT')
    .max(60, 'PASSWORD_TOO_LONG'),
  productKey: z.string().length(48, 'INVALID_PRODUCT_KEY'), // 24 bytes hex
});

export type SignUpDto = z.infer<typeof SignUpDtoSchema>;
