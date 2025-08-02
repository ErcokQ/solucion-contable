import { Job, Queue } from 'bullmq';
import { connection } from '@infra/queue/queue.provider';

const queueName = 'cfdi-processing';
const cfdiQueue = new Queue(queueName, { connection });

function formatJob(job: Job) {
  return {
    id: job.id,
    name: job.name,
    status: job.finishedOn
      ? 'completed'
      : job.failedReason
        ? 'failed'
        : job.processedOn
          ? 'active'
          : 'waiting',
    attemptsMade: job.attemptsMade,
    createdAt: job.timestamp,
    updatedAt: job.finishedOn ?? job.processedOn,
    failedReason: job.failedReason ?? null,
    data: {
      cfdiId: job.data?.cfdiId,
      uuid: job.data?.uuid,
      originalFilename: job.data?.originalFilename,
    },
  };
}

export class BullCfdiMonitorService {
  static async listAllJobs(limit = 20) {
    const waiting = await cfdiQueue.getJobs(['waiting'], 0, limit - 1);
    const active = await cfdiQueue.getJobs(['active'], 0, limit - 1);
    const completed = await cfdiQueue.getJobs(['completed'], 0, limit - 1);
    const failed = await cfdiQueue.getJobs(['failed'], 0, limit - 1);

    return {
      waiting: waiting.map(formatJob),
      active: active.map(formatJob),
      completed: completed.map(formatJob),
      failed: failed.map(formatJob),
    };
  }
}
