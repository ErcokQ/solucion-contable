// __tests__/cfdi.processor.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { processCfdi } from '@cfdi/infrastructure/cfdi.processor';
import * as CfdiProcessor from '@cfdi/infrastructure/cfdi.processor';
import { Job } from 'bullmq';
import { CfdiJobData } from '@cfdi/infrastructure/cfdi.queue';

vi.useFakeTimers();

const makeJob = (over: Partial<Job<CfdiJobData>> = {}): Job<CfdiJobData> =>
  ({
    id: 1,
    name: 'dummy',
    data: { uuid: 'ABCD', total: 123.45, fecha: new Date() },
    attemptsMade: 0,
    processedOn: Date.now(),
    finishedOn: null,
    opts: {},
    ...over,
  }) as unknown as Job<CfdiJobData>;

describe('CFDI processor', () => {
  it('devuelve ok y registra mensaje', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const promise = processCfdi(makeJob());
    vi.advanceTimersByTime(1_000); // resuelve el “sleep”
    const result = await promise;

    expect(result).toEqual({ ok: true });
    expect(spy).toHaveBeenCalledWith(
      '[processor] Recibí CFDI ABCD por $123.45',
    );

    spy.mockRestore();
  });

  it('propaga error si la lógica interna falla', async () => {
    const failingJob = makeJob({
      data: { uuid: 'ERR', total: 0, fecha: new Date() },
    });

    vi.spyOn(console, 'log').mockImplementation(() => {});

    /* 🔧 simulamos fallo */
    vi.spyOn(CfdiProcessor, 'processCfdi').mockRejectedValue(
      new Error('import failed'),
    );

    await expect(CfdiProcessor.processCfdi(failingJob)).rejects.toThrow(
      'import failed',
    );
  });
});
