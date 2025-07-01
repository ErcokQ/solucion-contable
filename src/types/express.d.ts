import { logger } from '@/infra/logger/logger';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
    interface Response {
      locals: { log: typeof logger };
    }
  }
}
