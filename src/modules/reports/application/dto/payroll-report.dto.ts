import { z } from 'zod';

export const PayrollReportDtoSchema = z.object({
  rfc: z.string().trim().min(12).max(13),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  formato: z.enum(['json', 'xlsx']).default('xlsx'),
});

export type PayrollReportDto = z.infer<typeof PayrollReportDtoSchema>;
