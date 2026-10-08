'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '../../components/BottomNav'

export default function CommentPage(){
  const params = useParams()
  const id = params.id as string
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState("")
  const [photo, setPhoto] = useState("")
  const [username, setUsername] = useState("Knmahesh")

  useEffect(()=>{
    const saved = localStorage.getItem("posts")
    if(saved){
      const posts = JSON.parse(saved)
      const found = posts.find((p:any)=> String(p.id) === String(id))
      setPost(found)
    }
    const allComments = JSON.parse(localStorage.getItem("chitpix_comments") || "{}")
    setComments(allComments[id] || [
      {id:1, user:"ChitPix Team", text:"M logo fire bro 🔥", time:"2m ago", likes:5, liked:false},
      {id:2, user:"mywork", text:"Super edit!", time:"15m ago", likes:2, liked:false},
    ])
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
    const n = localStorage.getItem("chitpix_username")
    if(n) setUsername(n)
  },[id])

  const saveComments = (newComments:any[])=>{
    setComments(newComments)
    const all = JSON.parse(localStorage.getItem("chitpix_comments") || "{}")
    all[id] = newComments
    localStorage.setItem("chitpix_comments", JSON.stringify(all))

    // Update count in home posts
    const saved = localStorage.getItem("posts")
    if(saved){
      const posts = JSON.parse(saved)
      const idx = posts.findIndex((p:any)=> String(p.id)===String(id))
      if(idx!==-1){
        posts[idx].comments = newComments.length
        localStorage.setItem("posts", JSON.stringify(posts))
      }
    }
  }

  const addComment = ()=>{
    if(!text.trim()) return
    const newC = {
      id: Date.now(),
      user: username,
      text: text,
      time: "Just now",
      likes: 0,
      liked: false,
      avatar: photo
    }
    saveComments([...comments, newC])
    setText("")
  }

  const likeComment = (i:number)=>{
    const u=[...comments]
    u[i].liked =!u[i].liked
    u[i].likes += u[i].liked? 1 : -1
    saveComments(u)
  }

  if(!post) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="w-full bg-white overflow-y-auto" style={{height:'100dvh'}}>
      <div className="max-w-md mx-auto bg-white pb-[140px]">

        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b sticky top-0 bg-white z-10">
          <Link href="/" className="text-xl w-8 h-8 flex items-center justify-center">←</Link>
          <p className="font-bold">Comments</p>
          <div className="ml-auto">
            <button onClick={()=>{
              if(navigator.share){ navigator.share({title:'ChitPix', text:post.caption}) }
            }} className="text-xl">↗️</button>
          </div>
        </div>

        {/* Post Small */}
        <div className="flex gap-3 p-3 border-b">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {post.avatar? <img src={post.avatar} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center font-bold">M</div>}
          </div>
          <div className="flex-1">
            <p className="text-[14px]"><span className="font-bold">{post.username}</span> {post.caption}</p>
            <p className="text-[12px] text-gray-500">{post.time}</p>
          </div>
          <img src={post.image} className="w-12 h-12 object-cover rounded" alt=""/>
        </div>

        {/* Comments List */}
        <div className="p-3">
          {comments.map((c:any,i:number)=>(
            <div key={c.id} className="flex gap-3 py-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[12px] overflow-hidden">
                {c.avatar? <img src={c.avatar} className="w-full h-full object-cover" alt=""/> : c.user[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-[13px] leading-tight">
                  <span className="font-bold mr-2">{c.user}</span>
                  {c.text}
                </p>
                <div className="flex gap-4 mt-1">
                  <span className="text-[11px] text-gray-500">{c.time}</span>
                  <button className="text-[11px] text-gray-500 font-bold">Reply</button>
                </div>
              </div>
              <button onClick={()=>likeComment(i)} className="flex flex-col items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill={c.liked? "red" : "none"} stroke={c.liked? "red" : "gray"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span className="text-[10px] text-gray-500">{c.likes}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add Comment Box - Fixed Bottom */}
        <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t p-3 max-w-md mx-auto flex gap-2 items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            {photo? <img src={photo} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">M</div>}
          </div>
          <input
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && addComment()}
            placeholder={`Add a comment as ${username}...`}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[14px] outline-none"
          />
          <button onClick={addComment} disabled={!text.trim()} className={`font-bold text-[14px] ${text.trim()? 'text-blue-500' : 'text-blue-200'}`}>Post</button>
        </div>

      </div>
      <BottomNav />
    </div>
  )
                  }
