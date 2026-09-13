"use client"
import { useState, useEffect } from "react"

export default function Home(){
  const [user,setUser]=useState("")
  const [posts,setPosts]=useState<any[]>([])
  const [cap,setCap]=useState("")
  const [tab,setTab]=useState("home")
  const [search,setSearch]=useState("")

  useEffect(()=>{
    const u=localStorage.getItem("chitpix_user")
    if(!u) location.href="/login"
    else setUser(u)
    const s=localStorage.getItem("chitpix_posts")
    if(s) setPosts(JSON.parse(s))
    else setPosts([
      {id:1,user:"mahesh",img:"https://picsum.photos/400/400?1",cap:"First 🔥",likes:5},
      {id:2,user:"sravani",img:"https://picsum.photos/400/400?2",cap:"Hi",likes:3}
    ])
  },[])

  function addPost(){
    if(!cap) return
    const n={id:Date.now(),user,img:"https://picsum.photos/400/400?"+Date.now(),cap,likes:0}
    const up=[n,...posts]
    setPosts(up)
    localStorage.setItem("chitpix_posts",JSON.stringify(up))
    setCap("")
  }

  function like(id:number){
    const up=posts.map(p=> p.id===id ? {...p,likes:p.likes+1} : p)
    setPosts(up)
    localStorage.setItem("chitpix_posts",JSON.stringify(up))
  }

  const list=posts.filter(p=> p.user.includes(search) || p.cap.includes(search))

  return(
    <div style={{background:"black",color:"white",minHeight:"100vh",paddingBottom:"70px"}}>
      <div style={{padding:"15px",borderBottom:"1px solid #333",display:"flex",justifyContent:"space-between"}}>
        <h1>ChitPix</h1>
        <button onClick={()=>{localStorage.removeItem("chitpix_user");location.href="/login"}} style={{background:"red",color:"white",border:"none",padding:"5px 10px",borderRadius:"10px"}}>Logout</button>
      </div>

      {tab==="home" && <div style={{maxWidth:"400px",margin:"0 auto",padding:"15px"}}>
        <input value={cap} onChange={e=>setCap(e.target.value)} placeholder="Caption..." style={{width:"100%",padding:"10px",background:"#222",color:"white",borderRadius:"8px",border:"1px solid #444"}}/>
        <button onClick={addPost} style={{width:"100%",marginTop:"10px",background:"#0095f6",padding:"10px",borderRadius:"8px",border:"none",color:"white"}}>Post</button>
        {posts.map(p=><div key={p.id} style={{marginTop:"15px",border:"1px solid #333",borderRadius:"10px",overflow:"hidden",background:"#111"}}>
          <div style={{padding:"10px"}}>@{p.user}</div>
          <img src={p.img} style={{width:"100%",height:"350px",objectFit:"cover"}}/>
          <div style={{padding:"10px"}}><span onClick={()=>like(p.id)}>❤️ {p.likes}</span> {p.cap}</div>
        </div>)}
      </div>}

      {tab==="search" && <div style={{padding:"15px",maxWidth:"400px",margin:"0 auto"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search" style={{width:"100%",padding:"12px",background:"#222",color:"white",borderRadius:"10px",border:"1px solid #444"}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"2px",marginTop:"10px"}}>
          {list.map(p=><img key={p.id} src={p.img} style={{height:"120px",objectFit:"cover"}}/>)}
        </div>
      </div>}

      {tab==="reels" && <div style={{maxWidth:"400px",margin:"0 auto"}}>
        {posts.map(p=><div key={p.id} style={{height:"80vh",position:"relative"}}>
          <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",bottom:"20px",left:"10px"}}>@{p.user} - {p.cap}<br/>❤️{p.likes}</div>
        </div>)}
      </div>}

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"black",borderTop:"1px solid #333",display:"flex",justifyContent:"space-around",padding:"12px 0"}}>
        <button onClick={()=>setTab("home")} style={{background:"none",border:"none",fontSize:"22px"}}>🏠</button>
        <button onClick={()=>setTab("search")} style={{background:"none",border:"none",fontSize:"22px"}}>🔍</button>
        <button onClick={()=>setTab("reels")} style={{background:"none",border:"none",fontSize:"22px"}}>🎬</button>
        <button style={{background:"none",border:"none",fontSize:"22px"}}>👤</button>
      </div>
    </div>
  )
      }
