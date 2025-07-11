import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';

export interface CfdiRepositoryPort {
  existsByUuid(uuid: string): Promise<boolean>;
  save(header: CfdiHeader): Promise<void>;
}
