import { describe, it, expect } from 'vitest';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

describe('SMOKE | BullMQ', () => {
  it('procesa 1 job en cfdi-processing', async () => {
    const queue = new Queue('cfdi-processing', { connection: redis });
    const events = new QueueEvents('cfdi-processing', { connection: redis });

    const done = new Promise<string>((ok, fail) => {
      events.on('completed', ({ jobId }) => ok(jobId));
      events.on('failed', ({ failedReason }) => fail(failedReason));
    });

    const job = await queue.add('dummy', {
      uuid: 'SMOKE',
      total: 0,
      fecha: new Date(),
    });

    const completedId = await done;
    expect(completedId).toBe(job.id);
  }, 15_000);
});
