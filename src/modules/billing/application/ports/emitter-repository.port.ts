// modules/billing/application/ports/emitter-repository.port.ts
import { EmitterConfig } from '@billing/domain/entities/emitter-config.entity';

export interface EmitterRepositoryPort {
  findById(id: number): Promise<EmitterConfig | null>;
}
