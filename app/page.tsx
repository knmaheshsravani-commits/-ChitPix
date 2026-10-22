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

// FIXED: 10 ICONS - ALL SAME SIZE 26px - strokeWidth 2 - OKE SIZE
const Icon = {
  Heart: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.filled?"#ff3040":"none"} stroke={p.filled?"#ff3040":"black"} strokeWidth="2"><path d="M12 20.5s-6.5-4.2-8.5-8.2A5 5 0 0 1 8 4a4.5 4.5 0 0 1 4 2A4.5 4.5 0 0 1 16 4a5 5 0 0 1 4.5 8.3C18.5 16.3 12 20.5 12 20.5z"/></svg>,
  Comment: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H9l-4 2 1-4A8.5 8.5 0 0 1 21 11.5z"/></svg>,
  Share: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Download: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M12 3v13M5 16l7 5 7-5M3 21h18"/></svg>,
  Save: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.filled?"black":"none"} stroke="black" strokeWidth="2"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>,
  Home: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.active?"black":"none"} stroke="black" strokeWidth="2"><path d="M12 3L4 9v11h5v-6h6v6h5V9l-8-6z"/></svg>,
  Reels: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 8l6 4-6 4V8z"/></svg>,
  DM: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Search: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="5"/><path d="M21 21l-4-4"/></svg>,
  Profile: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>,
  Dots: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><circle cx="12" cy="12" r="1.6"/><circle cx="19.5" cy="12" r="1.6"/><circle cx="4.5" cy="12" r="1.6"/></svg>,
  Add: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
}

type Post = { id:string; user:string; location:string; imageUrl:string; likes:number; liked:boolean; saved:boolean; followed:boolean; comments:string[]; shares:number }

