import { injectable } from 'tsyringe';
import { EventEmitter } from 'node:events';
import { DomainEvent } from '@shared/bus/DomainEvent';
import { EventBus } from '@shared/bus/EventBus';
import { EventPayloads } from '@shared/bus/EventPayloads';

@injectable()
export class InMemoryEventBus implements EventBus {
  private emitter = new EventEmitter();

  async publish<E extends keyof EventPayloads>(
    event: DomainEvent<E>,
  ): Promise<void> {
    this.emitter.emit(event.name, event);
  }

  subscribe<E extends keyof EventPayloads>(
    eventName: E,
    handler: (event: DomainEvent<E>) => void | Promise<void>,
  ): void {
    this.emitter.on(
      eventName,
      (raw) => void Promise.resolve(handler(raw as DomainEvent<E>)),
    );
  }
}
