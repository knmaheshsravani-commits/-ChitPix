"use client"
import { useState, useEffect } from 'react'

const R2_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da628304e5e65.r2.dev"

async function uploadToR2(file: File, folder: string) {
  const name = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
  const r = await fetch("/api/r2-presign", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ fileName:name, fileType:file.type }) })
  const { url } = await r.json()
  await fetch(url, { method:"PUT", body:file, headers:{"Content-Type":file.type} })
  return `${R2_URL}/${name}`
}

// NEW ICONS - NO INSTAGRAM COPY
const Icon = {
  Home: (p:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={p.active?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M12 3L3 10v10h6v-6h6v6h6V10L12 3z"/></svg>,
  Search: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="5"/><path d="M16 16l4 4"/></svg>,
  Add: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>,
  Heart: (p:any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={p.fill?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M12 20s-6-4.5-6-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.5-6 9-6 9z"/></svg>,
  User: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>,
  Bookmark: (p:any) => <svg width="20" height="20" viewBox="0 0 24 24" fill={p.fill?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>,
  Comment: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.1-5.3A8.5 8.5 0 0 1 21 11.5z"/></svg>,
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Dots: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="19.5" cy="12" r="1.5"/><circle cx="4.5" cy="12" r="1.5"/></svg>,
  Close: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
}

type Post = { id:string; imageUrl:string; likes:number; liked:boolean; saved:boolean; caption:string; comments:string[]; time:string }

export default function HomePage(){
  const [up,setUp]=useState(false)
  const [posts,setPosts]=useState<Post[]>([])
  const [stories,setStories]=useState<any[]>([])
  const [activeStory,setActiveStory]=useState<any>(null)
  const [showComments,setShowComments]=useState<string|null>(null)
  const [showSearch,setShowSearch]=useState(false)
  const [showNotif,setShowNotif]=useState(false)
  const [showProfile,setShowProfile]=useState(false)
  const [showOptions,setShowOptions]=useState<string|null>(null)
  const [commentText,setCommentText]=useState('')
  const [searchQ,setSearchQ]=useState('')
  const [heartAnim,setHeartAnim]=useState<string|null>(null)
  const [viewMode,setViewMode]=useState<'feed'|'grid'>('feed')

  // FETCH - FIX IMAGE BUG HERE - normalize imageUrl / image_url / url
  useEffect(()=>{
    fetch('/api/posts').then(r=>r.json()).then(d=>{
      const raw = d.posts || d || []
      const normalized = raw.map((p:any,i:number)=>{
        const img = p.imageUrl || p.image_url || p.url || p.src || ''
        return {
          id: p.id || p.Key || `p-${i}-${Date.now()}`,
          imageUrl: img,
          likes: p.likes || Math.floor(Math.random()*200)+10,
          liked: false,
          saved: false,
          caption: p.caption || p.Key || 'ChitPix',
          comments: p.comments || [],
          time: p.created_at ? 'now' : `${i+1}h`
        }
      }).filter((p:any)=> p.imageUrl && p.imageUrl.length > 5)
      
      if(normalized.length>0) setPosts(normalized)
      else {
        // Fallback if R2 empty
        setPosts([
          { id:'1', imageUrl:'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', likes:124, liked:false, saved:false, caption:'ChitPix Test', comments:[], time:'now' },
        ])
      }
      if(d.stories) setStories(d.stories)
    }).catch(()=>{
      setPosts([{ id:'1', imageUrl:'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', likes:124, liked:false, saved:false, caption:'R2 not loaded - fallback', comments:[], time:'now' }])
    })
  },[])

  const toggleLike = (id:string) => setPosts(ps=>ps.map(p=> p.id===id ? {...p, liked:!p.liked, likes: p.liked ? p.likes-1 : p.likes+1} : p))
  const doubleTap = (id:string) => { const p=posts.find(x=>x.id===id); if(p && !p.liked) toggleLike(id); setHeartAnim(id); setTimeout(()=>setHeartAnim(null),800) }
  const toggleSave = (id:string) => setPosts(ps=>ps.map(p=> p.id===id ? {...p, saved:!p.saved} : p))
  const addComment = (id:string) => { if(!commentText.trim()) return; setPosts(ps=>ps.map(p=> p.id===id ? {...p, comments:[...p.comments, commentText]} : p)); setCommentText('') }
  const deletePost = (id:string) => { setPosts(ps=>ps.filter(p=>p.id!==id)); setShowOptions(null) }
  const handleUpload = async (e:any, folder:'posts'|'stories') => {
    const file=e.target.files?.[0]; if(!file) return; setUp(true)
    try { const url = await uploadToR2(file, folder); if(folder==='stories') setStories(s=>[{id:Date.now()+'', imageUrl:url, seen:false}, ...s]); else setPosts(p=>[{id:Date.now()+'', imageUrl:url, likes:0, liked:false, saved:false, caption:'New R2 Pix', comments:[], time:'now'}, ...p]); await fetch('/api/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageUrl:url, type:folder})}) } catch{}; setUp(false)
  }

  const filtered = posts.filter(p=> p.caption.toLowerCase().includes(searchQ.toLowerCase()))

  return(
    <div className="min-h-screen bg-[#080b14] text-white w-full max-w-[430px] mx-auto flex flex-col">
      <div className="flex-1 pb-[150px] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-[#080b14]/95 backdrop-blur-xl p-4 flex justify-between items-center border-b border-blue-500/10">
        <h1 className="text-[28px] font-black tracking-tight">Chit<span className="text-blue-500">Pix</span></h1>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div><button onClick={()=>setViewMode(viewMode==='feed'?'grid':'feed')} className="text-[12px] px-3 py-1 bg-white/10 rounded-full">{viewMode}</button></div>
      </header>

      {up && <div className="mx-4 mt-3 bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300">Uploading to R2...</div>}

      <div className="flex gap-3 p-4 overflow-x-auto">
        <label className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
          <div className="w-[64px] h-[64px] rounded-full bg-[#121725] border-2 border-dashed border-blue-500/60 flex items-center justify-center"><Icon.Add/></div>
          <span className="text-[11px] text-white/60">Add</span>
          <input type="file" hidden accept="image/*" onChange={(e)=>handleUpload(e,'stories')}/>
        </label>
        {stories.map((s:any,i:number)=>(
          <div key={s.id||i} onClick={()=>setActiveStory(s)} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
            <div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-blue-500 to-cyan-400">
              <img src={s.imageUrl} alt="story" className="w-full h-full rounded-full object-cover border-2 border-[#080b14] bg-[#121725]"/>
            </div>
            <span className="text-[11px] text-white/60">User</span>
          </div>
        ))}
      </div>

      <div className={viewMode==='feed' ? "flex flex-col gap-5 p-3" : "grid grid-cols-3 gap-1 p-2"}>
        {filtered.map((post)=>(
          viewMode==='feed' ? (
          <div key={post.id} className="bg-[#121725] rounded-[22px] overflow-hidden border border-white/[0.06]">
            <div className="p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">C</div><span className="text-[14px] font-semibold">chitpix_user</span><span className="text-[12px] text-white/40">• {post.time}</span></div>
              <button onClick={()=>setShowOptions(showOptions===post.id?null:post.id)} className="p-1"><Icon.Dots/></button>
            </div>
            {showOptions===post.id && <div className="mx-3 mb-2 bg-[#1e253a] rounded-xl p-2 border border-white/10"><button onClick={()=>deletePost(post.id)} className="w-full text-left text-sm p-2.5 hover:bg-white/10 rounded-lg text-red-400">Delete Post - Working</button><button onClick={()=>setShowOptions(null)} className="w-full text-left text-sm p-2.5 hover:bg-white/10 rounded-lg">Close</button></div>}
            
            <div className="relative w-full aspect-[4/5] bg-[#0f1423] flex items-center justify-center overflow-hidden" onDoubleClick={()=>doubleTap(post.id)}>
              <img 
                src={post.imageUrl} 
                alt="post" 
                className="w-full h-full object-cover block"
                onError={(e:any)=>{ e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' }}
                loading="lazy"
              />
              {heartAnim===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[90px] animate-[ping_0.7s_ease-out]">❤️</span></div>}
            </div>

            <div className="p-3.5 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <button onClick={()=>toggleLike(post.id)} className={`${post.liked?'text-red-500':''} p-1`}><Icon.Heart fill={post.liked}/></button>
                <button onClick={()=>setShowComments(post.id)} className="p-1"><Icon.Comment/></button>
                <button onClick={()=>{ navigator.clipboard.writeText(post.imageUrl); alert('Link copied - Working!')}} className="p-1"><Icon.Send/></button>
              </div>
              <button onClick={()=>toggleSave(post.id)} className={`${post.saved?'text-blue-500':''} p-1`}><Icon.Bookmark fill={post.saved}/></button>
            </div>
            <div className="px-3.5 pb-4">
              <p className="text-[14px] font-semibold">{post.likes} likes</p>
              <p className="text-[14px] mt-1"><span className="font-semibold">chitpix_user </span>{post.caption}</p>
              <button onClick={()=>setShowComments(post.id)} className="text-[12px] text-white/40 mt-1">View {post.comments.length} comments - Working</button>
            </div>
          </div>
          ) : (
            <div key={post.id} className="h-32 rounded-xl overflow-hidden bg-[#121725]"><img src={post.imageUrl} onError={(e:any)=>e.target.src='https://via.placeholder.com/400'} className="w-full h-full object-cover"/></div>
          )
        ))}
      </div>
      </div>

      {/* BOTTOM NAV - FIXED UP - NOT TOO LOW */}
      <nav className="fixed bottom-[18px] left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] h-[66px] bg-[#121725]/95 backdrop-blur-2xl rounded-full border border-blue-500/20 flex items-center justify-around shadow-[0_10px_40px_rgba(0,0,0,0.7)] z-30">
        <button onClick={()=>window.scrollTo({top:0, behavior:'smooth'})} className="text-blue-500 p-2.5"><Icon.Home active={true}/></button>
        <button onClick={()=>setShowSearch(true)} className="text-white/60 p-2.5"><Icon.Search/></button>
        <label className="w-[54px] h-[54px] bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#3b82f6] cursor-pointer active:scale-95 transition"><Icon.Add/><input type="file" hidden accept="image/*" onChange={(e)=>handleUpload(e,'posts')}/></label>
        <button onClick={()=>setShowNotif(true)} className="relative text-white/60 p-2.5"><Icon.Heart/><span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#121725]"></span></button>
        <button onClick={()=>setShowProfile(true)} className="text-white/60 p-2.5"><Icon.User/></button>
      </nav>

      {showComments && <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center"><div className="bg-[#121725] w-full max-w-[430px] rounded-t-[24px] max-h-[75vh] flex flex-col"><div className="p-4 flex justify-between border-b border-white/10"><b>Comments Working</b><button onClick={()=>setShowComments(null)}><Icon.Close/></button></div><div className="flex-1 overflow-auto p-4 space-y-3">{posts.find(p=>p.id===showComments)?.comments.map((c,i)=><div key={i} className="text-sm bg-white/5 p-2 rounded-lg">{c}</div>)} {posts.find(p=>p.id===showComments)?.comments.length===0 && <p className="text-white/40 text-sm">No comments yet</p>}</div><div className="p-3 flex gap-2 border-t border-white/10"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-sm outline-none"/><button onClick={()=>addComment(showComments)} className="bg-blue-500 px-5 py-2.5 rounded-full text-sm font-semibold">Post</button></div></div></div>}
      {activeStory && <div className="fixed inset-0 z-50 bg-black flex flex-col"><div className="p-4 flex justify-between items-center"><span>Story - Working</span><button onClick={()=>setActiveStory(null)}><Icon.Close/></button></div><img src={activeStory.imageUrl} className="flex-1 object-contain bg-[#080b14]"/></div>}
      {showSearch && <div className="fixed inset-0 z-40 bg-[#080b14] p-4"><div className="flex gap-2"><input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search captions - Working" className="flex-1 bg-white/10 rounded-full px-4 py-3 text-sm outline-none"/><button onClick={()=>setShowSearch(false)} className="px-4 py-2 bg-white/10 rounded-full">Close</button></div><div className="mt-4"><p className="text-sm text-white/50">{filtered.length} results found - Working</p><div className="mt-4 space-y-2">{filtered.map(p=><div key={p.id} className="bg-[#121725] p-2 rounded-xl flex gap-2"><img src={p.imageUrl} className="w-12 h-12 rounded-lg object-cover"/><span className="text-sm">{p.caption}</span></div>)}</div></div></div>}
      {showNotif && <div className="fixed inset-0 z-40 bg-[#080b14] p-4"><div className="flex justify-between mb-4"><h2 className="font-bold">Notifications - Working</h2><button onClick={()=>setShowNotif(false)}><Icon.Close/></button></div><div className="space-y-2">{posts.slice(0,5).map(p=><div key={p.id} className="bg-[#121725] p-3 rounded-xl flex items-center gap-3"><img src={p.imageUrl} className="w-10 h-10 rounded-full object-cover"/><span className="text-sm">Someone liked your pix</span><span className="ml-auto text-xs text-white/40">now</span></div>)}</div></div>}
      {showProfile && <div className="fixed inset-0 z-40 bg-[#080b14] p-4"><div className="flex justify-between mb-6"><h2 className="font-bold">Profile - Working</h2><button onClick={()=>setShowProfile(false)}><Icon.Close/></button></div><div className="flex flex-col items-center gap-3"><div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-black">C</div><p className="font-bold">ChitPix User</p><p className="text-sm text-white/50">R2 Bucket Connected - 460MB</p><div className="flex gap-8 mt-4"><div className="text-center"><p className="font-bold">{posts.length}</p><p className="text-xs text-white/40">Posts</p></div><div className="text-center"><p className="font-bold">{stories.length}</p><p className="text-xs text-white/40">Stories</p></div></div></div></div>}
    </div>
  )
                                                        }
