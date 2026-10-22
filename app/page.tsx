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

// 200% INSTA ICONS
const I = {
  Heart: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.filled?"#ff3040":"none"} stroke={p.filled?"#ff3040":"currentColor"} strokeWidth={p.filled?0:1.7}><path d="M12 20.5s-6.5-4.2-8.5-8.2A5 5 0 0 1 8 4a4.5 4.5 0 0 1 4 2A4.5 4.5 0 0 1 16 4a5 5 0 0 1 4.5 8.3C18.5 16.3 12 20.5 12 20.5z"/></svg>,
  Comment: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H9l-4 2 1-4A8.5 8.5 0 0 1 21 11.5z"/></svg>,
  Share: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Save: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.filled?"currentColor":"none"} stroke="currentColor" strokeWidth="1.7"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>,
  Dots: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.8"/><circle cx="19.5" cy="12" r="1.8"/><circle cx="4.5" cy="12" r="1.8"/></svg>,
  Home: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.active?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M12 3L4 9v11h5v-6h6v6h5V9l-8-6z"/></svg>,
  Search: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="5"/><path d="M21 21l-4-4"/></svg>,
  Reels: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 8l6 4-6 4V8z"/></svg>,
  DM: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Download: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v13M5 16l7 5 7-5M3 21h18"/></svg>,
  Tag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM6 17a6 6 0 0 1 12 0v1H6v-1z"/></svg>,
  Mute: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>,
}

type Post = { id:string; user:string; location:string; imageUrl:string; likes:number; liked:boolean; saved:boolean; followed:boolean; comments:string[]; shares:number; time:string }

