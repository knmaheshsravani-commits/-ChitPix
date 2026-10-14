"use client"
import { useState, useEffect } from "react"

type Comment = {
  id: string
  user: string
  photo: string
  text: string
  likes: number
  time: string
  replies: {user:string, text:string}[]
}

export default function CommentsAZ({postId, isOpen, onClose, username, userPhoto}:{postId:string, isOpen:boolean, onClose:()=>void, username:string, userPhoto:string}) {
  const [comments, setComments] = useState<Comment[]>([
    {id:"1", user:"knmahesh", photo:"https://i.pravatar.cc/100?u=1", text:"Bagundi bro 🔥", likes:12, time:"2h", replies:[]},
    {id:"2", user:"arjun", photo:"https://i.pravatar.cc/100?u=2", text:"200MB quality mass!", likes:5, time:"1h", replies:[]},
  ])
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<string|null>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  useEffect(()=>{
    if(isOpen) document.body.style.overflow="hidden"
    else document.body.style.overflow="auto"
    return ()=>{ document.body.style.overflow="auto" }
  },[isOpen])

  const handleSend = () => {
    if(!text.trim()) return
    if(replyTo){
      setComments(prev=>prev.map(c=>c.id===replyTo?{...c,replies:[...c.replies,{user:username||"you",text}]}:c))
      setReplyTo(null)
    } else {
      const newComment: Comment = {
        id: Date.now().toString(),
        user: username||"you",
        photo: userPhoto||"https://i.pravatar.cc/100?u=me",
        text, likes:0, time:"now", replies:[]
      }
      setComments(prev=>[newComment,...prev])
    }
    setText("")
  }

  const handleLikeComment = (id:string) => {
    const isLiked = likedComments.has(id)
    const newSet = new Set(likedComments)
    if(isLiked) newSet.delete(id)
    else newSet.add(id)
    setLikedComments(newSet)
    setComments(prev=>prev.map(c=>c.id===id?{...c,likes: isLiked? c.likes-1 : c.likes+1}:c))
  }

  if(!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 flex justify-center">
      <div className="w-full max-w-[470px] h-[100dvh] flex flex-col justify-end" onClick={onClose}>
        <div className="bg-zinc-900 w-full rounded-t-[24px] h-[85vh] flex flex-col border-t border-zinc-800" onClick={e=>e.stopPropagation()}>
          <div className="p-4 border-b border-zinc-800">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3"></div>
            <h3 className="text-center font-bold text-[15px]">{comments.length} Comments</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map(c=>(
              <div key={c.id} className="flex gap-3">
                <img src={c.photo} alt="" className="w-8 h-8 rounded-full mt-1"/>
                <div className="flex-1">
                  <p className="text-[13px]"><b>{c.user}</b> {c.text}</p>
                  <div className="flex gap-4 mt-1 text-[11px] text-zinc-500">
                    <span>{c.time}</span>
                    <span className="font-bold">{c.likes} likes</span>
                    <button onClick={()=>setReplyTo(c.id)} className="font-bold text-zinc-300">Reply</button>
                  </div>
                  {c.replies.map((r,i)=><div key={i} className="mt-2 text-[12px]"><b>{r.user}</b> {r.text}</div>)}
                  {replyTo===c.id && <p className="text-[11px] text-blue-400 mt-1">Replying to {c.user}</p>}
                </div>
                <button onClick={()=>handleLikeComment(c.id)} className="self-start pt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={likedComments.has(c.id)?"#ff3040":"none"} stroke={likedComments.has(c.id)?"#ff3040":"#666"} strokeWidth="1.6"><path d="M12 21s-6.5-4.35-8.5-7.5C1.5 10.5 2.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4.5 0 5.5 4.5 3.5 7.5C18.5 16.65 12 21 12 21z"/></svg>
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-800 bg-zinc-900 flex gap-2 items-center">
            <img src={userPhoto||"https://i.pravatar.cc/100?u=me"} alt="" className="w-8 h-8 rounded-full"/>
            <div className="flex-1 bg-zinc-800 rounded-full flex items-center px-4 h-10">
              <input value={text} onChange={e=>setText(e.target.value)} placeholder={replyTo?"Reply...":"Add a comment..."} className="flex-1 bg-transparent text-[13px] outline-none text-white" onKeyDown={e=>e.key==="Enter"&&handleSend()}/>
              <button onClick={handleSend} className="text-blue-500 font-bold text-[13px] ml-2">Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
