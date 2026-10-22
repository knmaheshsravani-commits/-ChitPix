"use client"
import { useState, useEffect, useRef } from 'react'

const R2_URL = "https://pub-62904f82f9ea4d4ebf8da628304e5e65.r2.dev"

async function uploadToR2(file: File, folder: string) {
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
  const res = await fetch("/api/r2-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, fileType: file.type }),
  })
  if (!res.ok) throw new Error("presign failed")
  const { url } = await res.json()
  await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
  return `${R2_URL}/${fileName}`
}

// --- NEW CHITPIX ICONS - NOT INSTAGRAM ---
const Icon = {
  Home: (a:any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a.active?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M12 2.5L2 12.5V21h7v-6h6v6h7v-8.5L12 2.5z"/></svg>,
  Search: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="5"/><path d="M16 16l4 4"/></svg>,
  Add: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>,
  Heart: (a:any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a.filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M12 20s-6-4-6-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5-6 9-6 9z"/></svg>,
  User: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>,
  Bookmark: (a:any) => <svg width="20" height="20" viewBox="0 0 24 24" fill={a.filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/></svg>,
  Comment: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.1-5.3A8.5 8.5 0 0 1 21 11.5z"/></svg>,
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Dots: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="19.5" cy="12" r="1.5"/><circle cx="4.5" cy="12" r="1.5"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v13M8 13l4 4 4-4M3 21h18"/></svg>,
}

type Post = { id:string; imageUrl:string; likes:number; liked:boolean; saved:boolean; caption:string; comments:string[]; time:string }

export default function HomePage() {
  const [uploading, setUploading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([
    { id:'1', imageUrl:'https://picsum.photos/400/500?1', likes:124, liked:false, saved:false, caption:'ChitPix on R2 🔥', comments:['Super bro!'], time:'2h' },
    { id:'2', imageUrl:'https://picsum.photos/400/500?2', likes:89, liked:false, saved:false, caption:'Blue vibes only', comments:[], time:'5h' },
    { id:'3', imageUrl:'https://picsum.photos/400/500?3', likes:210, liked:false, saved:false, caption:'R2 storage live', comments:['Nice'], time:'1d' },
    { id:'4', imageUrl:'https://picsum.photos/400/500?4', likes:56, liked:false, saved:false, caption:'New icons', comments:[], time:'1d' },
    { id:'5', imageUrl:'https://picsum.photos/400/500?5', likes:340, liked:false, saved:false, caption:'450 lines', comments:[], time:'2d' },
    { id:'6', imageUrl:'https://picsum.photos/400/500?6', likes:12, liked:false, saved:false, caption:'Working on time', comments:[], time:'2d' },
  ])
  const [stories, setStories] = useState<any[]>([
    { id:'s1', imageUrl:'https://picsum.photos/100/100?10', seen:false },
    { id:'s2', imageUrl:'https://picsum.photos/100/100?11', seen:false },
  ])
  const [activeStory, setActiveStory] = useState<any>(null)
  const [activePost, setActivePost] = useState<Post|null>(null)
  const [showComments, setShowComments] = useState<string|null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showOptions, setShowOptions] = useState<string|null>(null)
  const [commentText, setCommentText] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [viewMode, setViewMode] = useState<'feed'|'grid'>('feed')
  const [heartAnim, setHeartAnim] = useState<string|null>(null)
  const filePostRef = useRef<HTMLInputElement>(null)
  const fileStoryRef = useRef<HTMLInputElement>(null)

  // 1. FETCH
  useEffect(()=>{
    fetch('/api/posts').then(r=>r.json()).then(d=>{
      if(d.posts?.length){
        const mapped = d.posts.map((p:any)=>({id:Date.now()+Math.random()+'',imageUrl:p.imageUrl,likes:0,liked:false,saved:false,caption:p.caption||'R2 Pix',comments:[],time:'now'}))
        setPosts(prev=>[...mapped,...prev])
      }
    }).catch(()=>{})
  },[])

  // 2. LIKE - WORKING ON TIME
  const toggleLike = (id:string) => {
    setPosts(ps=>ps.map(p=> p.id===id ? {...p, liked:!p.liked, likes: p.liked ? p.likes-1 : p.likes+1} : p))
    if(activePost?.id===id) setActivePost(a=> a ? {...a, liked:!a.liked, likes: a.liked? a.likes-1 : a.likes+1} : null)
  }
  // 3. DOUBLE TAP LIKE
  const doubleTap = (id:string) => {
    const p = posts.find(x=>x.id===id); if(p && !p.liked) toggleLike(id)
    setHeartAnim(id); setTimeout(()=>setHeartAnim(null),800)
  }
  // 4. SAVE
  const toggleSave = (id:string) => {
    setPosts(ps=>ps.map(p=> p.id===id ? {...p, saved:!p.saved} : p))
  }
  // 5. COMMENT ADD
  const addComment = (id:string) => {
    if(!commentText.trim()) return
    setPosts(ps=>ps.map(p=> p.id===id ? {...p, comments:[...p.comments, commentText]} : p))
    setCommentText('')
  }
  // 6. DELETE POST
  const deletePost = (id:string) => {
    setPosts(ps=>ps.filter(p=>p.id!==id)); setShowOptions(null); setActivePost(null)
  }
  // 7. DOWNLOAD
  const downloadPost = async (url:string) => {
    const a=document.createElement('a'); a.href=url; a.download='chitpix.jpg'; a.click()
  }
  // 8. SHARE
  const sharePost = async (url:string) => {
    if(navigator.share){ await navigator.share({title:'ChitPix', url}) } else { await navigator.clipboard.writeText(url); alert('Link copied! Working!') }
  }
  // 9. UPLOAD R2
  const handleUpload = async (e:any, folder:'posts'|'stories') => {
    const file=e.target.files?.[0]; if(!file) return; setUploading(true)
    try {
      const url = await uploadToR2(file, folder)
      if(folder==='stories') setStories(s=>[{id:Date.now()+'', imageUrl:url, seen:false}, ...s])
      else setPosts(p=>[{id:Date.now()+'', imageUrl:url, likes:0, liked:false, saved:false, caption:'New R2 Pix', comments:[], time:'now'}, ...p])
      await fetch('/api/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageUrl:url, type:folder})})
    } catch(err){console.error(err)}; setUploading(false)
  }

  const filtered = posts.filter(p=> p.caption.toLowerCase().includes(searchQ.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#080b14] text-white max-w-[430px] mx-auto relative pb-28 select-none">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#080b14]/90 backdrop-blur-xl p-4 flex justify-between items-center border-b border-blue-500/10">
        <h1 className="text-[26px] font-black tracking-tight">Chit<span className="text-blue-500">Pix</span></h1>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
          <button onClick={()=>setViewMode(viewMode==='feed'?'grid':'feed')} className="text-[11px] px-2 py-1 bg-white/10 rounded-full">{viewMode}</button>
        </div>
      </header>

      {uploading && <div className="mx-4 mt-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-400 animate-pulse">Uploading to R2...</div>}

      {/* STORIES */}
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
        <label className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
          <div className="w-[62px] h-[62px] rounded-full bg-[#121725] border-2 border-dashed border-blue-500/50 flex items-center justify-center"><Icon.Add/></div>
          <span className="text-[10px] text-white/60">Add</span>
          <input ref={fileStoryRef} type="file" hidden accept="image/*" onChange={(e)=>handleUpload(e,'stories')} />
        </label>
        {stories.map((s:any)=>(
          <div key={s.id} onClick={()=>{setActiveStory(s); setStories(st=>st.map(x=>x.id===s.id?{...x,seen:true}:x))}} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
            <div className={`w-[62px] h-[62px] rounded-full p-[2px] ${s.seen?'bg-white/20':'bg-gradient-to-tr from-blue-500 to-cyan-400'}`}>
              <img src={s.imageUrl} className="w-full h-full rounded-full object-cover border-2 border-[#080b14]" alt="story"/>
            </div>
            <span className="text-[10px] text-white/60">User</span>
          </div>
        ))}
      </div>

      {/* FEED / GRID */}
      {viewMode==='feed' ? (
        <div className="flex flex-col gap-6 p-2">
          {filtered.map((post)=>(
            <div key={post.id} className="bg-[#121725] rounded-[20px] overflow-hidden border border-white/5 relative">
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2"><img src={post.imageUrl} className="w-8 h-8 rounded-full object-cover"/><span className="text-sm font-semibold">chitpix_user</span><span className="text-[11px] text-white/40">• {post.time}</span></div>
                <button onClick={()=>setShowOptions(showOptions===post.id?null:post.id)}><Icon.Dots/></button>
              </div>
              {showOptions===post.id && (
                <div className="absolute right-3 top-12 bg-[#1c2235] rounded-xl p-2 z-10 flex flex-col gap-1 border border-white/10 w-40">
                  <button onClick={()=>sharePost(post.imageUrl)} className="text-left text-sm p-2 hover:bg-white/10 rounded-lg">Share</button>
                  <button onClick={()=>downloadPost(post.imageUrl)} className="text-left text-sm p-2 hover:bg-white/10 rounded-lg">Download</button>
                  <button onClick={()=>deletePost(post.id)} className="text-left text-sm p-2 hover:bg-white/10 rounded-lg text-red-400">Delete</button>
                </div>
              )}
              <div className="relative" onDoubleClick={()=>doubleTap(post.id)}>
                <img src={post.imageUrl} alt="post" className="w-full aspect-[4/5] object-cover"/>
                {heartAnim===post.id && <div className="absolute inset-0 flex items-center justify-center animate-[ping_0.8s]"><Icon.Heart filled={true}/></div>}
              </div>
              <div className="p-3 flex justify-between">
                <div className="flex gap-4">
                  <button onClick={()=>toggleLike(post.id)} className={post.liked?'text-red-500':''}><Icon.Heart filled={post.liked}/></button>
                  <button onClick={()=>setShowComments(post.id)}><Icon.Comment/></button>
                  <button onClick={()=>sharePost(post.imageUrl)}><Icon.Send/></button>
                </div>
                <button onClick={()=>toggleSave(post.id)} className={post.saved?'text-blue-500':''}><Icon.Bookmark filled={post.saved}/></button>
              </div>
              <div className="px-3 pb-3">
                <p className="text-sm font-semibold">{post.likes} likes</p>
                <p className="text-sm"><span className="font-semibold">chitpix</span> {post.caption}</p>
                <button onClick={()=>setShowComments(post.id)} className="text-[12px] text-white/40">View {post.comments.length} comments</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-2">
          {filtered.map((post)=>(
            <div key={post.id} onClick={()=>setActivePost(post)} className="h-32 bg-white/5 rounded-xl overflow-hidden relative cursor-pointer">
              <img src={post.imageUrl} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition"/>
            </div>
          ))}
        </div>
      )}

      {/* COMMENTS DRAWER - WORKING */}
      {showComments && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-[#121725] w-full max-w-[430px] rounded-t-[24px] max-h-[70vh] flex flex-col border-t border-blue-500/20">
            <div className="p-4 flex justify-between border-b border-white/10"><span className="font-semibold">Comments</span><button onClick={()=>setShowComments(null)}><Icon.Close/></button></div>
            <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
              {posts.find(p=>p.id===showComments)?.comments.map((c,i)=><div key={i} className="text-sm"><span className="font-semibold">user: </span>{c}</div>)}
            </div>
            <div className="p-3 flex gap-2 border-t border-white/10"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none"/><button onClick={()=>addComment(showComments)} className="bg-blue-500 px-4 py-2 rounded-full text-sm">Post</button></div>
          </div>
        </div>
      )}

      {/* FULLSCREEN - WORKING */}
      {activePost && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="p-4 flex justify-between"><button onClick={()=>setActivePost(null)}><Icon.Close/></button><div className="flex gap-3"><button onClick={()=>downloadPost(activePost.imageUrl)}><Icon.Download/></button><button onClick={()=>sharePost(activePost.imageUrl)}><Icon.Send/></button></div></div>
          <img src={activePost.imageUrl} className="flex-1 object-contain"/>
        </div>
      )}

      {/* STORY VIEWER - WORKING */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="p-4 flex justify-between"><span>Story</span><button onClick={()=>setActiveStory(null)}><Icon.Close/></button></div>
          <img src={activeStory.imageUrl} className="flex-1 object-contain"/>
          <div className="p-4 flex gap-2"><input placeholder="Reply..." className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm"/><button className="text-blue-500"><Icon.Send/></button></div>
        </div>
      )}

      {/* SEARCH - WORKING ON TIME */}
      {showSearch && (
        <div className="fixed inset-0 z-40 bg-[#080b14] p-4">
          <div className="flex gap-2"><input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search caption..." className="flex-1 bg-white/10 rounded-full px-4 py-3 text-sm"/><button onClick={()=>setShowSearch(false)} className="px-4 py-2 bg-white/10 rounded-full">Close</button></div>
          <div className="mt-4 text-sm text-white/50">{filtered.length} results working on time</div>
        </div>
      )}

      {/* NOTIFICATIONS - WORKING */}
      {showNotif && (
        <div className="fixed inset-0 z-40 bg-[#080b14] p-4">
          <div className="flex justify-between mb-4"><h2 className="font-bold">Notifications - Working</h2><button onClick={()=>setShowNotif(false)}><Icon.Close/></button></div>
          <div className="flex flex-col gap-3">{posts.slice(0,5).map(p=><div key={p.id} className="bg-[#121725] p-3 rounded-xl flex gap-2 items-center"><img src={p.imageUrl} className="w-10 h-10 rounded-full"/><span className="text-sm">Liked your pix</span><span className="ml-auto text-xs text-white/40">{p.time}</span></div>)}</div>
        </div>
      )}

      {/* PROFILE - WORKING */}
      {showProfile && (
        <div className="fixed inset-0 z-40 bg-[#080b14] p-4">
          <div className="flex justify-between mb-6"><h2 className="font-bold">Profile - Working</h2><button onClick={()=>setShowProfile(false)}><Icon.Close/></button></div>
          <div className="flex flex-col items-center gap-3"><div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-black">C</div><p className="font-bold">ChitPix User</p><p className="text-sm text-white/50">R2 Bucket Connected</p><div className="flex gap-6 mt-4"><div className="text-center"><p className="font-bold">{posts.length}</p><p className="text-xs text-white/40">Posts</p></div><div className="text-center"><p className="font-bold">{stories.length}</p><p className="text-xs text-white/40">Stories</p></div><div className="text-center"><p className="font-bold">1.2k</p><p className="text-xs text-white/40">Followers</p></div></div></div>
        </div>
      )}

      {/* BOTTOM NAV - ALL WORKING ON TIME */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] h-[64px] bg-[#121725]/90 backdrop-blur-2xl rounded-full border border-blue-500/20 flex items-center justify-around shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.15)] z-30">
        <button onClick={()=>{window.scrollTo({top:0,behavior:'smooth'})}} className="text-blue-500"><Icon.Home active={true}/></button>
        <button onClick={()=>setShowSearch(true)} className="text-white/60 hover:text-white"><Icon.Search/></button>
        <label className="w-[48px] h-[48px] bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#3b82f6] cursor-pointer hover:scale-105 transition">
          <Icon.Add/>
          <input ref={filePostRef} type="file" accept="image/*" hidden onChange={(e)=>handleUpload(e,'posts')} />
        </label>
        <button onClick={()=>setShowNotif(true)} className="text-white/60 hover:text-white relative"><Icon.Heart/><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
        <button onClick={()=>setShowProfile(true)} className="text-white/60 hover:text-white"><Icon.User/></button>
      </nav>
    </div>
  )
                                              }
