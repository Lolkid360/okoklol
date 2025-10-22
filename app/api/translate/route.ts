import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing API key.' },
        { status: 500 }
      );
    }

    const { text, isBatch } = await request.json()
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    if (isBatch) {
      const prompt = `
        You are a professional translator specializing in translating Japanese and Korean text from manga and webtoons into natural-sounding English.

        The user has provided a list of text blocks, each with an index number. Your task is to translate each text block to English.

        **Instructions:**
        1.  Read the input, which is a series of lines formatted as \`[index] text\`.
        2.  Translate the text for each index into English.
        3.  Preserve the original tone, style, and cultural nuances.
        4.  If a text block cannot be translated or is not in a translatable language, return the original text for that block.
        5.  Respond with a single JSON object with one key: \`"translations"\`.
        6.  The value of \`"translations"\` must be a JSON array of objects, where each object has two keys: \`"index"\` (number) and \`"text"\` (string).

        **Example Input:**
        [0] 안녕하세요
        [1] これはテストです

        **Example JSON Output:**
        {
          "translations": [
            { "index": 0, "text": "Hello" },
            { "index": 1, "text": "This is a test" }
          ]
        }

        **Translate the following text blocks:**
        ${text}
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      let responseText = response.text()

      // Clean up the response to ensure it's valid JSON
      if (responseText.startsWith("```json")) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
      } else if (responseText.startsWith("```")) {
        responseText = responseText.substring(3, responseText.length - 3).trim();
      }
      
      try {
        const jsonOutput = JSON.parse(responseText);
        return NextResponse.json(jsonOutput);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", responseText);
        // If parsing fails, attempt to return a valid-like structure with an error message
        return NextResponse.json(
          { error: 'Translation failed: Invalid format from translation service.', details: responseText },
          { status: 500 }
        );
      }

    } else {
      const prompt = `Translate the following text to English, keeping the translation natural and preserving the tone: ${text}`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const translatedText = response.text()

      return NextResponse.json({ translatedText })
    }
  } catch (error: any) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed', details: error.message },
      { status: 500 }
    )
  }
}
