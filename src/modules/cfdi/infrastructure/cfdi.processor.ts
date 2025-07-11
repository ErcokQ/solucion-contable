// src/modules/cfdi/infrastructure/cfdi.processor.ts
import { Job } from 'bullmq';
import { CfdiJobData } from './cfdi.queue';
import { AppDataSource } from '@infra/orm/data-source';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'node:fs';
import { QueueProvider } from '@infra/queue/queue.provider';

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
  parser.parse(xml);

  console.log(`[processor] CFDI ${cfdiId} procesado, ruta ${path}`);

  // marcar encabezado como "processed" en DB
  const repo = AppDataSource.getRepository(CfdiHeader);
  await repo.update(cfdiId, { status: 'PARSED' });

  return { ok: true };
}

/**
 * Arranca un Worker que escuche la cola 'cfdi-processing'
 * usando la función processCfdi
 */
QueueProvider.buildWorker<CfdiJobData>('cfdi-processing', processCfdi);
