// modules/billing/application/ports/pdf-renderer.port.ts
export interface PdfRendererPort {
  /** Genera un PDF (A4/carta) desde el XML timbrado y datos auxiliares */
  render(xmlTimbrado: string): Promise<Buffer>;
}
