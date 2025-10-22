import React, { useState } from 'react'

type Props = {
  onFetch: (images: string[]) => void
  onLoading: (isLoading: boolean) => void
}

export default function UrlInput({ onFetch, onLoading }: Props) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleFetch = async () => {
    try {
      setError('')
      onLoading(true)
      
      // Fetch the webpage content
      const res = await fetch('/api/fetch-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (!res.ok) throw new Error('Failed to fetch images')
      
      const { images } = await res.json()
      if (images.length === 0) {
        setError('No images found on this page')
        return
      }
      
      onFetch(images)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch images')
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="p-5 border border-gray-200 rounded-lg shadow-sm bg-white">
      <label className="block mb-3 font-medium text-black">Chapter URL</label>
      <div className="flex gap-3">
        <input
          type="url"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/chapter/1"
        />
        <button
          onClick={handleFetch}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Fetch Images
        </button>
      </div>
      {error && (
        <p className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
          {error}
        </p>
      )}
    </div>
  )
}