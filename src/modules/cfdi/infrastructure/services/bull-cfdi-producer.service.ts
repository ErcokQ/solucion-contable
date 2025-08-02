import { injectable } from 'tsyringe';
import { QueueProducerPort } from '@cfdi/application/ports/queue-producer.port';
import { cfdiQueue, CfdiJobData } from '@cfdi/infrastructure/cfdi.queue';

@injectable()
export class BullCfdiProducer implements QueueProducerPort {
  async addJob(name: string, data: CfdiJobData): Promise<void> {
    await cfdiQueue.add(name, data, { removeOnComplete: 1000 });
  }
}
