import { z } from 'zod';

export const ReportDiotDtoSchema = z.object({
  fechaDesde: z.coerce.date(),
  fechaHasta: z.coerce.date(),
});

export type ReportDiotDto = z.infer<typeof ReportDiotDtoSchema>;
