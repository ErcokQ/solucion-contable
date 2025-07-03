import { QueueProvider } from '@infra/queue/queue.provider';

export interface CfdiJobData {
  uuid: string;
  total: number;
  fecha: Date;
}

export const cfdiQueue = QueueProvider.buildQueue<CfdiJobData>(
  'cfdi-processing',
  {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
  },
);
