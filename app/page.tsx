"use client"
import { useState } from "react"

export default function Home() {
  const [tab, setTab] = useState('home')
  const [posts, setPosts] = useState([
    { id: 1, user: "mahesh-07", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600", likes: 12, liked: false, caption: "First post 🔥", comments: ["Nice!"] },
    { id: 2, user: "sravani", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", likes: 5, liked: false, caption: "Beach day 🌊", comments: [] },
    { id: 3, user: "mahesh-07", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600", likes: 20, liked: false, caption: "Sunset ❤️", comments: ["Super"] },
  ])
  const [search, setSearch] = useState("")
  const [cInputs, setCInputs] = useState<any>({})
  const [showC, setShowC] = useState<any>({})

  const handleShare = async (p:any) => {
    try {
      if (navigator.share) await navigator.share({title:'Chit-Pix', text:p.caption, url:p.img})
      else { await navigator.clipboard.writeText(p.img); alert('Link copied 🚀') }
    } catch {}
  }
  const filtered = posts.filter(p => p.user.toLowerCase().includes(search.toLowerCase()) || p.caption.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{background:'#000', color:'#fff', minHeight:'100vh', paddingBottom:'70px'}}>
      {/* HEADER WITH YOUR LOGO DESIGN */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 15px', borderBottom:'1px solid #222', position:'sticky', top:0, background:'#000', zIndex:20}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg, #ff7a00, #ff3ca0, #8a2be2, #3a5bff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'bold'}}>📸</div>
          <h1 style={{margin:0, fontSize:'26px', fontWeight:'900', letterSpacing:'-0.5px'}}>
            <span style={{color:'#fff'}}>Chit</span><span style={{background:'linear-gradient(90deg, #ff7a00, #ff00a0, #a855f7)', WebkitBackgroundClip:'text', color:'transparent'}}>pix</span>
          </h1>
        </div>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}><span style={{fontSize:'13px'}}>@Mahesh-07</span><button style={{background:'red', color:'#fff', border:'none', padding:'6px 14px', borderRadius:'20px', fontSize:'12px'}}>Logout</button></div>
      </div>

      <div style={{maxWidth:'500px', margin:'0 auto'}}>
        {tab==='home' && posts.map(p=>(
          <div key={p.id} style={{borderBottom:'1px solid #1a1a1a', background:'#0a0a0a', marginBottom:'8px'}}>
            <div style={{padding:'10px', fontWeight:'bold'}}>@{p.user}</div>
            <img src={p.img} style={{width:'100%', height:'420px', objectFit:'cover'}} />
            <div style={{display:'flex', gap:'18px', padding:'10px'}}>
              <button onClick={()=>setPosts(posts.map(x=> x.id===p.id? {...x, likes: x.liked? x.likes-1: x.likes+1, liked:!x.liked}:x))} style={{background:'none', border:'none', color:'#fff', fontSize:'20px'}}>❤️ {p.likes}</button>
              <button onClick={()=>setShowC({...showC, [p.id]:!showC[p.id]})} style={{background:'none', border:'none', color:'#fff', fontSize:'20px'}}>💬 {p.comments.length}</button>
              <button onClick={()=>handleShare(p)} style={{background:'none', border:'none', color:'#fff', fontSize:'20px', marginLeft:'auto'}}>🚀 Share</button>
            </div>
            <div style={{padding:'0 12px 12px'}}><b>@{p.user}</b> {p.caption}</div>
            {showC[p.id] && (
              <div style={{padding:'0 12px 12px'}}>
                {p.comments.map((c,i)=><div key={i} style={{fontSize:'14px', color:'#ccc'}}>• {c}</div>)}
                <div style={{display:'flex', gap:'6px', marginTop:'8px'}}>
                  <input value={cInputs[p.id]||''} onChange={e=>setCInputs({...cInputs, [p.id]:e.target.value})} placeholder="Comment..." style={{flex:1, background:'#1a1a1a', border:'1px solid #333', borderRadius:'20px', padding:'8px 12px', color:'#fff'}} />
                  <button onClick={()=>{if(!cInputs[p.id])return; setPosts(posts.map(x=> x.id===p.id? {...x, comments:[...x.comments, cInputs[p.id]]}:x)); setCInputs({...cInputs, [p.id]:''})}} style={{background:'#0095f6', border:'none', borderRadius:'20px', padding:'8px 14px', color:'#fff'}}>Post</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {tab==='search' && (<div style={{padding:'15px'}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users, captions..." style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #333', background:'#1a1a1a', color:'#fff'}} /><div style={{marginTop:'15px'}}>{filtered.map(p=>(<div key={p.id} style={{display:'flex', gap:'10px', alignItems:'center', padding:'10px', borderBottom:'1px solid #222'}}><img src={p.img} style={{width:'50px', height:'50px', borderRadius:'50%'}} /><div><div style={{fontWeight:'bold'}}>@{p.user}</div><div style={{fontSize:'13px', color:'#aaa'}}>{p.caption}</div></div></div>))}</div></div>)}
        {tab==='reels' && (<div style={{padding:'10px'}}><h2 style={{textAlign:'center'}}>🎬 Reels</h2>{posts.map(p=>(<div key={p.id} style={{marginBottom:'15px', borderRadius:'12px', overflow:'hidden', position:'relative'}}><img src={p.img} style={{width:'100%', height:'500px', objectFit:'cover'}} /><div style={{position:'absolute', bottom:'10px', left:'10px', background:'rgba(0,0,0,0.6)', padding:'6px 10px', borderRadius:'8px'}}><b>@{p.user}</b> - {p.caption}</div></div>))}</div>)}
        {tab==='profile' && (<div style={{padding:'20px', textAlign:'center'}}><div style={{width:'90px', height:'90px', borderRadius:'50%', margin:'0 auto', background:'linear-gradient(135deg, #ff7a00, #ff3ca0, #8a2be2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', border:'3px solid #ff0050'}}>📸</div><h2 style={{margin:'10px 0 5px'}}>@Mahesh-07</h2><div style={{display:'flex', justifyContent:'center', gap:'20px', margin:'15px 0'}}><div><b>{posts.length}</b><br/>Posts</div><div><b>120</b><br/>Followers</div><div><b>180</b><br/>Following</div></div><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px', marginTop:'20px'}}>{posts.filter(p=>p.user==='mahesh-07').map(p=><img key={p.id} src={p.img} style={{width:'100%', height:'120px', objectFit:'cover'}} />)}</div></div>)}
      </div>

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#000', borderTop:'1px solid #222', display:'flex', justifyContent:'space-around', padding:'12px 0', zIndex:30}}>
        <button onClick={()=>setTab('home')} style={{background:'none', border:'none', fontSize:'26px', opacity: tab==='home'?1:0.4}}>🏠</button>
        <button onClick={()=>setTab('search')} style={{background:'none', border:'none', fontSize:'26px', opacity: tab==='search'?1:0.4}}>🔍</button>
        <button onClick={()=>setTab('reels')} style={{background:'none', border:'none', fontSize:'26px', opacity: tab==='reels'?1:0.4}}>🎬</button>
        <button onClick={()=>setTab('profile')} style={{background:'none', border:'none', fontSize:'26px', opacity: tab==='profile'?1:0.4}}>👤</button>
      </div>
    </div>
  )
      }
