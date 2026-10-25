"use client"
import { useState, useEffect, useRef } from 'react'
import BottomNav from './components/BottomNav'
import Stories from './components/Stories'
import { supabase } from '../lib/supabase'

export const dynamic = 'force-dynamic'
const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"
const WA = "916363373372"

function fixR2Url(p:any){
  if(!p) return ""
  let url = typeof p === "string" ? p : (p.image_url || p.r2_url || p.url || p.image || "")
  if(!url) return ""
  url = String(url).trim()
  if(url.startsWith("http")) return url
  return url
}

const uploadToR2 = async (file: File) => {
  const presignRes = await fetch("/api/r2-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: `posts/${Date.now()}_${file.name}`, contentType: file.type }),
  })
  const { url, publicUrl, key } = await presignRes.json()
  if (!url) throw new Error("Presign failed")
  await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
  return publicUrl || `${R2_PUBLIC}/${key}`
}

// DEMO POSTS - Instagram beat kottela - Posts lekapoyina feed kanipistundi!
const DEMO_POSTS = [
  {id:1, image_url:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500", caption:"Backside Maggam Work ₹350 - Kadur Delivery", username:"mahesh_tailor", price:"350"},
  {id:2, image_url:"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500", caption:"Heavy Bridal Blouse ₹450 - DM Order", username:"priya_kadur", price:"450"},
  {id:3, image_url:"https://images.unsplash.com/photo-1609354825940-3b06ab2eaa2c?w=500", caption:"Simple Aari Work ₹300 - ChitPix Exclusive", username:"sneha_design", price:"300"},
]

function PostCard({ post, index, galleryRef }: { post:any, index:number, galleryRef:any }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(15+index*3)
  const [heart, setHeart] = useState(false)
  const r2Url = fixR2Url(post)
  const displayUrl = r2Url || post.image_url
  const price = post.price || 350+index*10
  const caption = post.caption || `Design #${post.id}`

  const handleLike = () => {
    const nl = !liked; setLiked(nl); setLikes(nl?likes+1:likes-1)
    if(nl){ setHeart(true); setTimeout(()=>setHeart(false),800) }
  }
  const handleDoubleTap = () => { if(!liked) handleLike() }
  const handleDM = () => {
    const m=`Hi 👋 ChitPix design nachindi ID:${post.id} ${displayUrl} ${caption} ₹${price}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`,"_blank")
  }

  return (
    <div className="border-b-[8px] border-zinc-100 bg-white">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={`https://i.pravatar.cc/100?img=${(post.id%70)+1}`} className="w-full h-full rounded-full border-2 border-white" alt="" /></div>
          <div className="leading-[1.15]"><p className="text-[13px] font-bold">{post.username||`designer_${index+1}`} ✓</p><p className="text-[11px] text-zinc-500">📍 Kadur • {index+1}h ago</p></div>
        </div>
        <button className="text-[12px] font-bold text-blue-500">Follow</button>
      </div>
      <div className="relative bg-zinc-100 w-full aspect-[4/5] overflow-hidden" onDoubleClick={handleDoubleTap}>
        <img src={displayUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">R2 HD • ₹{price}</div>
        {heart && <div className="absolute inset-0 flex items-center justify-center text-[80px] animate-pulse">❤️</div>}
      </div>
      <div className="flex justify-between px-3 pt-3">
        <div className="flex gap-4 text-[22px]"><button onClick={handleLike}>{liked?'❤️':'🤍'}</button><button>💬</button><button>✈️</button></div>
        <div className="flex gap-3"><button className="text-[20px]">📑</button><button onClick={handleDM} className="bg-black text-white text-[11px] px-4 py-1.5 rounded-full font-black">DM ₹{price}</button></div>
      </div>
      <div className="px-3 py-2 text-[13px]"><p className="font-bold">{likes} likes</p><p><b>{post.username}</b> {caption}</p></div>
    </div>
  )
}
export default function HomePage(){
  const [posts, setPosts] = useState<any[]>(DEMO_POSTS) // Instagram beat - demo tho start
  const [uploadFile, setUploadFile] = useState<File|null>(null)
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("350")
  const [uploading, setUploading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const galleryRef = useRef<HTMLInputElement>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(()=>{
    const fetchR2 = async ()=>{
      try{
        const { data } = await supabase.from('posts').select('*').order('created_at', {desc:true}).limit(50)
        if(data && data.length>0){
          console.log("REAL POSTS:", data.length)
          setPosts(data)
        } else {
          console.log("Using DEMO - table empty")
        }
      }catch(e){ console.log(e) }
    }
    fetchR2()
  },[])

  const handleUpload = async () => {
    if(!uploadFile) return
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if(!user){ alert("Login avvali bro"); setUploading(false); return }
      const r2Url = await uploadToR2(uploadFile)
      const { data, error } = await supabase.from('posts').insert({
        user_id: user.id,
        image_url: r2Url,
        r2_url: r2Url,
        url: r2Url,
        caption: `${caption} ₹${price}`,
        price, username: user.email?.split('@')[0] || "mahesh_tailor"
      }).select().single()
      if(error) throw error
      const newPost = { id: data?.id || Date.now(), image_url: r2Url, caption: `${caption} ₹${price}`, price, username:"You", likes_count:0 }
      setPosts([newPost, ...posts])
      setShowCreate(false); setUploadFile(null); setCaption(""); setPrice("350")
      alert("✅ Posted to R2 - Instagram beat!")
    }catch(e:any){ alert("Failed: "+e.message) }
    setUploading(false)
  }

  const filtered = posts.filter(p=> !searchText || (p.caption||"").toLowerCase().includes(searchText.toLowerCase()))

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[70px]">
      <div className="sticky top-0 z-30 bg-white px-3 py-2.5 flex justify-between items-center border-b">
        <h1 className="text-[22px] font-black">ChitPix ▼</h1>
        <div className="flex gap-3 items-center">
          <button onClick={async()=>{setRefreshing(true); const {data}=await supabase.from('posts').select('*').order('created_at',{ascending:false}); if(data?.length)setPosts(data); setRefreshing(false)}} className={`${refreshing?'animate-spin':''}`}>↻</button>
          <button>🤍</button>
          {/* ✅ DM BUTTON - DIRECT GALLERY OPEN! */}
          <button onClick={()=>galleryRef.current?.click()} className="bg-black text-white px-3 py-1 rounded-full text-[12px] font-bold">+ POST</button>
        </div>
      </div>

      <div className="px-3 py-2"><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="🔍 Search blouse design, ID, ₹350..." className="w-full bg-zinc-100 rounded-full px-4 py-2 text-[13px]" /></div>

      {/* HIDDEN GALLERY INPUT - DM BUTTON DIRECT OPEN */}
      <input ref={galleryRef} type="file" accept="image/*,video/*" hidden onChange={e=>{ if(e.target.files?.[0]){ setUploadFile(e.target.files[0]); setShowCreate(true) }}} />

      {showCreate && (
        <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[380px] rounded-2xl p-4">
            <div className="flex justify-between mb-3"><h3 className="font-bold">Create R2 Post</h3><button onClick={()=>setShowCreate(false)}>✕</button></div>
            <div onClick={()=>galleryRef.current?.click()} className="w-full aspect-[4/3] bg-zinc-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden">
              {uploadFile ? <img src={URL.createObjectURL(uploadFile)} className="w-full h-full object-cover" alt="" /> : <div className="text-center"><p className="text-[30px]">📸</p><p className="text-[12px] text-zinc-400">Tap to select - Gallery Direct</p></div>}
            </div>
            <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption" className="w-full border rounded-xl px-3 py-2.5 mt-3 text-[13px]" />
            <div className="flex gap-2 mt-2"><span className="py-2.5 px-3 bg-zinc-100 rounded-xl">₹</span><input value={price} onChange={e=>setPrice(e.target.value)} className="flex-1 border rounded-xl px-3 py-2.5 text-[13px]" /></div>
            <button onClick={handleUpload} disabled={!uploadFile || uploading} className="w-full bg-black text-white py-3 rounded-xl mt-3 font-bold disabled:opacity-50">{uploading ? "Uploading R2..." : "Share - Beat Instagram 🚀"}</button>
          </div>
        </div>
      )}

      <Stories />

      <div className="flex-1">
        {filtered.map((post:any,i:number)=><PostCard key={post.id||i} post={post} index={i} galleryRef={galleryRef} />)}
      </div>

      <BottomNav active="home" avatar="" />
    </div>
  )
}
