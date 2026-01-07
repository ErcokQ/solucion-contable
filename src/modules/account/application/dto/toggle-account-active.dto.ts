// src/modules/account/application/dto/toggle-account-active.dto.ts
import { z } from 'zod';

export const ToggleAccountActiveDtoSchema = z.object({
  accountId: z.number().int().positive(),
  active: z.boolean(),
});

export type ToggleAccountActiveDto = z.infer<
  typeof ToggleAccountActiveDtoSchema
>;
