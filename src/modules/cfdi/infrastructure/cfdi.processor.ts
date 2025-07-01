import { Job } from 'bullmq';
import { QueueProvider } from '@infra/queue/queue.provider';
import { CfdiJobData } from './cfdi.queue';

export const { worker: cfdiWorker } = QueueProvider.buildWorker(
  'cfdi-processing',
  async (job: Job<CfdiJobData>) => {
    // 🔧 aquí iría la lógica real
    console.log(
      `[processor] Recibí CFDI ${job.data.uuid} por $${job.data.total}`,
    );
    // Simular trabajo:
    await new Promise((r) => setTimeout(r, 1_000));
    return { ok: true };
  },
);
