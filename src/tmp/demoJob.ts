import { cfdiQueue } from '@cfdi/infrastructure/cfdi.queue';

(async () => {
  await cfdiQueue.add('dummy-cfdi', {
    uuid: 'ABCD-1234',
    total: 1234.56,
    fecha: new Date(),
  });

  console.log('🎉 Job añadido a la cola cfdi-processing');
  process.exit(0);
})();
