import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl)
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageData = await response.arrayBuffer()

    // Return the image with proper headers
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}