import React from 'react'

type Props = {
  src?: string
}

export default function Preview({ src }: Props) {
  if (!src) return (
    <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50 text-center text-black min-h-[400px]">
      <p>No image selected</p>
    </div>
  )
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      <div className="relative aspect-video flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={src} 
          alt="preview" 
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    </div>
  )
}
