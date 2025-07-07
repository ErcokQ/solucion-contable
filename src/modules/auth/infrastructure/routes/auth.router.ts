// src/modules/auth/infraestructure/routes/auth.router.ts
import { Router } from 'express';
import { container } from '@shared/container';

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
    next(e);
  }
});

/* Refresh */
authRouter.post('/auth/refresh', async (req, res, next) => {
  try {
    const dto = RefreshDtoSchema.parse(req.body);
    const out = await container.resolve(RefreshUseCase).execute(dto);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});

/* Logout */
authRouter.post('/auth/logout', async (req, res, next) => {
  try {
    const dto = LogoutDtoSchema.parse(req.body);
    await container.resolve(LogoutUseCase).execute(dto);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
