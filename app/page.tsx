"use client"
import { useState, useEffect, useRef } from 'react'
import BottomNav from './components/BottomNav'
import Stories from './components/Stories'

const R2_PUBLIC = "https://pub-62904f82f9ea4d4ebf8da6283b4e5cf9b2f55.r2.dev"
const WA = "916363373372"

function fixR2Url(p:any){
  let url = p.image_url || p.url || p.image || p.key || ""
  if(!url) return ""
  if(url.includes("r2.dev")) return url
  if(url.includes("posts/")){
    const last = url.split("posts/").pop()
    return `${R2_PUBLIC}/posts/${last}`
  }
  const file = url.split("/").pop() || ""
  return `${R2_PUBLIC}/posts/${file}`
}

function PostCard({ post, index }: { post:any, index:number }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likes, setLikes] = useState(Number(post.likes_count || 15+index*2))
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [followed, setFollowed] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [heart, setHeart] = useState(false)
  const [comments, setComments] = useState<any[]>([
    { user:"priya_kadur", text:"Super design bro! ❤️ Rate?", time:"2m", likes:2 },
    { user:"abhicharli", text:"Kadur delivery unda?", time:"1h", likes:1 },
    { user:"sneha_design", text:"Backside work superb 👌", time:"3h", likes:5 },
  ])

  const r2Url = fixR2Url(post)
  const displayUrl = r2Url || `https://picsum.photos/400/500?random=${post.id}`
  const price = 350 + index*10
  const caption = post.caption || `Backside Maggam Work #${post.id} ₹${price} - DM for Order - Kadur`

  const handleDoubleTap = () => {
    if(!liked){ setLiked(true); setLikes(likes+1); setHeart(true); setTimeout(()=>setHeart(false),800); if(navigator.vibrate) navigator.vibrate(30) }
  }
  const handleLike = () => {
    const nl = !liked; setLiked(nl); setLikes(nl?likes+1:likes-1)
    if(nl){ setHeart(true); setTimeout(()=>setHeart(false),800) }
    if(navigator.vibrate) navigator.vibrate(20)
  }
  const handleComment = () => { if(!commentText.trim()) return; setComments([{user:"mahesh_tailor", text:commentText, time:"now", likes:0}, ...comments]); setCommentText("") }
  const handleShare = () => { const t=`ChitPix 🔥 ${caption} ${r2Url}`; window.open(`https://wa.me/?text=${encodeURIComponent(t)}`,"_blank"); setShowShare(false) }
  const handleSave = () => { const ns=!saved; setSaved(ns); try{ const s=JSON.parse(localStorage.getItem('chitpix_saved')||'[]'); localStorage.setItem('chitpix_saved', JSON.stringify(ns?[...s,post.id]:s.filter((x:any)=>x!==post.id))) }catch{} }
  const handleDM = () => { const m=`Hi Mahesh Tailor 👋 ChitPix design nachindi ID:${post.id} ${r2Url} ${caption}`; window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`,"_blank") }
  const handleCopy = async () => { try{ await navigator.clipboard.writeText(r2Url); alert("Copied ✅ "+r2Url) }catch{ alert(r2Url) } }

  return (
    <div className="border-b-[6px] border-zinc-100 bg-white">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={`https://i.pravatar.cc/100?img=${(post.id%70)+1}`} className="w-full h-full rounded-full border-2 border-white" alt="" /></div>
          <div className="leading-[1.15]"><p className="text-[13px] font-bold flex gap-1">{post.username||`designer_${index+1}`} <span className="bg-blue-500 text-white rounded-full w-3 h-3 text-[8px] flex items-center justify-center">✓</span></p><p className="text-[11px] text-zinc-500">📍 Kadur • {index+1}h ago • R2</p></div>
        </div>
        <div className="flex gap-2 items-center"><button onClick={()=>setFollowed(!followed)} className={`text-[12px] font-bold ${followed?'text-zinc-400':'text-blue-500'}`}>{followed?'Following':'Follow'}</button><button onClick={()=>setShowMore(!showMore)} className="px-2 font-bold">...</button></div>
      </div>
      {showMore && <div className="mx-3 mb-2 bg-zinc-50 rounded-xl p-2 text-[12px]"><button className="block w-full text-left py-1">Report</button><button onClick={()=>setShowMore(false)} className="block w-full text-left py-1 text-red-500">Close</button></div>}
      <div className="relative bg-zinc-100 w-full aspect-[4/5] overflow-hidden" onDoubleClick={handleDoubleTap}>
        <img src={displayUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-2 left-2 flex gap-1"><span className="bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full">R2 HD</span><span className="bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-full">₹{price}</span></div>
        {heart && <div className="absolute inset-0 flex items-center justify-center"><span className="text-[80px]">❤️</span></div>}
      </div>
      <div className="flex justify-between px-3 pt-3"><div className="flex gap-4 text-[22px]"><button onClick={handleLike} className={`${liked?'scale-110':''}`}>{liked?'❤️':'🤍'}</button><button onClick={()=>setShowComments(true)}>💬</button><button onClick={()=>setShowShare(true)}>✈️</button></div><div className="flex gap-4 text-[22px]"><button onClick={handleSave}>{saved?'🔖':'📑'}</button><button onClick={handleDM} className="bg-black text-white text-[11px] px-4 py-1.5 rounded-full font-black">DM</button></div></div>
      <div className="px-3 py-2 text-[13px]"><p onClick={()=>setShowLikes(true)} className="font-bold cursor-pointer">{likes} likes</p><p><b>{post.username||'mahesh_tailor'}</b> {caption} <span className="text-blue-500">#Kadur #Blouse</span></p><button onClick={()=>setShowComments(true)} className="text-zinc-400 text-[12px]">View all {comments.length} comments</button></div>
      {showComments && <div className="fixed inset-0 z-[200] bg-black/50 flex items-end" onClick={()=>setShowComments(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl max-h-[75vh] flex flex-col" onClick={e=>e.stopPropagation()}><div className="p-3 border-b flex justify-between"><b>Comments {comments.length}</b><button onClick={()=>setShowComments(false)}>X</button></div><div className="flex-1 overflow-auto p-3 space-y-2">{comments.map((c,i)=><div key={i} className="text-[13px]"><b>{c.user}</b> {c.text} <span className="text-zinc-400 text-[11px]">{c.time}</span></div>)}</div><div className="p-3 border-t flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-[13px]" /><button onClick={handleComment} className="text-blue-500 font-bold">Post</button></div></div></div>}
      {showShare && <div className="fixed inset-0 z-[200] bg-black/50 flex items-end" onClick={()=>setShowShare(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-4" onClick={e=>e.stopPropagation()}><div className="grid grid-cols-4 gap-4 text-center"><button onClick={handleShare} className="flex flex-col items-center"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">W</div><span className="text-[11px]">WhatsApp</span></button><button onClick={handleCopy} className="flex flex-col items-center"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">🔗</div><span className="text-[11px]">Copy</span></button></div></div></div>}
      {showLikes && <div className="fixed inset-0 z-[200] bg-black/50 flex items-end" onClick={()=>setShowLikes(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-4" onClick={e=>e.stopPropagation()}><b>{likes} Likes - R2 Post {post.id}</b><div className="mt-3 space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="flex gap-2 items-center"><img src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-8 h-8 rounded-full" alt="" /><span className="text-[13px]">user_{i}</span></div>)}</div></div></div>}
    </div>
  )
          }
export default function HomePage(){
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('home')
  const [showNotif, setShowNotif] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [uploadFile, setUploadFile] = useState<File|null>(null)
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("350")
  const [uploading, setUploading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const galleryRef = useRef<HTMLInputElement>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(()=>{
    fetch('/api/posts?limit=100', {cache:"no-store"})
      .then(r=>r.json())
      .then(d=>{
        const raw = d.posts || d || []
        const fixed = raw.map((p:any)=>({...p, image_url: fixR2Url(p)}))
        setPosts(fixed)
      }).catch(()=>{})
  },[])

  const handleRefresh = async () => {
    setRefreshing(true)
    try{
      const res = await fetch('/api/posts?limit=100', {cache:"no-store"})
      const d = await res.json()
      const raw = d.posts || d || []
      setPosts(raw.map((p:any)=>({...p, image_url: fixR2Url(p)})))
    }catch{}
    setRefreshing(false)
  }

  const handleUpload = async () => {
    if(!uploadFile) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', uploadFile)
    fd.append('caption', `${caption} ₹${price}`)
    fd.append('price', price)
    try{
      const res = await fetch('/api/upload', { method:'POST', body: fd })
      const data = await res.json()
      const url = data.url || data.r2Url || URL.createObjectURL(uploadFile)
      const newPost = { id: Date.now(), image_url: url, caption: `${caption} ₹${price}`, price, username: "mahesh_tailor", likes_count: 0 }
      setPosts([newPost, ...posts])
      setShowCreate(false)
      setUploadFile(null)
      setCaption("")
      setPrice("350")
      alert("Posted to R2 ✅")
    }catch(e){ alert("Upload failed - check /api/upload") }
    setUploading(false)
  }

  const filtered = posts.filter((p:any)=> {
    if(!searchText) return true
    const c = (p.caption || "").toLowerCase()
    return c.includes(searchText.toLowerCase()) || String(p.id).includes(searchText)
  })

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[70px] flex flex-col">
      <div className="sticky top-0 z-30 bg-white px-3 py-2.5 flex justify-between items-center border-b border-zinc-100">
        <button onClick={()=>setShowCreate(true)} className="w-8 h-8 border-2 border-black rounded-lg flex items-center justify-center font-bold">+</button>
        <div className="flex items-center gap-1">
          <h1 className="text-[22px] font-black tracking-tight">ChitPix</h1>
          <span className="text-[12px]">▼</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className={`text-[18px] ${refreshing?'animate-spin':''}`}>↻</button>
          <button onClick={()=>setShowNotif(true)} className="relative text-[22px]">🤍<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span></button>
          <button onClick={()=>setShowCreate(true)} className="text-[22px]">✉️</button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-zinc-50">
        <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="🔍 Search blouse design, ID, ₹350..." className="w-full bg-zinc-100 rounded-full px-4 py-2 text-[13px]" />
      </div>

      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={e=>{ if(e.target.files?.[0]){ setUploadFile(e.target.files[0]); setShowCreate(true) }}} />

      {showCreate && (
        <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4" onClick={()=>setShowCreate(false)}>
          <div className="bg-white w-full max-w-[380px] rounded-2xl p-4" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-[16px]">Create Post • R2 Upload</h3><button onClick={()=>setShowCreate(false)} className="w-7 h-7 bg-zinc-100 rounded-full">✕</button></div>
            <div onClick={()=>galleryRef.current?.click()} className="w-full aspect-[4/3] bg-zinc-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden">
              {uploadFile ? <img src={URL.createObjectURL(uploadFile)} className="w-full h-full object-cover" alt="" /> : <div className="text-center"><p className="text-[30px]">📸</p><p className="text-zinc-400 text-[12px] mt-1">Tap to select from Gallery</p><p className="text-zinc-400 text-[10px]">R2 HD Upload</p></div>}
            </div>
            <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption - Eg: Backside Maggam Work" className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 mt-3 text-[13px]" />
            <div className="flex gap-2 mt-2"><span className="py-2.5 px-3 bg-zinc-100 rounded-xl text-[13px]">₹</span><input value={price} onChange={e=>setPrice(e.target.value)} placeholder="350" className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-[13px]" /></div>
            <button onClick={handleUpload} disabled={!uploadFile || uploading} className="w-full bg
