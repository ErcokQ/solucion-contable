import { z } from 'zod';

export const BulkUploadCfdiDtoSchema = z.object({
  /** ZIP en Buffer (campo "file" de multer) */
  fileBuffer: z.instanceof(Buffer),
  /** userId desde el JWT (ya validado por middleware) */
  userId: z.number().int().positive(),
});

export type BulkUploadCfdiDto = z.infer<typeof BulkUploadCfdiDtoSchema>;
