/* worker/index.ts */
import 'reflect-metadata';
import * as dotenv from 'dotenv';

// En local usas .env, en Docker ya van vía env_file (.env.docker), así que esto no estorba
dotenv.config({ path: '.env' });

// 👇 TODAS estas iban con alias, las pasamos a rutas relativas desde src/workers/index.ts
import { AppDataSource } from '../infraestructure/orm/data-source';
import '../infraestructure/queue/queue.provider';

import '../modules/cfdi/infrastructure/cfdi.processor'; // ✅ worker CFDI
import '../modules/payments/infrastructure/payment.processor'; // ✅ worker Payments
import '../modules/payments/infrastructure/payments.bootstrap';
import '../modules/payroll/infrastructure/payroll.processor'; // ✅ worker Payroll
import '../modules/payroll/infrastructure/payroll.bootstrap';

async function bootstrap() {
  console.log('[worker] Inicializando BD…');
  await AppDataSource.initialize();
  console.log('[worker] BD OK, workers listos');
}

bootstrap();
