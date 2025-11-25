// modules/billing/application/dto/billing-invoice-concept.dto.ts
import { z } from 'zod';

export const BillingInvoiceTaxDtoSchema = z.object({
  impuesto: z.string().min(1), // '001'|'002'|'003'
  tipoFactor: z.enum(['Tasa', 'Cuota', 'Exento']),
  tasaCuota: z.coerce.number().nullable().optional(),
  base: z.coerce.number().min(0),
  importe: z.coerce.number().min(0),
});
export type BillingInvoiceTaxDto = z.infer<typeof BillingInvoiceTaxDtoSchema>;

export const BillingInvoiceConceptDtoSchema = z.object({
  claveProdserv: z.string().min(1), // c_ClaveProdServ
  claveUnidad: z.string().min(1), // c_ClaveUnidad
  unidad: z.string().nullable().optional(),
  descripcion: z.string().min(1),
  cantidad: z.coerce.number().positive(),
  valorUnitario: z.coerce.number().min(0),
  descuento: z.coerce.number().min(0).default(0),
  importe: z.coerce.number().min(0),
  taxes: z.array(BillingInvoiceTaxDtoSchema).default([]),
});
export type BillingInvoiceConceptDto = z.infer<
  typeof BillingInvoiceConceptDtoSchema
>;
