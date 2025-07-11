// src/worker/index.ts
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { AppDataSource } from '@infra/orm/data-source'; // <-- importa tu data source
import '@infra/queue/queue.provider'; // inicializa Redis
import '@cfdi/infrastructure/cfdi.processor'; // arranca el Worker

async function bootstrap() {
  console.log('[worker] Inicializando conexión a BD…');
  await AppDataSource.initialize();
  console.log('[worker] Conexión a BD establecida');
  console.log('[worker] Arrancando workers…');
}

bootstrap().catch((err) => {
  console.error('[worker] Error arrancando:', err);
  process.exit(1);
});

// Opcional: manejo de cierre limpio
process.on('SIGTERM', async () => {
  console.log('[worker] Recibida señal SIGTERM, cerrando BD…');
  await AppDataSource.destroy();
  process.exit(0);
});
