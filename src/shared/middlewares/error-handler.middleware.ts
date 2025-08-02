// src/shared/middlewares/error-handler.middleware.ts
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '@shared/error/ApiError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  /* ---------- Errores de dominio ---------- */
  if (err instanceof ApiError) {
    res
      .status(err.status)
      .json({ error: err.code ?? err.message, details: err.details });
    return;
  }

  /* ---------- Errores de validación (Zod) ---------- */
  if (err instanceof ZodError) {
    const first = err.errors[0]; // primer fallo
    res.status(400).json({
      error: first.message, // p.ej. PASSWORD_TOO_SHORT
      path: first.path.join('.'), // campo que falló: "password"
    });
    return;
  }

  /* ---------- Otros (body-parser, etc.) ---------- */
  if ('status' in err && typeof err.status === 'number') {
    res.status(err.status).json({ error: err.message || 'BAD_REQUEST' });
    return;
  }

  /* ---------- Fallback 500 ---------- */
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
};
