// src/types/bull-arena.d.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'bull-arena' {
  import { Router } from 'express';
  import { Adapter } from 'bull-arena/dist/src/queueAdapters/base';

  interface ArenaOptions {
    queues: {
      name: string;
      hostId: string;
      type: 'bull' | 'bullmq';
      queue: Adapter;
    }[];
  }

  interface ArenaConfig {
    basePath?: string;
    disableListen?: boolean;
  }

  function Arena(options: ArenaOptions, config?: ArenaConfig): Router;
  namespace Arena {
    const BullMQAdapter: any;
    const adapters: any;
  }

  export = Arena; // CommonJS-style default export
}
