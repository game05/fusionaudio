import { NextResponse } from 'next/server';

export interface AudioMetadata {
  name: string;
  date: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const fileName = formData.get('name') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Ici, on ne fait que retourner un succès
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving audio:', error);
    return NextResponse.json(
      { error: 'Failed to save audio' },
      { status: 500 }
    );
  }
}
