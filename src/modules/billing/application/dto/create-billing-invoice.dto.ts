// modules/billing/application/dto/create-billing-invoice.dto.ts
import { z } from 'zod';
import { BillingInvoiceConceptDtoSchema } from './billing-invoice-concept.dto';

export const CreateBillingInvoiceDtoSchema = z.object({
  // quién factura (config emisor seleccionada)
  emitterConfigId: z.coerce.number().int().positive(),

  // control humano de serie/folio (opcional)
  serieId: z.coerce.number().int().positive().optional(),

  // receptor (snapshot)
  rfcReceptor: z.string().min(12).max(13),
  nombreReceptor: z.string().min(1),

  // parámetros CFDI
  moneda: z.string().length(3).default('MXN'),
  tipoCambio: z.coerce.number().positive().optional().nullable(),
  formaPago: z
    .string()
    .length(2)
    .or(z.string().length(3))
    .optional()
    .nullable(),
  metodoPago: z.string().length(3).optional().nullable(),
  usoCfdi: z.string().min(2).max(3).default('01'),
  lugarExpedicion: z.string().min(5).max(10).optional().nullable(),

  // conceptos
  concepts: z.array(BillingInvoiceConceptDtoSchema).min(1),

  // relaciones previas (opcional)
  related: z
    .array(
      z.object({
        tipoRelacion: z.string().min(2).max(2), // catálogo c_TipoRelacion
        uuidRelacionado: z.string().length(36),
      }),
    )
    .optional()
    .default([]),
});
export type CreateBillingInvoiceDto = z.infer<
  typeof CreateBillingInvoiceDtoSchema
>;
