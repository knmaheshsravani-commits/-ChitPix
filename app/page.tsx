"use client"
import { useState, useRef } from "react"
import Link from "next/link"

export default function Page(){
  const [stories, setStories] = useState([{id:0, name:"Your story", me:true},{id:1,name:"user_1"},{id:2,name:"user_2"},{id:3,name:"user_3"}])
  const [viewStory, setViewStory] = useState<any>(null)
  const [posts, setPosts] = useState([
    {id:1, user:"chitpix_user", following:false, liked:false, likes:124, caption:"Welcome to ChitPix 🚀", comments:["🔥 super bro","nice!"], showComments:false},
    {id:2, user:"sneha_99", following:false, liked:false, likes:89, caption:"Sunset vibes ✨", comments:["Wow 😍"], showComments:false},
    {id:3, user:"bunny_official", following:false, liked:false, likes:210, caption:"New post 🔥", comments:["Kiraak bro"], showComments:false},
  ])
  const [commentText, setCommentText] = useState("")
  const [shareOpen, setShareOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const addStory = (e:any)=>{
    const file = e.target.files[0]
    if(!file) return
    setStories([...stories, {id:Date.now(), name:`you_${Date.now()}`, me:false} as any])
    alert("Story added! ✅")
  }
  const toggleLike = (id:number)=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes: p.liked? p.likes-1 : p.likes+1} : p))
  const addComment = (id:number)=>{
    if(!commentText.trim()) return
    setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments, commentText]} : p))
    setCommentText("")
  }

  return(
    <div className="max-w-[500px] mx-auto bg-white min-h-screen pb-[70px]">
      <div className="h-[58px] px-4 flex justify-between items-center border-b sticky top-0 bg-white z-40">
        <h1 className="font-black text-[24px] tracking-tighter">ChitPix.com</h1>
        <div className="flex gap-5">
          <Link href="/notifications"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M12 21s-6.5-4.35-8.5-8.15C2 9.5 3.5 5 8 5c2.1 0 3.2 1.1 4 2.2C12.8 6.1 14 5 16 5c4.5 0 6 4.5 4.5 7.85C18.5 16.65 12 21 12 21z"/></svg></Link>
          <Link href="/messages"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg></Link>
        </div>
      </div>

      <div className="flex gap-4 p-3 overflow-x-auto border-b">
        {stories.map((s:any, i)=>(
          <div key={s.id} className="flex flex-col items-center min-w-[66px]" onClick={()=> i===0? fileRef.current?.click() : setViewStory(s)}>
            <div className={`w-[62px] h-[62px] rounded-full p-[2px] ${s.me? 'bg-gray-200' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'}`}>
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">{s.me? <span className="text-2xl">+</span> : null}</div>
            </div>
            <span className="text-[11px] mt-1 truncate w-[66px] text-center">{s.name}</span>
          </div>
        ))}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={addStory}/>
      </div>

      {posts.map(post=>(
        <div key={post.id} className="border-b">
          <div className="flex justify-between p-3 items-center">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-black rounded-full"/>
              <b className="text-sm">{post.user}</b>
              <button onClick={()=>setPosts(posts.map(p=> p.id===post.id? {...p, following:!p.following}:p))} className={`text-[11px] font-bold px-3 py-1 rounded-full border ${post.following? 'bg-white text-black border-gray-300' : 'bg-blue-500 text-white border-blue-500'}`}>{post.following? 'Following' : 'Follow'}</button>
            </div>
            <b>•••</b>
          </div>
          <div className="h-[380px] bg-gray-100 flex items-center justify-center"><span className="text-gray-400">Post Image</span></div>
          <div className="flex gap-4 p-3">
            <button onClick={()=>toggleLike(post.id)}><svg width="26" height="26" viewBox="0 0 24 24" fill={post.liked?"red":"none"} stroke={post.liked?"red":"black"} strokeWidth="2"><path d="M12 21s-6.5-4.35-8.5-8.15C2 9.5 3.5 5 8 5c2.1 0 3.2 1.1 4 2.2C12.8 6.1 14 5 16 5c4.5 0 6 4.5 4.5 7.85C18.5 16.65 12 21 12 21z"/></svg></button>
            <button onClick={()=>setPosts(posts.map(p=> p.id===post.id? {...p, showComments:!p.showComments}:p))}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-3.9 7.1L18 21l-3.2-1.9A8.5 8.5 0 1 1 21 11.5z"/></svg></button>
            <button onClick={()=>setShareOpen(true)}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          </div>
          <div className="px-3 pb-1 font-bold text-sm">{post.likes} likes</div>
          <div className="px-3 pb-3 text-sm"><b>{post.user}</b> {post.caption}</div>
          {post.showComments && (
            <div className="px-3 pb-3 border-t pt-2">
              {post.comments.map((c,i)=><div key={i} className="text-sm py-1"><b>user_{i}</b> {c}</div>)}
              <div className="flex gap-2 mt-2">
                <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 border rounded-full px-3 py-1 text-sm outline-none"/>
                <button onClick={()=>addComment(post.id)} className="text-blue-500 font-bold text-sm">Post</button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto h-[62px] bg-white border-t flex justify-around items-center z-50">
        <Link href="/"><svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></Link>
        <Link href="/search"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></Link>
        <Link href="/create"><div className="w-[32px] h-[32px] bg-black rounded-xl flex items-center justify-center"><span className="text-white text-[22px]">+</span></div></Link>
        <Link href="/reels"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10 8 16 12 10 16 10 8" fill="black"/></svg></Link>
        <Link href="/profile"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg></Link>
      </div>

      {viewStory && (<div className="fixed inset-0 bg-black z-[100] flex flex-col" onClick={()=>setViewStory(null)}><div className="p-4 flex justify-between text-white"><span>{viewStory.name}</span><span>X</span></div><div className="flex-1 bg-gray-800 flex items-center justify-center text-white">Story {viewStory.name}</div></div>)}
      {shareOpen && (<div className="fixed inset-0 bg-black/50 z-[100] flex items-end" onClick={()=>setShareOpen(false)}><div className="bg-white w-full max-w-[500px] mx-auto rounded-t-[20px] p-5" onClick={e=>e.stopPropagation()}><h3 className="font-bold text-center mb-4">Share</h3><button onClick={()=>{navigator.clipboard.writeText("https://www.chitpix.com"); alert("Link copied!"); setShareOpen(false)}} className="w-full border py-3 rounded-xl font-bold">Copy Link</button></div></div>)}
    </div>
  )
}
