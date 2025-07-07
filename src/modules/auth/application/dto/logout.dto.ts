import { z } from 'zod';

export const LogoutDtoSchema = z.object({
  refreshToken: z.string().nonempty('REFRESH_TOKEN_REQUIRED'),
});

export type LogoutDto = z.infer<typeof LogoutDtoSchema>;
