// modules/cfdi/application/dto/cfdi-query.dto.ts
import { z } from 'zod';

export const CfdiQueryDtoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  rfcEmisor: z.string().optional(),
  rfcReceptor: z.string().optional(),
  uuid: z.string().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  totalMin: z.coerce.number().optional(),
  totalMax: z.coerce.number().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'PARSED']).optional(),
});

export type CfdiQueryDto = z.infer<typeof CfdiQueryDtoSchema>;
