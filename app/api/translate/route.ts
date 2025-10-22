import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { text, sourceLang, isBatch, count } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (isBatch) {
      // Batch translation - text contains numbered entries like "[0] text\n[1] text\n..."
      const response = await openai.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in manga and webtoon translation. The input contains numbered text entries in the format "[index] text". Translate each entry to English, preserving the tone, style, and cultural context. Keep translations natural and readable. Respond with a JSON array of objects with "index" and "text" fields.'
          },
          {
            role: 'user',
            content: `Translate these ${sourceLang || 'text'} entries to English. Maintain the index numbers and return as JSON:\n\n${text}`
          }
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 4096
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return NextResponse.json({ 
        translations: result.translations || [],
        originalText: text,
        sourceLang 
      })
    } else {
      // Single translation
      const response = await openai.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in manga and webtoon translation. Translate the provided text to English, preserving the tone, style, and cultural context. Keep translations natural and readable.'
          },
          {
            role: 'user',
            content: `Translate this ${sourceLang || 'text'} to English: ${text}`
          }
        ],
        max_completion_tokens: 500
      })

      const translatedText = response.choices[0].message.content || text

      return NextResponse.json({ 
        translatedText,
        originalText: text,
        sourceLang 
      })
    }
  } catch (error: any) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed', details: error.message },
      { status: 500 }
    )
  }
}
