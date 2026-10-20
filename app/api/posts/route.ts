import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
})
const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix'
const POSTS_KEY = "data/posts.json"

export async function GET() {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }))
    const text = await res.Body?.transformToString()
    let posts = text ? JSON.parse(text) : []
    // HOME LO ONLY POSTS - Stories ni filter chesthunna - 100% Home lo ravu!
    posts = posts.filter((p: any) => p.type !== 'story' && !p.image_url?.includes('/stories/'))
    posts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return NextResponse.json({ success: true, posts, count: posts.length })
  } catch {
    return NextResponse.json({ success: true, posts: [] })
  }
}
