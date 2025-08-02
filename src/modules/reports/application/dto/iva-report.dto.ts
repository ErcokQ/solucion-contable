// src/modules/reports/application/dto/iva-report.dto.ts
import { z } from 'zod';

export const IvaReportDtoSchema = z.object({
  tipo: z.enum(['emitidos', 'recibidos']).default('emitidos'), // Según el RFC que se analiza
  rfc: z.string().trim().min(12).max(13),

  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),

  formato: z.enum(['json', 'xlsx']).default('xlsx'),
});

export type IvaReportDto = z.infer<typeof IvaReportDtoSchema>;
