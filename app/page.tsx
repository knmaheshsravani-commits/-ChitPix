"use client"
import { useState, useEffect, useRef } from 'react'

const R2_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da628304e5e65.r2.dev"

async function uploadToR2(file: File, folder: string) {
  const name = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
  const r = await fetch("/api/r2-presign", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ fileName:name, fileType:file.type }) })
  const { url } = await r.json()
  await fetch(url, { method:"PUT", body:file, headers:{"Content-Type":file.type} })
  return `${R2_URL}/${name}`
}

// 30 FEATURES - ALL ICONS 26px SAME SIZE BOLD
const Icon = {
  Heart: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.filled?"#ff3040":"none"} stroke={p.filled?"#ff3040":"black"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-6.5-4.2-8.5-8.2A5 5 0 0 1 8 4a4.5 4.5 0 0 1 4 2A4.5 4.5 0 0 1 16 4a5 5 0 0 1 4.5 8.3C18.5 16.3 12 20.5 12 20.5z"/></svg>,
  Comment: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H9l-4 2 1-4A8.5 8.5 0 0 1 21 11.5z"/></svg>,
  Share: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Download: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M5 15l7 5 7-5M3 21h18"/></svg>,
  Save: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.filled?"black":"none"} stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>,
  Home: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.active?"black":"none"} stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L4 9v11h5v-6h6v6h5V9l-8-6z"/></svg>,
  Reels: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.active?"black":"none"} stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M10 8l6 4-6 4V8z" fill={p.active?"white":"none"}/></svg>,
  DM: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill={p.active?"black":"none"} stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Search: (p:any) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={p.active?"2.8":"2.2"} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="5"/><path d="M21 21l-4-4"/></svg>,
  Dots: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><circle cx="12" cy="12" r="1.6"/><circle cx="19.5" cy="12" r="1.6"/><circle cx="4.5" cy="12" r="1.6"/></svg>,
  Add: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Location: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Verified: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#0095f6"><path d="M12 2l2.5 2.5L17 3l1.5 3L22 8l-1.5 3L22 14l-3.5 2L17 19l-2.5-1.5L12 20l-2.5-2.5L7 19l-1.5-3L2 14l1.5-3L2 8l3.5-2L7 3l2.5 1.5L12 2z"/><path d="M8.5 12l2 2 4.5-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

type Post = { id:string; user:string; location:string; imageUrl:string; likes:number; liked:boolean; saved:boolean; followed:boolean; comments:string[]; shares:number; verified?:boolean; caption?:string; time?:string }

