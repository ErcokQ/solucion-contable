// src/modules/auth/application/use-cases/logout.usecase.ts
import { injectable } from 'tsyringe';
import { LogoutDto } from '../dto/logout.dto';

@injectable()
export class LogoutUseCase {
  // No dependencias si es stateless
  async execute(_dto: LogoutDto): Promise<void> {
    // Con estrategia stateless no hacemos nada.
    // El cliente simplemente elimina sus tokens.
    return;
  }
}
