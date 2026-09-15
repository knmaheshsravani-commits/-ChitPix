"use client"
import { useState } from "react"

export default function Home() {
  const [posts, setPosts] = useState([
    { id: 1, user: "mahesh-07", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600", likes: 12, liked: false, caption: "First post 🔥", comments: ["Nice!", "Wow", "Super"], showComments: false },
    { id: 2, user: "sravani", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", likes: 5, liked: false, caption: "Beach vibes 🌊", comments: [], showComments: false },
  ])
  const [commentInputs, setCommentInputs] = useState<any>({})

  const handleShare = async (p: any) => {
    const shareUrl = p.img
    const shareText = `${p.user}: ${p.caption}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Chit-Pix', text: shareText, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied! 🚀 - ' + shareUrl.substring(0,30)+'...')
      }
    } catch {}
  }

  return (
    <div style={{background:'#000', color:'#fff', minHeight:'100vh', paddingBottom:'70px'}}>
      {/* Top Bar */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', borderBottom:'1px solid #222', position:'sticky', top:0, background:'#000', zIndex:10}}>
        <h1 style={{fontSize:'28px', fontWeight:'bold', margin:0}}>ChitPix</h1>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span>@Mahesh-07</span>
          <button style={{background:'#ff0000', color:'#fff', border:'none', padding:'6px 14px', borderRadius:'20px', fontWeight:'bold'}}>Logout</button>
        </div>
      </div>

      {/* Posts */}
      <div style={{maxWidth:'500px', margin:'0 auto'}}>
        {posts.map((p)=>(
          <div key={p.id} style={{borderBottom:'1px solid #222', background:'#0a0a0a', marginBottom:'10px'}}>
            <div style={{padding:'12px', fontWeight:'bold'}}>@{p.user}</div>
            <img src={p.img} style={{width:'100%', height:'420px', objectFit:'cover'}} />
            <div style={{display:'flex', gap:'18px', padding:'12px', alignItems:'center'}}>
              <button onClick={()=>setPosts(posts.map(x=> x.id===p.id? {...x, likes: x.liked? x.likes-1 : x.likes+1, liked: !x.liked} : x))} style={{background:'none', border:'none', color:'#fff', fontSize:'22px', display:'flex', alignItems:'center', gap:'6px'}}>
                <span style={{color: p.liked? '#ff0000' : '#fff'}}>❤️</span> {p.likes}
              </button>
              <button onClick={()=>setPosts(posts.map(x=> x.id===p.id? {...x, showComments: !x.showComments} : x))} style={{background:'none', border:'none', color:'#fff', fontSize:'22px', display:'flex', alignItems:'center', gap:'6px'}}>
                💬 {p.comments.length}
              </button>
              <button onClick={()=>handleShare(p)} style={{background:'none', border:'none', color:'#fff', fontSize:'22px', marginLeft:'auto'}}>🚀</button>
            </div>
            <div style={{padding:'0 12px 12px', fontSize:'15px'}}><b>@{p.user}</b> {p.caption}</div>
            
            {p.showComments && (
              <div style={{padding:'0 12px 12px'}}>
                {p.comments.map((c,i)=>(<div key={i} style={{fontSize:'14px', marginBottom:'4px', color:'#ccc'}}>• {c}</div>))}
                <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                  <input value={commentInputs[p.id]||''} onChange={(e)=>setCommentInputs({...commentInputs, [p.id]: e.target.value})} placeholder="Add comment..." style={{flex:1, background:'#1a1a1a', border:'1px solid #333', borderRadius:'20px', padding:'8px 12px', color:'#fff'}} />
                  <button onClick={()=>{
                    if(!commentInputs[p.id]) return
                    setPosts(posts.map(x=> x.id===p.id? {...x, comments: [...x.comments, commentInputs[p.id]]} : x))
                    setCommentInputs({...commentInputs, [p.id]: ''})
                  }} style={{background:'#0095f6', border:'none', borderRadius:'20px', padding:'8px 14px', color:'#fff'}}>Post</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#000', borderTop:'1px solid #222', display:'flex', justifyContent:'space-around', padding:'12px 0', zIndex:10}}>
        <span style={{fontSize:'26px'}}>🏠</span>
        <span style={{fontSize:'26px'}}>🔍</span>
        <span style={{fontSize:'26px'}}>🎬</span>
        <span style={{fontSize:'26px'}}>👤</span>
      </div>
    </div>
  )
            }
