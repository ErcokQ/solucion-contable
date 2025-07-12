import { z } from 'zod';

/**
 * Estructura del dto para recepcion xml
 */
export const UploadCfdiDtoSchema = z.object({
  /** Buffer si llega multipart; si no, xmlBase64 debe existir */
  file: z.instanceof(Buffer).optional(),
  /** XML en Base64 si llega como string (opcional si se usa multipart) */
  xmlBase64: z.string().optional(),
  /** Identificador del usuario propietario (tomado de JWT servidor) */
  userId: z.number().int().positive(),
});

export type UploadCfdiDto = z.infer<typeof UploadCfdiDtoSchema>;
