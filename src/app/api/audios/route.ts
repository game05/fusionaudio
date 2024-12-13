import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export interface AudioMetadata {
  id: string;
  name: string;
  url: string;
  size: number;
  date: string;
}

const STORAGE_KEY = 'shared_audios';

// Fonction helper pour générer un ID unique
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Fonction helper pour obtenir les audios stockés
function getStoredAudios(): AudioMetadata[] {
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : [];
}

// Fonction helper pour sauvegarder les audios
function saveAudios(audios: AudioMetadata[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audios));
}

// POST /api/audios
export async function POST(request: Request) {
  try {
    const metadata = await request.json();
    
    const audioMetadata: AudioMetadata = {
      id: generateId(),
      name: metadata.name,
      url: metadata.url,
      size: metadata.size,
      date: metadata.date,
    };

    const audios = getStoredAudios();
    audios.push(audioMetadata);
    saveAudios(audios);

    return NextResponse.json(audioMetadata);
  } catch (error) {
    console.error('Error in POST /api/audios:', error);
    return NextResponse.json({ error: 'Failed to process audio upload' }, { status: 500 });
  }
}

// GET /api/audios
export async function GET() {
  try {
    const audios = getStoredAudios();
    return NextResponse.json(audios);
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

    const audios = getStoredAudios();
    const audioToDelete = audios.find(audio => audio.id === id);

    if (!audioToDelete) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
    }

    // Supprimer le fichier de Vercel Blob Storage
    await del(audioToDelete.url);

    // Mettre à jour la liste des audios
    const updatedAudios = audios.filter(audio => audio.id !== id);
    saveAudios(updatedAudios);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/audios:', error);
    return NextResponse.json({ error: 'Failed to delete audio' }, { status: 500 });
  }
}
