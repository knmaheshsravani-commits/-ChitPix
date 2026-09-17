"use client"
import { useState, useRef, useEffect } from "react"
export default function Home(){
  const [currentUser,setCurrentUser]=useState<string|null>(null)
  const [loginUser,setLoginUser]=useState("")
  const [showAdd,setShowAdd]=useState(false)
  const [newImg,setNewImg]=useState("")
  const [newCap,setNewCap]=useState("")
  const fileRef=useRef<HTMLInputElement>(null)
  const [posts,setPosts]=useState<any[]>([
    {id:1,user:"mahesh-07",avatar:"https://i.pravatar.cc/150?img=1",img:"https://picsum.photos/seed/p1/600/600",cap:"ChitPix first post! 🔥",likes:24},
    {id:2,user:"sravani",avatar:"https://i.pravatar.cc/150?img=5",img:"https://picsum.photos/seed/p2/600/600",cap:"Beach vibes 🌊",likes:41}
  ])
  useEffect(()=>{const s=localStorage.getItem("chitpix_user");if(s)setCurrentUser(s)},[])
  const handleFile=(e:any)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>setNewImg(r.result as string);r.readAsDataURL(f)}
  const handleAuth=()=>{if(!loginUser)return;localStorage.setItem("chitpix_user",loginUser);setCurrentUser(loginUser)}
  const addPost=()=>{if(!newImg)return;setPosts([{id:Date.now(),user:currentUser,avatar:`https://i.pravatar.cc/150?u=${currentUser}`,img:newImg,cap:newCap,likes:0},...posts]);setNewImg("");setNewCap("");setShowAdd(false)}
  if(!currentUser){return(<div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><h1 style={{fontSize:50,fontWeight:900,marginBottom:24,textShadow:'0 0 20px #ff6a00'}}>ChitPix 📸</h1><input placeholder="Username" value={loginUser} onChange={e=>setLoginUser(e.target.value)} style={{padding:'20px 24px',borderRadius:16,border:'3px solid #ff6a00',marginBottom:16,width:320,fontSize:20,color:'#000'}}/><button onClick={handleAuth} style={{background:'#ff6a00',color:'#fff',padding:'20px 60px',borderRadius:16,border:'none',fontWeight:900,fontSize:20,boxShadow:'0 0 20px #ff6a00'}}>LOGIN 🔥</button></div>)}
  return(
  <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:160}}>
    <div style={{position:'sticky',top:0,zIndex:10,background:'#000',padding:'22px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'3px solid #ff6a00'}}><h1 style={{fontWeight:900,fontSize:32,textShadow:'0 0 10px #ff6a00'}}>ChitPix</h1><div style={{display:'flex',gap:32}}><span onClick={()=>setShowAdd(true)} style={{fontSize:50,cursor:'pointer',filter:'drop-shadow(0 0 10px #ff6a00)'}}>➕</span><span style={{fontSize:50}}>💬</span></div></div>
    <div style={{display:'flex',flexDirection:'column',gap:28}}>{posts.map(p=>(<div key={p.id} style={{borderBottom:'3px solid #222'}}><div style={{display:'flex',gap:16,padding:'20px 24px',alignItems:'center'}}><img src={p.avatar} style={{width:60,height:60,borderRadius:30,border:'3px solid #ff6a00'}}/><b style={{fontSize:20}}>{p.user}</b></div><img src={p.img} style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderTop:'2px solid #333',borderBottom:'2px solid #333'}}/><div style={{padding:'20px 24px',display:'flex',gap:32,fontSize:48}}><span>❤️</span><span>💬</span><span>✈️</span></div><div style={{padding:'0 24px 20px',fontSize:18}}><b>{p.user}</b> {p.cap} - <b>{p.likes} likes</b></div></div>))}</div>
    {showAdd && (<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}><div style={{background:'#111',padding:32,borderRadius:28,width:'100%',maxWidth:440,border:'4px solid #ff6a00',boxShadow:'0 0 40px rgba(255,106,0,0.5)'}}><h3 style={{fontSize:28,fontWeight:900,marginBottom:24}}>New Post 📸</h3><input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/><button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:'60px 20px',border:'4px dashed #ff6a00',borderRadius:20,background:'#000',color:'#fff',fontSize:20,fontWeight:800,marginBottom:20}}>{newImg?"✅ READY!":"📁 TAP TO CHOOSE IMAGE"}</button>{newImg && <img src={newImg} style={{width:'100%',height:260,objectFit:'cover',borderRadius:16,marginBottom:20,border:'3px solid #333'}}/>}<input placeholder="Write caption... #hiking" value={newCap} onChange={e=>setNewCap(e.target.value)} style={{width:'100%',padding:'18px 20px',borderRadius:14,border:'3px solid #333',background:'#000',color:'#fff',marginBottom:20,fontSize:18}}/><div style={{display:'flex',gap:16}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:'18px',borderRadius:14,border:'3px solid #333',background:'#222',color:'#fff',fontWeight:800,fontSize:18}}>Cancel</button><button onClick={addPost} style={{flex:1,padding:'18px',borderRadius:14,border:'none',background:'#ff6a00',color:'#fff',fontWeight:900,fontSize:18}}>Post 🚀</button></div></div></div>)}
    <div style={{position:'fixed',bottom:0,left:0,right:0,height:150,background:'#000',borderTop:'4px solid #ff6a00',display:'flex',justifyContent:'space-around',alignItems:'center',zIndex:50,boxShadow:'0 -10px 30px rgba(255,106,0,0.3)'}}>
      <button style={{background:'none',border:'none',fontSize:70,filter:'drop-shadow(0 0 12px rgba(255,106,0,0.6))',textShadow:'0 0 10px #ff6a00'}}>🏠</button>
      <button style={{background:'none',border:'none',fontSize:70}}>🔍</button>
      <button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(45deg,#ff6a00,#ff006a)',border:'4px solid #fff',width:100,height:100,borderRadius:50,fontSize:62,color:'#fff',fontWeight:900,boxShadow:'0 10px 40px rgba(255,106,0,0.9)'}}>+</button>
      <button style={{background:'none',border:'none',fontSize:70}}>🎬</button>
      <button style={{background:'none',border:'none',fontSize:70}}>👤</button>
    </div>
  </div>)
    }
