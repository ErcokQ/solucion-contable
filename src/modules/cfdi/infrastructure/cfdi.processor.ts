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

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});
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

  // 0️⃣ Marca status = PROCESSING
  await headerRepo.update(cfdiId, { status: 'PROCESSING' });

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
  return { ok: true };
}

/**
 * Arranca un Worker que escuche la cola 'cfdi-processing'
 * usando la función processCfdi
 */
QueueProvider.buildWorker<CfdiJobData>('cfdi-processing', processCfdi);
