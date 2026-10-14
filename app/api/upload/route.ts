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

export async function GET(){
  try{
    const { data, error } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
    if(error) throw error
    return NextResponse.json({ posts: data })
  }catch(e:any){
    return NextResponse.json({ posts: [], error: e.message })
  }
}

export async function POST(req: NextRequest){
  try{
    const form = await req.formData()
    const file = form.get('file') as File
    const caption = form.get('caption') as string || ''
    const username = form.get('username') as string || 'Knmahesh'
    
    if(!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    // 50MB limit check
    if(file.size > 50 * 1024 * 1024){
      return NextResponse.json({ error: 'File too big, max 50MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await R2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

    // Save to supabase
    const { data, error } = await supabase.from('posts').insert({
      image_url: publicUrl,
      video_url: file.type.startsWith('video') ? publicUrl : null,
      username: username,
      caption: caption,
    }).select().single()

    if(error) throw error

    return NextResponse.json({ success: true, url: publicUrl, post: data })

  }catch(e:any){
    console.error('UPLOAD ERROR:', e)
    // IMPORTANT: Always return JSON!
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}
