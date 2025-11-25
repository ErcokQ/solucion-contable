export interface FileStoragePort {
  /** Devuelve la ruta o URL donde quedó almacenado el archivo */
  save(buffer: Buffer, fileName: string): Promise<string>;

  // Opcionales (no rompen implementaciones existentes):
  read?(filePath: string): Promise<Buffer>;
  remove?(filePath: string): Promise<void>;
}
