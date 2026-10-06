"use client"
import { useState, useRef, useEffect } from "react"

type Story = {id:number, url:string, time:number}
type Post = {id:number,user:string,image:string,likes:number,liked:boolean,comments:number,reposts:number,shares:number,saved:boolean,followed:boolean,followers:number}

export default function Page(){
  const storyRef = useRef<HTMLInputElement>(null)
  const postRef = useRef<HTMLInputElement>(null)

  const [showMsg,setShowMsg] = useState(false)
  const [tab,setTab] = useState<"likes"|"reply"|"msgs"|"saved">("msgs")
  const [viewProfile,setViewProfile] = useState<any>(null)
  const [viewStory,setViewStory] = useState<Story|null>(null)

    const [stories,setStories] = useState<Story[]>(()=>{
    if(typeof window!=="undefined"){
      try{
        const saved = localStorage.getItem("chitpix_stories")
        if(saved){
          const parsed = JSON.parse(saved)
          return parsed.filter((st:any)=> Date.now() - st.time < 24*60*60*1000)
        }
      }catch{}
    }
    return []
  })
  const [posts,setPosts] = useState<Post[]>([
    {id:1,user:"sneha_99",image:"https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=500",likes:20700,liked:false,comments:2020,reposts:558,shares:6710,saved:false,followed:false,followers:1200}
  ])

  // SAVE TO LOCAL + 24H AUTO DELETE
  useEffect(()=>{
    localStorage.setItem("chitpix_stories", JSON.stringify(stories))
  },[stories])

  useEffect(()=>{
    const iv=setInterval(()=>{
      const now=Date.now()
      setStories(s=>s.filter(st=> now - st.time < 24*60*60*1000))
    },60000)
    return()=>clearInterval(iv)
  },[])

  const uploadStory = (e:any)=>{
    const f=e.target.files[0]; if(!f) return
    setStories([{id:Date.now(),url:URL.createObjectURL(f),time:Date.now()},...stories])
  }
  const uploadPost = (e:any)=>{
    const f=e.target.files[0]; if(!f) return
    setPosts([{id:Date.now(),user:"you",image:URL.createObjectURL(f),likes:0,liked:false,comments:0,reposts:0,shares:0,saved:false,followed:false,followers:0},...posts])
  }

  const toggleLike = (id:number)=> setPosts(posts.map(p=>p.id===id?{...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}:p))
  const toggleSave = (id:number)=> setPosts(posts.map(p=>p.id===id?{...p,saved:!p.saved}:p))
  const toggleFollow = (id:number)=> setPosts(posts.map(p=>p.id===id?{...p,followed:!p.followed,followers:p.followed?p.followers-1:p.followers+1}:p))
  const addComment = (id:number)=> setPosts(posts.map(p=>p.id===id?{...p,comments:p.comments+1}:p))
  const addRepost = (id:number)=> setPosts(posts.map(p=>p.id===id?{...p,reposts:p.reposts+1}:p))
  const addShare = async (p:Post)=>{
    setPosts(posts.map(x=>x.id===p.id?{...x,shares:x.shares+1}:x))
    // DIRECT GALLERY / WHATSAPP SHARE
    if(navigator.share){
      try{ await navigator.share({title:"ChitPix",text:`Check ${p.user}'s photo on ChitPix.com`,url:window.location.href}) }catch{}
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link Copied! Share to Gallery/WhatsApp ✈️")
        }

  const likesNotifs = [
    {user:"sneha_99", action:`liked your post`, time:"2h", pic:"https://i.pravatar.cc/100?img=5", count:posts[0]?.likes},
    {user:"arjun_77", action:`liked your fox photo • ${posts[0]?.likes} likes`, time:"5h", pic:"https://i.pravatar.cc/100?img=8", count:128},
  ]

  // --- REPLY WITH BOX FIX ---
  const [replyLikes, setReplyLikes] = useState([
    {id:1,user:"sneha_99", action:"Nice fox! 🦊 Where is this?", time:"1h", pic:"https://i.pravatar.cc/100?img=5", likes:12, liked:false},
    {id:2,user:"priya_22", action:"Super pic bro! 🔥", time:"3h", pic:"https://i.pravatar.cc/100?img=9", likes:5, liked:false},
  ])
  const [replyText,setReplyText] = useState("")
  const [replyingTo,setReplyingTo] = useState<number|null>(null)
  const [replies,setReplies] = useState<any[]>([])

  const toggleReplyLike = (id:number)=>{
    setReplyLikes(replyLikes.map(r=> r.id===id? {...r, liked:!r.liked, likes: r.liked? r.likes-1: r.likes+1} : r))
  }
  const sendReply = (toId:number, toUser:string)=>{
    if(!replyText.trim()) return
    setReplies([...replies,{id:Date.now(), parentId:toId, to:toUser, text:replyText, time:"now"}])
    setReplyText("")
    setReplyingTo(null)
  }

  const msgData = [
    {user:"sneha_99", msg:"Hey! Fox pic super undi 😍", time:"10m", pic:"https://i.pravatar.cc/100?img=5"},
    {user:"arjun_77", msg:"Bro ChitPix bagundi!", time:"1h", pic:"https://i.pravatar.cc/100?img=8"},
  ]
  return(
    <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-20 relative">
      <input ref={storyRef} type="file" accept="image/*" hidden onChange={uploadStory}/>
      <input ref={postRef} type="file" accept="image/*" hidden onChange={uploadPost}/>

      <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
        <h1 className="font-extrabold text-[22px] tracking-tight">ChitPix.com</h1>
        <div className="flex gap-5">
          <button onClick={()=>{setTab("likes");setShowMsg(true)}}><svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 21s-6.5-4.35-9-8.5A5 5 0 0112 6a5 5 0 019 6.5C18.5 16.65 12 21 12 21z"/></svg></button>
          <button onClick={()=>{setTab("msgs");setShowMsg(true)}}><svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
        </div>
      </div>

      {/* STORY VIEW - FULLSCREEN */}
      {viewStory && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col max-w-[480px] mx-auto">
          <div className="flex justify-between items-center p-3 text-white"><span className="font-bold">you • {Math.floor((Date.now()-viewStory.time)/3600000)}h ago • deletes in {24-Math.floor((Date.now()-viewStory.time)/3600000)}h</span><button onClick={()=>setViewStory(null)} className="text-2xl">✕</button></div>
          <img src={viewStory.url} className="flex-1 object-contain"/>
          <div className="p-3 text-white text-center text-[12px] opacity-60">24 hours auto-delete • {new Date(viewStory.time+24*60*60*1000).toLocaleTimeString()}</div>
        </div>
      )}

      {/* MESSAGES BOX - LIKES REPLY LIKES COUNT + SAVED */}
      {showMsg && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[480px] mx-auto">
          <div className="flex justify-between items-center px-4 py-3 border-b"><button onClick={()=>setShowMsg(false)} className="text-[22px]">←</button><h2 className="font-bold text-[18px]">ChitPix</h2><span className="w-5"></span></div>
          <div className="flex border-b overflow-x-auto">
            <button onClick={()=>setTab("likes")} className={`px-4 py-3 font-semibold text-[13px] whitespace-nowrap ${tab==="likes"?"border-b-2 border-black":"text-gray-500"}`}>❤️ Likes ({posts.reduce((a,p)=>a+p.likes,0)})</button>
            <button onClick={()=>setTab("reply")} className={`px-4 py-3 font-semibold text-[13px] whitespace-nowrap ${tab==="reply"?"border-b-2 border-black":"text-gray-500"}`}>💬 Reply</button>
            <button onClick={()=>setTab("msgs")} className={`px-4 py-3 font-semibold text-[13px] whitespace-nowrap ${tab==="msgs"?"border-b-2 border-black":"text-gray-500"}`}>✉️ Messages</button>
            <button onClick={()=>setTab("saved")} className={`px-4 py-3 font-semibold text-[13px] whitespace-nowrap ${tab==="saved"?"border-b-2 border-black":"text-gray-500"}`}>🔖 Saved ({posts.filter(p=>p.saved).length})</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab==="likes" && likesNotifs.map((x,i)=>(
              <div key={i} onClick={()=>setViewProfile(x)} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer">
                <img src={x.pic} className="w-12 h-12 rounded-full"/><div className="flex-1"><span className="font-bold text-[14px]">{x.user}</span><span className="text-[14px]"> {x.action}</span><div className="text-[12px] text-gray-500 flex gap-2"><span>{x.time}</span><span>❤️ {x.count} likes</span></div></div>
              </div>
            ))}
                        {tab==="reply" && replyLikes.map((x)=>(
              <div key={x.id} className="px-4 py-3 border-b">
                <div className="flex items-center gap-3">
                  <img src={x.pic} className="w-12 h-12 rounded-full"/>
                  <div className="flex-1">
                    <span className="font-bold text-[14px]">{x.user}</span>
                    <div className="text-[14px]">{x.action}</div>
                    <div className="text-[12px] text-gray-500 flex gap-3 mt-1">
                      <span>{x.time}</span>
                      <button onClick={()=>toggleReplyLike(x.id)} className="font-bold">{x.liked?"❤️":"♡"} {x.likes} likes</button>
                      <button onClick={()=>setReplyingTo(x.id)} className="bg-blue-100 px-2 py-0.5 rounded font-bold text-black">Reply</button>
                    </div>
                  </div>
                  <button onClick={()=>toggleReplyLike(x.id)} className="text-xl">{x.liked?"❤️":"♡"}</button>
                </div>
                {replyingTo===x.id && (
                  <div className="flex gap-2 mt-3">
                    <input value={replyText} onChange={(e:any)=>setReplyText(e.target.value)} className="flex-1 border rounded-full px-3 py-1.5 text-[13px] outline-none" placeholder={`Reply to ${x.user}...`}/>
                    <button onClick={()=>sendReply(x.id, x.user)} className="bg-black text-white px-4 py-1.5 rounded-full text-[13px] font-bold">Send</button>
                  </div>
                )}
                {replies.filter(r=>r.parentId===x.id).map((r:any)=>(
                  <div key={r.id} className="mt-2 ml-14 pl-3 border-l-2 border-blue-400 text-[13px] bg-blue-50 py-1.5 rounded">
                    <b>you → {r.to}</b> {r.text} <span className="text-[11px] text-gray-400 ml-2">{r.time}</span>
                  </div>
                ))}
              </div>
            ))}
                        {tab==="msgs" && msgData.map((x,i)=>(
              <div key={i} onClick={()=>setViewProfile(x)} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer">
                <img src={x.pic} className="w-12 h-12 rounded-full"/>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-[14px]">{x.user}</span>
                    <span className="text-[11px] text-gray-400">{x.time}</span>
                  </div>
                  <div className="text-[13px] text-gray-600 truncate">{x.msg}</div>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            ))}
            {tab==="saved" && (
              posts.filter((p:any)=>p.saved).length===0
             ? <div className="p-10 text-center text-gray-500">No saved posts yet</div>
              : posts.filter((p:any)=>p.saved).map((p:any,i:number)=><div key={i} className="p-2"><img src={p.url || p.image} className="w-full rounded-lg"/></div>)
            )}
          </div>
          {viewProfile && (<div className="absolute inset-0 bg-white z-10 flex flex-col"><div className="flex items-center gap-3 p-3 border-b"><button onClick={()=>setViewProfile(null)}>← Back</button><img src={viewProfile.pic} className="w-8 h-8 rounded-full"/><b>{viewProfile.user}</b></div><div className="flex-1 flex items-center justify-center text-gray-400">Chat coming soon...</div></div>)}
        </div>
      )}

      {/* STORIES - INSTAGRAM RING + 24H TIMER */}
  <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b">
    <div onClick={()=>storyRef.current?.click()} className="flex flex-col items-center cursor-pointer min-w-[62px]">
      {stories.length>0? (
        <div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
          <img src={stories[0].url} className="w-full h-full rounded-full object-cover border-2 border-white"/>
        </div>
      ) : (
        <div className="w-[62px] h-[62px] rounded-full bg-[#f0f0f0] flex items-center justify-center text-2xl border-2 border-dashed border-gray-400">+</div>
      )}
      <span className="text-[11px] mt-1 font-bold">{stories.length>0?"Your Story":"Add Story"}</span>
      {stories.length>0 && <span className="text-[9px] text-gray-500">{24-Math.floor((Date.now()-stories[0].time)/3600000)}h left</span>}
    </div>

    {stories.slice(1).map(s=>(
      <div key={s.id} onClick={()=>setViewStory(s)} className="flex flex-col items-center cursor-pointer min-w-[62px]">
        <div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
          <img src={s.url} className="w-full h-full rounded-full object-cover border-2 border-white"/>
        </div>
        <span className="text-[10px] mt-1">{Math.floor((Date.now()-s.time)/60000)}m</span>
      </div>
    ))}

    <div className="flex flex-col items-center cursor-pointer min-w-[62px]">
      <div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
        <img src="https://i.pravatar.cc/100?img=5" className="w-full h-full rounded-full object-cover border-2 border-white"/>
      </div>
      <span className="text-[10px] mt-1">sneha_99</span>
    </div>
  </div>

      {posts.map(p=>(
        <div key={p.id} className="border-b">
          <div className="flex justify-between items-center px-3 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-full"></div><span className="font-semibold text-[15px]">{p.user}</span><span className="text-[11px] text-gray-500">{p.followers}</span><button onClick={()=>toggleFollow(p.id)} className={`${p.followed?"bg-gray-200 text-black":"bg-[#0095F6] text-white"} px-4 py-1 rounded-full text-[13px] font-semibold`}>{p.followed?"Following":"Follow"}</button></div><span>···</span></div>
          <div className="bg-[#f5f5f5] w-full aspect-square overflow-hidden"><img src={p.image} className="w-full h-full object-cover"/></div>
          <div className="flex items-center gap-4 px-3 py-3">
            <button onClick={()=>toggleLike(p.id)} className="flex items-center gap-1.5"><svg className={`w-[26px] h-[26px] ${p.liked?"fill-red-500 stroke-red-500":"fill-none stroke-black"}`} strokeWidth="1.7" viewBox="0 0 24 24"><path d="M12 21s-6.5-4.35-9-8.5A5 5 0 0112 6a5 5 0 019 6.5C18.5 16.65 12 21 12 21z"/></svg><span className="text-[14px] font-semibold">{p.likes>=1000?(p.likes/1000).toFixed(1)+'K':p.likes}</span></button>
            <button onClick={()=>addComment(p.id)} className="flex items-center gap-1.5"><svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 01-12.5 7.5L3 21l2-5.5A8.5 8.5 0 0121 11.5z"/></svg><span className="text-[14px] font-semibold">{p.comments.toLocaleString()}</span></button>
            <button onClick={()=>addRepost(p.id)} className="flex items-center gap-1.5"><svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg><span className="text-[14px] font-semibold">{p.reposts}</span></button>
            <button onClick={()=>addShare(p)} className="flex items-center gap-1.5"><svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg><span className="text-[14px] font-semibold">{p.shares.toLocaleString()}</span></button>
            <button onClick={()=>toggleSave(p.id)} className="ml-auto"><svg className={`w-[26px] h-[26px] ${p.saved?"fill-black":"fill-none"}`} stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></button>
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t flex justify-around items-center py-3">
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="5.5"/><path d="M21 21l-3.5-3.5"/></svg>
        <div onClick={()=>postRef.current?.click()} className="w-[28px] h-[28px] bg-black rounded-[8px] flex items-center justify-center cursor-pointer"><svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
        <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8.5l6 3.5-6 3.5v-7z"/></svg>
        <div className="w-[26px] h-[26px] rounded-full border-[1.8px] border-black"></div>
      </div>
    </div>
  )
          }
