/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const api_key = process.env.API_KEY

export async function GET(req: NextRequest) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Verify Authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ') && authHeader?.split(" ")[0] != api_key ) {
    return NextResponse.json(
      { error: 'Unauthorized - Missing token' },
      { status: 403, headers }
    );
  }

  const id = req.headers.get('fileId');
  console.log(id);


  if (typeof id !== 'string') {
    return new Response('Invalid file ID', { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'uploads', id);

  if (!fs.existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  try {
    const fileStream = fs.createReadStream(filePath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Response(fileStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${id}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
