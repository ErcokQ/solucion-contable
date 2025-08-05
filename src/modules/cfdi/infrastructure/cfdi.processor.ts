// src/modules/cfdi/infrastructure/cfdi.processor.ts
import { Job } from 'bullmq';
import { CfdiJobData } from './cfdi.queue';
import { AppDataSource } from '@infra/orm/data-source';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { CfdiConcept } from '@cfdi/domain/entities/cfdi-concept.entity';
import { CfdiTax } from '@cfdi/domain/entities/cfdi-tax.entity';
import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'node:fs';
import { QueueProvider } from '@infra/queue/queue.provider';
import type { DeepPartial } from 'typeorm';
import crypto from 'node:crypto';
import { container } from '@shared/container';
import { EventBus } from '@shared/bus/EventBus';
import { CfdiReplacement } from '@cfdi/domain/entities/cfdi-replacement.entity';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

const SUBSTITUTION_RELATIONS = ['04'] as const;
type SubstitutionRelation = (typeof SUBSTITUTION_RELATIONS)[number];
/**
 *
 * @param job Procesa el trabajo de colas del cfdi
 * @returns
 */
export async function processCfdi(job: Job<CfdiJobData>) {
  const { cfdiId, path } = job.data;
  const xml = await fs.readFile(path, 'utf8');
  const json = parser.parse(xml); // 1️⃣ parsear
  const comp = json['cfdi:Comprobante'];

  const headerRepo = AppDataSource.getRepository(CfdiHeader);
  const conceptRepo = AppDataSource.getRepository(CfdiConcept);
  const taxRepo = AppDataSource.getRepository(CfdiTax);
  const repRepo = AppDataSource.getRepository(CfdiReplacement);

  // 0️⃣ Marca status = PROCESSING y busca relacion de sustitució
  await headerRepo.update(cfdiId, { status: 'PROCESSING' });

  const toArray = <T>(value: T | T[] | undefined): T[] =>
    Array.isArray(value) ? value : value ? [value] : [];

  const relNode = comp['cfdi:CfdiRelacionados'];
  const tipoRel = relNode?.['@_TipoRelacion'] as string | undefined;

  if (
    tipoRel &&
    (SUBSTITUTION_RELATIONS as readonly string[]).includes(tipoRel)
  ) {
    const relsXml = relNode['cfdi:CfdiRelacionado'];
    const oldUuids = toArray<{ '@_UUID': string }>(relsXml).map(
      (r) => r['@_UUID'],
    );

    for (const oldUuid of oldUuids) {
      await repRepo.save({
        nuevo: { id: cfdiId },
        uuidReemplazado: oldUuid,
        tipoRelacion: tipoRel as SubstitutionRelation,
      });
    }
  }

  // 1️⃣ Desglosa conceptos
  const conceptosXml = comp['cfdi:Conceptos']?.['cfdi:Concepto'] || [];
  const conceptosArr = Array.isArray(conceptosXml)
    ? conceptosXml
    : [conceptosXml];

  for (const c of conceptosArr) {
    // 2️⃣ Crear y guardar el concepto
    const concept = conceptRepo.create({
      cfdiHeader: { id: cfdiId },
      claveProdServ: c['@_ClaveProdServ'],
      noIdentificacion: c['@_NoIdentificacion'],
      cantidad: parseFloat(c['@_Cantidad']),
      valorUnitario: parseFloat(c['@_ValorUnitario']),
      descuento: parseFloat(c['@_Descuento'] ?? '0'),
      importe: parseFloat(c['@_Importe']),
      descripcion: c['@_Descripcion'],
    });
    const savedConcept = await conceptRepo.save(concept);

    // 3️⃣ Impuestos trasladados y retenidos
    const impNode = c['cfdi:Impuestos'] || {};
    const traslados = impNode['cfdi:Traslados']?.['cfdi:Traslado'] || [];
    const retenciones = impNode['cfdi:Retenciones']?.['cfdi:Retencion'] || [];

    const trasladosArr = Array.isArray(traslados)
      ? traslados
      : traslados
        ? [traslados]
        : [];
    const retencionesArr = Array.isArray(retenciones)
      ? retenciones
      : retenciones
        ? [retenciones]
        : [];

    const allTaxes = [
      ...trasladosArr.map((x) => ({
        ...(typeof x === 'object' && x ? x : {}),
        tipo: 'TRASLADADO',
      })),
      ...retencionesArr.map((x) => ({
        ...(typeof x === 'object' && x ? x : {}),
        tipo: 'RETENIDO',
      })),
    ];

    for (const t of allTaxes) {
      const partialTax: DeepPartial<CfdiTax> = {
        concept: { id: savedConcept.id },
        tipo: t.tipo as 'TRASLADADO' | 'RETENIDO',
        impuesto: t['@_Impuesto'],
        tipoFactor: t['@_TipoFactor'],
        tasaCuota: t['@_TasaOCuota']
          ? parseFloat(t['@_TasaOCuota'])
          : undefined,
        importe: parseFloat(t['@_Importe']),
        base: parseFloat(t['@_Base'] ?? '0'),
      };

      const tax = taxRepo.create(partialTax);
      await taxRepo.save(tax);
    }
  }

  // 4️⃣ Marca status = PARSED
  await headerRepo.update(cfdiId, { status: 'PARSED' });

  console.log(`[processor] CFDI ${cfdiId} procesado, ruta ${path}`);

  /* 5️⃣  Publicar evento CfdiProcessed */
  const bus = container.resolve<EventBus>('EventBus');
  const tipoComprobante = comp['@_TipoDeComprobante'];

  /* Obtén header ya persistido para armar el payload */
  const header = await headerRepo.findOneByOrFail({ id: cfdiId });

  await bus.publish({
    id: crypto.randomUUID(),
    name: 'CfdiProcessed',
    occurredOn: new Date(),
    version: 1,
    payload: {
      uuid: header.uuid,
      rfcEmisor: header.rfcEmisor,
      rfcReceptor: header.rfcReceptor,
      fecha: header.fecha,
      total: header.total,
      conceptos: conceptosArr.length,
      tipo: tipoComprobante,
    },
    /*  datos adicionales para el módulo Payments */
    meta: { cfdiId, filePath: path },
  });

  return { ok: true };
}

/**
 * Arranca un Worker que escuche la cola 'cfdi-processing'
 * usando la función processCfdi
 */
QueueProvider.buildWorker<CfdiJobData>('cfdi-processing', processCfdi);
