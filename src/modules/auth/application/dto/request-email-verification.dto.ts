import { z } from 'zod';

export const RequestEmailVerificationDtoSchema = z.object({
  login: z.string().min(1).max(150),
});

export type RequestEmailVerificationDto = z.infer<
  typeof RequestEmailVerificationDtoSchema
>;
