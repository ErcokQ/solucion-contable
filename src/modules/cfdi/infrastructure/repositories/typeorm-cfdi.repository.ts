import { injectable } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';

import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { CfdiRepositoryPort } from '@cfdi/application/ports/cfdi-repository.port';
import { AppDataSource } from '@infra/orm/data-source';
import { CfdiQueryDto } from '@cfdi/application/dto/cfdi-query.dto';
import { ApiError } from '@shared/error/ApiError';
import { ReportDiotDto } from '@cfdi/application/dto/report-diot.dto';

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

  async findByUuid(uuid: string) {
    const header = await this.repo.findOneBy({ uuid });
    if (!header) throw new Error('Not found');
    return header;
  }

  async findFiltered(filters: CfdiQueryDto) {
    const qb = this.repo.createQueryBuilder('cfdi');

    if (filters.rfcEmisor) {
      qb.andWhere('cfdi.rfcEmisor = :rfcEmisor', {
        rfcEmisor: filters.rfcEmisor,
      });
    }
    if (filters.rfcReceptor) {
      qb.andWhere('cfdi.rfcReceptor = :rfcReceptor', {
        rfcReceptor: filters.rfcReceptor,
      });
    }
    if (filters.uuid) {
      qb.andWhere('cfdi.uuid LIKE :uuid', { uuid: `%${filters.uuid}%` });
    }
    if (filters.fechaDesde && filters.fechaHasta) {
      qb.andWhere('cfdi.fecha BETWEEN :desde AND :hasta', {
        desde: filters.fechaDesde,
        hasta: filters.fechaHasta,
      });
    } else if (filters.fechaDesde) {
      qb.andWhere('cfdi.fecha >= :desde', { desde: filters.fechaDesde });
    } else if (filters.fechaHasta) {
      qb.andWhere('cfdi.fecha <= :hasta', { hasta: filters.fechaHasta });
    }

    if (filters.totalMin) {
      qb.andWhere('cfdi.total >= :min', { min: filters.totalMin });
    }
    if (filters.totalMax) {
      qb.andWhere('cfdi.total <= :max', { max: filters.totalMax });
    }

    if (filters.status) {
      qb.andWhere('cfdi.status = :status', { status: filters.status });
    }

    qb.orderBy('cfdi.fecha', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
      },
    };
  }

  async findByUuidWithDetails(uuid: string) {
    const repo = this.repo;

    const header = await repo.findOne({
      where: { uuid },
      relations: {
        concepts: {
          taxes: true,
        },
      },
    });

    if (!header) throw new Error('CFDI no encontrado');

    return header;
  }

  async getXmlPathByUuid(uuid: string): Promise<string> {
    const header = await this.repo.findOneBy({ uuid });
    if (!header || !header.xmlPath) throw new Error('XML no encontrado');
    return header.xmlPath;
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const header = await this.repo.findOneBy({ uuid });
    if (!header) {
      throw new ApiError(404, 'CFDI_NOT_FOUND');
    }

    // 1️⃣ Intentar borrar XML
    if (header.xmlPath) {
      try {
        await unlink(header.xmlPath);
      } catch (err) {
        console.warn('[WARN] No se pudo borrar XML:', err);
      }
    }

    // 2️⃣ Borrar en base
    await this.repo.delete({ uuid });
  }

  async getDiotReport({ fechaDesde, fechaHasta }: ReportDiotDto) {
    const qb = this.repo
      .createQueryBuilder('cfdi')
      .innerJoin('cfdi.concepts', 'concept')
      .innerJoin('concept.taxes', 'tax')
      .select([
        'cfdi.rfcReceptor AS rfcReceptor',
        'tax.tipo AS tipo',
        'tax.impuesto AS impuesto',
        'SUM(tax.base) AS base',
        'SUM(tax.importe) AS importe',
      ])
      .where('cfdi.fecha BETWEEN :desde AND :hasta', {
        desde: fechaDesde,
        hasta: fechaHasta,
      })
      .groupBy('cfdi.rfcReceptor')
      .addGroupBy('tax.tipo')
      .addGroupBy('tax.impuesto');

    return qb.getRawMany();
  }
}
