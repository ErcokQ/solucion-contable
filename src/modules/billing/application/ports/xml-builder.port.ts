// modules/billing/application/ports/xml-builder.port.ts
import { BillingInvoice } from '@billing/domain/entities/billing-invoice.entity';

export interface XmlBuilderPort {
  /** Construye el XML CFDI 4.0 listo para timbrar desde el agregado BillingInvoice */
  build(invoice: BillingInvoice): Promise<string>;
}
