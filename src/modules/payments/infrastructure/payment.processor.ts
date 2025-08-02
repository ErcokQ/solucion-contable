/* ────────────────────────────────────────────────────────────────
 * src/modules/payments/infrastructure/payment.processor.ts
 * ----------------------------------------------------------------
 * Worker que procesa el complemento de Pagos 2.0 a partir del
 * evento CfdiProcessed (cola cfdi-payments).  Incluye:
 *   • Validación de errores con ApiError
 *   • Publicación de PaymentRegistered
 *   • Tipado sin `any`
 * ──────────────────────────────────────────────────────────────── */

import { Job } from 'bullmq';
import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';

import { XMLParser } from 'fast-xml-parser';
import { DeepPartial } from 'typeorm';

import { AppDataSource } from '@infra/orm/data-source';
import { QueueProvider } from '@infra/queue/queue.provider';

import { PaymentJobData } from './payment.queue';
import { PaymentHeader } from '@payments/domain/entities/payment-header.entity';
import { PaymentDetail } from '@payments/domain/entities/payment-detail.entity';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';

import { PaymentRepositoryPort } from '@payments/application/ports/payment-repository.port';
import { EventBus } from '@shared/bus/EventBus';
import { ApiError } from '@shared/error/ApiError';
import { container } from '@shared/container';

/* ---------- XML PARSER ---------- */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

/* ---------- TYPES AUX ---------- */
type PagoXML = {
  '@_FechaPago': string;
  '@_FormaDePagoP': string;
  '@_MonedaP'?: string;
  '@_TipoCambioP'?: string;
  '@_Monto': string;
  'pago20:DoctosRelacionados'?: {
    'pago20:DoctoRelacionado': DoctoRelacionadoXML | DoctoRelacionadoXML[];
  };
};

type DoctoRelacionadoXML = {
  '@_IdDocumento': string;
  '@_ImpPagado': string;
  '@_ImpSaldoAnt': string;
  '@_ImpSaldoInsoluto': string;
};

/* ---------- PROCESSOR ---------- */
export async function processPayments(job: Job<PaymentJobData>) {
  const { cfdiId, xmlPath } = job.data;

  /* 1. Leer y parsear XML */
  let json: unknown;
  try {
    const xml = await fs.readFile(xmlPath, 'utf8');
    json = parser.parse(xml);
  } catch (err) {
    throw new ApiError(400, 'XML_READ_OR_PARSE_ERROR', err);
  }

  /* 2. Localizar nodo Pagos 2.0 */
  const comp = (json as Record<string, unknown>)['cfdi:Comprobante'] as
    | Record<string, unknown>
    | undefined;

  if (!comp) {
    throw new ApiError(422, 'COMPROBANTE_NODE_MISSING');
  }

  const complemento = comp['cfdi:Complemento'] as
    | Record<string, unknown>
    | undefined;

  const nodoPagos = complemento?.['pago20:Pagos'] as
    | { 'pago20:Pago': PagoXML | PagoXML[] }
    | undefined;
  if (!nodoPagos) {
    // CFDI sin complemento de pagos: no es error fatal
    return { ok: true, message: 'SIN_COMPLEMENTO_PAGOS' };
  }

  const pagosArr: PagoXML[] = Array.isArray(nodoPagos['pago20:Pago'])
    ? (nodoPagos['pago20:Pago'] as PagoXML[])
    : [nodoPagos['pago20:Pago'] as PagoXML];

  /* 3. Repositorios y servicios */
  const paymentRepo = container.resolve<PaymentRepositoryPort>('PaymentRepo');
  const eventBus = container.resolve<EventBus>('EventBus');

  for (const pago of pagosArr) {
    const monto = Number(pago['@_Monto']);
    if (Number.isNaN(monto)) {
      throw new ApiError(400, 'INVALID_PAGO_NUMERIC', {
        campo: 'Monto',
        valor: pago['@_Monto'],
      });
    }

    /* 3.1 Detalles relacionados */
    const relRaw =
      pago['pago20:DoctosRelacionados']?.['pago20:DoctoRelacionado'];
    const relArr: DoctoRelacionadoXML[] = relRaw
      ? Array.isArray(relRaw)
        ? relRaw
        : [relRaw]
      : [];

    /* 3.2 Construir encabezado */
    const header = AppDataSource.getRepository(PaymentHeader).create({
      cfdiHeader: { id: cfdiId } as DeepPartial<CfdiHeader>,
      fechaPago: new Date(pago['@_FechaPago']),
      monto,
      formaPago: pago['@_FormaDePagoP'],
      moneda: pago['@_MonedaP'] ?? 'MXN',
      tipoCambio: pago['@_TipoCambioP']
        ? Number(pago['@_TipoCambioP'])
        : undefined,
      detalles: relArr.map(
        (d): DeepPartial<PaymentDetail> => ({
          uuidRelacionado: d['@_IdDocumento'],
          importePagado: Number(d['@_ImpPagado']),
          saldoAnterior: Number(d['@_ImpSaldoAnt']),
          saldoInsoluto: Number(d['@_ImpSaldoInsoluto']),
        }),
      ),
    });

    /* 3.3 Persistir */
    let savedHeader: PaymentHeader;
    try {
      savedHeader = await paymentRepo.save(header);
    } catch (err) {
      throw new ApiError(500, 'DB_ERROR', err);
    }

    /* 3.4 Evento de dominio */
    await eventBus.publish({
      id: crypto.randomUUID(),
      name: 'PaymentRegistered',
      occurredOn: new Date(),
      version: 1,
      payload: {
        paymentId: savedHeader.id,
        cfdiUuid: (savedHeader.cfdiHeader as CfdiHeader).uuid,
        fechaPago: savedHeader.fechaPago,
        monto: savedHeader.monto,
      },
    });
  }

  return { ok: true, message: 'PAGOS_PROCESADOS' };
}

/* ---------- WORKER ---------- */
QueueProvider.buildWorker<PaymentJobData>('cfdi-payments', processPayments);
