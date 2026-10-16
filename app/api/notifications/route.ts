import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
const R2 = new S3Client({ region:'auto', endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials:{ accessKeyId:process.env.R2_ACCESS_KEY_ID!, secretAccessKey:process.env.R2_SECRET_ACCESS_KEY! } })
const BUCKET = process.env.R2_BUCKET_NAME || 'chitpix'
const KEY = "data/notifications.json"
async function getNotifs(){ try{ const r=await R2.send(new GetObjectCommand({Bucket:BUCKET, Key:KEY})); const t=await r.Body?.transformToString(); return t?JSON.parse(t):[] }catch{return[]} }

export async function POST(req:Request){
  const body = await req.json()
  const notifs = await getNotifs()
  notifs.unshift({id:Date.now().toString(),...body, read:false, created_at:new Date().toISOString()})
  await R2.send(new PutObjectCommand({Bucket:BUCKET, Key:KEY, Body:JSON.stringify(notifs.slice(0,200)), ContentType:"application/json"}))
  return Response.json({success:true})
}
export async function GET(req:Request){
  const {searchParams} = new URL(req.url)
  const user = searchParams.get('user')
  let notifs = await getNotifs()
  if(user) notifs = notifs.filter((n:any)=>n.toUser===user)
  return Response.json(notifs.slice(0,50))
}
