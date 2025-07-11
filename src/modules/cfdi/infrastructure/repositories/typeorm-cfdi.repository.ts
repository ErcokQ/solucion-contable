import { injectable } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';

import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { CfdiRepositoryPort } from '@cfdi/application/ports/cfdi-repository.port';
import { AppDataSource } from '@infra/orm/data-source';

@injectable()
export class TypeOrmCfdiRepository implements CfdiRepositoryPort {
  private readonly repo: Repository<CfdiHeader>;

  constructor() {
    const ds: DataSource = AppDataSource;
    this.repo = ds.getRepository(CfdiHeader);
  }

  /** ¿Ya existe un CFDI con ese UUID? */
  existsByUuid(uuid: string): Promise<boolean> {
    return this.repo
      .createQueryBuilder('c')
      .where('c.uuid = :uuid', { uuid })
      .getExists();
  }

  /** Inserta el encabezado en la tabla */
  async save(header: CfdiHeader): Promise<void> {
    await this.repo.save(header);
  }
}
