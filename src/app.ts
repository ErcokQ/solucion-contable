// src/app.ts
import 'reflect-metadata';
import { config } from '@shared/config';
import express from 'express';
import { AppDataSource } from '@infra/orm/data-source';

import { requestLogger } from '@infra/http/logger.middleware';
import { healthRouter } from 'routes/health.router';
import { docsRouter } from 'routes/docs.router';
import { authRouter } from '@auth/infrastructure/routes/auth.router';
import { cfdiRouter } from '@cfdi/infrastructure/routes/cfdi.routes';
import { paymentsRouter } from '@payments/infrastructure/routes/payments.routes';
import { payrollRouter } from '@payroll/infrastructure/routes/payroll.routes';
import { summaryRouter } from '@summary/infrastructure/routes/summary.routes';
import { reportsRouter } from '@reports/infrastructure/routes/reports.routes';

import { ApiError } from '@shared/error/ApiError';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';
import cors from 'cors';

(async () => {
  /* 1️⃣  Conecta a la BD — debe hacerse una sola vez */
  await AppDataSource.initialize();
  console.log('📦  Data Source inicializado');
})();

/* 2️⃣  Configura Express **después** */
const app = express();

/**COnfiguracion cors */
app.use(
  cors({
    origin: config.URL_FRONTEND,
    credentials: true, // si luego envías cookies
  }),
);

const PORT = config.PORT;
const base = config.BASE_SERVER;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(healthRouter);
app.use(docsRouter);
app.use(base, authRouter); // /api/sc/v1/...
app.use(base, cfdiRouter);
app.use(base, paymentsRouter);
app.use(base, payrollRouter);
app.use(base, summaryRouter);
app.use(base, reportsRouter);

app.use((_req, _res, next) => next(new ApiError(404, 'ROUTE_NOT_FOUND')));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀  API en http://localhost:${PORT}${base}`);
  console.log(`📑  Swagger http://localhost:${PORT}/docs`);
});
