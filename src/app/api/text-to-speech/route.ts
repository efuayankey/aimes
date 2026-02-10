// API route for text-to-speech (multilingual audio generation)
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type Language = 'en' | 'es';
type Voice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

// Voice recommendations by language for natural pronunciation
const VOICE_BY_LANGUAGE: Record<Language, Voice> = {
  en: 'nova',    // Clear, warm female voice for English
  es: 'nova'     // Same voice handles Spanish well with natural accent
};

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Auto-detect language if not provided, default to English
    const lang = (language as Language) || 'en';

    // Validate language
    const validLanguages: Language[] = ['en', 'es'];
    if (!validLanguages.includes(lang)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported: en, es' },
        { status: 400 }
      );
    }

    const selectedVoice = VOICE_BY_LANGUAGE[lang];

    // Generate audio using OpenAI's TTS API
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // Use tts-1 for lower cost, tts-1-hd for higher quality
      voice: selectedVoice,
      input: text,
      speed: 1.0
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return the audio file as a response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error: unknown) {
    console.error('Text-to-speech API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to generate audio: ' + errorMessage },
      { status: 500 }
    );
  }
}
