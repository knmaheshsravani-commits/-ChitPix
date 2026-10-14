"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function CommentAZ({postId, isOpen, onClose}:{postId:string, isOpen:boolean, onClose:()=>void}) {
  const router = useRouter()
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<any|null>(null)
  const me = {username:"knmahesh", photo:"https://i.pravatar.cc/100?u=mahesh"}

  useEffect(()=>{
    if(!isOpen) return
    document.body.style.overflow="hidden"
    load()
    return ()=>{ document.body.style.overflow="auto" }
  },[isOpen])

  const load = async () => {
    const { data } = await supabase.from("comments").select("*").eq("post_id", postId).order("created_at",{ascending:false})
    if(data){
      const { data: likes } = await supabase.from("comment_likes").select("comment_id").eq("username", me.username)
      const set = new Set(likes?.map((l:any)=>l.comment_id))
      const parents = data.filter((c:any)=>!c.parent_id).map((c:any)=>({...c, liked:set.has(c.id), replies:data.filter((x:any)=>x.parent_id===c.id).map((r:any)=>({...r, liked:set.has(r.id)}))}))
      setComments(parents)
    }
  }

  const post = async () => {
    if(!text.trim()) return
    const savedText = text.trim()
    setText(""); setReplyTo(null)
    setComments(prev=>replyTo?prev.map(p=>p.id===replyTo.id?{...p, replies:[...p.replies, {id:Date.now().toString(), username:me.username, user_photo:me.photo, text:savedText, likes:0, created_at:new Date().toISOString()}]}:p):[{id:Date.now().toString(), username:me.username, user_photo:me.photo, text:savedText, likes:0, replies:[], created_at:new Date().toISOString()},...prev])
    await supabase.from("comments").insert({post_id:postId, username:me.username, user_photo:me.photo, text:savedText, parent_id:replyTo?.id||null})
    load()
  }

  const like = async (c:any) => {
    const liked = c.liked
    setComments(prev=>prev.map(p=>{
      if(p.id===c.id) return {...p, likes:liked?p.likes-1:p.likes+1, liked:!liked}
      return {...p, replies:p.replies?.map((r:any)=>r.id===c.id?{...r, likes:liked?r.likes-1:r.likes+1, liked:!liked}:r)}
    }))
    if(liked){ await supabase.from("comment_likes").delete().eq("comment_id",c.id).eq("username",me.username); await supabase.from("comments").update({likes:c.likes-1}).eq("id",c.id) }
    else { await supabase.from("comment_likes").insert({comment_id:c.id, username:me.username}); await supabase.from("comments").update({likes:c.likes+1}).eq("id",c.id) }
  }

  const timeAgo = (t:string)=>{ const d=Math.floor((Date.now()-new Date(t).getTime())/1000); if(d<60) return "now"; if(d<3600) return `${Math.floor(d/60)}m`; if(d<86400) return `${Math.floor(d/3600)}h`; return `${Math.floor(d/86400)}d` }

  if(!isOpen) return null
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex justify-center items-end" onClick={onClose}>
      <div className="w-full max-w-[470px] bg-[#121212] rounded-t-[28px] h-[82vh] flex flex-col border-t border-zinc-800" onClick={e=>e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-800">
          <div className="w-12 h-1.5 bg-zinc-600 rounded-full mx-auto mb-4"></div>
          <div className="flex justify-between"><h3 className="font-bold text-white">Comments • {comments.reduce((a,c)=>a+1+(c.replies?.length||0),0)}</h3><span className="text-[11px] text-zinc-500">💥 Lifetime</span></div>
          {replyTo && <div className="mt-3 bg-zinc-800 rounded-full px-3 py-1.5 flex justify-between text-[12px] text-zinc-300"><span>Replying to <b className="text-white">{replyTo.username}</b></span><button onClick={()=>setReplyTo(null)}>✕</button></div>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {comments.map(c=>(
            <div key={c.id}><div className="flex gap-3"><img src={c.user_photo} onClick={()=>router.push(`/profile/${c.username}`)} className="w-8 h-8 rounded-full cursor-pointer"/><div className="flex-1"><p className="text-[13.5px] text-white"><b onClick={()=>router.push(`/profile/${c.username}`)} className="mr-2 cursor-pointer hover:underline">{c.username}</b>{c.text}</p><div className="flex gap-4 mt-1 text-[11px] text-zinc-500"><span>{timeAgo(c.created_at)}</span><span>{c.likes} likes</span><button onClick={()=>setReplyTo(c)} className="font-bold">Reply</button></div></div><button onClick={()=>like(c)} className="pt-1 active:scale-125">❤️</button></div>
            {c.replies?.map((r:any)=><div key={r.id} className="flex gap-3 ml-11 mt-3"><img src={r.user_photo} onClick={()=>router.push(`/profile/${r.username}`)} className="w-6 h-6 rounded-full cursor-pointer"/><div className="flex-1"><p className="text-[12.5px] text-white"><b className="mr-2">{r.username}</b>{r.text}</p><div className="flex gap-3 mt-1 text-[10px] text-zinc-500"><span>{timeAgo(r.created_at)}</span><span>{r.likes} likes</span><button onClick={()=>like(r)} className={r.liked?"text-red-500":""}>{r.liked?"Liked":"Like"}</button></div></div></div>)}</div>
          ))}
        </div>
        <div className="p-3 border-t border-zinc-800 flex gap-2 items-center"><img src={me.photo} className="w-8 h-8 rounded-full"/><div className="flex-1 bg-[#2a2a2a] rounded-full flex items-center px-4 h-[44px]"><input value={text} onChange={e=>setText(e.target.value)} placeholder={replyTo?`Reply to ${replyTo.username}...`:"Add a comment for lifetime... 💬"} className="flex-1 bg-transparent text-[13px] outline-none text-white" onKeyDown={e=>e.key==="Enter"&&post()}/></div><button onClick={post} disabled={!text.trim()} className="bg-white disabled:bg-zinc-700 text-black font-bold px-5 h-[44px] rounded-full text-[13px]">Post</button></div>
      </div>
    </div>
  )
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 }
