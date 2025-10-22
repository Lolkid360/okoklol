import React, { useEffect, useRef, useState } from 'react'

type BoundingBox = {
  x: number
  y: number
  width: number
  height: number
  text: string
  translatedText?: string
}

type Props = {
  imageUrl: string
  boundingBoxes: BoundingBox[]
  showOriginal?: boolean
}

export default function TranslatedImageOverlay({ imageUrl, boundingBoxes, showOriginal = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height
      setImageDimensions({ width: img.width, height: img.height })

      // Draw the original image
      ctx.drawImage(img, 0, 0)

      if (!showOriginal && boundingBoxes.length > 0) {
        // Overlay translated text
        boundingBoxes.forEach(box => {
          if (box.translatedText) {
            // Fill the original text area with white to mask it
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
            ctx.fillRect(box.x, box.y, box.width, box.height)

            // Draw translated text
            const fontSize = Math.max(12, Math.min(box.height * 0.7, 24))
            ctx.font = `${fontSize}px Arial, sans-serif`
            ctx.fillStyle = 'black'
            ctx.textBaseline = 'top'

            // Word wrap the text if it's too long
            const words = box.translatedText.split(' ')
            let line = ''
            let yOffset = box.y + 2
            const lineHeight = fontSize * 1.2
            const maxWidth = box.width - 4

            for (let i = 0; i < words.length; i++) {
              const testLine = line + words[i] + ' '
              const metrics = ctx.measureText(testLine)
              
              if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, box.x + 2, yOffset)
                line = words[i] + ' '
                yOffset += lineHeight
              } else {
                line = testLine
              }
            }
            ctx.fillText(line, box.x + 2, yOffset)
          }
        })
      }

      setImageLoaded(true)
    }

    img.onerror = () => {
      console.error('Failed to load image for overlay')
    }

    img.src = imageUrl
  }, [imageUrl, boundingBoxes, showOriginal])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
      {!imageLoaded && (
        <div className="text-gray-500">Loading image...</div>
      )}
    </div>
  )
}
