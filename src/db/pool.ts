import {  Pool } from 'pg';


const pool: Pool = new Pool({
  user: process.env.DB_USER,       // Uses DB_USER from .env
  host: process.env.DB_HOST,       // Uses DB_HOST from .env
  database: process.env.DB_NAME, // Uses DB_NAME from .env
  password: process.env.DB_PASSWORD, // Uses DB_PASSWORD from .env
  port: parseInt(process.env.DB_PORT || '5432'), // Uses DB_PORT from .env, defaulting to 5432
});

export default pool;
