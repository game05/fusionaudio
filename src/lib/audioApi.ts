import { AudioMetadata } from '@/app/api/audios/route';

export async function uploadAudio(blob: Blob, fileName: string): Promise<AudioMetadata> {
  const formData = new FormData();
  formData.append('audio', blob, fileName);
  formData.append('name', fileName);

  const response = await fetch('/api/audios', {
    method: 'POST',
    body: formData,
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

export function getAudioUrl(id: string): string {
  return `/uploads/${id}.mp3`;
}
