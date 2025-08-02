// src/modules/cfdi/infrastructure/cfdi.router.ts
import multer from 'multer';
import { Router } from 'express';
import { container } from '@shared/container';
import { jwtAuth } from '@auth/infrastructure/middlewares/jwt-auth.middleware';
import { ImportCfdiUseCase } from '@cfdi/application/use-cases/import-cfdi.usecase';
import { BulkImportCfdiUseCase } from '@cfdi/application/use-cases/bulk-import-cfdi.usecase';
import { UploadCfdiDtoSchema } from '@cfdi/application/dto/upload-cfdi.dto';
import { BulkUploadCfdiDtoSchema } from '@cfdi/application/dto/bulk-upload-cfdi.dto';
import { ApiError } from '@shared/error/ApiError';
import { ListCfdiJobsUseCase } from '@cfdi/application/use-cases/list-cfdi-jobs.usecase';
import { ListCfdiUseCase } from '@cfdi/application/use-cases/list-cfdi.usecase';
import { CfdiQueryDtoSchema } from '@cfdi/application/dto/cfdi-query.dto';
import { GetCfdiDetailUseCase } from '@cfdi/application/use-cases/get-cfdi-detail.usecase';
import { GetCfdiXmlUseCase } from '@cfdi/application/use-cases/get-cfdi-xml.usecase';
import { DeleteCfdiUseCase } from '@cfdi/application/use-cases/delete-cfdi.usecase';
import { ReportDiotDtoSchema } from '@cfdi/application/dto/report-diot.dto';
import { GenerateDiotReportUseCase } from '@cfdi/application/use-cases/generate-diot-report.usecase';
import { createReadStream } from 'fs';

const upload = multer(); // almacena en memoria

export const cfdiRouter = Router();

// Importación de un solo XML
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
      res.status(202).json(out);
    } catch (e) {
      next(e);
    }
  },
);

// Importación masiva desde un ZIP
cfdiRouter.post(
  '/cfdi/uploads',
  jwtAuth(),
  upload.single('file'),
  async (req, res, next) => {
    try {
      // 1️⃣ validar que venga el ZIP
      if (!req.file?.buffer) {
        throw new ApiError(400, 'NO_ZIP_UPLOADED');
      }

      // 2️⃣ parsear y validar DTO
      const { fileBuffer, userId } = BulkUploadCfdiDtoSchema.parse({
        fileBuffer: req.file.buffer,
        userId: req.userId, // TS ya sabe que no es undefined tras parse
      });

      // 3️⃣ resolver y ejecutar el caso de uso
      const bulkUseCase = container.resolve(BulkImportCfdiUseCase);
      const results = await bulkUseCase.execute(fileBuffer, userId);

      // 4️⃣ responder
      res.status(202).json(results);
    } catch (e) {
      next(e);
    }
  },
);

cfdiRouter.get('/cfdi/jobs', jwtAuth(), async (req, res, next) => {
  try {
    const useCase = container.resolve(ListCfdiJobsUseCase);
    const limit = parseInt(req.query.limit as string) || 20;
    const jobs = await useCase.execute(limit);
    res.json(jobs);
  } catch (e) {
    next(e);
  }
});

cfdiRouter.get('/cfdi', jwtAuth(), async (req, res, next) => {
  try {
    const dto = CfdiQueryDtoSchema.parse(req.query);
    const useCase = container.resolve(ListCfdiUseCase);
    const result = await useCase.execute(dto);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

cfdiRouter.get('/cfdi/:uuid', jwtAuth(), async (req, res, next) => {
  try {
    const useCase = container.resolve(GetCfdiDetailUseCase);
    const result = await useCase.execute(req.params.uuid);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

cfdiRouter.get('/cfdi/:uuid/xml', jwtAuth(), async (req, res, next) => {
  try {
    const useCase = container.resolve(GetCfdiXmlUseCase);
    const path = await useCase.execute(req.params.uuid);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${req.params.uuid}.xml`,
    );

    const stream = createReadStream(path);
    stream.pipe(res);
  } catch (e) {
    next(e);
  }
});

cfdiRouter.delete('/cfdi/:uuid', jwtAuth(), async (req, res, next) => {
  try {
    const useCase = container.resolve(DeleteCfdiUseCase);
    const result = await useCase.execute(req.params.uuid);
    res.status(200).json({
      message: 'CFDI eliminado correctamente',
      ...result,
    });
  } catch (e) {
    next(e);
  }
});

cfdiRouter.delete('/cfdi', jwtAuth(), (req, res, next) => {
  try {
    throw new ApiError(405, 'DELETE_NOT_ALLOWED', {
      message:
        'No se permite eliminar múltiples CFDIs a través de este endpoint',
    });
  } catch (e) {
    next(e);
  }
});

cfdiRouter.get('/cfdi/report/diot', jwtAuth(), async (req, res, next) => {
  try {
    const dto = ReportDiotDtoSchema.parse(req.query);
    const useCase = container.resolve(GenerateDiotReportUseCase);
    const data = await useCase.execute(dto);

    res.json(
      data.map((row) => ({
        ...row,
        base: parseFloat(row.base),
        importe: parseFloat(row.importe),
      })),
    );
  } catch (e) {
    next(e);
  }
});
