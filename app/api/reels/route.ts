import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    // 1. Try REAL posts from your DB - reels type
    const postsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/posts?limit=100`, { cache: 'no-store' })
    const postsData = await postsRes.json().catch(()=>({posts:[]}))
    let realReels = (postsData.posts || []).filter((p:any)=> p.type==='reel' || p.videoUrl || p.video_url)

    // If no real reels, use all posts as reels (real users posts)
    if(realReels.length < 5){
      realReels = postsData.posts || []
    }

    // Paginate real reels
    const start = (page-1)*limit
    const paginated = realReels.slice(start, start+limit).map((r:any, i:number)=>({
      id: r.id || start+i,
      videoUrl: r.videoUrl || r.video_url || r.imageUrl,
      imageUrl: r.imageUrl || r.image_url || r.url,
      user: r.user || r.username || 'real_user',
      userAvatar: r.userAvatar || `https://picsum.photos/seed/${r.user}/100/100`,
      caption: r.caption || 'Real user post ❤️ #ChitPix',
      likes: r.likes || Math.floor(Math.random()*1000),
      comments: r.comments || 50,
      shares: 20,
      location: r.location || 'India'
    }))

    // If still empty, fallback to mock but show count as real users count
    if(paginated.length===0){
      throw new Error('no real reels')
    }

    return NextResponse.json({
      reels: paginated,
      total: postsData.posts?.length || 100,
      page,
      hasMore: start+limit < realReels.length,
      isReal: true
    })

  } catch(e){
    // Fallback mock only if no real posts at all
    const mock = Array.from({length: limit}).map((_, i)=>{
      const idx = (page-1)*limit + i
      return {
        id: idx,
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        imageUrl: `https://picsum.photos/seed/chitpix${idx}/720/1280`,
        user: `user_${idx}`,
        caption: `Join ChitPix - Real users uploading daily! #${idx}`,
        likes: 100, comments: 10, shares: 2, location: 'India'
      }
    })
    return NextResponse.json({ reels: mock, total: 1000000, page, hasMore: true, isReal: false })
  }
}
