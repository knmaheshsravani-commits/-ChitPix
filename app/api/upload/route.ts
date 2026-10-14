import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { supabase } from '../../../lib/supabase'

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
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))

    const publicUrl = `${process.env.R2_PUBLIC_URL?.replace(/\/$/, '')}/${key}`

    // Save to supabase
    const { data, error } = await supabase.from('posts').insert({
      image_url: publicUrl,
      publicUrl: publicUrl,
      url: publicUrl,
      username: username,
      caption: caption,
    }).select().single()

    if (error) throw error

    return NextResponse.json({ success: true, url: publicUrl, post: data })

  } catch (e: any) {
    console.error('UPLOAD ERROR:', e)
    // IMPORTANT: Always return JSON!
    return NextResponse.json({ error: e.message || 'Upload failed', details: String(e) }, { status: 500 })
  }
}