import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
const R2 = new S3Client({ region:'auto', endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials:{ accessKeyId:process.env.R2_ACCESS_KEY_ID!, secretAccessKey:process.env.R2_SECRET_ACCESS_KEY! } })
const BUCKET = process.env.R2_BUCKET_NAME || 'chitpix'
const USERS_KEY = "data/users.json"

async function getUsers(){ try{ const r=await R2.send(new GetObjectCommand({Bucket:BUCKET, Key:USERS_KEY})); const t=await r.Body?.transformToString(); return t?JSON.parse(t):[] }catch{return[]} }

export async function POST(req:Request){
  const b=await req.json()
  const users=await getUsers()
  if(!users.find((u:any)=>u.username===b.username)){
    users.push({...b, id:Date.now().toString(), created_at:new Date().toISOString(), photo:b.photo||`https://i.pravatar.cc/150?u=${b.username}`})
    await R2.send(new PutObjectCommand({Bucket:BUCKET, Key:USERS_KEY, Body:JSON.stringify(users,null,2), ContentType:"application/json"}))
  }
  return Response.json({success:true})
}
export async function GET(){
  const users=await getUsers()
  return Response.json(users)
}
