// __tests__/logger.middleware.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response } from 'express';

import { requestLogger } from '@infra/http/logger.middleware';
import { logger } from '@infra/logger/logger';
import type { Logger as WinstonLogger } from 'winston';

describe('requestLogger middleware', () => {
  let app: ReturnType<typeof express>;

  /** 💡 mocks reutilizables */
  const childInfo = vi.fn();
  const childMock = {
    info: childInfo,
  } as unknown as WinstonLogger;

  beforeEach(() => {
    /** Mock de logger.child(...) → devuelve nuestro childMock */
    vi.spyOn(logger, 'child').mockReturnValue(childMock);

    app = express();
    app.use(requestLogger); // << middleware bajo prueba
    app.get('/ping', (req: Request, res: Response) => {
      res.json({ id: req.requestId });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    childInfo.mockReset();
  });

  it('asigna requestId y registra logs de entrada/salida', async () => {
    const res = await request(app).get('/ping').expect(200);
    const { id } = res.body as { id: string };

    /** 1️⃣ logger.child se invoca con metadatos correctos */
    expect(logger.child).toHaveBeenCalledWith({
      requestId: id,
      route: '/ping',
    });

    /** 2️⃣ child.info se llama dos veces (entrada y salida) */
    expect(childInfo).toHaveBeenCalledTimes(2);

    /** 3️⃣ Entrada: placeholder + argumentos */
    expect(childInfo.mock.calls[0]).toEqual(['→ %s %s', 'GET', '/ping']);

    /** 4️⃣ Salida: placeholder + código + duración */
    const second = childInfo.mock.calls[1];
    expect(second[0]).toBe('← %s %s %d %dms'); // plantilla
    expect(second[1]).toBe('GET'); // método
    expect(second[2]).toBe('/ping'); // ruta
    expect(second[3]).toBe(200); // status
    expect(typeof second[4]).toBe('number'); // ms transcurridos
  });
});
