import { NextRequest, NextResponse } from 'next/server';
import convert from 'heic-convert';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert HEIC to JPEG using heic-convert
    const outputBuffer = await convert({
      buffer: buffer,
      format: 'JPEG',
      quality: 0.8, // 80% quality (0-1 scale)
    });

    // Return the converted image as a blob
    const uint8Array = new Uint8Array(outputBuffer);
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.(heic|heif)$/i, '.jpg')}"`,
      },
    });

  } catch (error: any) {
    console.error('HEIC conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert HEIC image', details: error.message }, 
      { status: 500 }
    );
  }
}

