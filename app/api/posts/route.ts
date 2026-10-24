import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID_1}.r2.cloudflarestorage.com`,
  credentials: { 
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_1 || process.env.R2_ACCESS_KEY!, 
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY_1 || process.env.R2_SECRET_ACCESS_KEY! 
  }
})

const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || process.env.R2_BUCKET_1 || 'chitpix'
const PUB_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || `https://pub-62904f82f9ea4d4ebf8da6283b4e5cf9b2f55.r2.dev`

export async function GET() {
  try {
    let posts: any[] = []
    // 1. Try data/posts.json first - 100% R2
    try {
      const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: "data/posts.json" }))
      const text = await res.Body?.transformToString()
      if (text) posts = JSON.parse(text)
    } catch {}

    // 2. LIST REAL R2 FILES - YOUR 460MB HERE!
    const listRes = await R2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "posts/",
      MaxKeys: 500
    }))

    const r2Files = (listRes.Contents || [])
      .filter(f => f.Key && !f.Key.endsWith('/') && !f.Key.includes('posts.json'))
      .filter(f => f.Key!.match(/\.(jpg|jpeg|png|webp|mp4|mov)$/i))
      .filter(f => {
        const k = f.Key!.toLowerCase()
        if(k.includes('blouse')) return false
        if(k.includes('backside')) return false
        if(k.includes('pinterest')) return false
        return true
      })
      .map(f => {
        const exists = posts.find((p:any) => p.imageUrl?.includes(f.Key!) || p.image_url?.includes(f.Key!))
        if (exists) return null
        const key = f.Key!
        return {
          id: key,
          imageUrl: `${PUB_URL}/${key}`,
          image_url: `${PUB_URL}/${key}`,
          url: `${PUB_URL}/${key}`,
          r2Url: `${PUB_URL}/${key}`,
          caption: `ChitPix 2026 🔥 #chitpix`,
          username: "knmahesh",
          likes: Math.floor(Math.random()*5000),
          views: Math.floor(Math.random()*10000),
          type: key.toLowerCase().endsWith('.mp4') ? 'reel' : 'post',
          p_type: key.toLowerCase().endsWith('.mp4') ? 'reel' : 'post',
          category: "For You",
          created_at: f.LastModified?.toISOString() || new Date().toISOString(),
          size: f.Size
        }
      })
      .filter(Boolean)

    // Merge - json + real R2 files - CLEAN
    const merged = [...posts.filter((p:any)=> {
      const cap = (p.caption||'').toLowerCase()
      if(cap.includes('blouse')) return false
      if(cap.includes('backside')) return false
      return p.type !== 'story' && !p.image_url?.includes('/stories/')
    }), ...r2Files]

    merged.sort((a:any,b:any)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // ✅ FIX: Return ARRAY DIRECTLY - Home + Search rendu ki same
    // Old code object return valla okate ostundi - Ippudu array return = 100% fix
    return NextResponse.json(merged, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })

  } catch (e:any) {
    console.error("R2 Error", e)
    return NextResponse.json([], { status: 200 })
  }
}
