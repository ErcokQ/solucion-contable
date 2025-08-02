import { Processor, QueueEvents, Worker, Queue, JobsOptions } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';

const redisOpts: RedisOptions = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null, // 👈  requisito de BullMQ
  enableReadyCheck: false, // acelera el boot en dev
};

export const connection = new IORedis(redisOpts);

export class QueueProvider {
  static buildQueue<T>(name: string, defaultJobOpts?: JobsOptions) {
    return new Queue<T>(name, {
      connection,
      defaultJobOptions: defaultJobOpts,
    });
  }

  static buildWorker<T>(name: string, processor: Processor<T>) {
    const worker = new Worker<T>(name, processor, { connection });
    const events = new QueueEvents(name, { connection });

    events.on('failed', ({ jobId, failedReason }) =>
      console.error(`[${name}] Job ${jobId} Fallido: ${failedReason}`),
    );
    events.on('completed', ({ jobId }) =>
      console.log(`[${name}] Job ${jobId} completado ✅`),
    );

    return { worker, events };
  }
}
