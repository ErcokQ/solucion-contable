import * as dotenv from 'dotenv';
import { z } from 'zod';

/* 1. Carga el .env adecuado */
const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: `.env.${nodeEnv}` }); // fallback a .env si no existe

/* 2. Declara el esquema */
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  /* App */
  PORT: z.coerce.number().default(3000),

  /* MySQL */
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  DB_ROOT_PASS: z.string(),

  /* Redis */
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  /* Logger */
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/* 3. Parsea y valida */
const _env = EnvSchema.safeParse(process.env);

if (!_env.success) {
  console.error(
    '[config] ❌ Variable de entorno invalidas:',
    _env.error.format(),
  );
  process.exit(1);
}

export const config = _env.data;
