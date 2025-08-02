/* worker/index.ts */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { AppDataSource } from '@infra/orm/data-source';
import '@infra/queue/queue.provider';

import '@cfdi/infrastructure/cfdi.processor'; // ✅ worker CFDI
import '@payments/infrastructure/payment.processor'; // ✅ worker Payments
import '@payments/infrastructure/payments.bootstrap';
import '@payroll/infrastructure/payroll.processor'; // ✅ worker Payroll
import '@payroll/infrastructure/payroll.bootstrap';

async function bootstrap() {
  console.log('[worker] Inicializando BD…');
  await AppDataSource.initialize();
  console.log('[worker] BD OK, workers listos');
}
bootstrap();
