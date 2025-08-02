import { logger } from '@/infra/logger/logger';
import 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      userId?: number;
      userRoles?: string[];
    }
    interface Response {
      locals: { log: typeof logger };
    }
  }
}
