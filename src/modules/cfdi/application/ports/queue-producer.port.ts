export interface QueueProducerPort {
  addJob(name: string, data: unknown): Promise<void>;
}
