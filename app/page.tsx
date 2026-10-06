"use client"
import { useState, useRef } from "react"

export default function Page(){
  const storyRef = useRef<any>(null)
  const [showMsgg,setShowMsgg] = useState(false)
  const [tab,setTab] = useState("likes")
  const [viewStory,setViewStory] = useState<any>(null)

  const [stories,setStories] = useState([
    {id:1,time:Date.now()-100000,pic:"https://i.pravatar.cc/100?img=1"},
    {id:2,time:Date.now()-200000,pic:"https://i.pravatar.cc/100?img=2"},
  ])

  const [posts,setPosts] = useState<any[]>([
    {id:1,user:"sneha_99",likes:120,liked:false,saved:false,image:"https://picsum.photos/500/500?1",caption:"My fox pic 🦊",comments:[]},
    {id:2,user:"arjun_77",likes:89,liked:false,saved:false,image:"https://picsum.photos/500/500?2",caption:"Nature vibes",comments:[]},
  ])

  const likesNotifs = [
    {user:"sneha_99", action:"liked your post", time:"2h", pic:"https://i.pravatar.cc/100?img=5"},
    {user:"arjun_77", action:"liked your fox photo", time:"5h", pic:"https://i.pravatar.cc/100?img=8"},
  ]

  const [replyLikes, setReplyLikes] = useState([
    {id:1, user:"sneha_99", text:"Nice fox! 🦊 Where is this?", time:"1h", likes:12, liked:false, pic:"https://i.pravatar.cc/100?img=5"},
    {id:2, user:"priya_22", text:"Super pic bro! 🔥", time:"3h", likes:5, liked:false, pic:"https://i.pravatar.cc/100?img=9"},
  ])
  const [replyText,setReplyText] = useState("")
  const [replyingTo, setReplyingTo] = useState<number|null>(null)
  const [replies, setReplies] = useState<any[]>([])

  const toggleReplyLike = (id:number)=>{
    setReplyLikes(replyLikes.map((r:any)=> r.id===id? {...r, liked:!r.liked, likes: r.liked? r.likes-1 : r.likes+1} : r))
  }
  const sendReply = (toId:number, toUser:string)=>{
    if(!replyText.trim()) return
    const newReply = {id:Date.now(), parentId:toId, user:"you", text:replyText, to:toUser, time:"now"}
    setReplies([...replies, newReply])
    setReplyText("")
    setReplyingTo(null)
  }
  const toggleLike = (id:number)=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked? p.likes-1:p.likes+1}:p))
  const addComment = (id:number)=> {
    const txt = prompt("Add comment")
    if(!txt) return
    setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments,{user:"you",text:txt}]}:p))
  }

  return(
    <div className="max-w-[480px] mx-auto bg-white min-h-screen">
      {showMsgg && (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex items-center gap-3 p-3 border-b">
          <button onClick={()=>setShowMsgg(false)}>←</button><b>Notifications</b>
        </div>
        <div className="flex border-b overflow-x-auto">
          <button onClick={()=>setTab("likes")} className={`px-4 py-3 font-semibold ${tab==="likes"?"border-b-2 border-black":""}`}>Likes</button>
          <button onClick={()=>setTab("reply")} className={`px-4 py-3 font-semibold ${tab==="reply"?"border-b-2 border-black":""}`}>Reply</button>
          <button onClick={()=>setTab("msgs")} className={`px-4 py-3 font-semibold ${tab==="msgs"?"border-b-2 border-black":""}`}>Msgs</button>
          <button onClick={()=>setTab("saved")} className={`px-4 py-3 font-semibold ${tab==="saved"?"border-b-2 border-black":""}`}>Saved</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tab==="likes" && likesNotifs.map((x:any,i:number)=>(
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b">
              <img src={x.pic} className="w-12 h-12 rounded-full"/>
              <div className="flex-1"><span className="font-bold">{x.user}</span> {x.action} <span className="text-gray-500 text-xs">{x.time}</span></div>
            </div>
          ))}
          {tab==="reply" && replyLikes.map((x:any)=>(
            <div key={x.id} className="flex gap-3 px-4 py-3 border-b">
              <img src={x.pic} className="w-12 h-12 rounded-full"/>
              <div className="flex-1">
                <b>{x.user}</b> <div className="text-[14px]">{x.text}</div>
                <div className="text-xs text-gray-500 flex gap-2 mt-1">
                  <span>{x.time}</span>
                  <button onClick={()=>toggleReplyLike(x.id)}>❤️ {x.likes}</button>
                  <button onClick={()=>setReplyingTo(x.id)} className="bg-blue-100 px-2 rounded font-bold">Reply</button>
                </div>
                {replyingTo===x.id && (
                  <div>
                    <div className="flex gap-2 mt-2">
                      <input value={replyText} onChange={(e:any)=>setReplyText(e.target.value)} className="flex-1 border rounded-full px-3 py-1.5 text-[13px]" placeholder={`Reply to ${x.user}...`}/>
                      <button onClick={()=>sendReply(x.id, x.user)} className="bg-black text-white px-4 py-1.5 rounded-full text-[13px] font-bold">Send</button>
                    </div>
                    {replies.filter((r:any)=>r.parentId===x.id).map((r:any)=>(
                      <div key={r.id} className="mt-2 ml-2 pl-3 border-l-2 border-blue-300 text-[13px]">
                        <b>you → {r.to}</b> {r.text} <span className="text-[11px] text-gray-400">{r.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {tab==="msgs" && (<div className="p-4 text-center text-gray-500 text-[14px]">No messages yet!</div>)}
          {tab==="saved" && (
            posts.filter((p:any)=>p.saved).length===0? <div className="p-10 text-center text-gray-500">No saved posts</div> : <div>{posts.filter((p:any)=>p.saved).map((p:any)=><img key={p.id} src={p.image} className="w-full"/>)}</div>
          )}
        </div>
      </div>
      )}

      <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b">
        <div onClick={()=>storyRef.current?.click()} className="flex flex-col items-center">
          <div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-pink-600"><div className="bg-white rounded-full w-full h-full flex items-center justify-center">+</div></div>
          <span className="text-[10px] mt-1">Your story</span>
        </div>
        {stories.map(s=>(
          <div key={s.id} onClick={()=>setViewStory(s)} className="flex flex-col items-center">
            <div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={s.pic} className="w-full h-full rounded-full border-2 border-white"/></div>
            <span className="text-[10px] mt-1">{Math.floor((Date.now()-s.time)/60000)}m</span>
          </div>
        ))}
      </div>

      {posts.map(p=>(
        <div key={p.id} className="border-b">
          <div className="flex justify-between items-center px-3 py-3"><div className="flex items-center gap-2"><div className="w-[26px] h-[26px] rounded-full border"><img src={`https://i.pravatar.cc/100?img=${p.id+10}`} className="rounded-full"/></div><b className="text-[14px]">{p.user}</b></div><button onClick={()=>setShowMsgg(true)}>❤️</button></div>
          <div className="bg-[#f5f5f5] w-full aspect-square overflow-hidden"><img src={p.image} className="w-full h-full object-cover"/></div>
          <div className="flex items-center gap-3 px-3 py-2">
            <button onClick={()=>toggleLike(p.id)} className="flex items-center gap-1">{p.liked?"❤️":"🤍"} {p.likes}</button>
            <button onClick={()=>addComment(p.id)} className="flex items-center gap-1">💬 {p.comments.length}</button>
          </div>
          <div className="px-3 pb-3 text-[14px]"><b>{p.user}</b> {p.caption}</div>
        </div>
      ))}
    </div>
  )
          }
