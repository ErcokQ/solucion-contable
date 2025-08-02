// src/modules/summary/infrastructure/typeorm-summary.repository.ts
import { injectable } from 'tsyringe';
import { AppDataSource } from '@infra/orm/data-source';
import {
  SummaryRepositoryPort,
  PendingRow,
} from '@summary/application/ports/summary-repository.port';
import { DataSource } from 'typeorm';

@injectable()
export class TypeOrmSummaryRepository implements SummaryRepositoryPort {
  // reutilizamos la conexión global
  private readonly ds: DataSource = AppDataSource;

  /* ---------------- CFDI ---------------- */
  async getCfdiKpis(desde: Date, hasta: Date) {
    const [row] = await this.ds.query(
      `
    SELECT
      /* CFDI de hoy */
      SUM(CASE WHEN c.fecha = CURDATE() THEN 1       ELSE 0 END) AS today,
      /* Total CFDI del mes (conteo) */
      COUNT(*)                                                   AS month,
      /* Monto facturado HOY */
      SUM(CASE WHEN c.fecha = CURDATE() THEN c.total ELSE 0 END) AS montoToday,
      /* Monto facturado MES */
      SUM(c.total)                                               AS montoMonth,
      /* Pendientes */
      SUM(CASE WHEN c.status = 'PENDING' THEN 1 ELSE 0 END)      AS pending
    FROM cfdi_headers c
    WHERE c.fecha BETWEEN ? AND ?
    `,
      [desde, hasta],
    );

    return {
      today: Number(row.today) || 0,
      month: Number(row.month) || 0,
      montoToday: Number(row.montoToday) || 0,
      montoMonth: Number(row.montoMonth) || 0,
      pending: Number(row.pending) || 0,
    };
  }

  async getCfdiSeriesLast15() {
    return this.ds.query(`
      SELECT DATE(fecha) AS date, COUNT(*) AS count
      FROM cfdi_headers
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)
      GROUP BY DATE(fecha)
      ORDER BY DATE(fecha)
    `);
  }

  /* ---------------- PAGOS ---------------- */
  /* ─────────── Pagos KPIs ─────────── */
  async getPaymentsKpis(desde: Date, hasta: Date) {
    /* KPI principal: hoy / monto */
    const [row] = await this.ds.query(
      `
    SELECT
      /* pagos registrados HOY */
      SUM(CASE WHEN p.fechaPago = CURDATE() THEN 1 ELSE 0 END) AS today,
      /* monto pagado en el rango (mes) */
      IFNULL(SUM(p.monto),0)                                   AS monto
    FROM payment_headers p
    WHERE p.fechaPago BETWEEN ? AND ?
    `,
      [desde, hasta],
    );

    /* serie últimos 15 días */
    const last15 = await this.ds.query(`
    SELECT DATE(p.fechaPago) AS date, COUNT(*) AS count
    FROM payment_headers p
    WHERE p.fechaPago >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)
    GROUP BY DATE(p.fechaPago)
    ORDER BY DATE(p.fechaPago)
  `);

    return {
      today: Number(row.today) || 0,
      monto: Number(row.monto) || 0,
      last15,
    };
  }

  /* ---------------- NÓMINA ---------------- */
  async getPayrollKpis(d: Date, h: Date) {
    return this.ds
      .query(
        `
      SELECT
        COUNT(*)                                AS month,
        SUM(totalPercepciones)                  AS percepciones,
        SUM(totalDeducciones)                   AS deducciones
      FROM payroll_headers
      WHERE fechaPago BETWEEN ? AND ?
      `,
        [d, h],
      )
      .then((r) => r[0]);
  }

  /* ---------------- PENDIENTES ---------------- */
  async getPendings(): Promise<PendingRow[]> {
    const pendCfdi = this.ds.query(`
      SELECT id, uuid             AS ref, created_at AS fecha,
             'CFDI'               AS tipo,
             'Sin procesar'       AS msg
      FROM cfdi_headers
      WHERE status = 'PENDING'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const pendPagos = this.ds.query(`
      SELECT p.id,
             p.id                AS ref,
             p.fechaPago         AS fecha,
             'PAGO'              AS tipo,
             'Saldo insoluto'    AS msg
      FROM payment_headers p
      JOIN payment_details d ON d.paymentHeaderId = p.id   --  ✅ columna correcta
      WHERE d.saldoInsoluto > 0
      ORDER BY p.fechaPago DESC
      LIMIT 20
    `);

    const pendNom = this.ds.query(`
      SELECT id, id AS ref, fechaPago AS fecha,
             'NÓMINA'              AS tipo,
             'Por contabilizar'    AS msg
      FROM payroll_headers
      WHERE totalDeducciones = 0
      ORDER BY fechaPago DESC
      LIMIT 20
    `);

    const rows = [
      ...(await pendCfdi),
      ...(await pendPagos),
      ...(await pendNom),
    ];
    // ordenamos por fecha desc y devolvemos sólo 20
    return rows
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
      .slice(0, 20);
  }
}
