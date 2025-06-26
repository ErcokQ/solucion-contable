import { EventPayloads } from '@shared/bus/EventPayloads';

/**
 * Interfaz que representa un evento de dominio.
 */
export interface DomainEvent<
  K extends keyof EventPayloads = keyof EventPayloads,
> {
  id: string; //Identificador del mensaje unico
  name: string; //Nombre del evento
  occurredOn: Date; //Fecha y hora en que se produjo el evento
  version: number; //Version del payload
  payload: EventPayloads[K]; //Datos del evento
  meta?: Record<string, unknown>; //Metadatos adicionales del evento
}
