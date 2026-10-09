import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const { image, filename, folder } = await req.json()
  const buffer = Buffer.from(image.split(",")[1], "base64")
  const key = `${folder || 'posts'}/${Date.now()}.jpg`
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  }))
  const url = `${process.env.R2_PUBLIC_URL}/${key}`
  return NextResponse.json({ url })
}
