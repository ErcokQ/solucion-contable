import Router from 'express';
import { container } from '@shared/container';
import { jwtAuth } from '@auth/infrastructure/middlewares/jwt-auth.middleware';
import { requireRole } from '@shared/middlewares/require-role.middleware';
import { ListAccountsAdminUseCase } from '@account/application/use-cases/list-accounts-admin.use-case';
import { ApiError } from '@shared/error/ApiError';
import { ToggleAccountActiveUseCase } from '@account/application/use-cases/toggle-account-active.use-case';
import { ListAccountProductKeysUseCase } from '@auth/application/use-cases/list-account-product-keys.use-case';
import { GetMyAccountUseCase } from '@account/application/use-cases/get-my-account.use-case';
export const accountRouter = Router();

/**
 * endpoint que lista todas las accounts (resumen para admin)
 */
accountRouter.get(
  '/admin/accounts',
  jwtAuth(),
  requireRole('admin'),
  async (_req, res, next) => {
    try {
      const useCase = container.resolve(ListAccountsAdminUseCase);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },
);

accountRouter.patch(
  '/admin/accounts/:id/active',
  jwtAuth(),
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { active } = req.body as { active: boolean };

      if (!Number.isInteger(id)) {
        throw new ApiError(400, 'INVALID_ACCOUNT_ID');
      }

      const useCase = container.resolve(ToggleAccountActiveUseCase);
      const result = await useCase.execute({ accountId: id, active });

      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },
);

accountRouter.get(
  '/admin/accounts/:id/product-keys',
  jwtAuth(),
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new ApiError(400, 'INVALID_ACCOUNT_ID');
      }

      const useCase = container.resolve(ListAccountProductKeysUseCase);
      const result = await useCase.execute(id);

      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },
);

/** ✅ Mi account */
accountRouter.get('/account/me', jwtAuth(), async (req, res, next) => {
  try {
    if (!req.accountId) throw new ApiError(401, 'UNAUTHENTICATED');

    const useCase = container.resolve(GetMyAccountUseCase);
    const result = await useCase.execute({ accountId: req.accountId });

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});
