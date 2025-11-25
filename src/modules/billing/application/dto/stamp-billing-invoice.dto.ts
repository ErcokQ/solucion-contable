// modules/billing/application/dto/stamp-billing-invoice.dto.ts
import { z } from 'zod';

export const StampBillingInvoiceDtoSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  // si quisieras permitir re-timbrar con serie/folio distinto:
  overrideSerieId: z.coerce.number().int().positive().optional(),
});
export type StampBillingInvoiceDto = z.infer<
  typeof StampBillingInvoiceDtoSchema
>;
