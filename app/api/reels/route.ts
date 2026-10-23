import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // TRY 1: Try supabase if you have
    try {
      const { createClient } = await import('@supabase/supabase-js')
      if(process.env.NEXT_PUBLIC_SUPABASE_URL){
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if(!error && data && data.length > 0){
          // Prioritize videos
          let reels = data.filter((p:any)=> p.videoUrl || p.video_url || p.url?.includes('.mp4') || p.type==='reel')
          if(reels.length===0) reels = data // fallback to all
          return NextResponse.json({ reels, posts: reels })
        }
      }
    } catch(e){ console.log('supabase fail', e) }

    // TRY 2: Fallback - Try /api/posts internally (if you have local data)
    // TRY 3: Return dummy R2 reels so page loads
    const dummyReels = [
      {
        id: '1',
        videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        video_url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        caption: 'Welcome to ChitPix 🔥 First R2 Reel #chitpix',
        user: 'knmahesh',
        userAvatar: 'https://i.pravatar.cc/100?u=knmahesh',
        likes: 124,
        comments: 34,
        type: 'reel'
      },
      {
        id: '2',
        videoUrl: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
        url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
        caption: 'Second reel - R2 storage connected 🚀',
        user: 'chitpix',
        likes: 89,
        type: 'reel'
      }
    ]

    return NextResponse.json({ reels: dummyReels, posts: dummyReels })

  } catch (e:any) {
    return NextResponse.json({ error: e.message, reels: [] }, { status: 500 })
  }
}
