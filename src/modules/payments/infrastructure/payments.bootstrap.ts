import { container } from '@shared/container';
import { EventBus } from '@shared/bus/EventBus';
import { paymentQueue } from './payment.queue';

const bus = container.resolve<EventBus>('EventBus');

bus.subscribe('CfdiProcessed', async (evt) => {
  const { cfdiId } = evt.meta as { cfdiId: number };
  const { filePath } = evt.meta as { filePath: string };

  await paymentQueue.add('parse-payments', {
    cfdiId,
    xmlPath: filePath,
  });
});
