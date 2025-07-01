import 'dotenv/config';
import express, { Request, Response } from 'express';
import { healthRouter } from 'routes/health.router';
import { docsRouter } from 'routes/docs.router';
import { ApiError } from '@shared/error/ApiError';
import arenaRouter from '@infra/http/arena.router';

// import { container } from './shared/container';   // inyecta dependencias (no usado aún)

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas base
app.use(healthRouter);
app.use(docsRouter);
app.use(arenaRouter);

// 404 para rutas no encontradas
app.use((_req, _res, next) => next(new ApiError(404, 'Ruta Inexistente')));

// Manejador de errores
app.use((err: Error, _req: Request, res: Response) => {
  const status = err instanceof ApiError ? err.status : 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀  API escuchando en http://localhost:${PORT}`);
  console.log(`📑  Swagger UI en  http://localhost:${PORT}/docs`);
});
