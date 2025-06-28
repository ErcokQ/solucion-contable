import 'reflect-metadata';
import { DataSource } from 'typeorm';

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
      ? ['@auth/domain/entities/*.ts']
      : ['dist/modules/**/domain/entities/*.js'],
  migrations: ['dist/migrations/*.js'],
});
