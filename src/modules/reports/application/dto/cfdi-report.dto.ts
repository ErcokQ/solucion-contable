import { z } from 'zod';

/**
 * Un solo RFC (el “propio” del contribuyente).
 * El selector `tipo`
 *   • emitidos   → filtros por rfc **emisor**
 *   • recibidos  → filtros por rfc **receptor**
 *   • cancelados → CFDI cancelados donde el RFC aparece como emisor o receptor
 */
export const CfdiReportDtoSchema = z.object({
  tipo: z.enum(['emitidos', 'recibidos', 'cancelados']).default('emitidos'),
  rfc: z.string().trim().min(12).max(13),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  formato: z.enum(['json', 'xlsx']).default('xlsx'),
});

export type CfdiReportDto = z.infer<typeof CfdiReportDtoSchema>;
