import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'chitpix.jpg'

  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 })

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
