import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! }
})

const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix'

export async function GET() {
  try {
    // 1. Try data/posts.json first
    let posts: any[] = []
    try {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3")
      const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: "data/posts.json" }))
      const text = await res.Body?.transformToString()
      if (text) posts = JSON.parse(text)
    } catch {}

    // 2. NOW LIST REAL R2 FILES - YOUR 460MB HERE!
    const listRes = await R2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "posts/",
      MaxKeys: 500
    }))

    const pubUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!
    const r2Files = (listRes.Contents || [])
      .filter(f => f.Key && !f.Key.endsWith('/') && !f.Key.includes('posts.json'))
      .filter(f => f.Key!.match(/\.(jpg|jpeg|png|webp|mp4|mov)$/i))
      .map(f => {
        // Check if already in json
        const exists = posts.find((p:any) => p.imageUrl?.includes(f.Key!) || p.image_url?.includes(f.Key!))
        if (exists) return null
        return {
          id: f.Key!,
          imageUrl: `${pubUrl}/${f.Key}`,
          image_url: `${pubUrl}/${f.Key}`,
          type: f.Key!.endsWith('.mp4') ? 'reel' : 'post',
          p_type: f.Key!.endsWith('.mp4') ? 'reel' : 'post',
          created_at: f.LastModified,
          likes: 0,
          size: f.Size
        }
      })
      .filter(Boolean)

    // Merge - json + real R2 files
    const allPosts = [...posts.filter((p:any)=> p.type !== 'story' && !p.image_url?.includes('/stories/')), ...r2Files]
    allPosts.sort((a:any,b:any)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const totalBytes = (listRes.Contents || []).reduce((s,f)=> s + (f.Size||0), 0)

    console.log(`R2 TOTAL: ${listRes.Contents?.length} files, ${(totalBytes/1024/1024).toFixed(2)} MB FOUND`)

    return NextResponse.json({ success: true, posts: allPosts, count: allPosts.length, totalMB: (totalBytes/1024/1024).toFixed(2) })
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ success: true, posts: [] })
  }
}
