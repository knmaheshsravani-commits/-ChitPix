import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const dynamic = 'force-dynamic'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME! || process.env.R2_BUCKET!

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType } = await req.json()
    if (!fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 })

    const ext = fileName.split('.').pop() || 'mp4'
    const key = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType || 'video/mp4',
    })

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 })

    const baseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
    const publicUrl = baseUrl ? `${baseUrl}/${key}` : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`

    return NextResponse.json({ success: true, uploadUrl: signedUrl, publicUrl, key })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
