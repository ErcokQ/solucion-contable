// src/scripts/rebuild-payments-from-xml.ts
import 'reflect-metadata';
import { AppDataSource } from '@infra/orm/data-source';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { paymentQueue } from '@payments/infrastructure/payment.queue';

async function main() {
  await AppDataSource.initialize();

  const cfdiRepo = AppDataSource.getRepository(CfdiHeader);

  // Opción simple: todos los CFDI
  const headers = await cfdiRepo.find();
  console.log(`Encolando ${headers.length} CFDI para reprocesar pagos...`);

  for (const h of headers) {
    // Cada job reutiliza TU worker processPayments
    await paymentQueue.add('parse-payments', {
      cfdiId: h.id,
      xmlPath: h.xmlPath,
    });
  }

  console.log('Jobs encolados. Ahora deja correr el worker cfdi-payments.');
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('Error reprocesando pagos:', err);
  process.exit(1);
});
