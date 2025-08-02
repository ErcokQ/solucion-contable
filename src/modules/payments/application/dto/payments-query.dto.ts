// modules/payments/application/dto/payments-query.dto.ts
import { z } from 'zod';

export const PaymentsQueryDtoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  rfcReceptor: z.string().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
});
export type PaymentsQueryDto = z.infer<typeof PaymentsQueryDtoSchema>;
