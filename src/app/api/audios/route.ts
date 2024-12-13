import { NextResponse } from 'next/server';
import { writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';

export interface AudioMetadata {
  id: string;
  name: string;
  date: string;
  size: number;
}

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const METADATA_FILE = path.join(process.cwd(), 'public', 'uploads', 'metadata.json');

// GET /api/audios
export async function GET() {
  try {
    const metadata = await readMetadata();
    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get audios' }, { status: 500 });
  }
}

// POST /api/audios
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const fileName = formData.get('name') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const id = generateId();
    const fileExtension = path.extname(fileName);
    const finalFileName = `${id}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, finalFileName);

    // Convert File to Buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file
    await writeFile(filePath, buffer);

    // Update metadata
    const metadata = await readMetadata();
    const newAudio: AudioMetadata = {
      id,
      name: fileName,
      date: new Date().toISOString(),
      size: buffer.length,
    };
    metadata.push(newAudio);
    await writeMetadata(metadata);

    return NextResponse.json(newAudio);
  } catch (error) {
    console.error('Error saving audio:', error);
    return NextResponse.json(
      { error: 'Failed to save audio' },
      { status: 500 }
    );
  }
}

// DELETE /api/audios/[id]
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'No ID provided' },
        { status: 400 }
      );
    }

    const metadata = await readMetadata();
    const audioToDelete = metadata.find(audio => audio.id === id);

    if (!audioToDelete) {
      return NextResponse.json(
        { error: 'Audio not found' },
        { status: 404 }
      );
    }

    // Delete the file
    const filePath = path.join(UPLOADS_DIR, `${id}.mp3`);
    await unlink(filePath);

    // Update metadata
    const updatedMetadata = metadata.filter(audio => audio.id !== id);
    await writeMetadata(updatedMetadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete audio' },
      { status: 500 }
    );
  }
}

async function readMetadata(): Promise<AudioMetadata[]> {
  try {
    const data = await readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeMetadata(metadata: AudioMetadata[]): Promise<void> {
  await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
