import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { CfdiQueryDto } from '../dto/cfdi-query.dto';

export interface CfdiRepositoryPort {
  existsByUuid(uuid: string): Promise<boolean>;
  save(header: CfdiHeader): Promise<void>;
  findByUuid(uuid: string): Promise<CfdiHeader>;
  findFiltered(filters: CfdiQueryDto): Promise<{
    data: CfdiHeader[];
    pagination: { total: number; page: number; limit: number };
  }>;
  findByUuidWithDetails(uuid: string): Promise<CfdiHeader>;
  getXmlPathByUuid(uuid: string): Promise<string>;
  deleteByUuid(uuid: string): Promise<void>;
}
