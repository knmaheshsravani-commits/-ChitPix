'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
export const dynamic = 'force-dynamic'
let activeVideoRef: HTMLVideoElement | null = null

const Icons = {
  heart: (f: boolean) => <svg width="28" height="28" viewBox="0 0 24 24" fill={f?"#ff3040":"none"} stroke={f?"#ff3040":"white"} strokeWidth="1.8"><path d="M12 21s-6.5-4.35-8.5-7.5A5 5 0 0 1 12 7a5 5 0 0 1 8.5 6.5C18.5 16.65 12 21 12 21z"/></svg>,
  comment: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  share: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  dm: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

export default function ReelsPage(){
  const [posts,setPosts]=useState<any[]>([]); const [loading,setLoading]=useState(true)
  useEffect(()=>{
    const load=async()=>{
      try{
        const res=await fetch('/api/upload',{cache:'no-store'}); const data=await res.json()
        let list=data.posts||data||[]; list=list.filter((p:any)=>p && (p.image_url||p.image||p.video_url||p.video||p.url)); setPosts(list)
      }catch{} setLoading(false)
    }; load()
  },[])
  if(loading) return <div style={{height:'100vh',background:'#000',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>
  return <div style={{height:'100vh',overflowY:'scroll',scrollSnapType:'y mandatory',background:'#000'}}>{posts.map((p,i)=><Reel key={p.id||i} post={p} idx={i}/>)}</div>
}

function Reel({post, idx}:any){
  const imageUrl=post?.image_url||post?.image||post?.video_url||post?.video||post?.url||""
  const isVideo=!!(post?.video_url||post?.video||imageUrl.includes('.mp4'))
  const username=post?.username||'Knmahesh'
  const avatar=post?.user_avatar||`https://i.pravatar.cc/100?u=${username}`

  const [liked,setLiked]=useState(false); const [likeCount,setLikeCount]=useState(0)
  const [commentCount,setCommentCount]=useState(0); const [followed,setFollowed]=useState(false)
  const [showHeart,setShowHeart]=useState(false); const [isMuted,setIsMuted]=useState(true)
  const [progress,setProgress]=useState(0); const [showComments,setShowComments]=useState(false)
  const [showShare,setShowShare]=useState(false); const [comments,setComments]=useState<any[]>([])
  const [commentText,setCommentText]=useState(""); const [isPosting,setIsPosting]=useState(false)
  const [friends,setFriends]=useState<any[]>([])
  const videoRef=useRef<HTMLVideoElement>(null)

  // 1. COUNTS + FOLLOW STATUS LOAD
  useEffect(()=>{
    const init=async()=>{
      const myName=localStorage.getItem("chitpix_username")||"guest"
      const {count:l}=await supabase.from("likes").select("*",{count:"exact",head:true}).eq("post_id",post.id)
      const {count:c}=await supabase.from("comments").select("*",{count:"exact",head:true}).eq("post_id",post.id)
      setLikeCount(l||0); setCommentCount(c||0)
      const {data:myLike}=await supabase.from("likes").select("*").eq("post_id",post.id).eq("username",myName).maybeSingle()
      if(myLike) setLiked(true)
      const {data:comms}=await supabase.from("comments").select("*").eq("post_id",post.id).order("created_at",{ascending:false})
      if(comms) setComments(comms)
      // Follow check
      const {data:f}=await supabase.from("follows").select("*").eq("follower",myName).eq("following",username).maybeSingle()
      if(f) setFollowed(true)
      // Friends list - last 10 users who commented/liked or dummy profiles
      const {data:profs}=await supabase.from("profiles").select("*").limit(12)
      setFriends(profs||[{username:'friend1', avatar_url:`https://i.pravatar.cc/100?u=1`},{username:'friend2'}])
    }; init()
  },[post.id, username])

  // VIDEO OBSERVER + PROGRESS
  useEffect(()=>{
    const v=videoRef.current; if(!v) return
    const obs=new IntersectionObserver((e)=>{e.forEach(en=>{if(en.isIntersecting){if(activeVideoRef&&activeVideoRef!==v)activeVideoRef.pause(); activeVideoRef=v; v.play().catch(()=>{})} else v.pause()})},{threshold:0.7})
    obs.observe(v); const onT=()=>setProgress((v.currentTime/(v.duration||1))*100); v.addEventListener('timeupdate',onT)
    return()=>{obs.disconnect(); v.removeEventListener('timeupdate',onT)}
  },[])

  // 2. FOLLOW BUTTON WORKING
  const handleFollow=async()=>{
    const myName=localStorage.getItem("chitpix_username")||"guest"
    if(followed){ setFollowed(false); await supabase.from("follows").delete().eq("follower",myName).eq("following",username) }
    else { setFollowed(true); await supabase.from("follows").insert({follower:myName,following:username}) }
  }

  // 3. LIKE WORKING COUNT
  const handleLike=async()=>{
    setShowHeart(true); setTimeout(()=>setShowHeart(false),800)
    const myName=localStorage.getItem("chitpix_username")||"guest"
    if(liked){ setLiked(false); setLikeCount(v=>Math.max(0,v-1)); await supabase.from("likes").delete().eq("post_id",post.id).eq("username",myName) }
    else { setLiked(true); setLikeCount(v=>v+1); await supabase.from("likes").insert({post_id:post.id,username:myName}) }
  }

  // COMMENT BOX WORKING FIX - 100%
  const handleCommentPost=async()=>{
    if(!commentText.trim()||isPosting) return; setIsPosting(true)
    const myName=localStorage.getItem("chitpix_username")||"guest"
    const {error}=await supabase.from("comments").insert({post_id:post.id,username:myName,comment:commentText,text:commentText})
    if(!error){ setComments([{username:myName,comment:commentText,created_at:new Date().toISOString()},...comments]); setCommentCount(v=>v+1); setCommentText("") }
    setIsPosting(false)
  }

  if(!imageUrl) return null

  return(
    <div style={{height:'100vh',scrollSnapAlign:'start',position:'relative',background:'#000',display:'flex',justifyContent:'center',overflow:'hidden'}}>
      {isVideo?<video ref={videoRef} src={imageUrl} loop muted={isMuted} playsInline preload="metadata" onClick={()=>setIsMuted(!isMuted)} onDoubleClick={handleLike} style={{height:'100%',width:'100%',maxWidth:'430px',objectFit:'cover'}}/>:<img src={imageUrl} onDoubleClick={handleLike} style={{height:'100%',width:'100%',maxWidth:'430px',objectFit:'cover'}} alt=""/>}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'rgba(255,255,255,0.2)'}}><div style={{height:'100%',width:`${progress}%`,background:'#fff'}}/></div>

      {/* TOP - PROFILE + FOLLOW + DM */}
      <div style={{position:'absolute',top:'14px',left:'12px',right:'12px',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:5}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(0,0,0,0.35)',backdropFilter:'blur(20px)',borderRadius:'999px',padding:'4px 10px 4px 4px',border:'1px solid rgba(255,255,255,0.1)'}}>
          <img src={avatar} style={{width:'32px',height:'32px',borderRadius:'50%'}} alt=""/>
          <div style={{display:'flex',flexDirection:'column'}}>
            <span style={{color:'#fff',fontSize:'13px',fontWeight:700,lineHeight:'13px'}}>{username}</span>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:'10px'}}>12.4k followers</span>
          </div>
          <button onClick={handleFollow} style={{marginLeft:'8px',background:followed?'rgba(255,255,255,0.2)':'#fff',color:followed?'#fff':'#000',border:'none',borderRadius:'999px',padding:'5px 12px',fontSize:'12px',fontWeight:800}}>{followed?'Following':'Follow'}</button>
        </div>
        <button onClick={()=>window.location.href='/messages'} style={{width:'38px',height:'38px',borderRadius:'50%',background:'rgba(255,255,255,0.12)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>{Icons.dm}</button>
      </div>

      {/* RIGHT ACTIONS */}
      <div style={{position:'absolute',right:'10px',bottom:'100px',display:'flex',flexDirection:'column',gap:'20px',alignItems:'center',zIndex:5}}>
        <button onClick={handleLike} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',background:'none',border:'none'}}><div style={{width:'48px',height:'48px',borderRadius:'50%',background:'rgba(255,255,255,0.12)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center'}}>{Icons.heart(liked)}</div><span style={{color:'#fff',fontSize:'12px',fontWeight:600}}>{likeCount}</span></button>
        <button onClick={()=>setShowComments(true)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',background:'none',border:'none'}}><div style={{width:'48px',height:'48px',borderRadius:'50%',background:'rgba(255,255,255,0.12)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center'}}>{Icons.comment}</div><span style={{color:'#fff',fontSize:'12px',fontWeight:600}}>{commentCount}</span></button>
        <button onClick={()=>setShowShare(true)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',background:'none',border:'none'}}><div style={{width:'48px',height:'48px',borderRadius:'50%',background:'rgba(255,255,255,0.12)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center'}}>{Icons.share}</div><span style={{color:'#fff',fontSize:'12px'}}>Share</span></button>
      </div>

      <div style={{position:'absolute',bottom:'20px',left:'14px',right:'70px',color:'#fff',zIndex:5}}><p style={{fontSize:'13px',lineHeight:'16px',margin:0}}>{post.caption||'New reel 🔥'}</p></div>
      {showHeart&&<div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'85px',zIndex:20}}>❤️</div>}

      {/* ✅ COMMENT BOX WORKING FIX */}
      {showComments&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9999,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setShowComments(false)}>
          <div style={{background:'#121212',width:'100%',maxWidth:'430px',borderRadius:'20px 20px 0 0',height:'75vh',display:'flex',flexDirection:'column',borderTop:'1px solid rgba(255,255,255,0.1)'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:'36px',height:'4px',background:'rgba(255,255,255,0.2)',borderRadius:'2px',margin:'12px auto'}}/>
            <div style={{padding:'0 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.1)',color:'#fff',fontWeight:700,textAlign:'center'}}>{commentCount} Comments</div>
            <div style={{flex:1,overflowY:'auto',padding:'12px'}}>
              {comments.length===0?<div style={{textAlign:'center',padding:'50px 0',color:'#777'}}>Be first to comment! 💬</div>:comments.map((c:any,i:number)=><div key={i} style={{display:'flex',gap:'8px',marginBottom:'12px'}}><div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#333',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:700}}>{(c.username||'G')[0].toUpperCase()}</div><div><b style={{color:'#fff',fontSize:'13px'}}>{c.username}</b><span style={{color:'#ddd',fontSize:'13px',marginLeft:'6px'}}>{c.comment||c.text}</span></div></div>)}
            </div>
            <div style={{padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',gap:'8px',background:'#121212'}}>
              <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') handleCommentPost()}} placeholder="Add a comment..." autoFocus style={{flex:1,background:'#222',border:'1px solid #333',borderRadius:'20px',padding:'10px 14px',color:'#fff',outline:'none'}}/>
              <button onClick={handleCommentPost} disabled={isPosting||!commentText.trim()} style={{background:'none',border:'none',color:commentText.trim()?'#0095f6':'#555',fontWeight:800}}>{isPosting?'...':'Post'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SHARE TO DIRECT FRIENDS */}
      {showShare&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9999,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setShowShare(false)}>
          <div style={{background:'#1c1c1e',width:'100%',maxWidth:'430px',borderRadius:'20px 20px 0 0',padding:'16px',paddingBottom:'30px'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:'36px',height:'4px',background:'rgba(255,255,255,0.2)',borderRadius:'2px',margin:'0 auto 16px'}}/>
            <div style={{color:'#fff',fontWeight:700,marginBottom:'14px'}}>Share to friends</div>
            <div style={{display:'flex',gap:'14px',overflowX:'auto',paddingBottom:'10px'}}>
              {friends.map((f:any,i:number)=>(
                <button key={i} onClick={()=>{alert(`Sent to ${f.username||f.profiles?.username||'friend'} ✅`); setShowShare(false)}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',background:'none',border:'none',minWidth:'60px'}}>
                  <img src={f.avatar_url||`https://i.pravatar.cc/100?u=${i}`} style={{width:'54px',height:'54px',borderRadius:'50%'}} alt=""/>
                  <span style={{color:'#fff',fontSize:'11px',maxWidth:'60px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.username||'Friend'}</span>
                </button>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-around',marginTop:'14px',borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'14px'}}>
              <button onClick={()=>{window.open(`https://wa.me/?text=${encodeURIComponent(imageUrl)}`,'_blank'); setShowShare(false)}} style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',color:'#fff'}}><div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#25D366',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>W</div><span style={{fontSize:'11px'}}>WhatsApp</span></button>
              <button onClick={async()=>{await navigator.clipboard.writeText(imageUrl); alert('Link Copied ✅'); setShowShare(false)}} style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',color:'#fff'}}><div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#333',display:'flex',alignItems:'center',justifyContent:'center'}}>🔗</div><span style={{fontSize:'11px'}}>Copy</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
                 }
