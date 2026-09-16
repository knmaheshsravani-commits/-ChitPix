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
 const [searchQ,setSearchQ]=useState("")
 const [posts,setPosts]=useState<any[]>([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",likes:12,liked:false,caption:"First ChitPix post 🔥",comments:[{user:"sravani",text:"Super pic bro!"}]},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:5,liked:false,caption:"Beach sunset 🌊",comments:[]},
  {id:3,user:"mahesh-07",img:"https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600",likes:20,liked:false,caption:"Golden hour ✨",comments:[]},
  {id:4,user:"arjun",img:"https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",likes:45,liked:false,caption:"Mountain vibes 🏔️",comments:[]},
 ])

 useEffect(()=>{ const s=localStorage.getItem("chitpix_user"); if(s) setCurrentUser(s) },[])
 const handleAuth=()=>{ if(!loginUser||!loginPass) return alert("Pettu bro!"); localStorage.setItem("chitpix_user",loginUser); setCurrentUser(loginUser) }
 const addPost=()=>{ if(!newImg) return alert("URL pettu!"); setPosts([{id:Date.now(),user:currentUser,img:newImg,likes:0,liked:false,caption:newCap,comments:[]},...posts]); setNewImg(""); setNewCap(""); setShowAdd(false); setTab('home') }
 const addComment=()=>{ if(!commentText.trim()||activePost===null) return; setPosts(posts.map(p=>p.id===activePost?{...p,comments:[...p.comments,{user:currentUser,text:commentText}]}:p)); setCommentText("") }
 const handleShare=async(p:any)=>{ const t=p.caption+" - ChitPix 📸\n"+p.img; if(navigator.share){ try{ await navigator.share({title:"ChitPix",text:t,url:location.href})}catch(e){} }else{ await navigator.clipboard.writeText(t); alert("Copied! 🚀\n"+t) } }

 const filtered = posts.filter(p=> p.user.toLowerCase().includes(searchQ.toLowerCase()) || p.caption.toLowerCase().includes(searchQ.toLowerCase()))
 const myPosts = posts.filter(p=> p.user===currentUser)

 if(!currentUser){
  return(<div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}><div style={{width:'100%',maxWidth:'360px',textAlign:'center'}}><div style={{width:'80px',height:'80px',borderRadius:'20px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',margin:'0 auto 15px'}}>📸</div><h1 style={{fontSize:'38px',fontWeight:900,margin:0}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1><div style={{background:'#111',borderRadius:'16px',padding:'20px',border:'1px solid #222',marginTop:'20px'}}><input value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="Username" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/><input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Password" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/><button onClick={handleAuth} style={{width:'100%',padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',color:'#fff',border:'none',fontWeight:'bold'}}>Login 🚀</button></div></div></div>)
 }

 return(
 <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:'90px'}}>
  <div style={{display:'flex',justifyContent:'space-between',padding:'12px 15px',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#000',zIndex:20,alignItems:'center'}}>
   <div style={{display:'flex',gap:'10px',alignItems:'center'}}><div style={{width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center'}}>📸</div><h1 style={{margin:0,fontSize:'26px',fontWeight:900}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1></div>
   <span style={{color:'#aaa',fontSize:'14px'}}>@{currentUser}</span>
  </div>

  {tab==='home' && <div style={{maxWidth:'500px',margin:'0 auto'}}>{posts.map(p=>(<div key={p.id} style={{borderBottom:'8px solid #111'}}><div style={{padding:'10px',fontWeight:'bold'}}>@{p.user}</div><img src={p.img} style={{width:'100%',height:'420px',objectFit:'cover'}} alt=""/><div style={{display:'flex',gap:'20px',padding:'12px',alignItems:'center'}}><button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))} style={{background:'none',border:'none',color:p.liked?'#ff3040':'#fff',fontSize:'20px'}}>❤️ {p.likes}</button><button onClick={()=>setActivePost(p.id)} style={{background:'none',border:'none',fontSize:'20px'}}>💬 {p.comments.length}</button><button onClick={()=>handleShare(p)} style={{background:'none',border:'none',fontSize:'20px',marginLeft:'auto'}}>🚀</button></div><div style={{padding:'0 12px 12px'}}><b>@{p.user}</b> {p.caption}{p.comments.length>0 && <div style={{marginTop:'6px'}}><span onClick={()=>setActivePost(p.id)} style={{color:'#888',fontSize:'13px'}}>View {p.comments.length} comments</span></div>}</div></div>))}</div>}

  {tab==='search' && <div style={{maxWidth:'500px',margin:'0 auto',padding:'15px'}}><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Search users, captions..." style={{width:'100%',padding:'14px',borderRadius:'25px',background:'#1a1a1a',color:'#fff',border:'1px solid #333',boxSizing:'border-box'}}/><div style={{marginTop:'20px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px'}}>{filtered.map(p=><img key={p.id} src={p.img} onClick={()=>{setTab('home'); window.scrollTo(0,0)}} style={{width:'100%',height:'140px',objectFit:'cover'}} alt=""/>)}</div>{filtered.length===0 && <p style={{color:'#666',textAlign:'center',marginTop:'40px'}}>No results for "{searchQ}" 😕</p>}</div>}

  {tab==='reels' && <div style={{maxWidth:'500px',margin:'0 auto'}}>{posts.map(p=>(<div key={p.id} style={{position:'relative',height:'75vh',marginBottom:'10px'}}><img src={p.img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px',background:'linear-gradient(transparent,rgba(0,0,0,0.8))'}}><div style={{fontWeight:'bold'}}>@{p.user}</div><div>{p.caption}</div><div style={{display:'flex',gap:'15px',marginTop:'10px'}}><span>❤️ {p.likes}</span><span>💬 {p.comments.length}</span><span onClick={()=>handleShare(p)}>🚀 Share</span></div></div><div style={{position:'absolute',right:'15px',bottom:'100px',display:'flex',flexDirection:'column',gap:'20px',fontSize:'24px'}}><span onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))}>❤️</span><span onClick={()=>setActivePost(p.id)}>💬</span><span onClick={()=>handleShare(p)}>🚀</span></div></div>))}</div>}

  {tab==='profile' && <div style={{maxWidth:'500px',margin:'0 auto',padding:'20px',textAlign:'center'}}><div style={{width:'90px',height:'90px',borderRadius:'50%',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',margin:'0 auto'}}>{currentUser?.[0]?.toUpperCase()}</div><h2 style={{margin:'10px 0 5px'}}>@{currentUser}</h2><p style={{color:'#888',margin:0}}>{myPosts.length} posts • {myPosts.reduce((a,b)=>a+b.likes,0)} likes</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px',marginTop:'20px'}}>{myPosts.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'140px',objectFit:'cover'}} alt=""/>)}</div>{myPosts.length===0 && <p style={{color:'#666',marginTop:'30px'}}>No posts yet! Click + to add 📸</p>}<button onClick={()=>{localStorage.removeItem("chitpix_user"); setCurrentUser(null)}} style={{marginTop:'30px',padding:'12px 30px',borderRadius:'25px',background:'#1a1a1a',color:'#ff3040',border:'1px solid #333'}}>Logout</button></div>}

  {activePost!==null && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:90,display:'flex',alignItems:'flex-end'}}><div style={{background:'#121212',width:'100%',maxHeight:'70vh',borderRadius:'20px 20px 0 0',borderTop:'1px solid #333',display:'flex',flexDirection:'column'}}><div style={{padding:'15px',borderBottom:'1px solid #222',display:'flex',justifyContent:'space-between'}}><b>Comments 💬</b><button onClick={()=>setActivePost(null)} style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>✕</button></div><div style={{flex:1,overflowY:'auto',padding:'15px'}}>{posts.find(x=>x.id===activePost)?.comments.map((c:any,i:number)=><div key={i} style={{marginBottom:'12px'}}><b>@{c.user}</b> {c.text}</div>)}{posts.find(x=>x.id===activePost)?.comments.length===0 && <p style={{color:'#666',textAlign:'center'}}>Be first to comment! 👇</p>}</div><div style={{padding:'12px',borderTop:'1px solid #222',display:'flex',gap:'10px'}}><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." style={{flex:1,padding:'12px',borderRadius:'25px',background:'#222',color:'#fff',border:'1px solid #333'}}/><button onClick={addComment} style={{background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',border:'none',padding:'12px 20px',borderRadius:'25px',color:'#fff',fontWeight:'bold'}}>Post</button></div></div></div>}

  {showAdd && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'15px'}}><div style={{background:'#1a1a1a',width:'100%',maxWidth:'400px',borderRadius:'16px',padding:'20px',border:'1px solid #333'}}><h3>New Post 📸</h3><input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="Image URL" style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/><input value={newCap} onChange={e=>setNewCap(e.target.value)} placeholder="Caption..." style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/><div style={{display:'flex',gap:'10px'}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#333',color:'#fff',border:'none'}}>Cancel</button><button onClick={addPost} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#fff',color:'#000',border:'none',fontWeight:'bold'}}>Post 🚀</button></div></div></div>}

  <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#000',borderTop:'1px solid #222',display:'flex',justifyContent:'space-around',alignItems:'center',padding:'10px 0',zIndex:50}}>
   <button onClick={()=>setTab('home')} style={{background:'none',border:'none',fontSize:'24px',opacity:tab==='home'?1:0.5}}>🏠</button>
   <button onClick={()=>setTab('search')} style={{background:'none',border:'none',fontSize:'24px',opacity:tab==='search'?1:0.5}}>🔍</button>
   <button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',border:'none',width:'50px',height:'50px',borderRadius:'50%',fontSize:'30px',color:'#fff',marginTop:'-10px'}}>+</button>
   <button onClick={()=>setTab('reels')} style={{background:'none',border:'none',fontSize:'24px',opacity:tab==='reels'?1:0.5}}>🎬</button>
   <button onClick={()=>setTab('profile')} style={{background:'none',border:'none',fontSize:'24px',opacity:tab==='profile'?1:0.5}}>👤</button>
  </div>
 </div>
 )
                                                                                                                                                                                                                                                                                                                                                                                                                                                       }
