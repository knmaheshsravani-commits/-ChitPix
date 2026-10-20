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

const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix'
const POSTS_KEY = "data/posts.json"
const STORIES_KEY = "data/stories.json"

async function getData(key: string) {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const text = await res.Body?.transformToString()
    if (!text) return []
    const data = JSON.parse(text)
    return Array.isArray(data) ? data : []
  } catch (e: any) {
    if (e.Code === 'NoSuchKey' || e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) {
      return []
    }
    console.log(`No file ${key} yet, returning []`)
    return []
  }
}

async function saveData(key: string, data: any[]) {
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: "application/json",
    CacheControl: 'no-cache'
  }))
}

export async function POST(req: NextRequest) {
  try {
    // ENV Check
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      return NextResponse.json({ error: 'R2 ENV missing - Check Vercel Settings > Environment Variables' }, { status: 500 })
    }
    const baseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
    if (!baseUrl) {
      return NextResponse.json({ error: 'R2_PUBLIC_URL missing! Add https://pub-xxx.r2.dev in Vercel ENV' }, { status: 500 })
    }

    const contentType = req.headers.get('content-type') || ''
    let publicUrl = ''
    let username = 'knmahesh'
    let caption = ''
    let fileName = ''
    let uploadType = 'post' // post | story | reel
    let isPaid = false
    let isR2Permanent = false

    // CASE 1: JSON (Presigned URL way - for videos >4MB)
    if (contentType.includes('application/json')) {
      const body = await req.json()
      publicUrl = body.url || body.publicUrl || body.video_url || body.image_url || body.imageUrl || body.videoUrl
      username = body.username || body.user || 'knmahesh'
      caption = body.caption || body.content || ''
      fileName = body.fileName || body.key || ''
      uploadType = body.type || body.uploadType || 'post'
      isPaid = body.isPaid || false
      isR2Permanent = body.isR2Permanent || false
      if (!publicUrl) return NextResponse.json({ error: 'No URL in JSON body' }, { status: 400 })
    }
    // CASE 2: FormData (Direct upload <10MB)
    else {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      username = (formData.get('username') as string) || 'knmahesh'
      caption = (formData.get('caption') as string) || (formData.get('content') as string) || ''
      uploadType = (formData.get('type') as string) || (formData.get('uploadType') as string) || 'post'
      isPaid = (formData.get('isPaid') as string) === 'true'
      isR2Permanent = (formData.get('isR2Permanent') as string) === 'true'
      const urlFromForm = (formData.get('url') as string) || (formData.get('publicUrl') as string)

      if (urlFromForm) {
        publicUrl = urlFromForm
        fileName = urlFromForm.split('/').pop() || ''
      } else {
        if (!file) return NextResponse.json({ error: 'No file found - Select photo/video' }, { status: 400 })
        if (file.size > 15 * 1024 * 1024) {
          return NextResponse.json({
            error: `File ${Math.round(file.size / 1024 / 1024)}MB too big. Max 15MB for direct, use /api/r2-presign for large files`,
            usePresign: true
          }, { status: 413 })
        }
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const folder = uploadType === 'story' ? 'stories' : uploadType === 'reel' ? 'reels' : 'posts'
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())
        await R2.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type || (ext === 'mp4' ? 'video/mp4' : `image/${ext}`),
          CacheControl: 'public, max-age=31536000, immutable'
        }))
        publicUrl = `${baseUrl}/${key}`
        fileName = key
      }
    }

    const cleanUrl = publicUrl.split('?')[0].toLowerCase()
    const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mkv')

    // ===== FEATURE 1: STORY UPLOAD - WILL NEVER GO TO HOME =====
    if (uploadType === 'story') {
      const newStory = {
        id: Date.now().toString(),
        image_url: publicUrl,
        url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(),
        caption: caption,
        content: caption,
        fileName: fileName,
        key: fileName,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        expires_at: null,
        expiresAt: null,
        type: 'story',
        likes: 0,
        likesCount: 0,
        views: 0,
        viewsCount: 0,
        isR2Permanent: true,
        isPaid: isPaid,
        isVideo: isVideo,
        viewsText: '0 views • R2 Permanent views',
        badge: 'R2 Permanent',
        comments: [],
        viewers: [],
        reactions: { heart: 0, fire: 0, laugh: 0, wow: 0, clap: 0 }
      }
      const stories = await getData(STORIES_KEY)
      const updatedStories = [newStory, ...stories].slice(0, 1000)
      await saveData(STORIES_KEY, updatedStories)
      return NextResponse.json({
        success: true,
        url: publicUrl,
        publicUrl: publicUrl,
        story: newStory,
        type: 'story',
        message: 'R2 Story saved ✅ - Will NOT appear in Home, only in Stories bar!'
      })
    }
    // ===== FEATURE 2: POST / REEL UPLOAD - GOES TO HOME =====
    else {
      const newPost = {
        id: Date.now().toString(),
        image_url: publicUrl,
        url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(),
        caption: caption,
        content: caption,
        fileName: fileName,
        key: fileName,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: isVideo ? 'reel' : 'post',
        likes: 0,
        likesCount: 0,
        views: 0,
        viewsCount: 0,
        viewsText: '0 views • R2 Permanent',
        isR2Permanent: true,
        isPaid: isPaid,
        isVideo: isVideo,
        comments: [],
        badge: 'R2 Permanent'
      }
      const posts = await getData(POSTS_KEY)
      const updated = [newPost, ...posts].slice(0, 2000)
      await saveData(POSTS_KEY, updated)
      return NextResponse.json({
        success: true,
        url: publicUrl,
        publicUrl: publicUrl,
        post: newPost,
        type: newPost.type,
        message: 'R2 Post saved ✅ - Will appear in Home!'
      })
    }

  } catch (e: any) {
    console.error('UPLOAD ERROR:', e)
    return NextResponse.json({
      error: e.message || 'Upload failed',
      details: e.toString(),
      code: e.Code || e.name,
      stack: e.stack
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ChitPix upload endpoint ready ✅ - Stories + Posts separated',
    bucket: BUCKET,
    postsKey: POSTS_KEY,
    storiesKey: STORIES_KEY,
    hasR2: !!process.env.R2_ACCOUNT_ID,
    hasKey: !!process.env.R2_ACCESS_KEY_ID,
    hasPublicUrl: !!process.env.R2_PUBLIC_URL,
    owner: 'K N Mahesh',
    features: ['story-home-separated', 'r2-permanent', 'video-support', 'paid-story', '15MB-direct', 'presign-support']
  })
    }
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'chitpix'
const STORIES_KEY = "data/stories.json"

export async function GET() {
  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY }));
    const text = await res.Body?.transformToString();
    let stories = text ? JSON.parse(text) : [];
    // Filter: R2 Permanent never expires
    stories = stories.filter((s: any) => s.expires_at === null || s.expiresAt === null || new Date(s.expires_at || s.expiresAt) > new Date() || true);
    // Sort newest first
    stories.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({ success: true, stories, count: stories.length });
  } catch (e: any) {
    return NextResponse.json({ success: true, stories: [], count: 0, error: e.message });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY }));
    const text = await res.Body?.transformToString();
    let stories = text ? JSON.parse(text) : [];
    stories = stories.filter((s: any) => s.id !== id)
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    await R2.send(new PutObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY, Body: JSON.stringify(stories, null, 2), ContentType: "application/json", CacheControl: 'no-cache' }))
    return NextResponse.json({ success: true, message: 'Story deleted' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
