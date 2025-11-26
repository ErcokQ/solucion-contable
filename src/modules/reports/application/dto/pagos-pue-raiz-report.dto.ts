import { z } from 'zod';

export const PagosPueRaizReportDtoSchema = z.object({
  tipo: z.enum(['emitidos', 'recibidos']).default('emitidos'),
  rfc: z.string().trim().min(12).max(13),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  formato: z.enum(['json', 'xlsx']).default('xlsx'),
});

export type PagosPueRaizReportDto = z.infer<typeof PagosPueRaizReportDtoSchema>;