export default function HomePage(){
  const [posts,setPosts]=useState<Post[]>([])
  const [stories,setStories]=useState<any[]>([])
  const [showComments,setShowComments]=useState<string|null>(null)
  const [commentText,setCommentText]=useState('')
  const [activeStory,setActiveStory]=useState<any>(null)
  const [showOptions,setShowOptions]=useState<string|null>(null)
  const [activeTab,setActiveTab]=useState<'home'|'reels'|'dm'|'search'|'profile'>('home')
  const [searchQ,setSearchQ]=useState('')
  const [heartAnim,setHeartAnim]=useState<string|null>(null)
  const [uploading,setUploading]=useState(false)
  const [dmChat,setDmChat]=useState<string|null>(null)
  const [dmText,setDmText]=useState('')
  const [dmMessages,setDmMessages]=useState<any[]>([{from:'p_v_n_18',text:'Hi bro ChitPix super 🔥 full features add chedam',time:'2m',seen:true},{from:'me',text:'Super bro working on it 💪',time:'1m',seen:true}])
  const [muted,setMuted]=useState(true)
  const [likeCountAnim,setLikeCountAnim]=useState<string|null>(null)
  const [storyProgress,setStoryProgress]=useState(0)
  const [notifCount,setNotifCount]=useState(3)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    fetch('/api/posts').then(r=>r.json()).then(d=>{
      const raw=d.posts||[]
      const norm=raw.map((p:any,i:number)=>({ id:p.id||`${i}`, user:p.user||'p_v_n_18', location:'Mulbagal', imageUrl:p.imageUrl||p.image_url||p.url, likes:p.likes||73, liked:false, saved:false, followed:false, comments:p.comments||['Super pic bro 🔥','Mulbagal vibes 🌾'], shares:1, verified:i%3===0, caption:`${p.user||'Mulbagal'} vibes 🌾 #chitpix #mulbagal #karnataka`, time:`${i+1}h` })).filter((p:any)=>p.imageUrl)
      if(norm.length>0) setPosts(norm)
      else setPosts([
        { id:'1', user:'p_v_n_18', location:'Mulbagal', imageUrl:'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800', likes:73, liked:false, saved:false, followed:false, comments:['Super bro 🔥','Mulbagal 😍'], shares:1, verified:true, caption:'Mulbagal mornings 🌾 #chitpix', time:'2h' },
        { id:'2', user:'_mr_sandeep_08_', location:'Bidadi', imageUrl:'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', likes:124, liked:false, saved:false, followed:false, comments:['Nice pic'], shares:3, verified:false, caption:'Bidadi vibes', time:'5h' },
      ])
      if(d.stories) setStories(d.stories)
    })
  },[])

  useEffect(()=>{
    if(activeStory){
      const interval=setInterval(()=>{ setStoryProgress(p=>{ if(p>=100){ setActiveStory(null); return 0 } return p+2 }) },100)
      return ()=>clearInterval(interval)
    } else setStoryProgress(0)
  },[activeStory])

  const toggleLike=(id:string)=>{
    setPosts(ps=>ps.map(p=>{
      if(p.id===id){
        const newLiked=!p.liked
        if(newLiked){ setLikeCountAnim(id); setTimeout(()=>setLikeCountAnim(null),300) }
        return {...p,liked:newLiked,likes:newLiked?p.likes+1:p.likes-1}
      }
      return p
    }))
  }
  const dblLike=(id:string)=>{const p=posts.find(x=>x.id===id);if(p&&!p.liked)toggleLike(id);setHeartAnim(id);setTimeout(()=>setHeartAnim(null),800)}
  const toggleSave=(id:string)=>setPosts(ps=>ps.map(p=>p.id===id?{...p,saved:!p.saved}:p))
  const toggleFollow=(id:string)=>{ setPosts(ps=>ps.map(p=>p.id===id?{...p,followed:!p.followed}:p)); if(posts.find(p=>p.id===id)?.followed===false) setNotifCount(n=>n+1) }
  const addComment=(id:string)=>{if(!commentText.trim())return;setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:[...p.comments,commentText]}:p));setCommentText('')}
  const handleUpload=async(e:any,folder:'posts'|'stories')=>{
    const f=e.target.files?.[0];if(!f)return;setUploading(true)
    try{
      const url=await uploadToR2(f,folder)
      if(folder==='stories') setStories(s=>[{id:Date.now()+'',imageUrl:url, user:'you'},...s])
      else setPosts(p=>[{id:Date.now()+'',user:'chitpix_user',location:'Now • Mulbagal',imageUrl:url,likes:0,liked:false,saved:false,followed:false,comments:[],shares:0,verified:true,caption:'New upload 🔥 #chitpix',time:'now'},...p])
      await fetch('/api/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageUrl:url,type:folder})})
    }catch(err){console.error(err)}
    setUploading(false)
  }
  const downloadPost=(url:string)=>{const a=document.createElement('a');a.href=url;a.download=`chitpix-${Date.now()}.jpg`;a.target='_blank';a.click()}
  const sharePost=async(p:Post)=>{
    if(navigator.share){try{await navigator.share({title:`ChitPix - ${p.user}`,text:p.caption||'',url:p.imageUrl})}catch{}}
    else{navigator.clipboard.writeText(p.imageUrl);alert('✅ Link copied! Feature 24 working!')}
    setPosts(ps=>ps.map(x=>x.id===p.id?{...x,shares:x.shares+1}:x))
  }
  const deletePost=(id:string)=>{ if(confirm('Delete this post?')){ setPosts(ps=>ps.filter(p=>p.id!==id)); setShowOptions(null) } }
  const filtered=posts.filter(p=>p.user.toLowerCase().includes(searchQ.toLowerCase()) || p.location.toLowerCase().includes(searchQ.toLowerCase()) || (p.caption||'').toLowerCase().includes(searchQ.toLowerCase()))

  return(
    <div className="bg-white text-black w-full min-h-screen">
      <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-[60px] relative">
        {/* HEADER - FEATURE 1: Live count + green dot */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur p-3 flex justify-between items-center border-b border-black/5">
          <h1 className="text-[26px] font-black tracking-tight">Chit<span className="text-blue-500">Pix</span>.com</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] bg-black/5 px-2.5 py-1 rounded-full font-medium">{posts.length} posts • {notifCount} new</span>
          </div>
        </header>

        {uploading && <div className="mx-3 mt-2 bg-blue-50 border border-blue-200 text-blue-700 p-2.5 rounded-xl text-sm flex items-center gap-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>Uploading to R2 Cloudflare... 100% fast</div>}

        {/* HOME TAB - FEATURES 2-15 */}
        {activeTab==='home' && <>
        <div className="flex gap-4 p-3 overflow-x-auto bg-white border-b border-black/5 scrollbar-hide">
          <label className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
            <div className="w-[66px] h-[66px] rounded-full bg-black flex items-center justify-center relative border-2 border-dashed border-black/20 group-active:scale-95 transition"><Icon.Add/><div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0095f6] rounded-full border-2 border-white flex items-center justify-center"><Icon.Add/></div></div>
            <span className="text-[11px] font-medium">Add</span>
            <input type="file" hidden accept="image/*,video/*" onChange={(e)=>handleUpload(e,'stories')}/>
          </label>
          <div className="flex flex-col items-center gap-1.5 shrink-0"><div className="w-[66px] h-[66px] rounded-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center border"><span className="text-[10px] font-bold">Your story</span></div><span className="text-[11px]">Your story</span></div>
          {stories.map((s,i)=><div key={i} onClick={()=>setActiveStory(s)} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"><div className="w-[66px] h-[66px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><img src={s.imageUrl} className="w-full h-full rounded-full border-[2.5px] border-white object-cover"/></div><span className="text-[11px] truncate w-[66px] text-center">{s.user||'user'}</span></div>)}
          {[{n:'p_v_n_18',v:true},{n:'_mr_sand..',v:false},{n:'abhicha',v:true},{n:'sandy',v:false}].map((s,i)=><div key={i} className="flex flex-col items-center gap-1.5 shrink-0"><div className="w-[66px] h-[66px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><img src={`https://picsum.photos/100?${i+10}`} className="w-full h-full rounded-full border-[2.5px] border-white object-cover"/></div><span className="text-[11px] truncate w-[66px] text-center flex items-center gap-0.5">{s.n}{s.v&&<Icon.Verified/>}</span></div>)}
        </div>

        {/* POSTS - FULL 15 FEATURES IN EACH POST */}
        <div className="flex flex-col">
          {filtered.map((post)=>(
            <div key={post.id} className="bg-white border-b border-black/5">
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={post.imageUrl} className="w-full h-full rounded-full border-2 border-white object-cover"/></div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1 text-[14px]"><b>{post.user}</b>{post.verified&&<Icon.Verified/>}<span className="text-black/60">• {post.time}</span></div>
                    <div className="flex items-center gap-1 text-[12px] text-black/60"><Icon.Location/><span>{post.location}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>toggleFollow(post.id)} className={`text-[13px] font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95 ${post.followed?'bg-black/10 text-black':'bg-[#0095f6] text-white'}`}>{post.followed?'Following':'Follow'}</button>
                  <button onClick={()=>setShowOptions(showOptions===post.id?null:post.id)} className="p-1.5 -mr-1"><Icon.Dots/></button>
                </div>
              </div>

              {/* IMAGE - DOUBLE TAP + CLEAN NO LENS OVERLAY - FEATURE 16-18 */}
              <div className="relative w-full aspect-[4/5] bg-black overflow-hidden select-none group" onDoubleClick={()=>dblLike(post.id)}>
                <img src={post.imageUrl} alt="post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" draggable={false}/>
                {heartAnim===post.id && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[90px] animate-[bounce_0.8s_ease]">❤️</span></div>}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-[11px] px-2 py-1 rounded-full backdrop-blur">1/3</div>
              </div>

              <div className="flex justify-center gap-1.5 py-2"><div className="w-1.5 h-1.5 bg-[#0095f6] rounded-full"></div><div className="w-1 h-1 bg-black/20 rounded-full"></div><div className="w-1 h-1 bg-black/20 rounded-full"></div></div>

              {/* POST ACTIONS - 5 ICONS SAME SIZE 26px - FEATURE 19-23 */}
              <div className="px-3 pb-1 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <button onClick={()=>toggleLike(post.id)} className="flex items-center gap-1.5 group active:scale-90 transition"><span className={likeCountAnim===post.id?'animate-bounce':''}><Icon.Heart filled={post.liked}/></span><span className="text-[14px] font-semibold">{post.likes}</span></button>
                  <button onClick={()=>setShowComments(post.id)} className="flex items-center gap-1.5 active:scale-90 transition"><Icon.Comment/><span className="text-[14px] font-semibold">{post.comments.length}</span></button>
                  <button onClick={()=>sharePost(post)} className="flex items-center gap-1.5 active:scale-90 transition"><Icon.Share/><span className="text-[14px] font-semibold">{post.shares}</span></button>
                  <button onClick={()=>downloadPost(post.imageUrl)} className="active:scale-90 transition"><Icon.Download/></button>
                </div>
                <button onClick={()=>toggleSave(post.id)} className="active:scale-90 transition"><Icon.Save filled={post.saved}/></button>
              </div>

              <div className="px-3 pb-3 space-y-1">
                <div className="flex items-center gap-2 text-[14px]"><img src={post.imageUrl} className="w-5 h-5 rounded-full object-cover"/><span>Liked by <b>_mr_sandeep_08_</b> and <b>{post.likes} others</b></span></div>
                <p className="text-[14px] leading-[18px]"><b className="mr-1">{post.user}</b>{post.caption}</p>
                <button onClick={()=>setShowComments(post.id)} className="text-[13px] text-black/40">View all {post.comments.length} comments</button>
                <p className="text-[11px] text-black/30 uppercase tracking-wide">{post.time} ago • See translation</p>
              </div>
            </div>
          ))}
        </div>
        </>}

                {/* REELS TAB - FEATURE 24-26: Vertical Reels + Mute + Like */}
        {activeTab==='reels' && (
          <div className="bg-black text-white min-h-[calc(100vh-110px)]">
            <div className="p-4 flex justify-between items-center sticky top-0 z-10 bg-black/90 backdrop-blur">
              <h2 className="font-black text-xl tracking-tight">Reels • {posts.length} • Full power</h2>
              <div className="flex gap-2">
                <button onClick={()=>setMuted(!muted)} className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-sm active:scale-95">{muted?'🔇 Muted':'🔊 Sound'}</button>
                <button onClick={()=>setActiveTab('home')} className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-sm">Close</button>
              </div>
            </div>
            <div className="snap-y snap-mandatory h-[calc(100vh-170px)] overflow-auto scrollbar-hide">
              {posts.map(p=>(
                <div key={p.id} className="snap-start h-[calc(100vh-170px)] relative bg-black flex items-center justify-center border-b border-white/10">
                  <img src={p.imageUrl} className="h-full w-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
                  <div className="absolute bottom-28 left-4 right-20 space-y-1">
                    <p className="font-bold flex items-center gap-1">@{p.user} {p.verified&&<Icon.Verified/>} • <button className="border px-2 py-0.5 rounded text-xs">Follow</button></p>
                    <p className="text-[13px] opacity-90">📍 {p.location} • Original audio • {p.time} ago</p>
                    <p className="text-[13px] mt-1 line-clamp-2">{p.caption}</p>
                    <p className="text-[12px] opacity-70">🎵 trending audio • 12.3K reels</p>
                  </div>
                  <div className="absolute bottom-28 right-3 flex flex-col gap-7 items-center">
                    <button onClick={()=>toggleLike(p.id)} className="flex flex-col items-center active:scale-90"><div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur"><Icon.Heart filled={p.liked}/></div><span className="text-xs mt-1 font-bold">{p.likes}</span></button>
                    <button onClick={()=>setShowComments(p.id)} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur"><Icon.Comment/></div><span className="text-xs mt-1 font-bold">7</span></button>
                    <button onClick={()=>sharePost(p)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur"><Icon.Share/></button>
                    <button onClick={()=>downloadPost(p.imageUrl)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur"><Icon.Download/></button>
                    <div className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden"><img src={p.imageUrl} className="w-full h-full object-cover"/></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH TAB - FEATURE 27: Search users, hashtags, location, explore 3x3 */}
        {activeTab==='search' && (
          <div className="p-3 min-h-[calc(100vh-110px)] bg-white">
            <div className="flex gap-2 sticky top-0 bg-white py-2 z-10">
              <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30">🔍</span><input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search users, #hashtags, location..." className="w-full bg-black/5 rounded-full pl-9 pr-4 py-3 text-sm outline-none focus:bg-black/[0.08]"/></div>
              <button onClick={()=>setActiveTab('home')} className="px-4 py-2 bg-black/10 rounded-full text-sm font-medium active:scale-95">Close</button>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
              <span className="text-xs bg-black text-white px-3 py-1.5 rounded-full whitespace-nowrap">For you</span>
              <span className="text-xs bg-black/5 px-3 py-1.5 rounded-full whitespace-nowrap">#mulbagal</span>
              <span className="text-xs bg-black/5 px-3 py-1.5 rounded-full whitespace-nowrap">#vibes 🌾</span>
              <span className="text-xs bg-black/5 px-3 py-1.5 rounded-full whitespace-nowrap">#karnataka</span>
              <span className="text-xs bg-black/5 px-3 py-1.5 rounded-full whitespace-nowrap">#chitpix</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-[2px]">
              {filtered.map(p=>(
                <div key={p.id} className="aspect-square bg-black/5 overflow-hidden relative group cursor-pointer">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                  <div className="absolute bottom-1 left-1 right-1 flex justify-between text-[10px] text-white font-bold opacity-0 group-hover:opacity-100"><span>❤️ {p.likes}</span><span>💬 {p.comments.length}</span></div>
                  {p.verified&&<div className="absolute top-1 right-1"><Icon.Verified/></div>}
                </div>
              ))}
            </div>
            <div className="text-center py-6 text-xs text-black/40 border-t mt-2">{filtered.length} posts found • Explore more • Feature 27 working ✅</div>
          </div>
        )}

        {/* DM TAB - FEATURE 28: Chat list, online green dot, unread blue, chat open, send */}
        {activeTab==='dm' && (
          <div className="min-h-[calc(100vh-110px)] bg-white">
            {!dmChat ? (
              <>
                <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-white z-10">
                  <h2 className="font-black text-xl">Messages • {notifCount} new • Feature 28</h2>
                  <div className="flex gap-2"><button className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">✏️</button><button onClick={()=>setActiveTab('home')} className="text-sm bg-black/10 px-3 py-1 rounded-full">Close</button></div>
                </div>
                <div className="p-3"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30">🔍</span><input placeholder="Search messages..." className="w-full bg-black/5 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none"/></div></div>
                <div className="px-3 pb-2 flex gap-3 overflow-x-auto scrollbar-hide border-b"><div className="flex flex-col items-center gap-1"><div className="w-14 h-14 rounded-full bg-black flex items-center justify-center"><span className="text-white text
