import { Job } from 'bullmq';
import { QueueProvider } from '@infra/queue/queue.provider';
import { CfdiJobData } from './cfdi.queue';

// cfdi.processor.ts
export async function processCfdi(job: Job<CfdiJobData>) {
  console.log(
    `[processor] Recibí CFDI ${job.data.uuid} por $${job.data.total}`,
  );
  await new Promise((r) => setTimeout(r, 1_000));
  return { ok: true };
}

export const { worker: cfdiWorker } = QueueProvider.buildWorker(
  'cfdi-processing',
  processCfdi,
);
