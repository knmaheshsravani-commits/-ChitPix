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
    return text ? JSON.parse(text) : []
  } catch { return [] }
}

export async function POST(req: NextRequest) {
  try {
    const baseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
    if (!baseUrl) return NextResponse.json({ error: 'R2_PUBLIC_URL missing!' }, { status: 500 })

    const contentType = req.headers.get('content-type') || ''
    let publicUrl = ''
    let username = 'knmahesh'
    let caption = ''
    let fileName = ''
    let uploadType = 'post'
    let isPermanentRaw: any = null

    if (contentType.includes('application/json')) {
      const body = await req.json()
      publicUrl = body.url || body.publicUrl || body.image_url
      username = body.username || 'knmahesh'
      caption = body.caption || ''
      uploadType = body.type || body.uploadType || 'post'
      isPermanentRaw = body.isPermanent ?? body.isR2Permanent ?? null
    } else {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      username = (formData.get('username') as string) || 'knmahesh'
      caption = (formData.get('caption') as string) || ''
      uploadType = (formData.get('type') as string) || (formData.get('uploadType') as string) || 'post'
      const urlFromForm = (formData.get('url') as string) || (formData.get('publicUrl') as string)
      isPermanentRaw = formData.get('isPermanent') || formData.get('isR2Permanent')

      if (urlFromForm) {
        publicUrl = urlFromForm
      } else {
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const folder = uploadType === 'story' ? 'stories' : 'posts'
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())
        await R2.send(new PutObjectCommand({
          Bucket: BUCKET, Key: key, Body: buffer,
          ContentType: file.type || `image/${ext}`,
          CacheControl: 'public, max-age=31536000, immutable'
        }))
        publicUrl = `${baseUrl}/${key}`
        fileName = key
      }
    }

    const cleanUrl = publicUrl.split('?')[0].toLowerCase()
    const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm')

    // FIXED: Permanent logic - string 'true' / boolean true support
    const isPermanent = isPermanentRaw === true || isPermanentRaw === 'true' || isPermanentRaw === '1'

    if (uploadType === 'story') {
      const now = new Date()
      const newStory = {
        id: Date.now().toString(), 
        image_url: publicUrl, 
        url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(), 
        caption, 
        fileName,
        created_at: now.toISOString(), 
        // FIXED: Permanent = null, 24h = +24h
        expires_at: isPermanent ? null : new Date(now.getTime() + 24*60*60*1000).toISOString(),
        type: 'story', 
        views: 0, 
        isR2Permanent: isPermanent,
        viewsText: isPermanent ? '0 views • R2 Permanent ♾️' : '0 views • 24h left'
      }
      const stories = await getData(STORIES_KEY)
      const updatedStories = [newStory, ...stories].slice(0, 500)
      await R2.send(new PutObjectCommand({ Bucket: BUCKET, Key: STORIES_KEY, Body: JSON.stringify(updatedStories, null, 2), ContentType: "application/json", CacheControl: 'no-cache' }))
      return NextResponse.json({ 
        success: true, 
        url: publicUrl, 
        story: newStory, 
        message: isPermanent ? 'R2 Permanent Saved ♾️ - Never deletes!' : '24h Story Saved ⏳ Auto delete after 24h' 
      })
    } else {
      const newPost = {
        id: Date.now().toString(), image_url: publicUrl, url: publicUrl,
        video_url: isVideo ? publicUrl : undefined,
        username: username.toLowerCase(), caption, content: caption, fileName,
        created_at: new Date().toISOString(), type: isVideo ? 'reel' : 'post',
        likes: 0, views: '0 views • R2 Permanent'
      }
      const posts = await getData(POSTS_KEY)
      const updated = [newPost, ...posts].slice(0, 1000)
      await R2.send(new PutObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY, Body: JSON.stringify(updated, null, 2), ContentType: "application/json", CacheControl: 'no-cache' }))
      return NextResponse.json({ success: true, url: publicUrl, post: newPost })
    }
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Ready ✅ Stories + Posts separated - Permanent + 24h both working' })
                           }
