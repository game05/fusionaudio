'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { initFFmpeg, mergeAudioFiles, downloadBlob } from '@/lib/audioService';
import ProgressBar from './ProgressBar';

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    initFFmpeg().catch(console.error);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFiles = acceptedFiles.filter(file => 
      file.type.startsWith('audio/') || 
      file.name.endsWith('.mp3') || 
      file.name.endsWith('.m4a') || 
      file.name.endsWith('.wav')
    );

    const sortedFiles = audioFiles.sort((a, b) => a.name.localeCompare(b.name));
    setFiles(sortedFiles);
    setProgress(0);
    setStatus('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const handleProcessFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStatus('Préparation des fichiers...');
    
    try {
      // Simuler la progression pour le chargement des fichiers
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus('Analyse des fichiers audio...');
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatus('Fusion des fichiers en cours...');
      // Simuler la progression pendant la fusion
      for (let i = 30; i <= 80; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const mergedBlob = await mergeAudioFiles(files);
      setProgress(90);
      
      setStatus('Finalisation...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus('Téléchargement du fichier...');
      setProgress(100);
      downloadBlob(mergedBlob, 'merged_audio.mp3');
      
      setStatus('Fusion terminée !');
    } catch (error) {
      console.error('Error processing files:', error);
      setStatus('Une erreur est survenue');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input 
          {...getInputProps()} 
          // @ts-ignore
          directory="" 
          webkitdirectory=""
        />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers audio ici'}
          </p>
          <p className="text-sm text-gray-500">
            ou cliquez pour sélectionner un dossier
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Fichiers détectés ({files.length})</h3>
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {isProcessing && (
              <ProgressBar progress={progress} status={status} />
            )}

            <button
              onClick={handleProcessFiles}
              disabled={isProcessing}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium
                ${isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isProcessing ? 'Fusion en cours...' : 'Fusionner les fichiers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
