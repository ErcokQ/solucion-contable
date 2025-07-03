import 'reflect-metadata';
import '@infra/queue/queue.provider'; // inicializa conexión Redis

/* importa todos los módulos que registren workers */
import '@cfdi/infrastructure/cfdi.processor';
// import '@/modules/payroll/infrastructure/payroll.processor';

console.log('[worker] Arrancando workers…');

// opcional: captura señales para apagar limpiamente
process.on('SIGTERM', async () => {
  console.log('[worker] Recibida señal SIGTERM, apagando worker…');
  process.exit(0);
});
