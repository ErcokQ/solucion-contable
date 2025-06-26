import 'reflect-metadata';
import { container } from 'tsyringe';
import { EventBus } from '@shared/bus/EventBus';
import { InMemoryEventBus } from '@infra/bus/InMemoryEventBus';

container.register<EventBus>('EventBus', {
  useClass: InMemoryEventBus,
});

export { container };
