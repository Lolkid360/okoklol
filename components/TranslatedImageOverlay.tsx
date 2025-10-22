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
            const fontSize = Math.max(12, Math.min(box.height * 0.7, 24))
            ctx.font = `${fontSize}px Arial, sans-serif`
            ctx.textBaseline = 'top'

            // Calculate the dimensions of the translated text
            const words = box.translatedText.split(' ')
            let line = ''
            const lines = []
            const maxWidth = box.width - 4 // Use original box width as a constraint
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' '
                const metrics = ctx.measureText(testLine)
                if (metrics.width > maxWidth && i > 0) {
                    lines.push(line)
                    line = words[i] + ' '
                } else {
                    line = testLine
                }
            }
            lines.push(line)

            let translatedWidth = 0;
            for (const l of lines) {
                const lineWidth = ctx.measureText(l.trim()).width;
                if (lineWidth > translatedWidth) {
                    translatedWidth = lineWidth;
                }
            }

            const lineHeight = fontSize * 1.2
            const translatedHeight = lines.length * lineHeight

            // Fill the original text area with white to mask it
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
            // center the new box
            const newX = box.x + (box.width - translatedWidth) / 2
            const newY = box.y + (box.height - translatedHeight) / 2
            ctx.fillRect(newX - 2, newY - 2, translatedWidth + 4, translatedHeight + 4)

            // Draw translated text
            ctx.fillStyle = 'black'
            let yOffset = newY;
            for (const l of lines) {
              ctx.fillText(l.trim(), newX, yOffset)
              yOffset += lineHeight
            }
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
        <div className="text-black">Loading image...</div>
      )}
    </div>
  )
}
