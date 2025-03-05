import dotenv from 'dotenv';
import path from 'path';

// ✅ Load dotenv BEFORE anything else
dotenv.config({ path: path.resolve(__dirname, './.env.local') });

// ✅ Debugging: Check if dotenv is working

// Now, import pool AFTER dotenv is loaded
import { Pool } from 'pg';


console.log(process.env.DB_USER);
console.log(process.env.DB_HOST);
console.log(process.env.DB_NAME);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

async function createContactsTable() {
  try {
    console.log('Creating contacts table...');

    const query = `
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE,
        total_amount NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_name_no_email UNIQUE (first_name, last_name) 
        DEFERRABLE INITIALLY IMMEDIATE
      );
    `;

    await pool.query(query);
    console.log('Contacts table created successfully.');
  } catch (error) {
    console.error('Error creating contacts table:', error);
    process.exit(1); // Exit with error
  } finally {
    await pool.end(); // Close DB connection
    process.exit(0); // Exit successfully
  }
}

// Run the migration
createContactsTable();
