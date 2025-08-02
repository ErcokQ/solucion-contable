import { z } from 'zod';

export const PayrollQueryDtoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),

  rfcReceptor: z.string().optional(),

  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),

  tipoNomina: z.enum(['O', 'E']).optional(),
});

export type PayrollQueryDto = z.infer<typeof PayrollQueryDtoSchema>;
