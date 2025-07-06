// src/app.ts
import { config } from '@shared/config';
import express from 'express';

import { requestLogger } from '@infra/http/logger.middleware';
import { healthRouter } from 'routes/health.router';
import { docsRouter } from 'routes/docs.router';

import { ApiError } from '@shared/error/ApiError';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';

const app = express();
const PORT = config.PORT;

// ---------- Middlewares globales ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registro de solicitudes (debe ir pronto para loggear todo)
app.use(requestLogger);

// ---------- Rutas ----------
app.use(healthRouter);
app.use(docsRouter);

// ---------- 404 ----------
app.use((_req, _res, next) => next(new ApiError(404, 'ROUTE_NOT_FOUND')));

// ---------- Manejador de errores (SIEMPRE el último) ----------
app.use(errorHandler);

// ---------- Arranque ----------
app.listen(PORT, () => {
  console.log(`🚀  API escuchando en http://localhost:${PORT}`);
  console.log(`📑  Swagger UI en  http://localhost:${PORT}/docs`);
});
