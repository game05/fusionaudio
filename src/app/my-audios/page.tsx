'use client';

import { useEffect, useState } from 'react';
import { AudioMetadata } from '@/app/api/audios/route';
import { getAudios, deleteAudio, getAudioUrl } from '@/lib/audioApi';
import { formatFileSize } from '@/lib/audioStorage';

export default function MyAudios() {
  const [audios, setAudios] = useState<AudioMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = async () => {
    try {
      const data = await getAudios();
      setAudios(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des audios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAudio(id);
      await loadAudios();
    } catch (err) {
      console.error('Error deleting audio:', err);
      setError('Erreur lors de la suppression');
    }
  };

  const handleDownload = (audio: AudioMetadata) => {
    const link = document.createElement('a');
    link.href = getAudioUrl(audio);
    link.download = audio.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement des audios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Audios Partagés</h1>
      
      {audios.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucun audio partagé pour le moment</p>
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
