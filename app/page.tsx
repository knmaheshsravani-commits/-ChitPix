"use client"
import { useState } from "react"

export default function Home() {
  const [posts, setPosts] = useState([
    { id: 1, user: "mahesh-07", img: "https://picsum.photos/600/600?1", likes: 12, caption: "First post", comments: [] },
    { id: 2, user: "sravani", img: "https://picsum.photos/600/600?2", likes: 5, caption: "Hello", comments: [] },
  ])
  const [cap, setCap] = useState("")
  const [imgData, setImgData] = useState("")
  const [showCmt, setShowCmt] = useState({})
  const [stories, setStories] = useState([
    { user: "mahesh-07", img: "https://picsum.photos/200/200?1", seen: false },
    { user: "sravani", img: "https://picsum.photos/200/200?2", seen: false },
  ])

  const handleShare = (p) => {
    if (navigator.share) {
      navigator.share({ title: 'Chit-Pix', text: p.caption, url: p.img }).catch(()=>{})
    } else {
      navigator.clipboard.writeText(p.img)
      alert('Link copied! 🚀')
    }
  }

  return (
    <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px', maxWidth:'500px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center'}}>Chit-Pix 📸</h1>
      <div style={{display:'flex', gap:'10px', overflowX:'auto', marginBottom:'20px'}}>
        {stories.map((s,i)=>(
          <div key={i} style={{textAlign:'center'}}>
            <img src={s.img} style={{width:'60px', height:'60px', borderRadius:'50%', border: s.seen? '2px solid #333' : '2px solid #ff0050'}} />
            <div style={{fontSize:'12px'}}>{s.user}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'20px', border:'1px solid #333', padding:'10px', borderRadius:'12px'}}>
        <input type="file" accept="image/*" onChange={(e)=>{
          const file = e.target.files && e.target.files[0]
          if(file){ const r=new FileReader(); r.onload=()=>setImgData(r.result); r.readAsDataURL(file) }
        }} />
        {imgData && <img src={imgData} style={{width:'100%', height:'200px', objectFit:'cover', marginTop:'10px'}} />}
        <input placeholder="Caption..." value={cap} onChange={(e)=>setCap(e.target.value)} style={{width:'100%', marginTop:'10px', padding:'8px', background:'#111', color:'#fff', border:'1px solid #333', borderRadius:'8px'}} />
        <button onClick={()=>{
          if(!imgData) return alert("Image select chey bro!")
          setPosts([{ id: Date.now(), user: "mahesh-07", img: imgData, likes: 0, caption: cap, comments: [] },...posts])
          setCap(""); setImgData("")
        }} style={{width:'100%', marginTop:'10px', padding:'10px', background:'#0095f6', border:'none', borderRadius:'8px', color:'#fff', fontWeight:'bold'}}>Post</button>
      </div>
      {posts.map((p)=>(
        <div key={p.id} style={{border:'1px solid #333', borderRadius:'12px', marginBottom:'20px', overflow:'hidden'}}>
          <div style={{padding:'10px', fontWeight:'bold'}}>@{p.user}</div>
          <img src={p.img} style={{width:'100%', height:'400px', objectFit:'cover'}} />
          <div style={{display:'flex', gap:'15px', padding:'10px'}}>
            <button onClick={()=>setPosts(posts.map((x)=> x.id===p.id? {...x, likes: x.likes+1} : x))} style={{border:'none', background:'none', fontSize:'22px'}}>❤️ {p.likes}</button>
            <button onClick={()=>handleShare
