// @ts-nocheck
import { NextResponse } from "next/server"

// Simple permanent - same as your posts API - Supabase lekunte R2 JSON
let storiesDB:any[] = (globalThis as any)._storiesDB || []
;(globalThis as any)._storiesDB = storiesDB

export async function GET(){
  // 24h valid
  const now = Date.now()
  const valid = storiesDB.filter((s:any)=> now - new Date(s.created_at).getTime() < 86400000)
  // Old invalid delete
  storiesDB = valid
  ;(globalThis as any)._storiesDB = storiesDB
  return NextResponse.json(valid)
}

export async function POST(req:Request){
  try{
    const body = await req.json()
    if(!body.image_url) return NextResponse.json({error:"No image"}, {status:400})
    
    const story = {
      id: Date.now().toString(),
      username: body.username || "knmahesh",
      image_url: body.image_url, // R2 URL - https://pub-62904f...
      avatar_url: body.avatar_url || `https://i.pravatar.cc/100?u=${body.username}`, // Idi lekapothe ne broken icon vastundi - nuvvu correct rasav!
      created_at: new Date().toISOString(),
      caption: body.caption || "",
      views: 0
    }
    storiesDB.unshift(story)
    ;(globalThis as any)._storiesDB = storiesDB
    
    // TODO: Later Supabase lo save chestham - ippudu memory + R2 image permanent
    return NextResponse.json(story)
  }catch(e:any){
    return NextResponse.json({error:e.message}, {status:500})
  }
}
