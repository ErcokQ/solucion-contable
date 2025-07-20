import { container } from '@shared/container';
import { EventBus } from '@shared/bus/EventBus';
import { payrollQueue } from './payroll.queue';

const bus = container.resolve<EventBus>('EventBus');
bus.subscribe('CfdiProcessed', async (evt) => {
  if (evt.payload.tipo !== 'N') return; // Solo CFDI de Nómina
  const { cfdiId, filePath } = evt.meta as { cfdiId: number; filePath: string };
  await payrollQueue.add('parse-payroll', { cfdiId, xmlPath: filePath });
});
