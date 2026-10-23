import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VIDEO_SAMPLES = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
]

const CAPTIONS = [
  "Viral Trending 🔥 #chitpix #viral #trending",
  "Hot Look Today 😍 #fashion #style #reels",
  "Beach vibes 🏖️ #travel #beach #summer",
  "Fitness motivation 💪 #gym #fitness",
  "Foodie heaven 🍜 #food #yummy",
  "Nature beauty 🌿 #nature #peace",
  "Dance challenge 💃 #dance #viralreel",
  "10 Lakh family ❤️ Thank you ChitPix!",
]

export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  
  const start = (page-1)*limit
  
  const reels = Array.from({length: limit}).map((_, i)=>{
    const idx = start + i
    return {
      id: idx + 1,
      videoUrl: VIDEO_SAMPLES[idx % VIDEO_SAMPLES.length],
      imageUrl: `https://picsum.photos/seed/chitpix${idx}/720/1280`,
      thumbnail: `https://picsum.photos/seed/chitpix${idx}/720/1280`,
      user: `user_${(idx % 5000)+1}`,
      userAvatar: `https://picsum.photos/seed/avatar${idx}/100/100`,
      caption: CAPTIONS[idx % CAPTIONS.length] + ` #${idx+1}`,
      likes: Math.floor(Math.random()*50000)+1000,
      comments: Math.floor(Math.random()*2000)+50,
      shares: Math.floor(Math.random()*500)+20,
      isLiked: false,
      location: ['Hyderabad','Mumbai','Goa','Bali','Dubai'][idx%5]
    }
  })

  return NextResponse.json({
    reels,
    total: 1000000,
    page,
    hasMore: start + limit < 1000000
  })
}
