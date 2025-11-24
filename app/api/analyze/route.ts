import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to process image data
// In a real app, you'd upload to object storage (S3/Supabase) and pass the URL
// Here we'll handle base64 direct processing for the demo
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to arrayBuffer -> base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // if (!process.env.GEMINI_API_KEY) {
    //   console.warn('GEMINI_API_KEY not set. Using mock response.');
      return NextResponse.json({
        title: 'Eternal Moment',
        description: 'A beautiful memory captured in time, preserved forever in the digital garden.',
        date: new Date().toISOString()
      });
    // }

    /* AI Analysis Disabled for now
    // Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Analyze this image. It is a romantic memory for a couple.
      Provide a JSON response with two fields:
      1. "title": A short, poetic title (max 5 words).
      2. "description": A single, romantic sentence describing the mood and visual content (max 20 words).
      Output ONLY raw JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: file.type
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code blocks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json({
      title: data.title || 'Untitled Memory',
      description: data.description || 'A fragment of time.',
      date: new Date().toISOString()
    });
    */

  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback for errors
    return NextResponse.json({
      title: 'Memory Fragment',
      description: 'The image glimmers with digital nostalgia.',
      date: new Date().toISOString()
    });
  }
}

