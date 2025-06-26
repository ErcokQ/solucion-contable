import { DomainEvent } from './DomainEvent';
import { EventPayloads } from '@shared/bus/EventPayloads';

export interface EventBus {
  publish<E extends keyof EventPayloads>(event: DomainEvent<E>): Promise<void>;
  subscribe<E extends keyof EventPayloads>(
    name: E,
    handler: (event: DomainEvent<E>) => Promise<void> | void,
  ): void;
}
