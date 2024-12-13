import { AudioMetadata } from '@/app/api/audios/route';
import { put } from '@vercel/blob';

export async function uploadAudio(blob: Blob, fileName: string): Promise<AudioMetadata> {
  // Upload direct vers Vercel Blob
  const { url } = await put(fileName, blob, {
    access: 'public',
  });

  // Enregistrer les métadonnées via l'API
  const metadata = {
    name: fileName,
    url: url,
    size: blob.size,
    date: new Date().toISOString(),
  };

  const response = await fetch('/api/audios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    throw new Error('Failed to upload audio');
  }

  return response.json();
}

export async function getAudios(): Promise<AudioMetadata[]> {
  const response = await fetch('/api/audios');
  
  if (!response.ok) {
    throw new Error('Failed to get audios');
  }

  return response.json();
}

export async function deleteAudio(id: string): Promise<void> {
  const response = await fetch(`/api/audios?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete audio');
  }
}

// Ajout de la fonction getAudioUrl
export function getAudioUrl(audio: AudioMetadata): string {
  return audio.url;
}
