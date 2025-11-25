// modules/billing/application/dto/billing-query.dto.ts
import { z } from 'zod';

export const BillingQueryDtoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  rfcReceptor: z.string().optional(),
  uuid: z.string().optional(),
  status: z
    .enum(['DRAFT', 'READY', 'STAMPED', 'CANCELLED', 'FAILED'])
    .optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
});
export type BillingQueryDto = z.infer<typeof BillingQueryDtoSchema>;
