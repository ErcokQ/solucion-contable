import { promises as fs } from 'node:fs';
import path from 'node:path';
import { injectable } from 'tsyringe';
import { FileStoragePort } from '@cfdi/application/ports/storage.port';

@injectable()
export class LocalDiskStorageService implements FileStoragePort {
  private readonly baseDir = path.resolve(
    __dirname,
    '../../../../storage/cfdi',
  );

  async save(buffer: Buffer, fileName: string): Promise<string> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const filePath = path.join(this.baseDir, fileName);
    await fs.writeFile(filePath, buffer);
    return filePath; // se guarda en DB
  }
}
