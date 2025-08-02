export interface HashServicePort {
  /**
   * Devuelve hash del texto plano usando el algoritmo de hashing especificado.
   * @param raw texto plano (contraseña)
   */
  hash(raw: string): Promise<string>;
  /**
   * Compara el texto plano con el hash generado.
   * @param raw
   * @param hashed
   * @returns true si contraseña coincide con el hash, false en caso contrario.
   */
  compare(raw: string, hashed: string): Promise<boolean>;
}
