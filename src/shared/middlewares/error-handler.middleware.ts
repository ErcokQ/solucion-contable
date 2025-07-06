// src/shared/middlewares/error-handler.middleware.ts
import { ErrorRequestHandler } from 'express';
import { ApiError } from '@shared/error/ApiError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res // ←  sin “return”
      .status(err.status)
      .json({ error: err.code, details: err.details });
    return; // ←  opcional, para cortar la ejecución
  }

  console.error(err); // logging interno
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
};
