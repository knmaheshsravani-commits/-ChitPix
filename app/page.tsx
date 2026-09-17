"use client"
import { useState, useEffect, useRef } from "react"
export default function Home(){
  const [currentUser,setCurrentUser]=useState<string|null>(null)
  const [loginUser,setLoginUser]=useState("")
  const [showAdd,setShowAdd]=useState(false)
  const [newImg,setNewImg]=useState("")
  const [newCap,setNewCap]=useState("")
  const fileRef=useRef<HTMLInputElement>(null)
  const [posts,setPosts]=useState<any[]>([
    {id:1,user:"mahesh-07",avatar:"https://i.pravatar.cc/150?img=1",img:"https://picsum.photos/seed/p1/600/600",cap:"ChitPix first post! 🔥 #hiking",likes:24,liked:false},
    {id:2,user:"sravani",avatar:"https://i.pravatar.cc/150?img=5",img:"https://picsum.photos/seed/p2/600/600",cap:"Beach vibes 🌊",likes:41,liked:false}
  ])
  const [stories,setStories]=useState<any[]>([
    {id:1,user:"mahesh-0",avatar:"https://i.pravatar.cc/150?img=1",time:Date.now()},
    {id:2,user:"sravani",avatar:"https://i.pravatar.cc/150?img=5",time:Date.now()}
  ])
  useEffect(()=>{const s=localStorage.getItem("chitpix_user");if(s)setCurrentUser(s)},[])
  const handleFile=(e:any)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>setNewImg(r.result as string);r.readAsDataURL(f)}
  const handleAuth=()=>{if(!loginUser)return;localStorage.setItem("chitpix_user",loginUser);setCurrentUser(loginUser)}
  const addPost=()=>{if(!newImg)return;setPosts([{id:Date.now(),user:currentUser,avatar:`https://i.pravatar.cc/150?u=${currentUser}`,img:newImg,cap:newCap,likes:0,liked:false},...posts]);setNewImg("");setNewCap("");setShowAdd(false)}
  if(!currentUser){return(<div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',padding:20}}><h1 style={{fontSize:38,fontWeight:800,marginBottom:20}}>ChitPix 📸</h1><input placeholder="Username" value={loginUser} onChange={e=>setLoginUser(e.target.value)} style={{padding:'14px 18px',borderRadius:12,border:'none',marginBottom:16,width:280,color:'#000'}}/><button onClick={handleAuth} style={{background:'#ff6a00',color:'#fff',padding:'14px 44px',borderRadius:12,border:'none',fontWeight:700}}>Login</button></div>)}
  return(
  <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:115}}>
    <div style={{position:'sticky',top:0,zIndex:10,background:'#000',padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #222'}}><h1 style={{fontWeight:800,fontSize:26}}>ChitPix</h1><div style={{display:'flex',gap:20}}><span onClick={()=>setShowAdd(true)} style={{fontSize:36,cursor:'pointer'}}>➕</span><span style={{fontSize:36}}>💬</span></div></div>
    <div style={{display:'flex',gap:16,padding:18,overflowX:'auto'}}>{stories.map(s=>(<div key={s.id} style={{textAlign:'center',minWidth:82}}><div style={{width:80,height:80,borderRadius:40,padding:3,background:'linear-gradient(45deg,#ff6a00,#ff006a)'}}><img src={s.avatar} style={{width:'100%',height:'100%',borderRadius:40,border:'3px solid #000'}}/></div><div style={{fontSize:12,marginTop:6}}>{s.user}</div></div>))}</div>
    <div style={{display:'flex',flexDirection:'column',gap:22}}>{posts.map(p=>(<div key={p.id} style={{borderBottom:'1px solid #222'}}><div style={{display:'flex',gap:12,padding:'14px 18px',alignItems:'center'}}><img src={p.avatar} style={{width:44,height:44,borderRadius:22}}/><b style={{fontSize:16}}>{p.user}</b></div><img src={p.img} style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/><div style={{padding:'14px 18px',display:'flex',gap:24,fontSize:36}}><span>🤍</span><span>💬</span><span>✈️</span></div><div style={{padding:'0 18px 14px',fontSize:15}}><b>{p.user}</b> {p.cap}</div></div>))}</div>
    {showAdd && (<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}><div style={{background:'#111',padding:24,borderRadius:20,width:'100%',maxWidth:400,border:'1px solid #333'}}><h3 style={{fontSize:20,fontWeight:700,marginBottom:16}}>New Post 📸</h3><input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/><button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:'40px 20px',border:'2px dashed #ff6a00',borderRadius:16,background:'#0a0a0a',color:'#fff',fontSize:16,marginBottom:16}}>{newImg?"✅ Image Selected!":"📁 Click to Choose Image"}</button>{newImg && <img src={newImg} style={{width:'100%',height:200,objectFit:'cover',borderRadius:12,marginBottom:16}}/>}<input placeholder="Write caption... #hiking" value={newCap} onChange={e=>setNewCap(e.target.value)} style={{width:'100%',padding:'12px 16px',borderRadius:12,border:'1px solid #333',background:'#000',color:'#fff',marginBottom:16}}/><div style={{display:'flex',gap:12}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:'12px',borderRadius:12,border:'1px solid #333',background:'#222',color:'#fff'}}>Cancel</button><button onClick={addPost} style={{flex:1,padding:'12px',borderRadius:12,border:'none',background:'#ff6a00',color:'#fff',fontWeight:700}}>Post</button></div></div></div>)}
    <div style={{position:'fixed',bottom:0,left:0,right:0,height:105,background:'#000',borderTop:'2px solid #333',display:'flex',justifyContent:'space-around',alignItems:'center',zIndex:40}}><button style={{background:'none',border:'none',fontSize:44}}>🏠</button><button style={{background:'none',border:'none',fontSize:44}}>🔍</button><button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(45deg,#ff6a00,#ff006a)',border:'none',width:76,height:76,borderRadius:38,fontSize:44,color:'#fff',fontWeight:800,boxShadow:'0 6px 24px rgba(255,106,0,0.6)'}}>+</button><button style={{background:'none',border:'none',fontSize:44}}>🎬</button><button style={{background:'none',border:'none',fontSize:44}}>👤</button></div>
  </div>)
    }           
