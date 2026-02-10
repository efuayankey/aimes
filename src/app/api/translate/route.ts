// API route for bidirectional translation (English ↔ Spanish)
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type Language = 'en' | 'es';

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Spanish'
};

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Validate languages
    const validLanguages: Language[] = ['en', 'es'];
    if (!validLanguages.includes(targetLanguage as Language)) {
      return NextResponse.json(
        { error: 'Invalid target language. Supported: en, es' },
        { status: 400 }
      );
    }

    const sourceLang = sourceLanguage || 'auto';
    const targetLang = targetLanguage as Language;

    const systemPrompt = sourceLang === 'auto'
      ? `You are a professional translator. Translate the given text to ${LANGUAGE_NAMES[targetLang]}. Maintain the tone, emotion, and cultural nuances. Only respond with the ${LANGUAGE_NAMES[targetLang]} translation, nothing else.`
      : `You are a professional translator. Translate the given ${LANGUAGE_NAMES[sourceLang as Language]} text to ${LANGUAGE_NAMES[targetLang]}. Maintain the tone, emotion, and cultural nuances. Only respond with the ${LANGUAGE_NAMES[targetLang]} translation, nothing else.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const translation = response.choices[0].message.content;

    if (!translation) {
      throw new Error('No translation generated');
    }

    return NextResponse.json({
      success: true,
      translation: translation.trim(),
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    });

  } catch (error: unknown) {
    console.error('Translation API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to translate: ' + errorMessage },
      { status: 500 }
    );
  }
}
