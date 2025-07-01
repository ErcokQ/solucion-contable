import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { logger } from '@infra/logger/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const id = uuid();
  req.requestId = id;

  const child = logger.child({ requestId: id, route: req.path });
  res.locals.log = child;

  const started = Date.now();
  child.info('→ %s %s', req.method, req.originalUrl);

  res.on('finish', () => {
    child.info(
      '← %s %s %d %dms',
      req.method,
      req.originalUrl,
      res.statusCode,
      Date.now() - started,
    );
  });

  next();
}
