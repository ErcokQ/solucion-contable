// src/infrastructure/http/arena.router.ts
import Arena from 'bull-arena';
import { Router } from 'express';
import * as BullMQ from 'bullmq'; // 👈 módulo completo
import { cfdiQueue } from '@cfdi/infrastructure/cfdi.queue';

const arena = Arena(
  {
    BullMQ, // 👈 se declara aquí
    queues: [
      {
        type: 'bullmq',
        name: cfdiQueue.name, // "cfdi-processing"
        hostId: 'redis-main',
        redis: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        },
      },
      // …añade más colas si lo necesitas…
    ],
  },
  {
    basePath: '/arena',
    disableListen: true, // lo montaremos en Express
  },
);

export default Router().use('/', arena);
