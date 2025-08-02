// src/modules/payroll/infrastructure/http/payroll.routes.ts
import { Router } from 'express';
import { jwtAuth } from '@auth/infrastructure/middlewares/jwt-auth.middleware';
import { ApiError } from '@shared/error/ApiError';
import { PayrollQueryDtoSchema } from '@payroll/application/dto/payments-query.dto'; // ← mismo archivo que mostraste
import { ListPayrollUseCase } from '@payroll/application/use-cases/list-payroll.usecase';
import { GetPayrollDetailUseCase } from '@payroll/application/use-cases/get-payroll-detail.usecase';
import { container } from '@shared/container';

export const payrollRouter = Router();

/**
 * GET /payrolls – listado paginado con filtros
 * Query-string esperada:
 *   - page, limit
 *   - rfcReceptor
 *   - fechaDesde, fechaHasta   (formato ISO-8601)
 *   - tipoNomina               (O | E)
 */
payrollRouter.get('/payrolls', jwtAuth(), async (req, res, next) => {
  try {
    // Validar y transformar query-string → DTO
    const dto = PayrollQueryDtoSchema.parse(req.query);

    //  Ejecutar caso de uso
    const uc = container.resolve(ListPayrollUseCase);
    const result = await uc.execute(dto);

    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /payrolls/:id – detalle de una nómina
 */
payrollRouter.get('/payrolls/:id', jwtAuth(), async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw new ApiError(400, 'INVALID_ID');

    const uc = container.resolve(GetPayrollDetailUseCase);
    const payroll = await uc.execute(id);

    if (!payroll) throw new ApiError(404, 'PAYROLL_NOT_FOUND');
    res.json(payroll);
  } catch (e) {
    next(e);
  }
});
