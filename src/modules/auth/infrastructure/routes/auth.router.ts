// src/modules/auth/infraestructure/routes/auth.router.ts
import { Router } from 'express';
import { container } from '@shared/container';
import { jwtAuth } from '../middlewares/jwt-auth.middleware';
import { requireRole } from '@shared/middlewares/require-role.middleware';
import { GenerateProductKeyUseCase } from '@auth/application/use-cases/generate-product-key.use-case';
import { RegisterAccountDtoSchema } from '@auth/application/dto/register-account.dto';
import { RegisterAccountUseCase } from '@auth/application/use-cases/register-account.use-case';
import { ListProductKeysUseCase } from '@auth/application/use-cases/list-product-keys.use-case';
import { ForgotPasswordDtoSchema } from '@auth/application/dto/forgot-password.dto';
import { ResetPasswordDtoSchema } from '@auth/application/dto/reset-password.dto';
import { RequestPasswordResetUseCase } from '@auth/application/use-cases/request-password-reset.usecase';
import { ResetPasswordUseCase } from '@auth/application/use-cases/reset-password.usecase';
import { RequestEmailVerificationDtoSchema } from '@auth/application/dto/request-email-verification.dto';
import { VerifyEmailDtoSchema } from '@auth/application/dto/verify-email.dto';
import { RequestEmailVerificationUseCase } from '@auth/application/use-cases/request-email-verification.usecase';
import { VerifyEmailUseCase } from '@auth/application/use-cases/verify-email.usecase';
import { ApiError } from '@shared/error/ApiError';

import {
  SignUpDtoSchema,
  SingInDtoSchema,
  RefreshDtoSchema,
  LogoutDtoSchema,
} from '@auth/application/dto';

import {
  SignupUseCase,
  SignInUseCase,
  RefreshUseCase,
  LogoutUseCase,
} from '@auth/application/use-cases';

export const authRouter = Router();

/* Signup */
authRouter.post('/auth/signup', async (req, res, next) => {
  try {
    const dto = SignUpDtoSchema.parse(req.body);
    const out = await container.resolve(SignupUseCase).execute(dto);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
});

/* Signin */
authRouter.post('/auth/signin', async (req, res, next) => {
  try {
    const dto = SingInDtoSchema.parse(req.body);
    const out = await container.resolve(SignInUseCase).execute(dto);
    res.status(200).json(out);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

/* Refresh */
authRouter.post('/auth/refresh', jwtAuth(), async (req, res, next) => {
  try {
    const dto = RefreshDtoSchema.parse(req.body);
    const out = await container.resolve(RefreshUseCase).execute(dto);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});

/* Logout */
authRouter.post('/auth/logout', jwtAuth(), async (req, res, next) => {
  try {
    const dto = LogoutDtoSchema.parse(req.body);
    await container.resolve(LogoutUseCase).execute(dto);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

/** endpoint que genera la clave del producto */
// Solo admin genera product keys
authRouter.post(
  '/auth/product-keys',
  jwtAuth(),
  requireRole('admin'),
  async (req, res, next) => {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'UNAUTHENTICATED');
      }

      const useCase = container.resolve(GenerateProductKeyUseCase);
      const result = await useCase.execute(req.userId);

      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * endpoint que lista todas las product keys
 */
authRouter.get(
  '/auth/product-keys',
  jwtAuth(),
  requireRole('admin'),
  async (_req, res, next) => {
    try {
      const useCase = container.resolve(ListProductKeysUseCase);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },
);

// Registro de account a partir de product key (no requiere estar logueado)
authRouter.post('/auth/register-account', async (req, res, next) => {
  try {
    // Validamos body con Zod
    const dto = RegisterAccountDtoSchema.parse(req.body);

    const useCase = container.resolve(RegisterAccountUseCase);
    const result = await useCase.execute(dto);

    // Aquí puedes elegir qué devolver; de momento devolvemos todo el DTO
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * solicitud de reseteo de password
 */
authRouter.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const dto = ForgotPasswordDtoSchema.parse(req.body);
    const out = await container
      .resolve(RequestPasswordResetUseCase)
      .execute(dto);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});

/**
 * solicitud de verificacion de email (reenviar)
 */
authRouter.post('/auth/resend-verification', async (req, res, next) => {
  try {
    const dto = RequestEmailVerificationDtoSchema.parse(req.body);
    const out = await container
      .resolve(RequestEmailVerificationUseCase)
      .execute(dto);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});

/**
 * verificacion de email
 */
authRouter.post('/auth/verify-email', async (req, res, next) => {
  try {
    const dto = VerifyEmailDtoSchema.parse(req.body);
    const out = await container.resolve(VerifyEmailUseCase).execute(dto);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});

/**
 * reseteo de password
 */
authRouter.post('/auth/reset-password', async (req, res, next) => {
  try {
    const dto = ResetPasswordDtoSchema.parse(req.body);
    const out = await container.resolve(ResetPasswordUseCase).execute(dto);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});
