'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export default function PostCard({ post }: any) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [saveCount, setSaveCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('chitpix_admin') === 'true') {
      setIsAdmin(true)
    }
    const loadCounts = async () => {
      const { count: l } = await supabase.from("likes").select("*",{count:"exact",head:true}).eq("post_id", post.id)
      const { count: c } = await supabase.from("comments").select("*",{count:"exact",head:true}).eq("post_id", post.id)
      const { count: s } = await supabase.from("saves").select("*",{count:"exact",head:true}).eq("post_id", post.id)
      setLikeCount(l||0)
      setCommentCount(c||0)
      setSaveCount(s||0)
      
      const myName = localStorage.getItem("chitpix_username")
      if(myName){
        const { data: myLike } = await supabase.from("likes").select("*").eq("post_id", post.id).eq("username", myName).maybeSingle()
        if(myLike) setLiked(true)
        const { data: mySave } = await supabase.from("saves").select("*").eq("post_id", post.id).eq("username", myName).maybeSingle()
        if(mySave) setSaved(true)
        const { data: comms } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at",{ascending:false})
        if(comms) setComments(comms)
      }
    }
    loadCounts()
  }, [post.id])

  // REELS FIX - OKKA VIDEO MATHRAME PLAY
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(()=>{})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.7 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/admin/delete-post', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id })
    })
    if (res.ok) { alert('Deleted! ✅'); window.location.reload() } else { alert('Failed') }
  }

  const handleLike = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if(liked){ setLiked(false); setLikeCount(v=>Math.max(0,v-1)); await supabase.from("likes").delete().eq("post_id", post.id).eq("username", myName) }
    else { setLiked(true); setLikeCount(v=>v+1); await supabase.from("likes").insert({post_id: post.id, username: myName}) }
  }

  const handleSave = async () => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    if(saved){ setSaved(false); setSaveCount(v=>Math.max(0,v-1)); await supabase.from("saves").delete().eq("post_id", post.id).eq("username", myName) }
    else { setSaved(true); setSaveCount(v=>v+1); await supabase.from("saves").insert({post_id: post.id, username: myName}) }
  }

  const handleCommentPost = async () => {
    if(!commentText.trim()) return
    const myName = localStorage.getItem("chitpix_username") || "guest"
    await supabase.from("comments").insert({post_id: post.id, username: myName, comment: commentText, text: commentText})
    setComments([{username: myName, comment: commentText, text: commentText}, ...comments])
    setCommentCount(v=>v+1)
    setCommentText("")
  }

  const handleShare = () => { setShareCount(v=>v+1); navigator.clipboard.writeText(window.location.href); alert("Link copied! ✅") }

  const imageUrl = post.image_url || post.image || post.video_url || post.video || post.url
  const isVideo = post.isVideo || post.video_url || post.video || post.type === 'reels' || imageUrl?.endsWith('.mp4') || imageUrl?.endsWith('.mov')
  const username = post.username || post.profiles?.username || 'Knmahesh'
  const avatar = post.user_avatar || post.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${username}`
  const caption = post.caption || ''

  if (!imageUrl) return null

  return (
    <div style={{ background: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', margin: '0 auto 16px', maxWidth: '470px', overflow:'hidden' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px' }}>
        <img src={avatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="av" />
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{username}</div>
        {isAdmin && (
          <button onClick={handleDelete} style={{ marginLeft: 'auto', background: '#ff3040', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            🗑️ Delete
          </button>
        )}
      </div>

      {isVideo ? (
        <video 
          ref={videoRef}
          src={imageUrl} 
          loop 
          muted 
          playsInline
          onClick={(e) => {
            const v = e.currentTarget as HTMLVideoElement
            v.muted = !v.muted
          }}
          style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', background:'#000' }} 
        />
      ) : (
        <img src={imageUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', background:'#fafafa' }} alt="post" onError={(e:any)=>e.target.style.display='none'} />
      )}

      <div style={{ padding: '10px 12px', display: 'flex', gap: '18px', alignItems: 'center', width:'100%' }}>
        <button onClick={handleLike} style={{display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked?"red":"none"} stroke={liked?"red":"black"} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span style={{fontSize:'14px', fontWeight:600}}>{likeCount}</span>
        </button>
        <button onClick={()=>setShowComments(true)} style={{display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span style={{fontSize:'14px', fontWeight:600}}>{commentCount}</span>
        </button>
        <button onClick={handleShare} style={{display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          <span style={{fontSize:'14px', fontWeight:600}}>{shareCount}</span>
        </button>
        <button onClick={handleSave} style={{display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer', marginLeft:'auto'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved?"black":"none"} stroke="black" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          <span style={{fontSize:'14px', fontWeight:600}}>{saveCount}</span>
        </button>
      </div>
      
      {caption && <div style={{padding:'0 12px 12px', fontSize:'14px'}}><b style={{marginRight:'6px'}}>{username}</b>{caption}</div>}

      {showComments && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
          <div style={{background:'#fff', width:'100%', maxWidth:'470px', borderRadius:'16px 16px 0 0', maxHeight:'70vh', display:'flex', flexDirection:'column'}}>
            <div style={{padding:'14px', borderBottom:'1px solid #dbdbdb', display:'flex', justifyContent:'space-between'}}><b>Comments {commentCount}</b><button onClick={()=>setShowComments(false)} style={{border:'none', background:'none', fontSize:'18px'}}>✕</button></div>
            <div style={{flex:1, overflowY:'auto', padding:'12px'}}>
              {comments.length===0 && <p style={{textAlign:'center', color:'#999', padding:'30px 0'}}>0 comments - Be first!</p>}
              {comments.map((c,i)=>(<div key={i} style={{marginBottom:'8px', fontSize:'14px'}}><b>{c.username || c.profiles?.username}</b> {c.comment || c.text}</div>))}
            </div>
            <div style={{padding:'10px', borderTop:'1px solid #dbdbdb', display:'flex', gap:'8px'}}>
              <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." style={{flex:1, background:'#efefef', border:'none', borderRadius:'20px', padding:'10px 14px', fontSize:'14px', outline:'none'}}/>
              <button onClick={handleCommentPost} style={{color:'#0095f6', fontWeight:700, border:'none', background:'none', cursor:'pointer'}}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
    }
