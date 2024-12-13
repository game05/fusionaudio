import { NextResponse } from 'next/server';
import { uploadToBlob, deleteFromBlob } from '@/lib/blobStorage';

export interface AudioMetadata {
  id: string;
  name: string;
  date: string;
  size: number;
  url: string;
}

// Stockage en mémoire temporaire des métadonnées (à remplacer par une base de données plus tard)
let audioMetadata: AudioMetadata[] = [];

// GET /api/audios
export async function GET() {
  try {
    return NextResponse.json(audioMetadata);
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
    const blobUrl = await uploadToBlob(audioFile, `${id}-${fileName}`);

    const newAudio: AudioMetadata = {
      id,
      name: fileName,
      date: new Date().toISOString(),
      size: audioFile.size,
      url: blobUrl
    };

    audioMetadata.push(newAudio);

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

    const audioToDelete = audioMetadata.find(audio => audio.id === id);

    if (!audioToDelete) {
      return NextResponse.json(
        { error: 'Audio not found' },
        { status: 404 }
      );
    }

    await deleteFromBlob(audioToDelete.url);
    audioMetadata = audioMetadata.filter(audio => audio.id !== id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete audio' },
      { status: 500 }
    );
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
