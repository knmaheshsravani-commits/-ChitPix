"use client"
import { useState, useEffect } from "react"

export default function Home(){
 const [currentUser,setCurrentUser]=useState<string|null>(null)
 const [isSignup,setIsSignup]=useState(false)
 const [loginUser,setLoginUser]=useState("")
 const [loginPass,setLoginPass]=useState("")
 const [tab,setTab]=useState('home')
 const [showAdd,setShowAdd]=useState(false)
 const [newImg,setNewImg]=useState("")
 const [newCap,setNewCap]=useState("")
 const [posts,setPosts]=useState([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",likes:12,liked:false,caption:"First ChitPix post 🔥 Trekking 🏔️"},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:5,liked:false,caption:"Beach sunset 🌊"},
  {id:3,user:"mahesh-07",img:"https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600",likes:20,liked:false,caption:"Golden hour ✨"},
 ])

 useEffect(()=>{
  const saved = localStorage.getItem("chitpix_user")
  if(saved) setCurrentUser(saved)
 },[])

 const handleAuth=()=>{
  if(!loginUser || !loginPass) return alert("Username & Password pettu bro!")
  if(loginUser.length<3) return alert("Username minimum 3 letters!")
  
  // Save user
  localStorage.setItem("chitpix_user", loginUser)
  localStorage.setItem(`chitpix_pass_${loginUser}`, loginPass)
  setCurrentUser(loginUser)
  setLoginUser(""); setLoginPass("")
 }

 const handleLogout=()=>{
  localStorage.removeItem("chitpix_user")
  setCurrentUser(null)
  setTab('home')
 }

 const addPost=()=>{
  if(!newImg) return alert("Image URL pettu bro!")
  setPosts([{id:Date.now(),user:currentUser!,img:newImg,likes:0,liked:false,caption:newCap},...posts])
  setNewImg(""); setNewCap(""); setShowAdd(false); setTab('home')
 }

 // LOGIN SCREEN
 if(!currentUser){
  return(
   <div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
    <div style={{width:'100%',maxWidth:'360px',textAlign:'center'}}>
     <div style={{width:'80px',height:'80px',borderRadius:'20px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',margin:'0 auto 15px'}}>📸</div>
     <h1 style={{fontSize:'38px',fontWeight:900,margin:'0'}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1>
     <p style={{color:'#888',margin:'5px 0 30px'}}>Share your chithram, pix style ✨</p>
     
     <div style={{background:'#111',borderRadius:'16px',padding:'20px',border:'1px solid #222'}}>
      <h3 style={{margin:'0 0 15px'}}>{isSignup ? "Create Account 🚀" : "Welcome Back 👋"}</h3>
      <input value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="Username (e.g. mahesh-07)" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/>
      <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Password" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/>
      <button onClick={handleAuth} style={{width:'100%',padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',color:'#fff',border:'none',fontWeight:'bold',fontSize:'16px'}}>{isSignup ? "Sign Up & Enter" : "Login to ChitPix"}</button>
      <p style={{marginTop:'15px',color:'#888',fontSize:'14px'}}>{isSignup ? "Already have account?" : "New to ChitPix?"} <span onClick={()=>setIsSignup(!isSignup)} style={{color:'#ff7a00',fontWeight:'bold',cursor:'pointer'}}>{isSignup ? "Login" : "Sign Up"}</span></p>
     </div>
     <p style={{color:'#555',fontSize:'12px',marginTop:'20px'}}>Demo login - No server needed, saved in your phone only</p>
    </div>
   </div>
  )
 }

 // MAIN APP
 return(
 <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:'90px'}}>
  <div style={{display:'flex',justifyContent:'space-between',padding:'12px 15px',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#000',zIndex:20,alignItems:'center'}}>
   <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
    <div style={{width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center'}}>📸</div>
    <h1 style={{margin:0,fontSize:'26px',fontWeight:900}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1>
   </div>
   <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
    <span style={{fontSize:'14px',color:'#aaa'}}>@{currentUser}</span>
    <button onClick={handleLogout} style={{background:'#1a1a1a',color:'#fff',border:'1px solid #333',padding:'6px 12px',borderRadius:'20px',fontSize:'12px'}}>Logout</button>
   </div>
  </div>

  <div style={{maxWidth:'500px',margin:'0 auto'}}>
   {tab==='home' && posts.map(p=>(
    <div key={p.id} style={{borderBottom:'8px solid #111'}}>
     <div style={{padding:'10px',fontWeight:'bold',display:'flex',justifyContent:'space-between'}}><span>@{p.user} {p.user===currentUser && <span style={{background:'#ff7a00',fontSize:'10px',padding:'2px 6px',borderRadius:'10px',marginLeft:'5px'}}>YOU</span>}</span></div>
     <img src={p.img} style={{width:'100%',height:'420px',objectFit:'cover',background:'#111'}} alt=""/>
     <div style={{display:'flex',gap:'20px',padding:'12px'}}>
      <button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))} style={{background:'none',border:'none',color:p.liked?'#ff3040':'#fff',fontSize:'20px'}}>❤️ {p.likes}</button>
      <span style={{fontSize:'20px'}}>💬</span><span style={{marginLeft:'auto',fontSize:'20px'}}>🚀</span>
     </div>
     <div style={{padding:'0 12px 12px'}}><b>@{p.user}</b> {p.caption}</div>
    </div>
   ))}
   {tab==='search' && <div style={{padding:'15px'}}><input placeholder="Search users..." style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#1a1a1a',color:'#fff',border:'1px solid #333'}}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px',marginTop:'15px'}}>{posts.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'120px',objectFit:'cover'}} alt=""/>)}</div></div>}
   {tab==='reels' && <div>{posts.map(p=><div key={p.id} style={{position:'relative',height:'80vh',marginBottom:'5px'}}><img src={p.img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/><div style={{position:'absolute',bottom:'20px',left:'10px'}}>🎬 @{p.user}</div></div>)}</div>}
   {tab==='profile' && <div style={{padding:'20px',textAlign:'center'}}><div style={{width:'90px',height:'90px',borderRadius:'50%',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px'}}>📸</div><h2>@{currentUser}</h2><p style={{color:'#aaa'}}>{posts.filter(p=>p.user===currentUser).length} posts • ChitPix creator</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px',marginTop:'20px'}}>{posts.filter(p=>p.user===currentUser).map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'120px',objectFit:'cover'}} alt=""/>)}</div></div>}
  </div>

  {showAdd && (
   <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'15px'}}>
    <div style={{background:'#1a1a1a',width:'100%',maxWidth:'400px',borderRadius:'16px',padding:'20px',border:'1px solid #333'}}>
     <h3 style={{margin:'0 0 15px'}}>New Post as @{currentUser} 📸</h3>
     <input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="Paste Image URL" style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/>
     <input value={newCap} onChange={e=>setNewCap(e.target.value)} placeholder="Caption..." style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/>
     <div style={{display:'flex',gap:'10px'}}>
      <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#333',color:'#fff',border:'none'}}>Cancel</button>
      <button onClick={addPost} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#fff',color:'#000',border:'none',fontWeight:'bold'}}>Post 🚀</button>
     </div>
    </div>
   </div>
  )}

  <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#000',borderTop:'1px solid #222',display:'flex',justifyContent:'space-around',alignItems:'center',padding:'12px 0',zIndex:50}}>
   <button onClick={()=>setTab('home')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='home'?1:0.3}}>🏠</button>
   <button onClick={()=>setTab('search')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='search'?1:0.3}}>🔍</button>
   <button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',border:'none',width:'52px',height:'52px',borderRadius:'50%',fontSize:'32px',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',marginTop:'-15px',boxShadow:'0 0 20px rgba(255,60,160,0.6)'}}>+</button>
   <button onClick={()=>setTab('reels')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='reels'?1:0.3}}>🎬</button>
   <button onClick={()=>setTab('profile')} style={{background:'none',border:'none',fontSize:'28px',opacity:tab==='profile'?1:0.3}}>👤</button>
  </div>
 </div>
 )
                                                     }
