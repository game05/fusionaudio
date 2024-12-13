'use client';

import { useEffect, useState } from 'react';
import { SavedAudio, getSavedAudios, deleteAudio, formatFileSize } from '@/lib/audioStorage';

export default function MyAudios() {
  const [audios, setAudios] = useState<SavedAudio[]>([]);

  useEffect(() => {
    setAudios(getSavedAudios());
  }, []);

  const handleDelete = (id: string) => {
    deleteAudio(id);
    setAudios(getSavedAudios());
  };

  const handleDownload = (audio: SavedAudio) => {
    const a = document.createElement('a');
    a.href = audio.url;
    a.download = audio.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Mes Audios</h1>
      
      {audios.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucun audio fusionné pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {audios.map((audio) => (
            <div
              key={audio.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium">{audio.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(audio.date).toLocaleDateString()} - {formatFileSize(audio.size)}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(audio)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Télécharger
                </button>
                <button
                  onClick={() => handleDelete(audio.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
