// src/modules/reports/infrastructure/http/reports.routes.ts
import { Router } from 'express';
import { jwtAuth } from '@auth/infrastructure/middlewares/jwt-auth.middleware';
import { container } from '@shared/container';
import { CfdiReportDtoSchema } from '@reports/application/dto/cfdi-report.dto';
import { GenerateCfdiReportUseCase } from '@reports/application/use-cases/generate-cfdi-report.usecase';
import { IvaReportDtoSchema } from '@reports/application/dto/iva-report.dto';
import { GenerateIvaReportUseCase } from '@reports/application/use-cases/generate-iva-report.usecase';
import { ReportTotalesPorRfcDtoSchema } from '@reports/application/dto/report-totales-rfc.dto';
import { GenerateTotalesPorRfcUseCase } from './../../application/use-cases/generate-totales-report.usecase';
import { PayrollReportDtoSchema } from '@reports/application/dto/payroll-report.dto';
import { GeneratePayrollReportUseCase } from '@reports/application/use-cases/generate-payroll-report.usecase';

export const reportsRouter = Router();

// src/modules/reports/infrastructure/http/reports.routes.ts
reportsRouter.get('/reports/cfdi', jwtAuth(), (req, res, next) => {
  (async () => {
    const dto = CfdiReportDtoSchema.parse(req.query);
    const out = await container.resolve(GenerateCfdiReportUseCase).execute(dto);

    if (dto.formato === 'json') return res.json(out);

    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cfdi-${Date.now()}.xlsx`,
    );
    res.send(out);
  })().catch(next);
});

reportsRouter.get('/reports/iva', jwtAuth(), (req, res, next) => {
  (async () => {
    const dto = IvaReportDtoSchema.parse(req.query);
    const out = await container.resolve(GenerateIvaReportUseCase).execute(dto);

    if (dto.formato === 'json') return res.json(out);

    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=iva-${Date.now()}.xlsx`,
    );
    res.send(out);
  })().catch(next);
});

reportsRouter.get('/reports/totales-rfc', jwtAuth(), (req, res, next) => {
  (async () => {
    /* ① validar query-string */
    const dto = ReportTotalesPorRfcDtoSchema.parse(req.query);

    /* ② ejecutar caso de uso */
    const out = await container
      .resolve(GenerateTotalesPorRfcUseCase)
      .execute(dto);

    /* ③ responder */
    if (dto.formato === 'json') return res.json(out);

    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=totales-rfc-${Date.now()}.xlsx`,
    );
    res.send(out);
  })().catch(next); // 👈  ⬅️ ¡no olvides el .catch(next)!
});

reportsRouter.get('/reports/nomina', jwtAuth(), (req, res, next) => {
  (async () => {
    const dto = PayrollReportDtoSchema.parse(req.query);
    const out = await container
      .resolve(GeneratePayrollReportUseCase)
      .execute(dto);

    if (dto.formato === 'json') return res.json(out);

    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=nomina-${Date.now()}.xlsx`,
    );
    res.send(out);
  })().catch(next);
});
