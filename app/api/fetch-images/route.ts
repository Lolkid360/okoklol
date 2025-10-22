import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    // Fetch the webpage content
    const response = await fetch(url)
    const html = await response.text()
    
    // Extract all image URLs using regex
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g
    const matches = [...html.matchAll(imgRegex)]
    const imageUrls = matches.map(match => {
      const imgUrl = match[1]
      // Handle relative URLs
      if (imgUrl.startsWith('/')) {
        const baseUrl = new URL(url)
        return `${baseUrl.origin}${imgUrl}`
      }
      return imgUrl
    })
    
    // Filter out duplicates and return
    const uniqueImages = [...new Set(imageUrls)]
    
    return NextResponse.json({ images: uniqueImages })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}