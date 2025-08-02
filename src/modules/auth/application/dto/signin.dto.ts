import { z } from 'zod';

export const SingInDtoSchema = z.object({
  login: z.string(),
  password: z.string(),
});

export type SignInDto = z.infer<typeof SingInDtoSchema>;
