import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { BcryptHashService } from '@auth/infrastructure/services/bcrypt-hash.service';

describe('BcryptHashService', () => {
  let svc: BcryptHashService;

  beforeEach(() => {
    svc = new BcryptHashService();
  });

  it('debería generar un hash bcrypt válido', async () => {
    const hash = await svc.hash('Pa$$w0rd!');
    expect(hash).toMatch(/^\$2[abxy]\$\d{2}\$/);
  });

  it('debería validar la contraseña correcta', async () => {
    const hash = await svc.hash('secreto');
    expect(await svc.compare('secreto', hash)).toBe(true);
  });

  it('debería rechazar la contraseña incorrecta', async () => {
    const hash = await svc.hash('secreto');
    expect(await svc.compare('otro', hash)).toBe(false);
  });

  it('dos hashes del mismo texto plano deben ser distintos (salt)', async () => {
    const h1 = await svc.hash('salado');
    const h2 = await svc.hash('salado');
    expect(h1).not.toBe(h2);
  });
});
