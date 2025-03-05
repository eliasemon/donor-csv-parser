import { NextRequest, NextResponse } from 'next/server';
import { createWriteStream, promises as fsPromises } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { inngest } from '@/inngest/client';
import Busboy from 'busboy';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to convert Web ReadableStream to Node.js Readable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function webToNodeStream(webStream: ReadableStream<any>): NodeJS.ReadableStream {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(Buffer.from(value));
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fsPromises.mkdir(uploadDir, { recursive: true });

    const busboy = Busboy({
      headers: Object.fromEntries(req.headers.entries())
    });

    let fileId = '';
    let originalFilename = 'unknown.csv';
    let fileExtensionValid = true;

    return new Promise<NextResponse>(async (resolve, reject) => {
      busboy.on('file', (name, file, info) => {
        const { filename } = info;
        originalFilename = filename || 'unknown.csv';

        if (!originalFilename.endsWith('.csv')) {
          fileExtensionValid = false;
          file.resume();
          return resolve(
            NextResponse.json(
              { error: 'Invalid file extension' },
              { status: 400 }
            )
          );
        }

        fileId = `${Date.now()}_${randomUUID()}_${originalFilename}`;
        const filePath = path.join(uploadDir, fileId);
        const writeStream = createWriteStream(filePath);
        file.pipe(writeStream);
      });

      busboy.on('close', async () => {
        if (!fileExtensionValid) return;
        console.log(`File uploaded: ${fileId}`);
        try {
          await inngest.send({
            name: 'csv/upload',
            data: { fileId },
          });
          resolve(NextResponse.json({ message: 'File uploaded successfully' }));
        } catch (error) {
          console.error(error);
          reject(NextResponse.json({ error: 'Processing failed' }, { status: 500 }));
        }
      });

      busboy.on('error', (error) => {
        console.error('Busboy error:', error);
        reject(NextResponse.json({ error: 'Upload failed' }, { status: 500 }));
      });

      // Convert Web Stream to Node.js Stream and pipe to Busboy
      if (req.body) {
        const nodeStream = webToNodeStream(req.body);
        nodeStream.pipe(busboy);
      } else {
        reject(NextResponse.json({ error: 'No data received' }, { status: 400 }));
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}