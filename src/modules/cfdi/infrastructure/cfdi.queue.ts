import { QueueProvider } from '@infra/queue/queue.provider';

export interface CfdiJobData {
  cfdiId: number; // PK en la BD
  path: string; // xmlPath donde quedó guardado
  uuid?: string;
  originalFilename?: string;
}

export const cfdiQueue = QueueProvider.buildQueue<CfdiJobData>(
  'cfdi-processing',
  {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
  },
);
