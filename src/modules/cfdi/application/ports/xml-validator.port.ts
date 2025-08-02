export interface XmlValidatorPort {
  /** Lanza Error('INVALID_XML') si el XML no es válido o no es CFDI 4.0 */
  validate(xml: string): Promise<void>;
}
