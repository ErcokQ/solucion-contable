// src/modules/summary/application/dto/summary-query.dto.ts
import { z } from 'zod';

export const SummaryQueryDtoSchema = z.object({
  // rango opcional; si no se envía, usa mes en curso
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
});

export type SummaryQueryDto = z.infer<typeof SummaryQueryDtoSchema>;
