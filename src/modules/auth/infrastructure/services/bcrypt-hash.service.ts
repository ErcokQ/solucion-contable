import * as bcrypt from 'bcrypt';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
/**
 * Servicio de hashing de contraseñas usando bcrypt.
 * Implementa la interfaz HashServicePort.
 */
export class BcryptHashService implements HashServicePort {
  private readonly rounds = 12;
  async hash(raw: string): Promise<string> {
    return bcrypt.hash(raw, this.rounds);
  }
  async compare(raw: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(raw, hashed);
  }
}
