import { Router } from 'express';

import { container } from '@shared/container';
import { jwtAuth } from '../middlewares/jwt-auth.middleware';
import { ApiError } from '@shared/error/ApiError';

import { GetMeUseCase } from '@auth/application/use-cases/get-me.use-case';
import { UpdateMeUseCase } from '@auth/application/use-cases/update-me.use-case';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.use-case';
import { SetAvatarUseCase } from '@auth/application/use-cases/set-avatar.use-case';

import {
  UpdateMeDtoSchema,
  ChangePasswordDtoSchema,
} from '@auth/application/dto/user-profile.dto';
import { avatarUpload } from '../middlewares/avatar-upload.middleware';

export const usersRouter = Router();

/** GET /users/me */
usersRouter.get('/users/me', jwtAuth(), async (req, res, next) => {
  try {
    if (!req.userId) throw new ApiError(401, 'UNAUTHENTICATED');
    const out = await container.resolve(GetMeUseCase).execute(req.userId);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});

/** PATCH /users/me */
usersRouter.patch('/users/me', jwtAuth(), async (req, res, next) => {
  try {
    if (!req.userId) throw new ApiError(401, 'UNAUTHENTICATED');
    const dto = UpdateMeDtoSchema.parse(req.body);
    const out = await container
      .resolve(UpdateMeUseCase)
      .execute(req.userId, dto);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
});

/** POST /users/me/change-password */
usersRouter.post(
  '/users/me/change-password',
  jwtAuth(),
  async (req, res, next) => {
    try {
      if (!req.userId) throw new ApiError(401, 'UNAUTHENTICATED');
      const dto = ChangePasswordDtoSchema.parse(req.body);
      await container.resolve(ChangePasswordUseCase).execute(req.userId, dto);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
);

/** POST /users/me/avatar (multipart) */
usersRouter.post(
  '/users/me/avatar',
  jwtAuth(),
  avatarUpload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.userId) throw new ApiError(401, 'UNAUTHENTICATED');
      if (!req.file) throw new ApiError(400, 'AVATAR_REQUIRED');

      const publicUrl = `/uploads/avatars/${req.file.filename}`;

      const out = await container
        .resolve(SetAvatarUseCase)
        .execute(req.userId, publicUrl);
      res.status(200).json(out);
    } catch (e) {
      next(e);
    }
  },
);
