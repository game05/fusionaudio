export interface SavedAudio {
  id: string;
  name: string;
  date: string;
  size: number;
  url: string;
}

const STORAGE_KEY = 'saved_audios';

export function saveAudio(blob: Blob, name: string): SavedAudio {
  const audioUrl = URL.createObjectURL(blob);
  const audio: SavedAudio = {
    id: generateId(),
    name,
    date: new Date().toISOString(),
    size: blob.size,
    url: audioUrl,
  };

  const savedAudios = getSavedAudios();
  savedAudios.push(audio);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAudios));

  return audio;
}

export function getSavedAudios(): SavedAudio[] {
  const savedAudiosStr = localStorage.getItem(STORAGE_KEY);
  return savedAudiosStr ? JSON.parse(savedAudiosStr) : [];
}

export function deleteAudio(id: string): void {
  const savedAudios = getSavedAudios();
  const audioToDelete = savedAudios.find(audio => audio.id === id);
  
  if (audioToDelete) {
    URL.revokeObjectURL(audioToDelete.url);
  }
  
  const filteredAudios = savedAudios.filter(audio => audio.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAudios));
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
