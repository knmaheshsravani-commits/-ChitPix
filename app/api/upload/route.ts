import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME! || process.env.R2_BUCKET!
const POSTS_KEY = "data/posts.json"

async function getPosts() {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }))
    const text = await res.Body?.transformToString()
    return text ? JSON.parse(text) : []
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const username = formData.get('username') as string || 'anonymous'
    const caption = formData.get('caption') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const key = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))

    // IMPORTANT: Use R2_PUBLIC_URL or fallback
    const baseUrl = (process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT || '').replace(/\/$/, '')
    const publicUrl = baseUrl ? `${baseUrl}/${key}` : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`

    // Create post object for reels
    const newPost = {
      id: Date.now().toString(),
      image_url: publicUrl,
      url: publicUrl,
      video_url: publicUrl,
      username: username,
      caption: caption,
      content: caption,
      created_at: new Date().toISOString(),
    }

    // SAVE TO R2 JSON (THIS IS WHAT REELS READS!)
    const posts = await getPosts()
    const updated = [newPost, ...posts]
    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: POSTS_KEY,
      Body: JSON.stringify(updated, null, 2),
      ContentType: "application/json",
    }))

    return NextResponse.json({ success: true, url: publicUrl, post: newPost })

  } catch (e: any) {
    console.error('UPLOAD ERROR:', e)
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}