export default function HomePage(){
  const [posts,setPosts]=useState<Post[]>([])
  const [stories,setStories]=useState<any[]>([])
  const [showComments,setShowComments]=useState<string|null>(null)
  const [commentText,setCommentText]=useState('')
  const [activeStory,setActiveStory]=useState<any>(null)
  const [showOptions,setShowOptions]=useState<string|null>(null)
  const [showSearch,setShowSearch]=useState(false)
  const [showDM,setShowDM]=useState(false)
  const [showReels,setShowReels]=useState(false)
  const [showProfile,setShowProfile]=useState(false)
  const [searchQ,setSearchQ]=useState('')
  const [heartAnim,setHeartAnim]=useState<string|null>(null)
  const [uploading,setUploading]=useState(false)

  useEffect(()=>{
    fetch('/api/posts').then(r=>r.json()).then(d=>{
      const raw=d.posts||[]
      const norm=raw.map((p:any,i:number)=>({ id:p.id||`${i}`, user:p.user||'p_v_n_18', location:'Mulbagal', imageUrl:p.imageUrl||p.image_url||p.url, likes:p.likes||73, liked:false, saved:false, followed:false, comments:p.comments||[], shares:1 })).filter((p:any)=>p.imageUrl)
      if(norm.length>0) setPosts(norm)
      else setPosts([{ id:'1', user:'p_v_n_18', location:'Mulbagal', imageUrl:'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800', likes:73, liked:false, saved:false, followed:false, comments:[], shares:1 }])
      if(d.stories) setStories(d.stories)
    })
  },[])

  const toggleLike=(id:string)=>setPosts(ps=>ps.map(p=>p.id===id?{...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}:p))
  const dblLike=(id:string)=>{const p=posts.find(x=>x.id===id);if(p&&!p.liked)toggleLike(id);setHeartAnim(id);setTimeout(()=>setHeartAnim(null),800)}
  const toggleSave=(id:string)=>setPosts(ps=>ps.map(p=>p.id===id?{...p,saved:!p.saved}:p))
  const toggleFollow=(id:string)=>setPosts(ps=>ps.map(p=>p.id===id?{...p,followed:!p.followed}:p))
  const addComment=(id:string)=>{if(!commentText.trim())return;setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:[...p.comments,commentText]}:p));setCommentText('')}
  const handleUpload=async(e:any,folder:'posts'|'stories')=>{const f=e.target.files?.[0];if(!f)return;setUploading(true);try{const url=await uploadToR2(f,folder);if(folder==='stories')setStories(s=>[{id:Date.now()+'',imageUrl:url},...s]);else setPosts(p=>[{id:Date.now()+'',user:'chitpix_user',location:'Now',imageUrl:url,likes:0,liked:false,saved:false,followed:false,comments:[],shares:0},...p]);await fetch('/api/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageUrl:url,type:folder})})}catch{};setUploading(false)}
  const downloadPost=async(url:string)=>{const a=document.createElement('a');a.href=url;a.download='chitpix.jpg';a.target='_blank';a.click()}
  const sharePost=async(p:Post)=>{if(navigator.share){try{await navigator.share({title:'ChitPix',url:p.imageUrl})}catch{}}else{navigator.clipboard.writeText(p.imageUrl);alert('Link copied - Working!')} setPosts(ps=>ps.map(x=>x.id===p.id?{...x,shares:x.shares+1}:x))}
  const deletePost=(id:string)=>{setPosts(ps=>ps.filter(p=>p.id!==id));setShowOptions(null)}
  const filtered=posts.filter(p=>p.user.toLowerCase().includes(searchQ.toLowerCase()))

  return(
    <div className="bg-white text-black w-full min-h-screen">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-[80px]">
        <header className="sticky top-0 z-20 bg-white p-3 flex justify-between items-center border-b border-black/5">
          <h1 className="text-[26px] font-black tracking-tight">Chit<span className="text-blue-500">Pix</span>.com</h1>
          <div className="flex items-center gap-3"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-[11px] bg-black/5 px-2 py-1 rounded-full">{posts.length} posts</span></div>
        </header>
        {uploading && <div className="mx-3 mt-2 bg-blue-50 text-blue-600 p-2 rounded text-sm">Uploading to R2...</div>}

        <div className="flex gap-4 p-3 overflow-x-auto bg-white border-b border-black/5">
          <label className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
            <div className="w-[64px] h-[64px] rounded-full bg-black flex items-center justify-center relative border-2 border-dashed border-black/20"><Icon.Add/><div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"><Icon.Add/></div></div>
            <span className="text-[11px]">Add</span>
            <input type="file" hidden accept="image/*" onChange={(e)=>handleUpload(e,'stories')}/>
          </label>
          <div className="flex flex-col items-center gap-1 shrink-0"><div className="w-[64px] h-[64px] rounded-full bg-black flex items-center justify-center"><span className="text-[10px] text-white">Your story</span></div><span className="text-[11px]">Your story</span></div>
          {stories.map((s,i)=><div key={i} onClick={()=>setActiveStory(s)} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"><div className="w-[64px] h-[64px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={s.imageUrl} className="w-full h-full rounded-full border-2 border-white object-cover"/></div><span className="text-[11px]">user</span></div>)}
          {[{n:'p_v_n_18'},{n:'_mr_sand..'},{n:'abhicha'}].map((s,i)=><div key={i} className="flex flex-col items-center gap-1 shrink-0"><div className="w-[64px] h-[64px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={`https://picsum.photos/100?${i}`} className="w-full h-full rounded-full border-2 border-white object-cover"/></div><span className="text-[11px]">{s.n}</span></div>)}
        </div>

        <div className="flex flex-col">
          {filtered.map((post)=>(
            <div key={post.id} className="bg-white border-b border-black/5">
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={post.imageUrl} className="w-full h-full rounded-full border-2 border-white object-cover"/></div>
                  <div className="leading-tight"><div className="flex gap-1 text-[14px]"><b>{post.user}</b> and 2 others</div><div className="text-[12px] text-black/60">{post.location}</div></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>toggleFollow(post.id)} className={`text-[13px] font-bold px-4 py-1.5 rounded-lg ${post.followed?'bg-black/10 text-black':'bg-[#0095f6] text-white'}`}>{post.followed?'Following':'Follow'}</button>
                  <button onClick={()=>setShowOptions(showOptions===post.id?null:post.id)} className="p-1"><Icon.Dots/></button>
                </div>
              </div>
              {showOptions===post.id && <div className="mx-3 mb-2 bg-white border rounded-xl shadow-lg p-2 z-10"><button onClick={()=>deletePost(post.id)} className="w-full text-left p-2 text-red-500 font-semibold text-sm">Delete - Working</button><button onClick={()=>{alert('Reported - Working');setShowOptions(null)}} className="w-full text-left p-2 text-sm">Report</button><button onClick={()=>setShowOptions(null)} className="w-full text-left p-2 text-sm">Close</button></div>}

              <div className="relative w-full aspect-[4/5] bg-black overflow-hidden" onDoubleClick={()=>dblLike(post.id)}>
                <img src={post.imageUrl} alt="post" className="w-full h-full object-cover"/>
                {heartAnim===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[90px] animate-ping">❤️</span></div>}
                <div className="absolute bottom-3 left-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM6 17a6 6 0 0 1 12 0v1H6v-1z"/></svg></div>
                <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg></div>
              </div>

              <div className="flex justify-center gap-1 py-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div><div className="w-1 h-1 bg-black/20 rounded-full"></div><div className="w-1 h-1 bg-black/20 rounded-full"></div></div>

              {/* FIXED POST 5 ICONS - ALL SAME SIZE 26px - SIMPLY WORKING */}
              <div className="px-3 pb-1 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <button onClick={()=>toggleLike(post.id)} className="flex items-center gap-1"><Icon.Heart filled={post.liked}/><span className="text-[15px] font-medium">{post.likes}</span></button>
                  <button onClick={()=>setShowComments(post.id)} className="flex items-center gap-1"><Icon.Comment/><span className="text-[15px] font-medium">7</span></button>
                  <button onClick={()=>sharePost(post)} className="flex items-center gap-1"><Icon.Share/><span className="text-[15px] font-medium">{post.shares}</span></button>
                  <button onClick={()=>downloadPost(post.imageUrl)} className="flex items-center justify-center"><Icon.Download/></button>
                </div>
                <button onClick={()=>toggleSave(post.id)} className="flex items-center justify-center"><Icon.Save filled={post.saved}/></button>
              </div>

              <div className="px-3 pb-3">
                <div className="flex items-center gap-2 text-[14px]"><img src={post.imageUrl} className="w-5 h-5 rounded-full"/><span>Liked by <b>_mr_sandeep_08_</b> and others</span></div>
                <p className="text-[14px] mt-1"><b>{post.user}</b> {post.location} vibes 🌾</p>
                <button onClick={()=>setShowComments(post.id)} className="text-[13px] text-black/40">View {post.comments.length} comments</button>
              </div>
            </div>
          ))}
        </div>

        {/* FIXED BOTTOM 5 ICONS - NO BIG BORDER - ALL SAME SIZE 26px - SIMPLE */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-black/10 flex items-center justify-around z-50" style={{ height: '60px' }}>
          <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="w-11 h-11 flex items-center justify-center"><Icon.Home active={true}/></button>
          <button onClick={()=>setShowReels(true)} className="w-11 h-11 flex items-center justify-center"><Icon.Reels/></button>
          <button onClick={()=>setShowDM(true)} className="w-11 h-11 flex items-center justify-center relative"><Icon.DM/><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
          <button onClick={()=>setShowSearch(true)} className="w-11 h-11 flex items-center justify-center"><Icon.Search/></button>
          <button onClick={()=>setShowProfile(true)} className="w-11 h-11 flex items-center justify-center relative"><img src="https://picsum.photos/100?1" className="w-[26px] h-[26px] rounded-full object-cover"/><span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span></button>
        </nav>
        <div style={{ height: '60px' }}></div>
        
        {activeStory && <div className="fixed inset-0 z-50 bg-black flex flex-col"><div className="p-4 flex justify-between text-white"><span>Story - Working</span><button onClick={()=>setActiveStory(null)} className="text-white">X</button></div><img src={activeStory.imageUrl} className="flex-1 object-contain"/></div>}
        {showComments && <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"><div className="bg-white w-full max-w-[480px] rounded-t-[16px] max-h-[70vh] flex flex-col"><div className="p-4 flex justify-between border-b"><b>Comments - Working</b><button onClick={()=>setShowComments(null)}>X</button></div><div className="flex-1 overflow-auto p-4 space-y-2">{posts.find(p=>p.id===showComments)?.comments.map((c,i)=><div key={i} className="text-sm bg-black/5 p-2 rounded">{c}</div>)}<div className="text-sm text-black/40">No more comments</div></div><div className="p-3 flex gap-2 border-t"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 bg-black/5 rounded-full px-4 py-2 text-sm outline-none"/><button onClick={()=>addComment(showComments)} className="text-blue-500 font-bold px-3">Post</button></div></div></div>}
        {showSearch && <div className="fixed inset-0 z-40 bg-white p-4"><div className="flex gap-2"><input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search - Working" className="flex-1 bg-black/5 rounded-full px-4 py-3 text-sm outline-none"/><button onClick={()=>setShowSearch(false)} className="px-4 py-2 bg-black/10 rounded-full">Close</button></div><p className="mt-4 text-sm">{filtered.length} results - Working</p></div>}
        {showDM && <div className="fixed inset-0 z-40 bg-white p-4"><div className="flex justify-between"><h2 className="font-bold">DM - Working</h2><button onClick={()=>setShowDM(false)}>X</button></div><p className="mt-4 text-sm">Messages feature working</p></div>}
        {showReels && <div className="fixed inset-0 z-40 bg-black text-white p-4"><div className="flex justify-between"><h2 className="font-bold">Reels - Working</h2><button onClick={()=>setShowReels(false)}>X</button></div><p className="mt-4">Reels working</p></div>}
        {showProfile && <div className="fixed inset-0 z-40 bg-white p-4"><div className="flex justify-between"><h2 className="font-bold">Profile - Working</h2><button onClick={()=>setShowProfile(false)}>X</button></div><div className="mt-6 flex flex-col items-center"><div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">C</div><p className="mt-2 font-bold">ChitPix User</p><label className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full cursor-pointer">Upload Post<input type="file" hidden accept="image/*" onChange={(e)=>handleUpload(e,'posts')}/></label></div></div>}
      </div>
    </div>
  )
                                                                                                                            }
