import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processCfdi } from '@cfdi/infrastructure/cfdi.processor';
import { promises as fs } from 'node:fs';
import { AppDataSource } from '@infra/orm/data-source';
import type { Repository } from 'typeorm';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { Job } from 'bullmq';
import { CfdiJobData } from '@cfdi/infrastructure/cfdi.queue';

vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));
vi.mock('@infra/orm/data-source');

describe('CFDI processor', () => {
  let repoUpdateSpy: ReturnType<typeof vi.fn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  const fakeXml = `<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"/>`;

  function makeJob(data: Partial<CfdiJobData> = {}): Job<CfdiJobData> {
    return {
      id: '1',
      name: 'process-cfdi',
      data: {
        cfdiId: 42,
        path: '/tmp/fake.xml',
        ...data,
      },
      attemptsMade: 0,
      processedOn: Date.now(),
      finishedOn: null,
      opts: {},
    } as unknown as Job<CfdiJobData>;
  }

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock readFile
    const readFileMock = vi.mocked(fs.readFile);
    readFileMock.mockResolvedValue(fakeXml);

    // Stub repository
    repoUpdateSpy = vi.fn().mockResolvedValue(undefined);
    const repoMock = { update: repoUpdateSpy } as Partial<
      Repository<CfdiHeader>
    >;
    vi.mocked(AppDataSource.getRepository).mockReturnValue(
      repoMock as Repository<CfdiHeader>,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('marca parsed y devuelve ok', async () => {
    const result = await processCfdi(makeJob());
    expect(result).toEqual({ ok: true });
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/fake.xml', 'utf8');
    expect(repoUpdateSpy).toHaveBeenCalledWith(42, { status: 'PARSED' });
    expect(logSpy).toHaveBeenCalledWith(
      '[processor] CFDI 42 procesado, ruta /tmp/fake.xml',
    );
  });

  it('propaga error si la lectura falla', async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('fs error'));
    await expect(processCfdi(makeJob())).rejects.toThrow('fs error');
  });

  it('propaga error si el repositorio falla', async () => {
    repoUpdateSpy.mockRejectedValueOnce(new Error('db error'));
    await expect(processCfdi(makeJob())).rejects.toThrow('db error');
  });
});
