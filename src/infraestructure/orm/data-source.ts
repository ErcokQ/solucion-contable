import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities:
    process.env.NODE_ENV === 'development'
      ? [
          'src/modules/**/domain/entities/*.ts',
          'src/infraestructure/orm/entities/*.ts',
        ]
      : [
          'dist/modules/**/domain/entities/*.js',
          'dist/infraestructure/orm/entities/*.js',
        ],
  migrations:
    process.env.NODE_ENV === 'development'
      ? ['src/infraestructure/orm/migrations/*.ts']
      : ['dist/**/orm/migrations/*.js'],
});
