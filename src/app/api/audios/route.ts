import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export interface AudioMetadata {
  id: string;
  name: string;
  url: string;
  size: number;
  date: string;
}

// Stockage temporaire en mémoire (à remplacer par une base de données plus tard)
let audioMetadata: AudioMetadata[] = [];

// Fonction helper pour générer un ID unique
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// POST /api/audios
export async function POST(request: Request) {
  try {
    const metadata = await request.json();
    
    const newAudio: AudioMetadata = {
      id: generateId(),
      name: metadata.name,
      url: metadata.url,
      size: metadata.size,
      date: metadata.date,
    };

    audioMetadata.push(newAudio);
    return NextResponse.json(newAudio);
  } catch (error) {
    console.error('Error in POST /api/audios:', error);
    return NextResponse.json({ error: 'Failed to process audio upload' }, { status: 500 });
  }
}

// GET /api/audios
export async function GET() {
  try {
    return NextResponse.json(audioMetadata);
  } catch (error) {
    console.error('Error in GET /api/audios:', error);
    return NextResponse.json({ error: 'Failed to get audios' }, { status: 500 });
  }
}

// DELETE /api/audios/[id]
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const audioToDelete = audioMetadata.find(audio => audio.id === id);

    if (!audioToDelete) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
    }

    // Supprimer le fichier de Vercel Blob Storage
    await del(audioToDelete.url);

    // Mettre à jour la liste des audios
    audioMetadata = audioMetadata.filter(audio => audio.id !== id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/audios:', error);
    return NextResponse.json({ error: 'Failed to delete audio' }, { status: 500 });
  }
}
