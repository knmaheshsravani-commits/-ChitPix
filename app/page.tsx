"use client"
import { useState } from "react"
export default function Home(){
 const [tab,setTab]=useState('home')
 const [posts,setPosts]=useState([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",likes:12,liked:false},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:5,liked:false},
  {id:3,user:"mahesh-07",img:"https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600",likes:20,liked:false},
 ])
 return(
 <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:'80px'}}>
  <div style={{display:'flex',justifyContent:'space-between',padding:'12px 15px',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#000',zIndex:20}}>
   <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
    <div style={{width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)'}}>📸</div>
    <h1 style={{margin:0,fontSize:'26px',fontWeight:900}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1>
   </div>
   <span>@Mahesh-07</span>
  </div>
  <div style={{maxWidth:'500px',margin:'0 auto'}}>
   {tab==='home' && posts.map(p=><div key={p.id} style={{borderBottom:'8px solid #111'}}><div style={{padding:'10px'}}>@{p.user}</div><img src={p.img} style={{width:'100%',height:'400px',objectFit:'cover'}} /><div style={{padding:'12px'}}><button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))} style={{background:'none',border:'none',color:'#fff'}}>❤️ {p.likes}</button></div></div>)}
   {tab==='search' && <div style={{padding:'15px'}}><input placeholder="Search..." style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#1a1a1a',color:'#fff',border:'1px solid #333'}} /><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px',marginTop:'15px'}}>{posts.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'120px',objectFit:'cover'}} />)}</div></div>}
   {tab==='reels' && <div>{posts.map(p=><div key={p.id} style={{position:'relative',height:'80vh',marginBottom:'5px'}}><img src={p.img} style={{width:'100%',height:'100%',objectFit:'cover'}} /><div style={{position:'absolute',bottom:'20px',left:'10px'}}>🎬 @{p.user}</div></div>)}</div>}
   {tab==='profile' && <div style={{padding:'20px',textAlign:'center'}}><div style={{width:'90px',height:'90px',borderRadius:'50%',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px'}}>📸</div><h2>@Mahesh-07</h2><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px',marginTop:'20px'}}>{posts.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'120px',objectFit:'cover'}} />)}</div></div>}
  </div>
  <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#000',borderTop:'1px solid #222',display:'flex',justifyContent:'space-around',padding:'14px 0',zIndex:50}}>
   <button onClick={()=>setTab('home')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='home'?1:0.3}}>🏠</button>
   <button onClick={()=>setTab('search')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='search'?1:0.3}}>🔍</button>
   <button onClick={()=>setTab('reels')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='reels'?1:0.3}}>🎬</button>
   <button onClick={()=>setTab('profile')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='profile'?1:0.3}}>👤</button>
  </div>
 </div>
 )
                                                                                          }
