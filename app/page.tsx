"use client"
import { useState, useEffect } from "react"

export default function Home(){
 const [currentUser,setCurrentUser]=useState<string|null>(null)
 const [loginUser,setLoginUser]=useState("")
 const [loginPass,setLoginPass]=useState("")
 const [tab,setTab]=useState('home')
 const [showAdd,setShowAdd]=useState(false)
 const [showStoryAdd,setShowStoryAdd]=useState(false)
 const [newImg,setNewImg]=useState("")
 const [newCap,setNewCap]=useState("")
 const [newStoryImg,setNewStoryImg]=useState("")
 const [commentText,setCommentText]=useState("")
 const [activePost,setActivePost]=useState<number|null>(null)
 const [activeStory,setActiveStory]=useState<number|null>(null)
 const [searchQ,setSearchQ]=useState("")
 const [dmText,setDmText]=useState("")
 const [activeChat,setActiveChat]=useState<string|null>(null)
 const [stories,setStories]=useState<any[]>([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",time:Date.now(),viewed:false},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",time:Date.now(),viewed:false},
  {id:3,user:"arjun",img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",time:Date.now(),viewed:true},
 ])
 const [posts,setPosts]=useState<any[]>([
  {id:1,user:"mahesh-07",img:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",likes:12,liked:false,caption:"First ChitPix post 🔥",comments:[{user:"sravani",text:"Super pic bro!"}]},
  {id:2,user:"sravani",img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",likes:5,liked:false,caption:"Beach sunset 🌊",comments:[]},
  {id:3,user:"arjun",img:"https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600",likes:20,liked:false,caption:"Golden hour ✨",comments:[]},
 ])
 const [chats,setChats]=useState<any[]>([
  {user:"sravani",avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",last:"Hey! ChitPix super undi 😍",messages:[{from:"sravani",text:"Hey! ChitPix super undi 😍",time:"10:30 AM"},{from:"me",text:"Thanks! Nuvvu kuda post pettu!",time:"10:31 AM"}]},
  {user:"arjun",avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",last:"Reel chusa bro 🔥",messages:[{from:"arjun",text:"Reel chusa bro 🔥",time:"9:15 AM"}]},
  {user:"mahesh-07",avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",last:"Story pettu bro!",messages:[{from:"mahesh-07",text:"Story pettu bro!",time:"Yesterday"}]},
 ])

 useEffect(()=>{ const s=localStorage.getItem("chitpix_user"); if(s) setCurrentUser(s) },[])
 useEffect(()=>{ if(activeStory!==null){ const t=setTimeout(()=>{ setStories(stories.map((s,i)=> i===activeStory?{...s,viewed:true}:s)); setActiveStory(activeStory+1 < stories.length? activeStory+1 : null) },4000); return ()=>clearTimeout(t) }},[activeStory,stories])

 const handleAuth=()=>{ if(!loginUser||!loginPass) return alert("Pettu bro!"); localStorage.setItem("chitpix_user",loginUser); setCurrentUser(loginUser) }
 const addPost=()=>{ if(!newImg) return alert("URL pettu!"); setPosts([{id:Date.now(),user:currentUser,img:newImg,likes:0,liked:false,caption:newCap,comments:[]},...posts]); setNewImg(""); setNewCap(""); setShowAdd(false); setTab('home') }
 const addStory=()=>{ if(!newStoryImg) return alert("Story image URL pettu!"); setStories([{id:Date.now(),user:currentUser,img:newStoryImg,time:Date.now(),viewed:false},...stories]); setNewStoryImg(""); setShowStoryAdd(false) }
 const addComment=()=>{ if(!commentText.trim()||activePost===null) return; setPosts(posts.map(p=>p.id===activePost?{...p,comments:[...p.comments,{user:currentUser,text:commentText}]}:p)); setCommentText("") }
 const sendDM=()=>{ if(!dmText.trim()||!activeChat) return; setChats(chats.map(c=> c.user===activeChat? {...c,last:dmText,messages:[...c.messages,{from:"me",text:dmText,time:"Now"}]}:c)); setDmText("") }
 const handleShare=async(p:any)=>{ const t=p.caption+" - ChitPix 📸\n"+p.img; if(navigator.share){ try{ await navigator.share({title:"ChitPix",text:t,url:location.href})}catch(e){} }else{ await navigator.clipboard.writeText(t); alert("Copied! 🚀") } }

 const filtered = posts.filter(p=> p.user.toLowerCase().includes(searchQ.toLowerCase()) || p.caption.toLowerCase().includes(searchQ.toLowerCase()))
 const myPosts = posts.filter(p=> p.user===currentUser)
 const validStories = stories.filter(s=> Date.now() - s.time < 24*60*60*1000)

 if(!currentUser){
  return(<div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}><div style={{width:'100%',maxWidth:'360px',textAlign:'center'}}><div style={{width:'80px',height:'80px',borderRadius:'20px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',margin:'0 auto 15px'}}>📸</div><h1 style={{fontSize:'38px',fontWeight:900,margin:0}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1><div style={{background:'#111',borderRadius:'16px',padding:'20px',border:'1px solid #222',marginTop:'20px'}}><input value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="Username" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/><input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Password" style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/><button onClick={handleAuth} style={{width:'100%',padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',color:'#fff',border:'none',fontWeight:'bold'}}>Login 🚀</button></div></div></div>)
 }

 return(
 <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:'90px'}}>
  <div style={{display:'flex',justifyContent:'space-between',padding:'12px 15px',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#000',zIndex:20,alignItems:'center'}}>
   <div style={{display:'flex',gap:'10px',alignItems:'center'}}><div style={{width:'42px',height:'42px',borderRadius:'12px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center'}}>📸</div><h1 style={{margin:0,fontSize:'26px',fontWeight:900}}>Chit<span style={{color:'#ff7a00'}}>pix</span></h1></div>
   <div style={{display:'flex',gap:'15px',alignItems:'center'}}><button onClick={()=>setTab('dm')} style={{background:'none',border:'none',fontSize:'22px'}}>💬</button><span style={{color:'#aaa',fontSize:'14px'}}>@{currentUser}</span></div>
  </div>

  {tab==='home' && <>
   <div style={{display:'flex',gap:'12px',padding:'12px 10px',overflowX:'auto',borderBottom:'1px solid #111'}}>
    <div onClick={()=>setShowStoryAdd(true)} style={{textAlign:'center',minWidth:'65px',cursor:'pointer'}}><div style={{width:'62px',height:'62px',borderRadius:'50%',background:'#1a1a1a',border:'2px dashed #444',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>+</div><div style={{fontSize:'11px',marginTop:'4px'}}>Add</div></div>
    {validStories.map((s,i)=><div key={s.id} onClick={()=>setActiveStory(i)} style={{textAlign:'center',minWidth:'65px',cursor:'pointer'}}><div style={{width:'62px',height:'62px',borderRadius:'50%',padding:'3px',background: s.viewed? '#333' : 'linear-gradient(135deg,#ff7a00,#ff3ca0,#8a2be2)'}}><img src={s.img} style={{width:'100%',height:'100%',borderRadius:'50%',border:'2px solid #000',objectFit:'cover'}} alt=""/></div><div style={{fontSize:'11px',marginTop:'4px',maxWidth:'62px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.user}</div></div>)}
   </div>
   <div style={{maxWidth:'500px',margin:'0 auto'}}>{posts.map(p=>(<div key={p.id} style={{borderBottom:'8px solid #111'}}><div style={{padding:'10px',fontWeight:'bold'}}>@{p.user}</div><img src={p.img} style={{width:'100%',height:'420px',objectFit:'cover'}} alt=""/><div style={{display:'flex',gap:'20px',padding:'12px',alignItems:'center'}}><button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,likes:x.liked?x.likes-1:x.likes+1,liked:!x.liked}:x))} style={{background:'none',border:'none',color:p.liked?'#ff3040':'#fff',fontSize:'20px'}}>❤️ {p.likes}</button><button onClick={()=>setActivePost(p.id)} style={{background:'none',border:'none',fontSize:'20px'}}>💬 {p.comments.length}</button><button onClick={()=>{ const u=chats.find(c=>c.user===p.user); if(!u){ setChats([{user:p.user,avatar:p.img,last:"Hi!",messages:[]},...chats]) } setActiveChat(p.user); setTab('dm') }} style={{background:'none',border:'none',fontSize:'20px'}}>📩</button><button onClick={()=>handleShare(p)} style={{background:'none',border:'none',fontSize:'20px',marginLeft:'auto'}}>🚀</button></div><div style={{padding:'0 12px 12px'}}><b>@{p.user}</b> {p.caption}</div></div>))}</div>
  </>}

  {tab==='dm' &&!activeChat && <div style={{maxWidth:'500px',margin:'0 auto'}}><div style={{padding:'15px',fontWeight:'bold',fontSize:'18px',borderBottom:'1px solid #222'}}>Messages 💬</div>{chats.map(c=><div key={c.user} onClick={()=>setActiveChat(c.user)} style={{display:'flex',gap:'12px',padding:'12px 15px',borderBottom:'1px solid #111',cursor:'pointer',alignItems:'center'}}><img src={c.avatar} style={{width:'50px',height:'50px',borderRadius:'50%',objectFit:'cover'}} alt=""/><div style={{flex:1}}><div style={{fontWeight:'bold'}}>@{c.user}</div><div style={{color:'#888',fontSize:'13px',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.last}</div></div><div style={{color:'#555',fontSize:'11px'}}>{c.messages[c.messages.length-1]?.time}</div></div>)}</div>}

  {tab==='dm' && activeChat && <div style={{maxWidth:'500px',margin:'0 auto',display:'flex',flexDirection:'column',height:'calc(100vh - 130px)'}}><div style={{display:'flex',gap:'10px',padding:'12px 15px',borderBottom:'1px solid #222',alignItems:'center'}}><button onClick={()=>setActiveChat(null)} style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>←</button><img src={chats.find(c=>c.user===activeChat)?.avatar} style={{width:'35px',height:'35px',borderRadius:'50%'}} alt=""/><b>@{activeChat}</b></div><div style={{flex:1,overflowY:'auto',padding:'15px',display:'flex',flexDirection:'column',gap:'10px'}}>{chats.find(c=>c.user===activeChat)?.messages.map((m:any,i:number)=><div key={i} style={{alignSelf:m.from==='me'?'flex-end':'flex-start',background:m.from==='me'?'linear-gradient(135deg,#ff7a00,#ff3ca0)':'#222',padding:'10px 14px',borderRadius:m.from==='me'?'18px 18px 4px 18px':'18px 18px 18px 4px',maxWidth:'70%'}}><div>{m.text}</div><div style={{fontSize:'10px',opacity:0.7,marginTop:'3px',textAlign:'right'}}>{m.time}</div></div>)}</div><div style={{padding:'10px',borderTop:'1px solid #222',display:'flex',gap:'10px'}}><input value={dmText} onChange={e=>setDmText(e.target.value)} onKeyDown={e=> e.key==='Enter' && sendDM()} placeholder="Message..." style={{flex:1,padding:'12px 16px',borderRadius:'25px',background:'#1a1a1a',color:'#fff',border:'1px solid #333'}}/><button onClick={sendDM} style={{background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',border:'none',width:'45px',height:'45px',borderRadius:'50%',color:'#fff',fontSize:'18px'}}>🚀</button></div></div>}

  {tab==='search' && <div style={{maxWidth:'500px',margin:'0 auto',padding:'15px'}}><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Search..." style={{width:'100%',padding:'14px',borderRadius:'25px',background:'#1a1a1a',color:'#fff',border:'1px solid #333',boxSizing:'border-box'}}/><div style={{marginTop:'20px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px'}}>{filtered.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'140px',objectFit:'cover'}} alt=""/>)}</div></div>}

  {tab==='reels' && <div style={{maxWidth:'500px',margin:'0 auto'}}>{posts.map(p=>(<div key={p.id} style={{position:'relative',height:'75vh',marginBottom:'10px'}}><img src={p.img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px',background:'linear-gradient(transparent,rgba(0,0,0,0.8))'}}><b>@{p.user}</b><div>{p.caption}</div></div></div>))}</div>}

  {tab==='profile' && <div style={{maxWidth:'500px',margin:'0 auto',padding:'20px',textAlign:'center'}}><div style={{width:'90px',height:'90px',borderRadius:'50%',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',margin:'0 auto'}}>{currentUser?.[0]?.toUpperCase()}</div><h2>@{currentUser}</h2><p style={{color:'#888'}}>{myPosts.length} posts • {validStories.filter(s=>s.user===currentUser).length} stories</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2px',marginTop:'20px'}}>{myPosts.map(p=><img key={p.id} src={p.img} style={{width:'100%',height:'140px',objectFit:'cover'}} alt=""/>)}</div><button onClick={()=>{localStorage.removeItem("chitpix_user"); setCurrentUser(null)}} style={{marginTop:'30px',padding:'12px 30px',borderRadius:'25px',background:'#1a1a1a',color:'#ff3040',border:'1px solid #333'}}>Logout</button></div>}

  {activeStory!==null && validStories[activeStory] && (<div style={{position:'fixed',inset:0,background:'#000',zIndex:200,display:'flex',flexDirection:'column'}}><div style={{display:'flex',gap:'3px',padding:'8px'}}>{validStories.map((_,idx)=><div key={idx} style={{flex:1,height:'3px',background: idx<activeStory!? '#fff' : idx===activeStory? '#ff3ca0' : 'rgba(255,255,255,0.3)',borderRadius:'2px'}}></div>)}</div><div style={{display:'flex',justifyContent:'space-between',padding:'10px 15px',alignItems:'center'}}><span style={{fontWeight:'bold'}}>🔥 @{validStories[activeStory].user}</span><button onClick={()=>setActiveStory(null)} style={{background:'none',border:'none',color:'#fff',fontSize:'24px'}}>✕</button></div><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}><img src={validStories[activeStory].img} style={{maxWidth:'100%',maxHeight:'80vh',objectFit:'contain'}} alt=""/><button onClick={()=>setActiveStory(activeStory>0?activeStory-1:null)} style={{position:'absolute',left:0,top:0,bottom:0,width:'30%',background:'none',border:'none'}}></button><button onClick={()=>setActiveStory(activeStory+1 < validStories.length? activeStory+1 : null)} style={{position:'absolute',right:0,top:0,bottom:0,width:'70%',background:'none',border:'none'}}></button></div></div>)}

  {activePost!==null && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:90,display:'flex',alignItems:'flex-end'}}><div style={{background:'#121212',width:'100%',maxHeight:'70vh',borderRadius:'20px 20px 0 0',borderTop:'1px solid #333',display:'flex',flexDirection:'column'}}><div style={{padding:'15px',borderBottom:'1px solid #222',display:'flex',justifyContent:'space-between'}}><b>Comments 💬</b><button onClick={()=>setActivePost(null)} style={{background:'none',border:'none',color:'#fff',fontSize:'20px'}}>✕</button></div><div style={{flex:1,overflowY:'auto',padding:'15px'}}>{posts.find(x=>x.id===activePost)?.comments.map((c:any,i:number)=><div key={i} style={{marginBottom:'12px'}}><b>@{c.user}</b> {c.text}</div>)}</div><div style={{padding:'12px',borderTop:'1px solid #222',display:'flex',gap:'10px'}}><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add comment..." style={{flex:1,padding:'12px',borderRadius:'25px',background:'#222',color:'#fff',border:'1px solid #333'}}/><button onClick={addComment} style={{background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',border:'none',padding:'12px 20px',borderRadius:'25px',color:'#fff',fontWeight:'bold'}}>Post</button></div></div></div>}

  {showAdd && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'15px'}}><div style={{background:'#1a1a1a',width:'100%',maxWidth:'400px',borderRadius:'16px',padding:'20px',border:'1px solid #333'}}><h3>New Post 📸</h3><input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="Image URL" style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'10px',boxSizing:'border-box'}}/><input value={newCap} onChange={e=>setNewCap(e.target.value)} placeholder="Caption..." style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/><div style={{display:'flex',gap:'10px'}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#333',color:'#fff',border:'none'}}>Cancel</button><button onClick={addPost} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#fff',color:'#000',border:'none',fontWeight:'bold'}}>Post 🚀</button></div></div></div>}

  {showStoryAdd && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:110,display:'flex',alignItems:'center',justifyContent:'center',padding:'15px'}}><div style={{background:'#1a1a1a',width:'100%',maxWidth:'400px',borderRadius:'16px',padding:'20px',border:'1px solid #333'}}><h3>Add Story 🔥</h3><input value={newStoryImg} onChange={e=>setNewStoryImg(e.target.value)} placeholder="Story Image URL" style={{width:'100%',padding:'12px',borderRadius:'10px',background:'#000',color:'#fff',border:'1px solid #333',marginBottom:'15px',boxSizing:'border-box'}}/><div style={{display:'flex',gap:'10px'}}><button onClick={()=>setShowStoryAdd(false)} style={{flex:1,padding:'12px',borderRadius:'10px',background:'#333',color:'#fff',border:'none'}}>Cancel</button><button onClick={addStory} style={{flex:1,padding:'12px',borderRadius:'10px',background:'linear-gradient(135deg,#ff7a00,#ff3ca0)',color:'#fff',border:'none',fontWeight:'bold'}}>Add Story 🚀</button></div></div></div>}

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
