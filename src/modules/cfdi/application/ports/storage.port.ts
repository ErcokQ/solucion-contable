export interface FileStoragePort {
  /** Devuelve la ruta o URL donde quedó almacenado el archivo */
  save(buffer: Buffer, fileName: string): Promise<string>;
}
