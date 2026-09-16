"use client"
import { useState, useEffect } from "react"

export default function Home(){
 const [currentUser,setCurrentUser]=useState<string|null>(null)
 const [loginUser,setLoginUser]=useState("")
 const [loginPass,setLoginPass]=useState("")
 const [tab,setTab]=useState('home')
 const [showAdd,setShowAdd]=useState(false)
 const [newImg,setNewImg]=useState("")
 const [newCap,setNewCap]=useState("")
 const [commentText,setCommentText]=useState("")
 const [activePost,setActivePost]=useState<number|null>(null)
 const [posts,setPosts]=useState<any[]>([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",likes:12,liked:false,caption:"First ChitPix post 🔥",comments:[{user:"sravani",text:"Super pic bro!"},{user:"Mahesh-07",text:"Thanks ra!"}]},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:5,liked:false,caption:"Beach sunset 🌊",comments:[]},
 ])

 useEffect(()=>{
  const saved = localStorage.getItem("chitpix_user")
  if(saved) setCurrentUser(saved)
 },[])

 const handleAuth=()=>{
  if(!loginUser||!loginPass) return alert("Username & Password pettu bro!")
  localStorage.setItem("chitpix_user",loginUser)
  setCurrentUser(loginUser)
 }

 const addPost=()=>{
  if(!newImg) return alert("Image URL pettu bro!")
  setPosts([{id:Date.now(),user:currentUser,img:newImg,likes:0,liked:false,caption:newCap,comments:[]},...posts])
  setNewImg(""); setNewCap(""); setShowAdd(false)
 }

 const addComment=()=>{
  if(!commentText.trim()||activePost===null) return
  setPosts(posts.map(p=> p.id===activePost? {...p,comments:[...p.comments,{user:currentUser,text:commentText}]}:p))
  setCommentText("")
 }

 const handleShare=async(p:any)=>{
  const text = p.caption+" - via ChitPix 📸\n"+p.img
  if(navigator.share){
   try{ await navigator.share({title:"ChitPix",text,url:window.location.href}) }catch(e){}
  }else{
   await navigator.clipboard.writeText(text)
   alert("Copied bro! 🚀\n"+text)
  }
 }

 if(!currentUser){
  return(
   <div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
    <div style={{width:'100%',maxWidth:'360px',textAlign:'center'}}>
     <div style={{width:'80px',height:'80px',borderRadius:'20px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',margin:'0 auto 15px'}}>📸</div>
     <h1 style={{fontSize:'38px',fontWeight:900,margin:0}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1>
     <div style={{background:'#111',borderRadius:'16px',padding:'20px',border:'1px solid #222',marginTop:'20px'}}>
      <input value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="Username" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/>
      <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Password" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/>
      <button onClick={handleAuth} style={{width:'100%',padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',color:'#fff',border:'none',fontWeight:'bold'}}>Login 🚀</button>
     </div>
    </div>
   </div>
  )
 }

 return(
 <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:'90px'}}>
  <div style={{display:'flex',justifyContent:'space-between',padding:'12px 15px',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#000',zIndex:20,alignItems:'center'}}>
   <div style={{display:'flex',gap:'10px',alignItems:'center'}}><div style={{width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center'}}>📸</div><h1 style={{margin:0,fontSize:'26px',fontWeight:900}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1></div>
   <div style={{display:'flex',gap:'10px',alignItems:'center'}}><span style={{color:'#aaa',fontSize:'14px'}}>@{currentUser}</span><button onClick={()=>{localStorage.removeItem("chitpix_user"); setCurrentUser(null)}} style={{background:'#1a1a1a',color:'#fff',border:'1px solid #333',padding:'6px 12px',borderRadius:'20px',fontSize:'12px'}}>Logout</button></div>
  </div>
  <div style={{maxWidth:'500px',margin:'0 auto'}}>
   {posts.map(p=>(
    <div key={p.id} style={{borderBottom:'8px solid #111'}}>
     <div style={{padding:'10px',fontWeight:'bold'}}>@{p.user}</div>
     <img src={p.img} style={{width:'100%',height:'420px',objectFit:'cover'}} alt=""/>
     <div style={{display:'flex',gap:'20px',padding:'12px',alignItems:'center'}}>
      <button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))} style={{background:'none',border:'none',color:p.liked?'#ff3040':'#fff',fontSize:'20px'}}>❤️ {p.likes}</button>
      <button onClick={()=>setActivePost(p.id)} style={{background:'none',border:'none',fontSize:'20px'}}>💬 {p.comments.length}</button>
      <button onClick={()=>handleShare(p)} style={{background:'none',border:'none',fontSize:'20px',marginLeft:'auto'}}>🚀</button>
     </div>
     <div style={{padding:'0 12px 8px'}}><b>@{p.user}</b> {p.caption}</div>
     {p.comments.length>0 && <div style={{padding:'0 12px 12px'}}><span onClick={()=>setActivePost(p.id)} style={{color:'#888',fontSize:'14px'}}>View {p.comments.length} comments</span><div style={{fontSize:'14px',marginTop:'4px'}}><b>@{p.comments[0].user}</b> {p.comments[0].text}</div></div>}
    </div>
   ))}
  </div>

  {activePost!==null && (
   <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:90,display:'flex',alignItems:'flex-end'}}>
    <div style={{background:'#121212',width:'100%',maxHeight:'70vh',borderRadius:'20px 20px 0 0',borderTop:'1px solid #333',display:'flex',flexDirection:'column'}}>
     <div style={{padding:'15px',borderBottom:'1px solid #222',display:'flex',justifyContent:'space-between'}}><b>Comments 💬</b><button onClick={()=>setActivePost(null)} style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>✕</button></div>
     <div style={{flex:1,overflowY:'auto',padding:'15px'}}>
      {posts.find(x=>x.id===activePost)?.comments.map((c:any,i:number)=><div key={i} style={{marginBottom:'12px'}}><b>@{c.user}</b> {c.text}</div>)}
     </div>
     <div style={{padding:'12px',borderTop:'1px solid #222',display:'flex',gap:'10px'}}>
      <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." style={{flex:1,padding:'12px',borderRadius:'25px',background:'#222',color:'#fff',border:'1px solid #333'}}/>
      <button onClick={addComment} style={{background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',border:'none',padding:'12px 20px',borderRadius:'25px',color:'#fff',fontWeight:'bold'}}>Post</button>
     </div>
    </div>
   </div>
  )}

  {showAdd && (
   <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'15px'}}>
    <div style={{background:'#1a1a1a',width:'100%',maxWidth:'400px',borderRadius:'16px',padding:'20px',border:'1px solid #333'}}>
     <h3>New Post 📸</h3>
     <input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="Image URL" style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/>
     <input value={newCap} onChange={e=>setNewCap(e.target.value)} placeholder="Caption..." style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/>
     <div style={{display:'flex',gap:'10px'}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#333',color:'#fff',border:'none'}}>Cancel</button><button onClick={addPost} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#fff',color:'#000',border:'none',fontWeight:'bold'}}>Post 🚀</button></div>
    </div>
   </div>
  )}

  <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#000',borderTop:'1px solid #222',display:'flex',justifyContent:'space-around',alignItems:'center',padding:'12px 0',zIndex:50}}>
   <button style={{background:'none',border:'none',fontSize:'28px'}}>🏠</button>
   <button style={{background:'none',border:'none',fontSize:'28px'}}>🔍</button>
   <button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',border:'none',width:'52px',height:'52px',borderRadius:'50%',fontSize:'32px',color:'#fff',marginTop:'-15px'}}>+</button>
   <button style={{background:'none',border:'none',fontSize:'28px'}}>🎬</button>
   <button style={{background:'none',border:'none',fontSize:'28px'}}>👤</button>
  </div>
 </div>
 )
     }
