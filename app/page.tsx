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
  let url = typeof p === "string" ? p : (p.image_url || p.r2_url || p.url || "")
  if(!url) return ""
  return String(url).trim()
}
const uploadToR2 = async (file: File) => {
  const r = await fetch("/api/r2-presign", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ fileName:`posts/${Date.now()}_${file.name}`, contentType:file.type }) })
  const { url, publicUrl, key } = await r.json()
  if(!url) throw new Error("Presign failed")
  await fetch(url, { method:"PUT", body:file, headers:{"Content-Type":file.type} })
  return publicUrl || `${R2_PUBLIC}/${key}`
}
const DEMO_POSTS = [
  {id:1, image_url:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500", caption:"Backside Maggam Work ₹350", username:"mahesh_tailor", price:"350", likes_count:128, location:"Kadur"},
  {id:2, image_url:"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500", caption:"Bridal Aari Work ₹450", username:"priya_kadur", price:"450", likes_count:89, location:"Chikmagalur"},
  {id:3, image_url:"https://images.unsplash.com/photo-1609354825940-3b06ab2eaa2c?w=500", caption:"Simple Design ₹300", username:"sneha_design", price:"300", likes_count:234, location:"Kadur"},
]

function PostCard({ post, index, galleryRef }: { post:any, index:number, galleryRef:any }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [likes, setLikes] = useState(Number(post.likes_count || 15+index*3))
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [heart, setHeart] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([
    { user:"priya_kadur", text:"Super design bro! ❤️", time:"2m", likes:2 },
    { user:"abhicharli", text:"Kadur delivery unda?", time:"1h", likes:1 },
    { user:"sneha_design", text:"Backside superb 👌 Price?", time:"3h", likes:5 },
  ])
  const r2Url = fixR2Url(post)
  const displayUrl = r2Url || post.image_url
  const price = post.price || 350
  const caption = post.caption || `Design #${post.id}`

  const handleLike = () => {
    const nl = !liked; setLiked(nl); setLikes(nl?likes+1:likes-1)
    if(nl){ setHeart(true); setTimeout(()=>setHeart(false),800) }
    if(navigator.vibrate) navigator.vibrate(20)
  }
  const handleComment = () => {
    if(!commentText.trim()) return
    setComments([{user:"mahesh_tailor", text:commentText, time:"now", likes:0}, ...comments])
    setCommentText("")
  }
  const handleDM = () => {
    const m=`Hi Mahesh Tailor 👋 ChitPix ID:${post.id} ${displayUrl} ${caption} ₹${price}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`,"_blank")
  }
  const handleShare = () => {
    const t=`ChitPix 🔥 ${caption} ₹${price} ${displayUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`,"_blank")
    setShowShare(false)
  }

  return (
    <div className="border-b-[8px] border-zinc-100 bg-white">
      {/* ✅ PROFILE + FOLLOW BUTTON */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600">
            <img src={`https://i.pravatar.cc/100?img=${(post.id%70)+1}`} className="w-full h-full rounded-full border-2 border-white" alt="" />
          </div>
          <div className="leading-[1.15]">
            <p className="text-[13px] font-bold flex items-center gap-1">{post.username} <span className="bg-blue-500 text-white rounded-full w-3.5 h-3.5 text-[9px] flex items-center justify-center">✓</span></p>
            <p className="text-[11px] text-zinc-500">📍 {post.location || "Kadur"} • {index+1}h ago • R2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setFollowed(!followed)} className={`text-[12px] font-bold px-3 py-1 rounded-full ${followed?'bg-zinc-100 text-zinc-600':'bg-blue-50 text-blue-600'}`}>{followed?'Following':'Follow'}</button>
          <button onClick={()=>setShowMore(!showMore)} className="font-bold px-2">⋯</button>
        </div>
      </div>
      {showMore && <div className="mx-3 mb-2 bg-zinc-50 rounded-xl p-3 text-[12px] space-y-2"><button className="block w-full text-left">⭐ Add to Favorites</button><button className="block w-full text-left">🙈 Hide</button><button className="block w-full text-left text-red-500">🚩 Report</button><button onClick={()=>setShowMore(false)} className="block w-full text-left text-zinc-400">Close</button></div>}

      {/* POST IMAGE - Double tap like */}
      <div className="relative bg-zinc-100 w-full aspect-[4/5] overflow-hidden" onDoubleClick={handleLike}>
        <img src={displayUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex gap-1"><span className="bg-black/70 text-white text-[9px] px-2 py-1 rounded-full">R2 HD</span><span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">₹{price}</span></div>
        {heart && <div className="absolute inset-0 flex items-center justify-center text-[90px] animate-ping">❤️</div>}
      </div>

      {/* ✅ 5 ICONS - Instagram Beat */}
      <div className="flex justify-between px-3 pt-3">
        <div className="flex gap-4 text-[22px]">
          <button onClick={handleLike} className={`transition ${liked?'scale-125':''}`}>{liked?'❤️':'🤍'}</button>
          <button onClick={()=>setShowComments(true)}>💬</button>
          <button onClick={()=>setShowShare(true)}>✈️</button>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={()=>setSaved(!saved)} className="text-[22px]">{saved?'🔖':'📑'}</button>
          <button onClick={handleDM} className="bg-black text-white text-[11px] px-4 py-1.5 rounded-full font-black">DM</button>
        </div>
      </div>

      {/* Likes + Caption */}
      <div className="px-3 py-2 text-[13px]">
        <p onClick={()=>setShowLikes(true)} className="font-bold cursor-pointer">{likes} likes</p>
        <p className="mt-1"><b>{post.username}</b> {caption} <span className="text-blue-600">#Kadur #Maggam #Blouse</span></p>
        <button onClick={()=>setShowComments(true)} className="text-zinc-400 text-[12px] mt-1">View all {comments.length} comments</button>
      </div>

      {/* ✅ COMMENT BOX - Direct under post */}
      <div className="px-3 pb-3 flex gap-2 items-center">
        <img src={`https://i.pravatar.cc/100?img=5`} className="w-6 h-6 rounded-full" alt="" />
        <div className="flex-1 bg-zinc-100 rounded-full px-3 py-1.5 flex">
          <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent text-[12px] outline-none" />
          <button onClick={handleComment} className="text-blue-500 font-bold text-[12px]">Post</button>
        </div>
      </div>

      {/* Popups */}
      {showComments && <div className="fixed inset-0 z-[200] bg-black/50 flex items-end" onClick={()=>setShowComments(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl max-h-[70vh] flex flex-col" onClick={e=>e.stopPropagation()}><div className="p-3 border-b flex justify-between"><b>💬 Comments {comments.length}</b><button onClick={()=>setShowComments(false)}>✕</button></div><div className="flex-1 overflow-auto p-3 space-y-3">{comments.map((c,i)=><div key={i} className="flex gap-2"><img src={`https://i.pravatar.cc/100?img=${i+12}`} className="w-7 h-7 rounded-full" alt="" /><div className="text-[13px]"><b>{c.user}</b> {c.text} <span className="text-zinc-400 text-[11px] ml-2">{c.time}</span></div></div>)}</div><div className="p-3 border-t flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-[13px]" /><button onClick={handleComment} className="text-blue-600 font-bold">Post</button></div></div></div>}
      {showShare && <div className="fixed inset-0 z-[200] bg-black/50 flex items-end" onClick={()=>setShowShare(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-5" onClick={e=>e.stopPropagation()}><p className="font-bold mb-4">Share</p><div className="grid grid-cols-4 gap-4 text-center"><button onClick={handleShare} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">W</div><span className="text-[11px]">WhatsApp</span></button><button className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">🔗</div><span className="text-[11px]">Copy Link</span></button></div></div></div>}
      {showLikes && <div className="fixed inset-0 z-[200] bg-black/50 flex items-end" onClick={()=>setShowLikes(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-4 max-h-[60vh] overflow-auto" onClick={e=>e.stopPropagation()}><b>{likes} Likes</b><div className="mt-3 space-y-3">{Array.from({length:6}).map((_,i)=><div key={i} className="flex justify-between items-center"><div className="flex gap-2 items-center"><img src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-8 h-8 rounded-full" alt="" /><span className="text-[13px] font-medium">user_{i+1}</span></div><button className="text-[12px] bg-black text-white px-3 py-1 rounded-full">Follow</button></div>)}</div></div></div>}
    </div>
  )
          }
export default function HomePage(){
  const [posts, setPosts] = useState<any[]>(DEMO_POSTS)
  const [uploadFile, setUploadFile] = useState<File|null>(null)
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("350")
  const [uploading, setUploading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [showNotif, setShowNotif] = useState(false)
  const [showDMList, setShowDMList] = useState(false)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(()=>{
    supabase.from('posts').select('*').order('created_at', { ascending:false }).limit(50).then(({data})=>{ if(data && data.length>0) setPosts(data) })
  },[])

  const handleUpload = async () => {
    if(!uploadFile) return
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if(!user){ alert("Login avvali"); setUploading(false); return }
      const r2Url = await uploadToR2(uploadFile)
      const { data } = await supabase.from('posts').insert({ user_id:user.id, image_url:r2Url, r2_url:r2Url, url:r2Url, caption:`${caption} ₹${price}`, price, username:user.email?.split('@')[0]||"mahesh_tailor" }).select().single()
      const newPost = { id:data?.id||Date.now(), image_url:r2Url, caption:`${caption} ₹${price}`, price, username:"You", likes_count:0 }
      setPosts([newPost, ...posts])
      setShowCreate(false); setUploadFile(null); setCaption(""); setPrice("350")
      alert("✅ Posted - Instagram Beat!")
    }catch(e:any){ alert(e.message) }
    setUploading(false)
  }
  const filtered = posts.filter(p=> !searchText || (p.caption||"").toLowerCase().includes(searchText.toLowerCase()) || String(p.price||"").includes(searchText))

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto relative pb-[70px] flex flex-col">
      {/* ✅ TOP BAR - NOTIFICATION + DM BUTTON */}
      <div className="sticky top-0 z-30 bg-white px-3 py-2.5 flex justify-between items-center border-b border-zinc-100">
        <h1 className="text-[22px] font-black tracking-tight">ChitPix ▼</h1>
        <div className="flex items-center gap-3">
          <button onClick={()=>setShowNotif(true)} className="relative text-[22px]">🤍<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span></button>
          <button onClick={()=>setShowDMList(true)} className="relative text-[22px]">✉️<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1 rounded-full">3</span></button>
          <button onClick={()=>galleryRef.current?.click()} className="bg-black text-white px-3 py-1.5 rounded-full text-[12px] font-bold">+ POST</button>
        </div>
      </div>

      {/* ✅ SEARCH BAR */}
      <div className="px-3 py-2 border-b border-zinc-50 sticky top-[48px] bg-white z-20">
        <div className="relative">
          <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="🔍 Search blouse, ID, ₹350, Kadur..." className="w-full bg-zinc-100 rounded-full px-4 py-2.5 pl-9 text-[13px] outline-none focus:bg-zinc-50 focus:ring-1 focus:ring-black" />
          <span className="absolute left-3 top-2.5 text-zinc-400">🔍</span>
          {searchText && <button onClick={()=>setSearchText("")} className="absolute right-3 top-2.5 text-zinc-400">✕</button>}
        </div>
      </div>

      <input ref={galleryRef} type="file" accept="image/*,video/*" hidden onChange={e=>{ if(e.target.files?.[0]){ setUploadFile(e.target.files[0]); setShowCreate(true) }}} />

      {showCreate && (
        <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[380px] rounded-2xl p-4">
            <div className="flex justify-between mb-3"><h3 className="font-bold">Create Post • R2</h3><button onClick={()=>setShowCreate(false)} className="w-7 h-7 bg-zinc-100 rounded-full">✕</button></div>
            <div onClick={()=>galleryRef.current?.click()} className="w-full aspect-[4/3] bg-zinc-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden">
              {uploadFile ? <img src={URL.createObjectURL(uploadFile)} className="w-full h-full object-cover" alt="" /> : <div className="text-center"><p className="text-[30px]">📸</p><p className="text-[12px] text-zinc-400">Tap - Gallery Direct Open</p></div>}
            </div>
            <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption - Backside Maggam Work" className="w-full border rounded-xl px-3 py-2.5 mt-3 text-[13px]" />
            <div className="flex gap-2 mt-2"><span className="py-2.5 px-3 bg-zinc-100 rounded-xl text-[13px]">₹</span><input value={price} onChange={e=>setPrice(e.target.value)} placeholder="350" className="flex-1 border rounded-xl px-3 py-2.5 text-[13px]" /></div>
            <button onClick={handleUpload} disabled={!uploadFile || uploading} className="w-full bg-black text-white py-3 rounded-xl mt-3 font-bold disabled:opacity-50">{uploading ? "Uploading R2..." : "Post to ChitPix 🚀"}</button>
          </div>
        </div>
      )}

      {/* ✅ STORIES */}
      <Stories />

      {/* FEED */}
      <div className="flex-1">
        {filtered.map((post:any,i:number)=><PostCard key={post.id||i} post={post} index={i} galleryRef={galleryRef} />)}
        {filtered.length===0 && <div className="p-10 text-center text-zinc-400 text-[13px]">No results for "{searchText}"</div>}
      </div>

      <BottomNav active="home" avatar="" />

      {/* ✅ NOTIFICATION POPUP */}
      {showNotif && <div className="fixed inset-0 z-[100] bg-black/50 flex items-end" onClick={()=>setShowNotif(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-4 max-h-[60vh] overflow-auto" onClick={e=>e.stopPropagation()}><div className="flex justify-between mb-3"><b>Notifications</b><button onClick={()=>setShowNotif(false)}>✕</button></div><div className="space-y-3"><div className="flex gap-2 items-center text-[13px]"><img src="https://i.pravatar.cc/100?img=15" className="w-8 h-8 rounded-full" alt="" /><p><b>priya_kadur</b> liked your post ❤️ 2m ago</p></div><div className="flex gap-2 items-center text-[13px]"><img src="https://i.pravatar.cc/100?img=20" className="w-8 h-8 rounded-full" alt="" /><p><b>abhicharli</b> commented "Rate?" 1h ago</p></div></div></div></div>}

      {/* ✅ DM LIST POPUP */}
      {showDMList && <div className="fixed inset-0 z-[100] bg-black/50 flex items-end" onClick={()=>setShowDMList(false)}><div className="bg-white w-full max-w-[480px] mx-auto rounded-t-2xl p-4 max-h-[70vh] overflow-auto" onClick={e=>e.stopPropagation()}><div className="flex justify-between mb-3"><b>Messages</b><button onClick={()=>setShowDMList(false)}>✕</button></div><div className="space-y-3">{[1,2,3].map(i=><div key={i} className="flex gap-3 items-center"><img src={`https://i.pravatar.cc/100?img=${10+i}`} className="w-10 h-10 rounded-full" alt="" /><div><p className="text-[13px] font-bold">customer_{i}</p><p className="text-[11px] text-zinc-500">Hi bro, blouse price? • 2h</p></div></div>)}</div></div></div>}
    </div>
  )
      }
