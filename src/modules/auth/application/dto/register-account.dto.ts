import { z } from 'zod';

/**
 * Datos necesarios para registrar una nueva cuenta (tenant)
 * a partir de una clave de producto de tipo "account".
 */
export const RegisterAccountDtoSchema = z.object({
  // Clave de producto enviada al cliente
  productKey: z.string().min(1, 'La clave de producto es obligatoria'),

  // Nombre comercial de la cuenta (puede agrupar varias empresas)
  accountName: z
    .string()
    .min(3, 'El nombre de la cuenta debe tener al menos 3 caracteres')
    .max(120),

  // Datos del usuario owner (propietario de la cuenta)
  ownerFullName: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(120),
  ownerEmail: z.string().email('Correo electrónico inválido'),
  ownerUsername: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(60),
  ownerPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(60),

  // Empresa principal (Company) del nuevo tenant
  companyName: z
    .string()
    .min(3, 'El nombre de la empresa debe tener al menos 3 caracteres')
    .max(200),
  companyRfc: z
    .string()
    .min(12, 'El RFC debe tener entre 12 y 13 caracteres')
    .max(13, 'El RFC debe tener entre 12 y 13 caracteres'),

  // Opcional: régimen fiscal (luego se puede ajustar a catálogo SAT)
  companyTaxRegime: z.string().optional(),
});

export const AuthTokensDtoSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RegisterAccountDto = z.infer<typeof RegisterAccountDtoSchema>;

// Resultado completo del RegisterAccountUseCase
export const RegisterAccountResultSchema = z.object({
  tokens: AuthTokensDtoSchema,
  requiresEmailVerification: z.boolean().optional(),
  user: z.object({
    id: z.number().int(),
    fullName: z.string(),
    email: z.string().email(),
  }),
  account: z.object({
    id: z.number().int(),
    name: z.string(),
    plan: z.string(), // luego podemos tipar más fuerte
    maxUsers: z.number().int(),
    maxCompanies: z.number().int(),
  }),
  company: z.object({
    id: z.number().int(),
    name: z.string(),
    rfc: z.string(),
  }),
});

export type RegisterAccountResultDto = z.infer<
  typeof RegisterAccountResultSchema
>;
