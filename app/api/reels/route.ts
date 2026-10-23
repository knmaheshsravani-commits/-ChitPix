import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || '20'

    // Directly fetch from your existing /api/posts endpoint
    // Vercel URL handling
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const host = req.headers.get('host') || 'www.chitpix.com'
    const baseUrl = `${protocol}://${host}`

    try {
      const postsRes = await fetch(`${baseUrl}/api/posts?limit=100`, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      })

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        const allPosts = postsData.posts || postsData || []
        
        // Filter only R2 reels - video URLs
        const reels = allPosts.filter((p: any) => {
          const v = (p.videoUrl || p.video_url || p.url || '').toLowerCase()
          const img = (p.imageUrl || '').toLowerCase()
          // Check if it's video
          return (
            p.type === 'reel' ||
            p.type === 'video' ||
            v.endsWith('.mp4') ||
            v.endsWith('.mov') ||
            v.includes('.mp4') ||
            v.includes('r2') ||
            img.includes('.mp4') ||
            p.videoUrl ||
            p.video_url
          )
        })

        // If no video reels found, take first 10 posts as reels (so page doesn't break)
        const finalReels = reels.length > 0 ? reels.slice(0, parseInt(limit)) : allPosts.slice(0, 10)
        
        return NextResponse.json({ reels: finalReels })
      }
    } catch (err) {
      console.log('Fetch error:', err)
    }

    // Absolute fallback
    return NextResponse.json({ reels: [] })
    
  } catch (error) {
    console.error('Reels API error:', error)
    return NextResponse.json({ reels: [] }, { status: 200 })
  }
}
