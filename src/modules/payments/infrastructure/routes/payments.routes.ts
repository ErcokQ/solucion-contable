import { Router } from 'express';
import { jwtAuth } from '@auth/infrastructure/middlewares/jwt-auth.middleware';
import { ApiError } from '@shared/error/ApiError';
import { PaymentsQueryDtoSchema } from '@payments/application/dto/payments-query.dto';
import { ListPaymentsUseCase } from '@payments/application/use-cases/payments-list.use-case';
import { GetPaymentDetailUseCase } from '@payments/application/use-cases/payments-detail.use-case';
import { container } from '@shared/container';

export const paymentsRouter = Router();
paymentsRouter.get('/payments', jwtAuth(), async (req, res, next) => {
  try {
    const dto = PaymentsQueryDtoSchema.parse(req.query);
    const uc = container.resolve(ListPaymentsUseCase);
    res.json(await uc.execute(dto));
  } catch (e) {
    next(e);
  }
});

paymentsRouter.get('/payments/:id', jwtAuth(), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const uc = container.resolve(GetPaymentDetailUseCase);
    const payment = await uc.execute(id);
    if (!payment) throw new ApiError(404, 'PAYMENT_NOT_FOUND');
    res.json(payment);
  } catch (e) {
    next(e);
  }
});
