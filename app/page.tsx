"use client"
import { useState, useEffect } from "react"
export default function Home(){
  const [user,setUser]=useState("")
  const [posts,setPosts]=useState<any[]>([])
  const [cap,setCap]=useState("")
  useEffect(()=>{
    const u=localStorage.getItem("chitpix_user")
    if(!u) window.location.href="/login"
    else setUser(u)
    const s=localStorage.getItem("chitpix_posts")
    if(s) setPosts(JSON.parse(s))
    else setPosts([{id:1,user:"mahesh-07",img:"https://picsum.photos/500/500?1",cap:"First post on ChitPix 🔥",likes:12},{id:2,user:"cherry",img:"https://picsum.photos/500/500?2",cap:"Black theme mass!",likes:5}])
  },[])
  const post=()=>{
    if(!cap) return
    const n={id:Date.now(),user,img:`https://picsum.photos/500/500?${Date.now()}`,cap,likes:0}
    const up=[n,...posts]
    setPosts(up)
    localStorage.setItem("chitpix_posts",JSON.stringify(up))
    setCap("")
  }
  const like=(id:number)=>{
    const up=posts.map(p=>p.id===id?{...p,likes:p.likes+1}:p)
    setPosts(up)
    localStorage.setItem("chitpix_posts",JSON.stringify(up))
  }
  return(
    <div style={{minHeight:'100vh',background:'black',color:'white'}}>
      <div style={{padding:'15px',borderBottom:'1px solid #333',display:'flex',justifyContent:'space-between',position:'sticky',top:0,background:'black'}}>
        <h1 style={{fontSize:'28px',fontWeight:'bold',fontFamily:'cursive'}}>ChitPix</h1>
        <div style={{display:'flex',gap:'10px',alignItems:'center'}}><span>@{user}</span><button onClick={()=>{localStorage.removeItem("chitpix_user");location.href="/login"}} style={{background:'red',padding:'6px 14px',borderRadius:'20px',border:'none',color:'white'}}>Logout</button></div>
      </div>
      <div style={{maxWidth:'470px',margin:'0 auto',padding:'15px'}}>
        <div style={{border:'1px solid #333',padding:'15px',borderRadius:'12px',background:'#111',marginBottom:'20px'}}>
          <input value={cap} onChange={e=>setCap(e.target.value)} placeholder="What's on your mind?" style={{width:'100%',padding:'10px',background:'#222',border:'1px solid #444',borderRadius:'8px',color:'white',marginBottom:'10px'}}/>
          <button onClick={post} style={{width:'100%',background:'#0095f6',padding:'10px',borderRadius:'8px',border:'none',color:'white',fontWeight:'bold'}}>Post</button>
        </div>
        {posts.map(p=>(
          <div key={p.id} style={{border:'1px solid #333',borderRadius:'12px',marginBottom:'20px',background:'#111',overflow:'hidden'}}>
            <div style={{padding:'12px',fontWeight:'bold'}}>@{p.user}</div>
            <img src={p.img} style={{width:'100%',height:'400px',objectFit:'cover'}}/>
            <div style={{padding:'12px'}}>
              <button onClick={()=>like(p.id)} style={{background:'none',border:'none',fontSize:'20px'}}>❤️ {p.likes}</button>
              <div style={{marginTop:'8px'}}><b>@{p.user}</b> {p.cap}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
          }
