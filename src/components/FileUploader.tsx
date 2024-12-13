'use client';

import { useState } from 'react';
import { uploadAudio } from '@/lib/audioApi';

export default function FileUploader() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mergedFile, setMergedFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const mergeAudioFiles = async () => {
    setIsLoading(true);
    setProgress(0);
    
    try {
      const audioContext = new AudioContext();
      const audioBuffers = await Promise.all(
        selectedFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          return audioContext.decodeAudioData(arrayBuffer);
        })
      );

      // Calculate total duration
      const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
      const sampleRate = audioBuffers[0].sampleRate;
      const numberOfChannels = audioBuffers[0].numberOfChannels;

      // Create the final buffer
      const mergedBuffer = audioContext.createBuffer(
        numberOfChannels,
        totalLength,
        sampleRate
      );

      // Merge buffers
      let offset = 0;
      for (let i = 0; i < audioBuffers.length; i++) {
        const buffer = audioBuffers[i];
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = mergedBuffer.getChannelData(channel);
          channelData.set(buffer.getChannelData(channel), offset);
        }
        offset += buffer.length;
        setProgress(((i + 1) / audioBuffers.length) * 90); // Up to 90%
      }

      // Convert merged buffer to WAV blob
      const wavBlob = await audioBufferToWav(mergedBuffer);
      setMergedFile(wavBlob);
      setProgress(100);

    } catch (error) {
      console.error('Error merging audio files:', error);
      alert('Une erreur est survenue lors de la fusion des fichiers audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!mergedFile) return;

    try {
      setIsLoading(true);
      await uploadAudio(mergedFile, 'merged_audio.wav');
      alert('Audio fusionné avec succès !');
    } catch (error) {
      console.error('Error uploading merged audio:', error);
      alert('Une erreur est survenue lors de l\'upload du fichier audio');
    } finally {
      setIsLoading(false);
      setMergedFile(null);
      setSelectedFiles([]);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Sélectionnez les fichiers audio à fusionner
        </label>
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={isLoading}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Fichiers sélectionnés :</h3>
          <ul className="list-disc pl-5">
            {selectedFiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="space-x-4">
        <button
          onClick={mergeAudioFiles}
          disabled={selectedFiles.length < 2 || isLoading || mergedFile !== null}
          className="bg-blue-500 text-white px-4 py-2 rounded-md
            hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Fusionner
        </button>

        {mergedFile && (
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded-md
              hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Sauvegarder
          </button>
        )}
      </div>
    </div>
  );
}

// Fonction pour convertir AudioBuffer en WAV
async function audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Get channels
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  // Write WAV header
  setUint32(0x46464952);                            // "RIFF"
  setUint32(36 + length);                           // File length
  setUint32(0x45564157);                            // "WAVE"
  setUint32(0x20746D66);                            // "fmt " chunk
  setUint32(16);                                    // Length of format data
  setUint16(1);                                     // Format type (1 = PCM)
  setUint16(numberOfChannels);                      // Number of channels
  setUint32(audioBuffer.sampleRate);                // Sample rate
  setUint32(audioBuffer.sampleRate * 2 * numberOfChannels); // Byte rate
  setUint16(numberOfChannels * 2);                  // Block align
  setUint16(16);                                    // Bits per sample
  setUint32(0x61746164);                            // "data" chunk
  setUint32(length);                                // Data length

  // Write interleaved audio data
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      setInt16(Math.floor(sample * 0x7FFF));
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  function setInt16(data: number) {
    view.setInt16(pos, data, true);
    pos += 2;
  }
}
