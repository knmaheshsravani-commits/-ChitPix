import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
const R2 = new S3Client({ region:'auto', endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials:{ accessKeyId:process.env.R2_ACCESS_KEY_ID!, secretAccessKey:process.env.R2_SECRET_ACCESS_KEY! } })
const BUCKET = process.env.R2_BUCKET_NAME || 'chitpix'
export async function POST(req:Request){ const b=await req.json(); await R2.send(new PutObjectCommand({Bucket:BUCKET, Key:"data/current.json", Body:JSON.stringify(b), ContentType:"application/json"})); return Response.json({success:true}) }
export async function GET(){ try{ const r=await R2.send(new GetObjectCommand({Bucket:BUCKET, Key:"data/current.json"})); const t=await r.Body?.transformToString(); return new Response(t||'{"username":"knmahesh"}') }catch{ return new Response('{"username":"knmahesh"}') } }
