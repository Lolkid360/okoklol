import React, { useState, useEffect } from 'react'

export type BoundingBox = {
  x: number
  y: number
  width: number
  height: number
  text: string
  translatedText?: string
}

type Props = {
  onSelect: (file: File) => void
  onResult?: (result: { 
    text: string
    language: string
    isLoading?: boolean
    boundingBoxes?: BoundingBox[]
    imageUrl?: string
  }) => void
  imageUrl?: string
}

export default function ImageUploader({ onSelect, onResult, imageUrl }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)

  const processImage = async (source: File | string) => {
    if (!onResult) return

    setIsProcessing(true)
    onResult({ text: 'Starting...', language: 'auto', isLoading: true })

    try {
      // If source is a URL, fetch it first to handle CORS
      let imageSource = source
      let imageBlobUrl = ''
      
      if (typeof source === 'string' && source.startsWith('http')) {
        onResult({ text: 'Fetching image...', language: 'auto', isLoading: true })
        const response = await fetch('/api/fetch-images/proxy?url=' + encodeURIComponent(source))
        if (!response.ok) throw new Error('Failed to fetch image')
        const blob = await response.blob()
        imageBlobUrl = URL.createObjectURL(blob)
        imageSource = imageBlobUrl
      } else if (source instanceof File) {
        imageBlobUrl = URL.createObjectURL(source)
        imageSource = imageBlobUrl
      } else {
        imageBlobUrl = source as string
        imageSource = source
      }

      onResult({ text: 'Loading OCR engine...', language: 'auto', isLoading: true })
      const { createWorker } = await import('tesseract.js')
      
      // Use Korean + Japanese + English for comprehensive detection
      console.log('Creating multi-language Tesseract worker...')
      const worker = await createWorker('kor+jpn+eng')
      
      console.log('Processing image with OCR...')
      const ret = await worker.recognize(imageSource)
      console.log('OCR processing complete')
      
      // Extract bounding boxes with text
      const boundingBoxes: BoundingBox[] = []
      const words = ret.data.words || []
      
      for (const word of words) {
        if (word.text.trim() && word.confidence > 30) {
          boundingBoxes.push({
            x: word.bbox.x0,
            y: word.bbox.y0,
            width: word.bbox.x1 - word.bbox.x0,
            height: word.bbox.y1 - word.bbox.y0,
            text: word.text
          })
        }
      }

      console.log(`Detected ${boundingBoxes.length} text regions`)

      // Batch translate all text in a single API call
      if (boundingBoxes.length > 0) {
        onResult({ 
          text: `Translating ${boundingBoxes.length} text regions...`, 
          language: 'auto', 
          isLoading: true,
          boundingBoxes,
          imageUrl: imageBlobUrl
        })

        try {
          // Combine all text with markers to maintain mapping
          const combinedText = boundingBoxes.map((box, i) => `[${i}] ${box.text}`).join('\n')
          
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: combinedText,
              sourceLang: 'Korean/Japanese',
              isBatch: true,
              count: boundingBoxes.length
            })
          })

          if (response.ok) {
            const data = await response.json()
            const translations = data.translations || []
            
            // Map translations back to bounding boxes
            translations.forEach((translation: any) => {
              if (translation.index >= 0 && translation.index < boundingBoxes.length) {
                boundingBoxes[translation.index].translatedText = translation.text
              }
            })
          } else {
            // Fallback to original text
            boundingBoxes.forEach(box => {
              box.translatedText = box.text
            })
          }
        } catch (err) {
          console.error('Translation error:', err)
          // Fallback to original text
          boundingBoxes.forEach(box => {
            box.translatedText = box.text
          })
        }
      }

      await worker.terminate()
      
      const fullText = boundingBoxes.map(b => b.text).join(' ')
      const translatedFullText = boundingBoxes.map(b => b.translatedText || b.text).join(' ')

      onResult({ 
        text: translatedFullText || 'No text detected', 
        language: 'kor+jpn+eng',
        isLoading: false,
        boundingBoxes,
        imageUrl: imageBlobUrl
      })
      
    } catch (err: any) {
      console.error('Image processing error:', err)
      onResult({ 
        text: `Error: ${err?.message || 'Unknown error'}`, 
        language: 'eng',
        isLoading: false
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Process imageUrl when it changes
  useEffect(() => {
    if (imageUrl) {
      processImage(imageUrl)
    }
  }, [imageUrl])

  return (
    <div className="relative">
      <label className="flex items-center gap-2">
        <span className="text-gray-800">Upload image</span>
        {isProcessing && (
          <span className="text-blue-600 animate-pulse">(Processing...)</span>
        )}
      </label>
      <div className="mt-2">
        <label className="flex justify-center w-full h-32 px-4 transition border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-500 focus:outline-none">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="pt-1 text-sm text-gray-600">
              Drop an image or click to select
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isProcessing}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                onSelect(f)
                processImage(f)
              }
            }}
          />
        </label>
      </div>
    </div>
  )
}
