// src/modules/payroll/infrastructure/repositories/typeorm-payroll.repository.ts
import { injectable } from 'tsyringe';
import { DataSource } from 'typeorm';
import { AppDataSource } from '@infra/orm/data-source';

import { PayrollHeader } from '@payroll/domain/entities/payroll-header.entity';
import {
  PayrollRepositoryPort,
  Paginated,
} from '@payroll/application/ports/payroll-repository.port';
import { PayrollQueryDto } from '@payroll/application/dto/payments-query.dto';

@injectable()
export class TypeOrmPayrollRepository implements PayrollRepositoryPort {
  private repo = (AppDataSource as DataSource).getRepository(PayrollHeader);

  save(header: PayrollHeader): Promise<PayrollHeader> {
    return this.repo.save(header);
  }

  async list(q: PayrollQueryDto): Promise<Paginated<PayrollHeader>> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.cfdiHeader', 'h');

    /* Filtros */
    if (q.rfcReceptor) qb.andWhere('h.rfcReceptor = :r', { r: q.rfcReceptor });
    if (q.tipoNomina) qb.andWhere('p.tipoNomina = :t', { t: q.tipoNomina });
    if (q.fechaDesde && q.fechaHasta)
      qb.andWhere('p.fechaPago BETWEEN :d AND :h', {
        d: q.fechaDesde,
        h: q.fechaHasta,
      });
    else if (q.fechaDesde)
      qb.andWhere('p.fechaPago >= :d', { d: q.fechaDesde });
    else if (q.fechaHasta)
      qb.andWhere('p.fechaPago <= :h', { h: q.fechaHasta });

    qb.orderBy('p.fechaPago', 'DESC')
      .skip((q.page - 1) * q.limit)
      .take(q.limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, pagination: { total, page: q.page, limit: q.limit } };
  }

  findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: {
        cfdiHeader: true,
        percepciones: true,
        deducciones: true,
        otrosPagos: true,
        incapacidades: true,
      },
    });
  }
}
