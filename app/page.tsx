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
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-4xl font-bold text-black">Chapter Image Translator</h1>
        <p className="text-black mt-2">Translate manga, comics, and other images with ease.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-8">
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="font-semibold text-lg text-black mb-4">Load Images</h3>
            <UrlInput onFetch={handleUrlFetch} onLoading={setIsFetching} />
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="font-semibold text-lg text-black mb-4">Upload Single Image</h3>
            <ImageUploader 
              onSelect={handleSelect} 
              onResult={handleResult}
              imageUrl={selectedImage?.url}
            />
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 max-h-[500px] overflow-y-auto">
            <h3 className="font-semibold text-lg text-black mb-4">
              Image Queue {isFetching && <span className="text-sm text-black">(Loading...)</span>}
            </h3>
            {images.length === 0 ? (
              <p className="text-black">No images loaded yet.</p>
            ) : (
              <div className="space-y-2">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full p-3 text-left rounded-lg transition-all duration-200 ${
                      i === selectedIndex 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <span className="font-medium">Image {i + 1}</span>
                    {img.isProcessing && <span className="text-xs ml-2">(Processing...)</span>}
                    {img.boundingBoxes && (
                      <span className="block text-xs mt-1">
                        ✓ {img.boundingBoxes.length} regions translated
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6" style={{ minHeight: '600px' }}>
            {selectedImage && selectedImage.boundingBoxes && selectedImage.processedImageUrl ? (
              <>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setShowOriginal(false)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      !showOriginal ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-black'
                    }`}
                  >
                    Translated
                  </button>
                  <button
                    onClick={() => setShowOriginal(true)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      showOriginal ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-black'
                    }`}
                  >
                    Original
                  </button>
                </div>
                <div className="border rounded-lg bg-gray-200 overflow-hidden">
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
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="font-semibold text-lg text-black mb-4">
              Translation Status {selectedImage?.isProcessing && <span className="text-sm text-black">(Processing...)</span>}
            </h3>
            <div className={`p-4 rounded-lg bg-gray-50 ${selectedImage?.isProcessing ? 'opacity-60' : ''}`}>
              <p className="text-black">
                {selectedImage?.text ?? 'No text detected yet.'}
              </p>
              {selectedImage?.boundingBoxes && (
                <div className="mt-3 text-sm text-black">
                  <span className="font-semibold">{selectedImage.boundingBoxes.length}</span> text regions detected and translated.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
