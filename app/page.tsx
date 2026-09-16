"use client"
import { useState } from "react"

export default function Home(){
 const [tab,setTab]=useState('home')
 const [posts,setPosts]=useState([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600",likes:12,liked:false,caption:"First post 🔥",comments:["Nice!"]},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:5,liked:false,caption:"Beach day 🌊",comments:[]},
  {id:3,user:"mahesh-07",img:"https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",likes:20,liked:false,caption:"Sunset ❤️",comments:["Super"]},
 ])
 const [search,setSearch]=useState("")
 const [showC,setShowC]=useState<any>({})

 return(
 <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:'70px'}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 15px',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#000',zIndex:20}}>
   <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
    <div style={{width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2,#3a5bff)',display:'flex',alignItems:'center',justifyContent:'center'}}>📸</div>
    <h1 style={{margin:0,fontSize:'26px',fontWeight:900}}><span style={{color:'#fff'}}>Chit</span><span style={{background:'linear-gradient(90deg,#ff7a00,#ff00a0,#a855f7)',WebkitBackgroundClip:'text',color:'transparent'}}>pix</span></h1>
   </div>
   <span style={{fontSize:'12px'}}>@Mahesh-07</span>
  </div>

  <div style={{maxWidth:'500px',margin:'0 auto'}}>
   {posts.map(p=>(
    <div key={p.id} style={{borderBottom:'1px solid #1a1a1a',background:'#0a0a0a',marginBottom:'8px'}}>
     <div style={{padding:'10px',fontWeight:'bold'}}>@{p.user}</div>
     <img src={p.img} style={{width:'100%',height:'420px',objectFit:'cover'}} />
     <div style={{display:'flex',gap:'18px',padding:'10px'}}>
      <button onClick={()=>setPosts(posts.map(x=> x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))} style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>❤️ {p.likes}</button>
      <button onClick={()=>setShowC({...showC,[p.id]:!showC[p.id]})} style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>💬</button>
      <button style={{background:'none',border:'none',color:'#fff',fontSize:'20px',marginLeft:'auto'}}>🚀</button>
     </div>
     <div style={{padding:'0 12px 12px'}}><b>@{p.user}</b> {p.caption}</div>
    </div>
   ))}
  </div>

  <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#000',borderTop:'1px solid #222',display:'flex',justifyContent:'space-around',padding:'12px 0'}}>
   <button onClick={()=>setTab('home')} style={{background:'none',border:'none',fontSize:'26px'}}>🏠</button>
   <button style={{background:'none',border:'none',fontSize:'26px',opacity:0.4}}>🔍</button>
   <button style={{background:'none',border:'none',fontSize:'26px',opacity:0.4}}>🎬</button>
   <button style={{background:'none',border:'none',fontSize:'26px',opacity:0.4}}>👤</button>
  </div>
 </div>
 )
    }
