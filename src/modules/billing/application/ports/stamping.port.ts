// modules/billing/application/ports/stamping.port.ts
export interface StampingPort {
  /** Envía el XML al PAC y devuelve UUID y XML timbrado */
  stamp(
    xml: string,
  ): Promise<{ uuid: string; xmlTimbrado: string; fechaTimbrado: Date }>;

  /** Cancela un CFDI en el PAC; algunos PAC devuelven acuse XML */
  cancel(uuid: string): Promise<{ acuseXml?: string | null }>;
}
