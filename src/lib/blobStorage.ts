// Ce fichier n'est plus nécessaire car nous utilisons directement @vercel/blob
// Vous pouvez le supprimer

import { put, del, list } from '@vercel/blob';
import { AudioMetadata } from '@/app/api/audios/route';

export async function uploadToBlob(blob: Blob, filename: string): Promise<string> {
  const { url } = await put(filename, blob, {
    access: 'public',
  });
  return url;
}

export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}

export async function listBlobs(): Promise<string[]> {
  const { blobs } = await list();
  return blobs.map(blob => blob.url);
}
