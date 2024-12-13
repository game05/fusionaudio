import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  // Charger FFmpeg
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

export async function mergeAudioFiles(files: File[]): Promise<Blob> {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized');
  }

  // Créer un fichier texte avec la liste des fichiers à concaténer
  let concatenateList = '';
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const fileName = `input${i}.mp3`;
    
    // Écrire le fichier dans la mémoire virtuelle de FFmpeg
    ffmpeg.writeFile(fileName, new Uint8Array(arrayBuffer));
    concatenateList += `file '${fileName}'\n`;
  }

  // Écrire le fichier de liste
  ffmpeg.writeFile('concat.txt', concatenateList);

  // Exécuter la commande de concaténation
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    'output.mp3'
  ]);

  // Lire le fichier de sortie
  const data = await ffmpeg.readFile('output.mp3');
  return new Blob([data], { type: 'audio/mpeg' });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
