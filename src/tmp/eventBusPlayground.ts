import { container } from '@shared/container';
import { EventBus } from '@shared/bus/EventBus';
import { randomUUID } from 'node:crypto';

async function demo() {
  const bus = container.resolve<EventBus>('EventBus');

  bus.subscribe('UserCreated', async (event) => {
    console.log(`💚  Recibí evento: ${event.payload.email}`);
  });

  await bus.publish({
    id: randomUUID(),
    name: 'UserCreated',
    payload: {
      userId: 1,
      email: 'enrique.munguia@m3rsync.com',
      fullname: 'Enrique Munguia',
      provider: 'local',
      roles: ['admin'],
    },
    occurredOn: new Date(),
    version: 1,
  });
}

demo();