export default function HomePage(){
  const [posts,setPosts]=useState<Post[]>([])
  const [showComments,setShowComments]=useState<string|null>(null)
  const [commentText,setCommentText]=useState('')
  const [searchOpen,setSearchOpen]=useState(false)
  const [heartAnim,setHeartAnim]=useState<string|null>(null)

  useEffect(()=>{
    fetch('/api/posts').then(r=>r.json()).then(d=>{
      const raw=d.posts||[]
      const norm=raw.map((p:any,i:number)=>({
        id: p.id||`p${i}`, user: p.user||`p_v_n_18`, location: p.location||'Mulbagal',
        imageUrl: p.imageUrl||p.image_url||p.url||'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        likes: p.likes||73, liked:false, saved:false, followed:false, comments:p.comments||[], shares:1, time:'now'
      }))
      if(norm.length>0) setPosts(norm)
      else setPosts([
        { id:'1', user:'p_v_n_18', location:'Mulbagal', imageUrl:'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', likes:73, liked:false, saved:false, followed:false, comments:['Nice bro'], shares:1, time:'2h' },
        { id:'2', user:'_mr_sandeep_08_', location:'Bangalore', imageUrl:'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', likes:99, liked:false, saved:false, followed:false, comments:[], shares:3, time:'5h' },
      ])
    })
  },[])

  const toggleLike=(id:string)=>{setPosts(ps=>ps.map(p=>p.id===id?{...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}:p))}
  const dblLike=(id:string)=>{const p=posts.find(x=>x.id===id);if(p&&!p.liked)toggleLike(id);setHeartAnim(id);setTimeout(()=>setHeartAnim(null),900)}
  const toggleSave=(id:string)=>setPosts(ps=>ps.map(p=>p.id===id?{...p,saved:!p.saved}:p))
  const toggleFollow=(id:string)=>setPosts(ps=>ps.map(p=>p.id===id?{...p,followed:!p.followed}:p))
  const addComment=(id:string)=>{if(!commentText.trim())return;setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:[...p.comments,commentText]}:p));setCommentText('')}
  const downloadPost=async(url:string)=>{ try{const a=document.createElement('a');a.href=url;a.download='chitpix.jpg';a.target='_blank';a.click()}catch{window.open(url,'_blank')} }
  const sharePost=async(post:Post)=>{ if(navigator.share){try{await navigator.share({title:'ChitPix',url:post.imageUrl})}catch{}}else{navigator.clipboard.writeText(post.imageUrl);alert('Link copied!')} setPosts(ps=>ps.map(p=>p.id===post.id?{...p,shares:p.shares+1}:p)) }

  return(
    <div className="bg-white text-black w-full min-h-screen">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-[90px] relative">
        {/* STORIES - LIKE INSTA 1ST IMAGE */}
        <div className="flex gap-4 p-3 overflow-x-auto border-b border-black/5 bg-white sticky top-0 z-20">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-[66px] h-[66px] rounded-full bg-black flex items-center justify-center relative"><span className="text-white">Your story</span><div className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full border-2 border-white flex items-center justify-center text-white text-[12px]">+</div></div>
            <span className="text-[12px]">Your story</span>
          </div>
          {[{n:'p_v_n_18',img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'},{n:'_mr_sand...',img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'},{n:'abhichan',img:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100'}].map((s,i)=><div key={i} className="flex flex-col items-center gap-1 shrink-0"><div className="w-[66px] h-[66px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><img src={s.img} className="w-full h-full rounded-full border-2 border-white object-cover"/></div><span className="text-[12px]">{s.n}</span></div>)}
        </div>

        {/* POSTS - 200% INSTA */}
        <div className="flex flex-col">
          {posts.map((post)=>(
            <div key={post.id} className="bg-white border-b border-black/5">
              {/* 1. PROFILE + FOLLOW BUTTON */}
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600"><img src={post.imageUrl} className="w-full h-full rounded-full border-2 border-white object-cover"/></div>
                  <div className="flex flex-col leading-tight">
                    <div className="flex items-center gap-1"><span className="font-semibold text-[14px]">{post.user}</span><span className="text-[13px]"> and 2 others</span></div>
                    <span className="text-[12px] text-black/60">{post.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={()=>toggleFollow(post.id)} className={`text-[13px] font-semibold px-3 py-1 rounded ${post.followed?'bg-black/10 text-black':'bg-blue-500 text-white'}`}>{post.followed?'Following':'Follow'}</button>
                  <button><I.Dots/></button>
                </div>
              </div>

              {/* 2. IMAGE WITH TAGS - LIKE 1ST SCREENSHOT */}
              <div className="relative w-full aspect-[4/5] bg-black overflow-hidden" onDoubleClick={()=>dblLike(post.id)}>
                <img src={post.imageUrl} alt="post" className="w-full h-full object-cover"/>
                {heartAnim===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[100px] animate-[ping_0.8s_ease]">❤️</span></div>}
                {/* Tag icons like screenshot */}
                <div className="absolute bottom-3 left-3 flex-col gap-2">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-2 py-1 rounded-full"><img src={post.imageUrl} className="w-6 h-6 rounded-full"/><span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px]">❤️</span></div>
                  <div className="w-9 h-9 bg-black/60 rounded-full flex items-center justify-center"><I.Tag/></div>
                </div>
                <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"><I.Mute/></div>
              </div>

              {/* DOTS */}
              <div className="flex justify-center gap-1 py-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div><div className="w-1 h-1 bg-black/20 rounded-full"></div><div className="w-1 h-1 bg-black/20 rounded-full"></div><div className="w-1 h-1 bg-black/20 rounded-full"></div></div>

              {/* 3. 10 ICONS ROW - LIKE/COMMENT/SHARE/SAVE/DOWNLOAD */}
              <div className="px-3 pb-1 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* 1. LIKE */}
                  <button onClick={()=>toggleLike(post.id)} className="flex items-center gap-1"><I.Heart filled={post.liked}/><span className="text-[15px] font-semibold">{post.likes}</span></button>
                  {/* 2. COMMENT */}
                  <button onClick={()=>setShowComments(post.id)} className="flex items-center gap-1"><I.Comment/><span className="text-[15px] font-semibold">7</span></button>
                  {/* 3. SHARE */}
                  <button onClick={()=>sharePost(post)} className="flex items-center gap-1"><I.Share/><span className="text-[15px] font-semibold">{post.shares}</span></button>
                  {/* 4. DOWNLOAD */}
                  <button onClick={()=>downloadPost(post.imageUrl)} className="ml-1"><I.Download/></button>
                </div>
                {/* 5. SAVE */}
                <button onClick={()=>toggleSave(post.id)}><I.Save filled={post.saved}/></button>
              </div>

              {/* LIKED BY */}
              <div className="px-3 pb-3">
                <div className="flex items-center gap-2"><img src={post.imageUrl} className="w-5 h-5 rounded-full"/><span className="text-[14px]">Liked by <b>_mr_sandeep_08_</b> and others</span></div>
                <p className="text-[14px] mt-1"><b>{post.user}</b> {post.location} vibes 🌾</p>
                <button onClick={()=>setShowComments(post.id)} className="text-[13px] text-black/40">View {post.comments.length} comments</button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM NAV - 200% INSTA - WHITE */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[64px] bg-white border-t border-black/10 flex items-center justify-around z-30">
          <button className="p-2 bg-black/10 rounded-full"><I.Home active={true}/></button>
          <button className="p-2"><I.Reels/></button>
          <button className="p-2 relative"><I.DM/><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
          <button onClick={()=>setSearchOpen(true)} className="p-2"><I.Search/></button>
          <button className="p-2 relative"><img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100" className="w-7 h-7 rounded-full"/><span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
        </nav>

        {/* COMMENTS MODAL */}
        {showComments && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <div className="bg-white w-full max-w-[480px] rounded-t-[16px] max-h-[70vh] flex flex-col">
              <div className="p-4 flex justify-between border-b"><b>Comments</b><button onClick={()=>setShowComments(null)}>X</button></div>
              <div className="flex-1 overflow-auto p-4 space-y-2">{posts.find(p=>p.id===showComments)?.comments.map((c,i)=><div key={i} className="text-[14px]"><b>user:</b> {c}</div>)}</div>
              <div className="p-3 flex gap-2 border-t"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-black/5 rounded-full px-4 py-2 text-sm outline-none"/><button onClick={()=>addComment(showComments)} className="text-blue-500 font-semibold">Post</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
            }
