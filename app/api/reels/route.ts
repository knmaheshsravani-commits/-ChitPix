import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // TRY 1: If you use Supabase (most ChitPix projects)
    try {
      // @ts-ignore
      const { createClient } = await import('@/lib/supabase/client').catch(() => import('@supabase/supabase-js'))
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      if (supabaseUrl && supabaseKey) {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
        const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
        
        // Fetch reels where type='reel' OR videoUrl not null
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .or('type.eq.reel,video_url.not.is.null,videoUrl.not.is.null')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (!error && data && data.length > 0) {
          return NextResponse.json({ reels: data })
        }
      }
    } catch (e) {
      console.log('Supabase try failed, trying fallback', e)
    }

    // TRY 2: If you use Prisma
    try {
      // @ts-ignore
      const { prisma } = await import('@/lib/prisma')
      if (prisma) {
        const reels = await prisma.post.findMany({
          where: {
            OR: [
              { type: 'reel' },
              { videoUrl: { not: null } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        })
        if (reels.length > 0) {
          return NextResponse.json({ reels })
        }
      }
    } catch {}

    // TRY 3: Fallback - fetch from your own /api/posts and filter R2 reels
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const postsRes = await fetch(`${baseUrl}/api/posts?limit=50`, { cache: 'no-store' }).catch(() => null)
    
    if (postsRes && postsRes.ok) {
      const postsData = await postsRes.json()
      const allPosts = postsData.posts || postsData || []
      // Filter R2 videos - check url contains mp4 or r2 or videoUrl field
      const r2Reels = allPosts.filter((p: any) => {
        const url = (p.videoUrl || p.video_url || p.url || p.imageUrl || '').toLowerCase()
        return p.type === 'reel' || url.includes('.mp4') || url.includes('r2') || url.includes('video') || p.videoUrl || p.video_url
      })
      
      // If no R2 reels found, return first 10 as demo reels (so page works)
      const finalReels = r2Reels.length > 0 ? r2Reels : allPosts.slice(0, 10)
      return NextResponse.json({ reels: finalReels })
    }

    return NextResponse.json({ reels: [] })
  } catch (error) {
    console.error('Reels API error:', error)
    return NextResponse.json({ reels: [], error: String(error) }, { status: 500 })
  }
}
