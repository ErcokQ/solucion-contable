// src/modules/account/application/dto/account-me.dto.ts
import { z } from 'zod';

export const AccountMeDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(150),
  plan: z.string().min(1).max(50),
  maxUsers: z.number().int().nonnegative(),
  maxCompanies: z.number().int().nonnegative(),
  active: z.boolean(),
});

export type AccountMeDto = z.infer<typeof AccountMeDtoSchema>;
