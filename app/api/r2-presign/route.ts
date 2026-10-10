import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-presigner"
import { NextRequest, NextResponse } from "next/server"
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2"

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, folder } = await req.json()
    const key = `${folder || 'reels'}/${Date.now()}_${fileName.replace(/\s+/g,'_')}`
    const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: fileType })
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
    const publicUrl = `${R2_PUBLIC_URL}/${key}`
    return NextResponse.json({ uploadUrl, publicUrl, key, success: true })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
