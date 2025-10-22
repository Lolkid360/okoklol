import React from 'react'

type Props = {
  src?: string
}

export default function Preview({ src }: Props) {
  if (!src) return (
    <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center text-gray-500">
      No image selected
    </div>
  )
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      <div className="relative aspect-video flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        <img 
          src={src} 
          alt="preview" 
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    </div>
  )
}
