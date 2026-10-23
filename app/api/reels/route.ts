import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File
    const caption = form.get('caption') as string || ''
    
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    
    // 300MB check
    if (file.size > 300 * 1024 * 1024) {
      return NextResponse.json({ error: 'Max 300MB allowed' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `reels/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'')}`
    
    await R2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }))

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`

    // Save to DB - your existing logic
    // If you have supabase:
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      await supabase.from('posts').insert({
        type: 'reel',
        videoUrl: publicUrl,
        video_url: publicUrl,
        url: publicUrl,
        caption,
        user: 'knmahesh',
        likes: 0,
      })
    } catch {}

    return NextResponse.json({ success: true, url: publicUrl, videoUrl: publicUrl })
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
