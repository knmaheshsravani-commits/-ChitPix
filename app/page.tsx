"use client"
import { useState } from "react"

export default function Home(){
 const [tab,setTab]=useState('home')
 const [posts,setPosts]=useState([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",likes:12,liked:false,caption:"First post 🔥",comments:[]},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:5,liked:false,caption:"Beach day 🌊",comments:[]},
  {id:3,user:"mahesh-07",img:"https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600",likes:20,liked:false,caption:"Sunset ❤️",comments:[]},
 ])

 return(
 <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:'80px'}}>
  {/* HEADER WITH LOGO */}
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 15px',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#000',zIndex:20}}>
   <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
    <div style={{width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2,#3a5bff)',display:'flex',alignItems:'center',justifyContent:'center'}}>📸</div>
    <h1 style={{margin:0,fontSize:'26px',fontWeight:900}}><span style={{color:'#fff'}}>Chit</span><span style={{background:'linear-gradient(90deg,#ff7a00,#ff00a0,#a855f7)',WebkitBackgroundClip:'text',color:'transparent'}}>pix</span></h1>
   </div>
   <span style={{fontSize:'14px',opacity:0.8}}>@Mahesh-07</span>
  </div>

  <div style={{maxWidth:'500px',margin:'0 auto'}}>
   {/* HOME TAB */}
   {tab==='home' && posts.map(p=>(
    <div key={p.id} style={{borderBottom:'8px solid #111'}}>
     <div style={{padding:'10px',fontWeight:'bold'}}>@{p.user}</div>
     <img src={p.img} style={{width:'100%',height:'400px',objectFit:'cover'}} />
     <div style={{display:'flex',gap:'20px',padding:'12px'}}>
      <button onClick={()=>setPosts(posts.map(x=> x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))} style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>❤️ {p.likes}</button>
      <button style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>💬</button>
      <button style={{background:'none',border:'none',color:'#fff',fontSize:'20px',marginLeft:'auto'}}>🚀</button>
     </div>
     <div style={{padding:'0 12px 12px'}}><b>@{p.user}</b> {p.caption}</div>
    </div>
   ))}

   {/* SEARCH TAB */}
   {tab==='search' && (
    <div style={{padding:'15px'}}>
     <input placeholder="Search users..." style={{width:'100%',padding:'14px',borderRadius:'12px',border:'1px solid #333',background:'#1a1a1a',color:'#fff',fontSize:'16px'}} />
     <div style={{marginTop:'20px'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px'}}>
       {posts.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'120px',objectFit:'cover'}} />)}
      </div>
      <p style={{textAlign:'center',color:'#666',marginTop:'20px'}}>Search feature coming soon 🔍</p>
     </div>
    </div>
   )}

   {/* REELS TAB */}
   {tab==='reels' && (
    <div>
     {posts.map(p=>(
      <div key={p.id} style={{position:'relative',height:'80vh',marginBottom:'5px'}}>
       <img src={p.img} style={{width:'100%',height:'100%',objectFit:'cover'}} />
       <div style={{position:'absolute',bottom:'20px',left:'12px',background:'rgba(0,0,0,0.5)',padding:'8px 12px',borderRadius:'10px'}}>
        <b>@{p.user}</b> {p.caption}<br/>🎵 Original audio
       </div>
       <div style={{position:'absolute',right:'12px',bottom:'80px',display:'flex',flexDirection:'column',gap:'20px',fontSize:'28px'}}>
        <span>❤️<br/><small style={{fontSize:'12px'}}>{p.likes}</small></span>
        <span>💬</span>
        <span>🚀</span>
       </div>
      </div>
     ))}
    </div>
   )}

   {/* PROFILE TAB */}
   {tab==='profile' && (
    <div style={{padding:'20px',textAlign:'center'}}>
     <div style={{width:'90px',height:'90px',borderRadius:'50%',margin:'0 auto',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px'}}>📸</div>
     <h2 style={{margin:'12px 0 4px'}}>@Mahesh-07</h2>
     <p style={{color:'#aaa',margin:'0'}}>3 posts • 120 followers • 80 following</p>
     <button style={{marginTop:'15px',background:'#fff',color:'#000',border:'none',padding:'8px 20px',borderRadius:'8px',fontWeight:'bold'}}>Edit Profile</button>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px',marginTop:'20px'}}>
      {posts.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'120px',objectFit:'cover'}} />)}
     </div>
    </div>
   )}
  </div>

  {/* BOTTOM NAV - FIXED */}
  <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#000',borderTop:'1px solid #222',display:'flex',justifyContent:'space-around',padding:'14px 0',zIndex:50}}>
   <button onClick={()=>setTab('home')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='home'?1:0.35,cursor:'pointer'}}>🏠</button>
   <button onClick={()=>setTab('search')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='search'?1:0.35,cursor:'pointer'}}>🔍</button>
   <button onClick={()=>setTab('reels')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='reels'?1:0.35,cursor:'pointer'}}>🎬</button>
   <button onClick={()=>setTab('profile')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='profile'?1:0.35,cursor:'pointer'}}>👤</button>
  </div>
 </div>
 )
       }
