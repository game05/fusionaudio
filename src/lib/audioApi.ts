import { AudioMetadata } from '@/app/api/audios/route';

export async function uploadAudio(blob: Blob, fileName: string): Promise<void> {
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
}
