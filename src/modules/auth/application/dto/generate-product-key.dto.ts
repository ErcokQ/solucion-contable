// src/modules/auth/application/dto/generate-product-key.dto.ts
import { z } from 'zod';

// Por ahora no pedimos nada en el body, pero dejamos el esquema
// para poder ampliarlo después (tipo de clave, maxUses, etc.)
export const GenerateProductKeyDtoSchema = z.object({});

export type GenerateProductKeyDto = z.infer<typeof GenerateProductKeyDtoSchema>;

// DTO de salida (lo que devolverá el use case al controller)
export const ProductKeyDtoSchema = z.object({
  id: z.number(),
  code: z.string(),
  used: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductKeyDto = z.infer<typeof ProductKeyDtoSchema>;
