import csv from 'csv-parser';
import axios, { AxiosResponse } from 'axios';
// import { IncomingMessage } from 'http';
import { inngest } from './client';
import pool from '@/db/pool';
import { Readable } from 'stream';

interface Contact {
  first_name: string;
  last_name: string;
  email?: string;
  total_amount?: number;
}

const apiUrl = `${process.env.SITE_URL}/api/files`; // Ensure correct environment variable name
const apiKey = process.env.API_KEY as string;

export const processCsv = inngest.createFunction(
  { id: 'Process CSV and insert into Postgres' },
  { event: 'csv/upload' },
  async ({ event }) => {
    const { fileId } = event.data;

    try {
      // Fetch the file as a stream
      const response: AxiosResponse<Readable> = await axios.get(
        `${apiUrl}`,
        {
          headers: { 
            Authorization: `Bearer ${apiKey}`, // Use capitalized 'Authorization'
            fileId : fileId
          },
          responseType: 'stream',
        }
      );

      const stream = response.data.pipe(csv({
        mapHeaders: ({ header }) => header.trim().toLowerCase(), // Normalize headers
        mapValues: ({ value }) => value.trim(), // Trim whitespace
      }));

      // Process each CSV row
      await new Promise((resolve, reject) => {
        stream
          .on('data', async (row: Contact) => {
            try {
              const { first_name, last_name, email, total_amount } = row;
              const amount = total_amount ? Number(total_amount) : 0;
              console.log(row);
              if (email) {
                await pool.query(
                  `INSERT INTO contacts (first_name, last_name, email, total_amount, created_at)
                   VALUES ($1, $2, $3, $4, NOW())
                   ON CONFLICT (email) 
                   DO UPDATE SET total_amount = contacts.total_amount + EXCLUDED.total_amount`,
                  [first_name, last_name, email, amount]
                );
              } else {
                await pool.query(
                  `INSERT INTO contacts (first_name, last_name, total_amount, created_at)
                   VALUES ($1, $2, $3, NOW())
                   ON CONFLICT (first_name, last_name) 
                   DO UPDATE SET total_amount = contacts.total_amount + EXCLUDED.total_amount`,
                  [first_name, last_name, amount]
                );
              }
            } catch (error) {
              reject(error);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);