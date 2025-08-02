import { z } from 'zod';

export const ReportTotalesPorRfcDtoSchema = z.object({
  tipo: z.enum(['emitidos', 'recibidos']),
  rfc: z.string().trim().min(12).max(13),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  formato: z.enum(['json', 'xlsx']).default('xlsx'),
  incluirNomina: z.coerce.boolean().default(false),
  agruparGlobal: z.coerce.boolean().default(false),
  origen: z.enum(['todos', 'nomina', 'factura']).default('todos'),
});

export type ReportTotalesPorRfcDto = z.infer<
  typeof ReportTotalesPorRfcDtoSchema
>;
