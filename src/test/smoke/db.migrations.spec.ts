import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mysql from 'mysql2/promise';

let conn: mysql.Connection;

beforeAll(async () => {
  conn = await mysql.createConnection({
    host: 'localhost',
    user: 'devuser',
    password: 'devpass',
    database: 'scrework',
  });
});

afterAll(() => conn.end());

describe('SMOKE | migrations', () => {
  it('Tabla usuarios existe', async () => {
    const [rows] = await conn.query("SHOW TABLES LIKE 'users'");
    expect(rows).toHaveLength(1);
  });
});
