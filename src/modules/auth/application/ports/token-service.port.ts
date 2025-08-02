import { SignOptions } from 'jsonwebtoken';

export interface TokenServicePort {
  /**
   * Devuelve un token firmado con el payload y las opciones especificadas expira en 15 min.
   * @param payload Objeto que contiene los datos a incluir en el token.
   * @param opts Opciones de firma del token.
   */
  sign(payload: object, opts?: SignOptions): string;
  /**
   * Verifica la validez del token y devuelve el payload decodificado.
   * @param token Token a verificar.
   * @returns El payload tipado del token.
   */
  verify<T = unknown>(token: string): T;
  /**
   * Devuelve un token de refresco firmado con el payload y las opciones especificadas.
   * @param payload Objeto que contiene los datos a incluir en el token de refresco.
   * @param opts Opciones de firma del token de refresco.
   */
  signRefresh(payload: object, opts?: SignOptions): string;
  /**
   *verifica la validez del token refrescado
   * @param token token dado al usuario
   * @returns: Paylaod del token refrescado
   */
  verifyRefresh<T = unknown>(token: string): T;
}
