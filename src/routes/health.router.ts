import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Online',
    timestamp: Date.now(),
  });
});
