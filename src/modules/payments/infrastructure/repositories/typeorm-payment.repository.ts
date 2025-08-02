// modules/payments/infrastructure/repositories/typeorm-payment.repository.ts
import { injectable } from 'tsyringe';
import { PaymentHeader } from '@payments/domain/entities/payment-header.entity';
import { AppDataSource } from '@infra/orm/data-source';
import { PaymentRepositoryPort } from '@payments/application/ports/payment-repository.port';
import { PaymentsQueryDto } from '@payments/application/dto/payments-query.dto';

@injectable()
export class TypeOrmPaymentRepository implements PaymentRepositoryPort {
  private repo = AppDataSource.getRepository(PaymentHeader);

  async save(header: PaymentHeader): Promise<PaymentHeader> {
    return this.repo.save(header); // TypeORM devuelve la entidad con id
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: { detalles: true, cfdiHeader: true },
    });
  }

  async list(f: PaymentsQueryDto) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.detalles', 'd')
      .leftJoinAndSelect('p.cfdiHeader', 'h');

    if (f.rfcReceptor) qb.andWhere('h.rfcReceptor = :r', { r: f.rfcReceptor });
    if (f.fechaDesde && f.fechaHasta)
      qb.andWhere('p.fechaPago BETWEEN :d AND :h', {
        d: f.fechaDesde,
        h: f.fechaHasta,
      });

    qb.orderBy('p.fechaPago', 'DESC')
      .skip((f.page - 1) * f.limit)
      .take(f.limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page: f.page, limit: f.limit } };
  }
}
