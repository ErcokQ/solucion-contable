import { QueueProvider } from '@infra/queue/queue.provider';

export interface PayrollJobData {
  cfdiId: number;
  xmlPath: string;
}

export const payrollQueue = QueueProvider.buildQueue<PayrollJobData>(
  'cfdi-payroll',
  { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
);
