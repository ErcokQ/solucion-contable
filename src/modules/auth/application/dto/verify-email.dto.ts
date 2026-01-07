import { z } from 'zod';

export const VerifyEmailDtoSchema = z.object({
  token: z.string().min(10),
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailDtoSchema>;
