import { Job } from 'bullmq';
import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';

import { XMLParser } from 'fast-xml-parser';
import { DeepPartial } from 'typeorm';

import { QueueProvider } from '@infra/queue/queue.provider';
import { AppDataSource } from '@infra/orm/data-source';

import { PayrollJobData } from './payroll.queue';
import { PayrollHeader } from '@payroll/domain/entities/payroll-header.entity';
import { PayrollPerception } from '@payroll/domain/entities/payroll-perceptions.entity';
import { PayrollDeduction } from '@payroll/domain/entities/payroll-deductions.entity';
import { PayrollOtherPayment } from '@payroll/domain/entities/payroll-other-payments.entity';
import { PayrollIncapacity } from '@payroll/domain/entities/payroll-incapacities.entity';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';

import { container } from '@shared/container';
import { EventBus } from '@shared/bus/EventBus';
import { PayrollRepositoryPort } from '@payroll/application/ports/payroll-repository.port';
import { ApiError } from '@shared/error/ApiError';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

console.log('[PAYROLL] Processor cargado');

/* ---------- TYPES AUX ---------- */
type NominaXML = {
  '@_TipoNomina': 'O' | 'E';
  '@_FechaPago': string;
  '@_FechaInicialPago': string;
  '@_FechaFinalPago': string;
  '@_NumDiasPagados': string;
  '@_TotalPercepciones': string;
  '@_TotalDeducciones'?: string;
  '@_TotalOtrosPagos'?: string;
  'nomina12:Percepciones'?: {
    'nomina12:Percepcion': PercepcionXML | PercepcionXML[];
  };
  'nomina12:Deducciones'?: {
    'nomina12:Deduccion': DeduccionXML | DeduccionXML[];
  };
  'nomina12:OtrosPagos'?: { 'nomina12:OtroPago': OtroPagoXML | OtroPagoXML[] };
  'nomina12:Incapacidades'?: {
    'nomina12:Incapacidad': IncapacidadXML | IncapacidadXML[];
  };
};

type PercepcionXML = {
  '@_TipoPercepcion': string;
  '@_Clave': string;
  '@_Concepto': string;
  '@_ImporteGravado': string;
  '@_ImporteExento': string;
};

type DeduccionXML = {
  '@_TipoDeduccion': string;
  '@_Clave': string;
  '@_Concepto': string;
  '@_Importe': string;
};

type OtroPagoXML = {
  '@_TipoOtroPago': string;
  '@_Clave': string;
  '@_Concepto': string;
  '@_Importe': string;
};

type IncapacidadXML = {
  '@_TipoIncapacidad': string;
  '@_DiasIncapacidad': string;
  '@_Importe': string;
};

/* ---------- PROCESSOR ---------- */
export async function processPayroll(job: Job<PayrollJobData>) {
  const { cfdiId, xmlPath } = job.data;

  /* 1. Leer y parsear XML */
  let comp: Record<string, unknown>;
  try {
    const xml = await fs.readFile(xmlPath, 'utf8');
    const json = parser.parse(xml);
    comp = json['cfdi:Comprobante'];
  } catch (err) {
    throw new ApiError(400, 'XML_READ_OR_PARSE_ERROR', err);
  }

  /* 2. Encontrar nodo Nomina */
  const complemento = comp['cfdi:Complemento'] as
    | Record<string, unknown>
    | undefined;
  const nomina = complemento?.['nomina12:Nomina'] as NominaXML | undefined;

  if (!nomina) return { ok: true, message: 'SIN_COMPLEMENTO_NOMINA' };

  /* 3. Repositorios */
  const payrollRepo = container.resolve<PayrollRepositoryPort>('PayrollRepo');
  const bus = container.resolve<EventBus>('EventBus');

  /* 4. Mapear header */
  const header = AppDataSource.getRepository(PayrollHeader).create({
    cfdiHeader: { id: cfdiId } as DeepPartial<CfdiHeader>,
    tipoNomina: nomina['@_TipoNomina'],
    fechaPago: new Date(nomina['@_FechaPago']),
    fechaInicialPago: new Date(nomina['@_FechaInicialPago']),
    fechaFinalPago: new Date(nomina['@_FechaFinalPago']),
    diasPagados: Number(nomina['@_NumDiasPagados']),
    totalPercepciones: Number(nomina['@_TotalPercepciones'] ?? 0),
    totalDeducciones: Number(nomina['@_TotalDeducciones'] ?? 0),
    totalOtrosPagos: Number(nomina['@_TotalOtrosPagos'] ?? 0),

    percepciones: mapPercepciones(nomina),
    deducciones: mapDeducciones(nomina),
    otrosPagos: mapOtrosPagos(nomina),
    incapacidades: mapIncapacidades(nomina),
  });

  /* 5. Persistir */
  let saved: PayrollHeader;
  try {
    saved = await payrollRepo.save(header);
  } catch (err) {
    throw new ApiError(500, 'DB_ERROR', err);
  }

  /* 6. Publicar evento */
  await bus.publish({
    id: crypto.randomUUID(),
    name: 'PayrollCreated',
    occurredOn: new Date(),
    version: 1,
    payload: {
      payrollId: saved.id,
      cfdiUuid: (saved.cfdiHeader as CfdiHeader).uuid,
      tipoNomina: saved.tipoNomina,
      fechaPago: saved.fechaPago,
      totalPercepciones: saved.totalPercepciones,
      totalDeducciones: saved.totalDeducciones,
    },
  });

  return { ok: true, message: 'NÓMINA_PROCESADA' };
}

/* ---------- Helpers ---------- */
function mapPercepciones(nomina: NominaXML): DeepPartial<PayrollPerception>[] {
  const raw = nomina['nomina12:Percepciones']?.['nomina12:Percepcion'] || [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(
    (p): DeepPartial<PayrollPerception> => ({
      tipoPercepcion: p['@_TipoPercepcion'],
      clave: p['@_Clave'],
      concepto: p['@_Concepto'],
      importeGravado: Number(p['@_ImporteGravado']),
      importeExento: Number(p['@_ImporteExento']),
    }),
  );
}

function mapDeducciones(nomina: NominaXML): DeepPartial<PayrollDeduction>[] {
  const raw = nomina['nomina12:Deducciones']?.['nomina12:Deduccion'] || [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(
    (d): DeepPartial<PayrollDeduction> => ({
      tipoDeduccion: d['@_TipoDeduccion'],
      clave: d['@_Clave'],
      concepto: d['@_Concepto'],
      importe: Number(d['@_Importe']),
    }),
  );
}

function mapOtrosPagos(nomina: NominaXML): DeepPartial<PayrollOtherPayment>[] {
  const raw = nomina['nomina12:OtrosPagos']?.['nomina12:OtroPago'] || [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(
    (o): DeepPartial<PayrollOtherPayment> => ({
      tipoOtroPago: o['@_TipoOtroPago'],
      clave: o['@_Clave'],
      concepto: o['@_Concepto'],
      importe: Number(o['@_Importe']),
    }),
  );
}

function mapIncapacidades(nomina: NominaXML): DeepPartial<PayrollIncapacity>[] {
  const raw = nomina['nomina12:Incapacidades']?.['nomina12:Incapacidad'] || [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(
    (i): DeepPartial<PayrollIncapacity> => ({
      tipoIncapacidad: i['@_TipoIncapacidad'],
      diasIncapacidad: Number(i['@_DiasIncapacidad']),
      importe: Number(i['@_Importe']),
    }),
  );
}

/* ---------- WORKER ---------- */
QueueProvider.buildWorker<PayrollJobData>('cfdi-payroll', processPayroll);
