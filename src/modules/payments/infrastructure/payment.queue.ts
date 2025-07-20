import { QueueProvider } from '@infra/queue/queue.provider';

export interface PaymentJobData {
  cfdiId: number;
  xmlPath: string;
}

export const paymentQueue = QueueProvider.buildQueue<PaymentJobData>(
  'cfdi-payments',
  {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
);
