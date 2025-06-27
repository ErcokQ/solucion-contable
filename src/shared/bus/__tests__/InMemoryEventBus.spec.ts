import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryEventBus } from '@infra/bus/InMemoryEventBus';
import { DomainEvent } from '@shared/bus/DomainEvent';

const dummyEvent: DomainEvent<'UserCreated'> = {
  id: 'uuid',
  name: 'UserCreated',
  occurredOn: new Date(),
  version: 1,
  payload: {
    userId: 1,
    email: 'test@acme.com',
    fullname: 'Test',
    provider: 'local',
    roles: [],
  },
};

describe('InMemoryEventBus', () => {
  let bus: InMemoryEventBus;

  beforeEach(() => {
    bus = new InMemoryEventBus();
  });

  it('deberia publicar y recibir un evento', async () => {
    const handler = vi.fn();

    bus.subscribe('UserCreated', handler);
    await bus.publish(dummyEvent);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(dummyEvent);
  });

  it('Deberia manejar multiples subscripciones', async () => {
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.subscribe('UserCreated', h1);
    bus.subscribe('UserCreated', h2);
    await bus.publish(dummyEvent);

    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('No debería fallar si no hay suscriptores', async () => {
    await expect(bus.publish(dummyEvent)).resolves.toBeUndefined();
  });

  it('debe esperar al controlador asíncrono', async () => {
    const asyncHandler = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    bus.subscribe('UserCreated', asyncHandler);
    await bus.publish(dummyEvent);

    expect(asyncHandler).toHaveBeenCalledOnce();
  });
});
