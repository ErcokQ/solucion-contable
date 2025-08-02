// src/modules/reports/infrastructure/typeorm-reports.repository.ts
import { injectable } from 'tsyringe';
import { DataSource } from 'typeorm';
import { AppDataSource } from '@infra/orm/data-source';
import {
  ReportsRepositoryPort,
  CfdiReportRow,
} from '@reports/application/ports/cfdi-report.port';
import { IvaReportRow } from '@reports/application/ports/iva-report.port';
import { ReportTotalesPorRfcDto } from '@reports/application/dto/report-totales-rfc.dto';
import { TotalesPorRfcRow } from '@reports/application/ports/cfdi-report.port';
import { PayrollDetRow } from '@reports/application/ports/cfdi-report.port';

export const SUBSTITUTION_RELATIONS = ['04'] as const;

@injectable()
export class TypeOrmReportsRepository implements ReportsRepositoryPort {
  private readonly ds: DataSource = AppDataSource;

  async getCfdiReport(params: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    tipo: 'emitidos' | 'recibidos' | 'cancelados';
    rfc: string; // ← único RFC “propio”
  }): Promise<CfdiReportRow[]> {
    const qb = this.ds
      .createQueryBuilder('cfdi_headers', 'c')
      .leftJoin(
        'cfdi_replacements',
        'rep',
        'rep.uuidReemplazado = c.uuid AND rep.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      .select([
        'c.uuid        AS UUID',
        'c.fecha       AS Fecha',
        'c.rfcEmisor   AS RFC_Emisor',
        'c.rfcReceptor AS RFC_Receptor',
        'c.total       AS Total',
        'c.status      AS Estatus',
      ])
      .andWhere('rep.id IS NULL');

    /* ---------- filtros por fecha ---------- */
    if (params.fechaDesde)
      qb.andWhere('c.fecha >= :d', { d: params.fechaDesde });

    if (params.fechaHasta)
      qb.andWhere('c.fecha <= :h', { h: params.fechaHasta });

    /* ---------- lógica de tipo ---------- */
    switch (params.tipo) {
      case 'emitidos': // CFDI donde *yo* soy emisor
        qb.andWhere('c.rfcEmisor = :rfc', { rfc: params.rfc });
        break;

      case 'recibidos': // CFDI donde *yo* soy receptor
        qb.andWhere('c.rfcReceptor = :rfc', { rfc: params.rfc });
        break;

      case 'cancelados': // CFDI cancelados con mi RFC en cualquiera de los dos lados
        qb.andWhere("c.status = 'CANCELLED'").andWhere(
          '(c.rfcEmisor = :rfc OR c.rfcReceptor = :rfc)',
          {
            rfc: params.rfc,
          },
        );
        break;
    }

    return qb.orderBy('c.fecha').getRawMany<CfdiReportRow>();
  }

  async getIvaReport({
    tipo,
    rfc,
    fechaDesde,
    fechaHasta,
  }: {
    tipo: 'emitidos' | 'recibidos';
    rfc: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<IvaReportRow[]> {
    const qb = this.ds
      .createQueryBuilder('cfdi_concepts', 'cc')
      .innerJoin('cfdi_headers', 'ch', 'cc.cfdiHeaderId = ch.id')
      .leftJoin(
        'cfdi_replacements',
        'rep',
        'rep.uuidReemplazado = ch.uuid AND rep.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      .innerJoin('cfdi_taxes', 'ct', 'ct.conceptId = cc.id')
      .select([
        'ch.uuid         AS UUID',
        'ch.fecha        AS Fecha',
        'ch.rfcEmisor    AS RFC_Emisor',
        'ch.nombreEmisor AS Nombre_Emisor',
        'ch.rfcReceptor  AS RFC_Receptor',
        'ct.base         AS Base',
        'ct.tasa_cuota   AS Tasa',
        'ct.importe      AS IVA',
        'ct.tipo_factor  AS TipoFactor',
        'cc.descripcion  AS Concepto',
      ])
      .andWhere('rep.id IS NULL')
      .andWhere(
        tipo === 'emitidos' ? 'ch.rfcEmisor = :rfc' : 'ch.rfcReceptor = :rfc',
        { rfc },
      );

    if (fechaDesde) qb.andWhere('ch.fecha >= :desde', { desde: fechaDesde });
    if (fechaHasta) qb.andWhere('ch.fecha <= :hasta', { hasta: fechaHasta });

    const filas = await qb
      .orderBy('ch.fecha')
      .getRawMany<Omit<IvaReportRow, 'Tipo' | 'Mes' | 'Año'>>();

    const tipoCalculado = tipo === 'emitidos' ? 'trasladado' : 'acreditable';

    return filas.map((row) => {
      const fechaObj = new Date(row.Fecha);

      return {
        ...row,
        Tipo: tipoCalculado,
        Mes: String(fechaObj.getMonth() + 1).padStart(2, '0'),
        Año: String(fechaObj.getFullYear()),
      };
    });
  }

  async getTotalesPorRfc({
    tipo,
    rfc,
    fechaDesde,
    fechaHasta,
    incluirNomina = false,
    agruparGlobal = false,
    origen = 'todos',
  }: ReportTotalesPorRfcDto): Promise<TotalesPorRfcRow[]> {
    const qb = this.ds
      .createQueryBuilder('cfdi_headers', 'c')
      /* descarta CFDI sustituidos */
      .leftJoin(
        'cfdi_replacements',
        'rep',
        'rep.uuidReemplazado = c.uuid AND rep.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      /* todo CFDI tiene ≥1 concepto  */
      .innerJoin('cfdi_concepts', 'cc', 'cc.cfdiHeaderId = c.id');

    /* ───────── ORIGEN ───────── */
    switch (origen) {
      case 'nomina': // solo CFDI con complemento nómina
        qb.innerJoin(
          'payroll_headers',
          'ph',
          'ph.cfdiHeaderId = c.id',
        ).leftJoin('cfdi_taxes', 'ct', 'ct.conceptId = cc.id'); // ← alias ct existe
        break;

      case 'factura': // solo CFDI con impuestos (descarta nómina)
        qb.innerJoin('cfdi_taxes', 'ct', 'ct.conceptId = cc.id')
          .leftJoin('payroll_headers', 'ph', 'ph.cfdiHeaderId = c.id')
          .andWhere('ph.id IS NULL');
        break;

      case 'todos': // mezcla; decide por incluirNomina
      default:
        if (incluirNomina) {
          qb.leftJoin('cfdi_taxes', 'ct', 'ct.conceptId = cc.id');
        } else {
          qb.innerJoin('cfdi_taxes', 'ct', 'ct.conceptId = cc.id');
        }
        break;
    }

    /* ───────── SELECT ───────── */
    const selectContraparte = agruparGlobal
      ? `'TODOS' AS rfcContraparte`
      : tipo === 'emitidos'
        ? 'c.rfcReceptor AS rfcContraparte'
        : 'c.rfcEmisor   AS rfcContraparte';

    qb.select([
      selectContraparte,
      'SUM(c.subTotal)  AS subtotal',
      'SUM(c.descuento) AS descuento',
      'SUM(c.total)     AS total',
      `SUM(CASE WHEN ct.tipo = 'TRASLADADO' THEN ct.importe ELSE 0 END) AS iva`,
      'COUNT(DISTINCT c.uuid) AS cantidad',
    ]);

    /* ───────── WHERE ───────── */
    qb.where(
      tipo === 'emitidos' ? 'c.rfcEmisor = :rfc' : 'c.rfcReceptor = :rfc',
      { rfc },
    ).andWhere('rep.id IS NULL');

    if (fechaDesde) qb.andWhere('c.fecha >= :fd', { fd: fechaDesde });
    if (fechaHasta) qb.andWhere('c.fecha <= :fh', { fh: fechaHasta });

    /* ───────── GROUP / ORDER ───────── */
    if (!agruparGlobal) {
      qb.groupBy(tipo === 'emitidos' ? 'c.rfcReceptor' : 'c.rfcEmisor').orderBy(
        'rfcContraparte',
      );
    }

    const raw = await qb.getRawMany<TotalesPorRfcRow>();

    const data = raw.map((r) => ({
      ...r,
      subtotal: r.subtotal ?? '0',
      descuento: r.descuento ?? '0',
      total: r.total ?? '0',
      iva: r.iva ?? '0',
      cantidad: r.cantidad ?? '0',
    }));

    return data;
  }

  async getPayrollReport({
    rfc,
    fechaDesde,
    fechaHasta,
  }: {
    rfc: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<PayrollDetRow[]> {
    const qb = this.ds
      .createQueryBuilder('cfdi_headers', 'ch')
      .innerJoin('payroll_headers', 'ph', 'ph.cfdiHeaderId = ch.id')
      .leftJoin(
        'payroll_deductions',
        'pd',
        `pd.payrollHeaderId = ph.id
       AND pd.tipoDeduccion = '002'`,
      )
      /* ——— Subsidio al empleo ——— */
      .leftJoin(
        'payroll_other_payments',
        'pop',
        `pop.payrollHeaderId = ph.id
       AND pop.tipoOtroPago = 'SubsidioAlEmpleo'`,
      )
      /* ——— Sustituciones ——— */
      .leftJoin(
        'cfdi_replacements',
        'rep',
        'rep.uuidReemplazado = ch.uuid AND rep.tipoRelacion IN (:...rel)',
        { rel: SUBSTITUTION_RELATIONS },
      )
      /* ——— SELECT ——— */
      .select([
        'ch.uuid                                AS UUID',
        'ph.fechaPago                           AS FechaPago',
        'ch.rfcReceptor                         AS RFC_Receptor',
        'ph.diasPagados                         AS DiasPagados',
        'ph.totalPercepciones                   AS Percepciones',
        'ph.totalDeducciones                    AS Deducciones',
        'COALESCE(pd.importe, 0)                AS ISR',
        'COALESCE(pop.importe, 0)               AS Subsidio',
        '(ph.totalPercepciones - ph.totalDeducciones) AS Neto',
      ])
      .where('ch.rfcEmisor = :rfc', { rfc })
      .andWhere('rep.id IS NULL');

    /* rango de fechas (opcional) */
    if (fechaDesde) qb.andWhere('ph.fechaPago >= :fd', { fd: fechaDesde });
    if (fechaHasta) qb.andWhere('ph.fechaPago <= :fh', { fh: fechaHasta });

    return qb.orderBy('ph.fechaPago').getRawMany<PayrollDetRow>();
  }
}
