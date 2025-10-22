import { NextResponse } from 'next/server'
import { createWorker } from 'tesseract.js'

// Configure Tesseract.js to use local worker
import path from 'path'

const workerPath = path.join(process.cwd(), 'public', 'tesseract', 'worker.min.js')

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const file = data.get('image') as File
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image file.' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate buffer size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image file is too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Initialize worker with explicit settings
    const worker = await createWorker({
      logger: m => console.log(m),
      errorHandler: err => console.error('Worker error:', err),
      workerPath: workerPath
    })

    await worker.loadLanguage('kor')
    await worker.initialize('kor')
    
    try {
      // Process the image with timeout
      const { data: { text } } = await Promise.race([
        worker.recognize(buffer),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OCR processing timeout after 30 seconds')), 30000)
        )
      ]) as any

      await worker.terminate()

      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Failed to extract text from image' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        text: text.trim() || 'No text detected',
        language: 'kor'
      })
    } finally {
      // Ensure worker is terminated even if there's an error
      try {
        await worker.terminate()
      } catch (e) {
        console.error('Error terminating worker:', e)
      }
    }
  } catch (error: any) {
    console.error('OCR error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    )
  }
}