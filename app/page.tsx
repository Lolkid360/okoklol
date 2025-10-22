"use client"

import React, { useState } from "react"
import Preview from "../components/Preview"
import UrlInput from "../components/UrlInput"
import ImageUploader, { BoundingBox } from "../components/ImageUploader"
import TranslatedImageOverlay from "../components/TranslatedImageOverlay"

type ImageResult = {
  url: string
  text?: string
  isProcessing?: boolean
  boundingBoxes?: BoundingBox[]
  processedImageUrl?: string
}

export default function Home() {
  const [images, setImages] = useState<ImageResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isFetching, setIsFetching] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  const handleUrlFetch = (imageUrls: string[]) => {
    const newImages = imageUrls.map(url => ({ url }))
    setImages(newImages)
    if (newImages.length > 0) {
      setSelectedIndex(0)
    }
  }

  const handleSelect = (file: File) => {
    const url = URL.createObjectURL(file)
    setImages([{ url }])
    setSelectedIndex(0)
  }

  const handleResult = (result: { 
    text: string
    language: string
    isLoading?: boolean
    boundingBoxes?: BoundingBox[]
    imageUrl?: string
  }) => {
    if (selectedIndex === -1) return
    setImages(prev => prev.map((img, i) => 
      i === selectedIndex 
        ? { 
            ...img, 
            text: result.text, 
            isProcessing: result.isLoading,
            boundingBoxes: result.boundingBoxes,
            processedImageUrl: result.imageUrl
          }
        : img
    ))
  }

  const selectedImage = selectedIndex >= 0 ? images[selectedIndex] : null

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Chapter Image Translator</h1>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <div className="space-y-4">
          <UrlInput onFetch={handleUrlFetch} onLoading={setIsFetching} />
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Upload Single Image</h3>
            <ImageUploader 
              onSelect={handleSelect} 
              onResult={handleResult}
              imageUrl={selectedImage?.url}
            />
          </div>
          <div className="p-4 border rounded max-h-[500px] overflow-y-auto">
            <h3 className="font-semibold mb-2">Images {isFetching && '(Loading...)'}</h3>
            {images.length === 0 ? (
              <p className="text-gray-500">No images loaded yet</p>
            ) : (
              <div className="space-y-2">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full p-2 text-left hover:bg-gray-100 rounded ${
                      i === selectedIndex ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    Image {i + 1} {img.isProcessing && '(Processing...)'}
                    {img.boundingBoxes && (
                      <span className="block text-xs text-green-600">
                        ✓ {img.boundingBoxes.length} regions translated
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {selectedImage && selectedImage.boundingBoxes && selectedImage.processedImageUrl ? (
            <>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`px-4 py-2 rounded ${
                    !showOriginal ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  Translated
                </button>
                <button
                  onClick={() => setShowOriginal(true)}
                  className={`px-4 py-2 rounded ${
                    showOriginal ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  Original
                </button>
              </div>
              <div className="border rounded bg-white overflow-hidden" style={{ minHeight: '500px' }}>
                <TranslatedImageOverlay
                  imageUrl={selectedImage.processedImageUrl}
                  boundingBoxes={selectedImage.boundingBoxes}
                  showOriginal={showOriginal}
                />
              </div>
            </>
          ) : (
            <Preview src={selectedImage?.url} />
          )}
          
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="font-semibold mb-2">
              Status {selectedImage?.isProcessing && '(Processing...)'}
            </h3>
            <p className={selectedImage?.isProcessing ? 'opacity-50' : ''}>
              {selectedImage?.text ?? 'No text detected yet'}
            </p>
            {selectedImage?.boundingBoxes && (
              <div className="mt-2 text-sm text-gray-600">
                Detected {selectedImage.boundingBoxes.length} text regions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
