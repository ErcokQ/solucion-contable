// src/modules/summary/infrastructure/http/summary.routes.ts
import { Router } from 'express';
import { jwtAuth } from '@auth/infrastructure/middlewares/jwt-auth.middleware';
import { SummaryQueryDtoSchema } from 'modules/summary/application/dto/summary-query.dto';
import { GetDashboardSummaryUseCase } from 'modules/summary/application/use-cases/get-dashboard-summary.usecase';
import { container } from '@shared/container';

export const summaryRouter = Router();

summaryRouter.get('/dashboard/summary', jwtAuth(), async (req, res, next) => {
  try {
    const dto = SummaryQueryDtoSchema.parse(req.query);
    const uc = container.resolve(GetDashboardSummaryUseCase);
    res.json(await uc.execute(dto));
  } catch (e) {
    next(e);
  }
});
