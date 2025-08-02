import { SUBSTITUTION_RELATIONS } from './../../../reports/infrastructure/repositories/typeorm-reports.repository';
import { injectable } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';

import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { CfdiRepositoryPort } from '@cfdi/application/ports/cfdi-repository.port';
import { AppDataSource } from '@infra/orm/data-source';
import { CfdiQueryDto } from '@cfdi/application/dto/cfdi-query.dto';
import { ApiError } from '@shared/error/ApiError';
import { ReportDiotDto } from '@cfdi/application/dto/report-diot.dto';
import { CfdiRow } from '@cfdi/application/dto/cfdi-row.dto';

@injectable()
export class TypeOrmCfdiRepository implements CfdiRepositoryPort {
  private readonly repo: Repository<CfdiHeader>;

  constructor() {
    const ds: DataSource = AppDataSource;
    this.repo = ds.getRepository(CfdiHeader);
  }

  existsByUuid(uuid: string): Promise<boolean> {
    return this.repo
      .createQueryBuilder('c')
      .where('c.uuid = :uuid', { uuid })
      .getExists();
  }

  async save(header: CfdiHeader): Promise<void> {
    await this.repo.save(header);
  }

  async findByUuid(uuid: string) {
    const header = await this.repo.findOneBy({ uuid });
    if (!header) throw new Error('Not found');
    return header;
  }

  async findFiltered(filters: CfdiQueryDto): Promise<{
    data: CfdiRow[];
    pagination: { total: number; page: number; limit: number };
  }> {
    /* ──────────────── builder ──────────────── */
    const qb = this.repo
      .createQueryBuilder('cfdi')

      /* 1️⃣  relaciones de sustitución */
      .leftJoin(
        'cfdi_replacements',
        'rep_old',
        'rep_old.uuidReemplazado = cfdi.uuid AND rep_old.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      .leftJoin(
        'cfdi_replacements',
        'rep_new',
        'rep_new.nuevoId = cfdi.id AND rep_new.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      .leftJoin('cfdi_headers', 'nuevo', 'nuevo.id = rep_old.nuevoId') // sustituto
      .leftJoin('cfdi_headers', 'viejo', 'viejo.uuid = rep_new.uuidReemplazado') // sustituido

      /* 2️⃣  columnas */
      .select([
        'cfdi', // todas las columnas del header
        'nuevo.uuid AS "uuidSustituto"', // uuid del CFDI nuevo
        'viejo.uuid AS "uuidSustituido"', // uuid del CFDI viejo
      ]);

    /* 3️⃣  filtros dinámicos (idénticos a tu versión) */
    if (filters.rfcEmisor)
      qb.andWhere('cfdi.rfcEmisor   = :rfcEmisor', {
        rfcEmisor: filters.rfcEmisor,
      });
    if (filters.rfcReceptor)
      qb.andWhere('cfdi.rfcReceptor = :rfcReceptor', {
        rfcReceptor: filters.rfcReceptor,
      });
    if (filters.uuid)
      qb.andWhere('cfdi.uuid LIKE :uuid', { uuid: `%${filters.uuid}%` });

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

    if (filters.totalMin)
      qb.andWhere('cfdi.total >= :min', { min: filters.totalMin });
    if (filters.totalMax)
      qb.andWhere('cfdi.total <= :max', { max: filters.totalMax });
    if (filters.status)
      qb.andWhere('cfdi.status = :status', { status: filters.status });

    /* 4️⃣  paginación y orden */
    qb.orderBy('cfdi.fecha', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    /* 5️⃣  ejecutar query */
    const { entities, raw } = await qb.getRawAndEntities<{
      uuidSustituto: string | null;
      uuidSustituido: string | null;
    }>();

    /* 6️⃣  mapear a CfdiRow[] */
    const data: CfdiRow[] = entities.map((entity, i) => ({
      ...entity,
      uuidSustituto: raw[i].uuidSustituto ?? null,
      uuidSustituido: raw[i].uuidSustituido ?? null,
    }));

    /* 7️⃣  total para paginación (mismo builder sin skip/take) */
    const total = await qb.clone().skip(undefined).take(undefined).getCount();

    return {
      data,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
      },
    };
  }

  async findByUuidWithDetails(uuid: string): Promise<CfdiRow> {
    const qb = this.repo
      .createQueryBuilder('cfdi')
      .leftJoinAndSelect('cfdi.concepts', 'concepts')
      .leftJoinAndSelect('concepts.taxes', 'taxes')

      .leftJoin(
        'cfdi_replacements',
        'rep_old',
        'rep_old.uuidReemplazado = cfdi.uuid AND rep_old.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      .leftJoin(
        'cfdi_replacements',
        'rep_new',
        'rep_new.nuevoId = cfdi.id AND rep_new.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      .leftJoin('cfdi_headers', 'nuevo', 'nuevo.id = rep_old.nuevoId')
      .leftJoin('cfdi_headers', 'viejo', 'viejo.uuid = rep_new.uuidReemplazado')

      .addSelect([
        'nuevo.uuid AS "uuidSustituto"',
        'viejo.uuid AS "uuidSustituido"',
      ])
      .where('cfdi.uuid = :uuid', { uuid });

    const { entities, raw } = await qb.getRawAndEntities<{
      uuidSustituto: string | null;
      uuidSustituido: string | null;
    }>();

    if (!entities.length) throw new Error('CFDI no encontrado');

    return {
      ...entities[0],
      uuidSustituto: raw[0].uuidSustituto ?? null,
      uuidSustituido: raw[0].uuidSustituido ?? null,
    };
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
      .leftJoin(
        'cfdi_replacements',
        'rep',
        'rep.uuidReemplazado = cfdi.uuid AND rep.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      .innerJoin('cfdi.concepts', 'concept')
      .innerJoin('concept.taxes', 'tax')
      .select([
        'cfdi.rfcReceptor AS rfcReceptor',
        'tax.tipo         AS tipo',
        'tax.impuesto     AS impuesto',
        'SUM(tax.base)    AS base',
        'SUM(tax.importe) AS importe',
      ])
      .where('cfdi.fecha BETWEEN :desde AND :hasta', {
        desde: fechaDesde,
        hasta: fechaHasta,
      })
      .andWhere('rep.id IS NULL')
      .groupBy('cfdi.rfcReceptor')
      .addGroupBy('tax.tipo')
      .addGroupBy('tax.impuesto');

    return qb.getRawMany();
  }
}
