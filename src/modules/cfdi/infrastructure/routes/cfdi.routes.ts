// cfdi.router.ts
import multer from 'multer';
import { ImportCfdiUseCase } from '@cfdi/application/use-cases/import-cfdi.usecase';
import { UploadCfdiDtoSchema } from '@cfdi/application/dto/upload-cfdi.dto';
import { jwtAuth } from '@auth/infrastructure/middlewares/jwt-auth.middleware';
import { container } from '@shared/container';
import { Router } from 'express';

const upload = multer(); // memoria

export const cfdiRouter = Router();
cfdiRouter.post(
  '/cfdi',
  jwtAuth(),
  upload.single('xml'),
  async (req, res, next) => {
    try {
      const dto = UploadCfdiDtoSchema.parse({
        file: req.file?.buffer,
        userId: req.userId,
      });
      const out = await container.resolve(ImportCfdiUseCase).execute(dto);
      res.status(202).json(out); // Accepted, job encolado
    } catch (e) {
      next(e);
    }
  },
);
