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
    {id:1,user:"mahesh-07",avatar:"https://i.pravatar.cc/150?img=1",img:"https://picsum.photos/seed/p1/600/600",cap:"ChitPix first post! 🔥 #hiking",likes:24},
    {id:2,user:"sravani",avatar:"https://i.pravatar.cc/150?img=5",img:"https://picsum.photos/seed/p2/600/600",cap:"Beach vibes 🌊",likes:41}
  ])
  useEffect(()=>{const s=localStorage.getItem("chitpix_user");if(s)setCurrentUser(s)},[])
  const handleFile=(e:any)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>setNewImg(r.result as string);r.readAsDataURL(f)}
  const handleAuth=()=>{if(!loginUser)return;localStorage.setItem("chitpix_user",loginUser);setCurrentUser(loginUser)}
  const addPost=()=>{if(!newImg)return;setPosts([{id:Date.now(),user:currentUser,avatar:`https://i.pravatar.cc/150?u=${currentUser}`,img:newImg,cap:newCap,likes:0},...posts]);setNewImg("");setNewCap("");setShowAdd(false)}
  if(!currentUser){return(<div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><h1 style={{fontSize:44,fontWeight:900,marginBottom:24}}>ChitPix 📸</h1><input placeholder="Username" value={loginUser} onChange={e=>setLoginUser(e.target.value)} style={{padding:'18px 22px',borderRadius:16,border:'none',marginBottom:16,width:300,fontSize:18,color:'#000'}}/><button onClick={handleAuth} style={{background:'#ff6a00',color:'#fff',padding:'18px 50px',borderRadius:16,border:'none',fontWeight:800,fontSize:18}}>Login</button></div>)}
  return(
  <div style={{background:'#000',color:'#fff',minHeight:'100vh',paddingBottom:140}}>
    <div style={{position:'sticky',top:0,zIndex:10,background:'#000',padding:'20px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #333'}}><h1 style={{fontWeight:900,fontSize:30}}>ChitPix</h1><div style={{display:'flex',gap:28}}><span onClick={()=>setShowAdd(true)} style={{fontSize:44,cursor:'pointer'}}>➕</span><span style={{fontSize:44}}>💬</span></div></div>
    <div style={{display:'flex',gap:18,padding:22,overflowX:'auto'}}><div style={{textAlign:'center',minWidth:95}}><div style={{width:92,height:92,borderRadius:46,padding:4,background:'linear-gradient(45deg,#ff6a00,#ff006a)'}}><div style={{width:'100%',height:'100%',borderRadius:46,background:'#333',border:'4px solid #000'}}></div></div><div style={{fontSize:14,marginTop:8,fontWeight:600}}>You</div></div></div>
    <div style={{display:'flex',flexDirection:'column',gap:24}}>{posts.map(p=>(<div key={p.id} style={{borderBottom:'2px solid #222'}}><div style={{display:'flex',gap:14,padding:'18px 22px',alignItems:'center'}}><img src={p.avatar} style={{width:54,height:54,borderRadius:27,border:'2px solid #ff6a00'}}/><b style={{fontSize:18}}>{p.user}</b></div><img src={p.img} style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/><div style={{padding:'18px 22px',display:'flex',gap:28,fontSize:42}}><span>❤️</span><span>💬</span><span>✈️</span></div><div style={{padding:'0 22px 18px',fontSize:17}}><b>{p.user}</b> {p.cap} - <b>{p.likes} likes</b></div></div>))}</div>
    {showAdd && (<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}><div style={{background:'#1a1a1a',padding:28,borderRadius:24,width:'100%',maxWidth:420,border:'2px solid #ff6a00'}}><h3 style={{fontSize:24,fontWeight:800,marginBottom:20}}>New Post 📸</h3><input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/><button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:'50px 20px',border:'3px dashed #ff6a00',borderRadius:20,background:'#000',color:'#fff',fontSize:18,fontWeight:700,marginBottom:18}}>{newImg?"✅ IMAGE READY!":"📁 TAP TO CHOOSE IMAGE"}</button>{newImg && <img src={newImg} style={{width:'100%',height:240,objectFit:'cover',borderRadius:16,marginBottom:18,border:'2px solid #333'}}/>}<input placeholder="Write caption... #hiking" value={newCap} onChange={e=>setNewCap(e.target.value)} style={{width:'100%',padding:'16px 18px',borderRadius:14,border:'2px solid #333',background:'#000',color:'#fff',marginBottom:18,fontSize:16}}/><div style={{display:'flex',gap:14}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:'16px',borderRadius:14,border:'2px solid #333',background:'#222',color:'#fff',fontWeight:700,fontSize:16}}>Cancel</button><button onClick={addPost} style={{flex:1,padding:'16px',borderRadius:14,border:'none',background:'#ff6a00',color:'#fff',fontWeight:800,fontSize:16}}>Post 🚀</button></div></div></div>)}
    <div style={{position:'fixed',bottom:0,left:0,right:0,height:130,background:'#000',borderTop:'3px solid #ff6a00',display:'flex',justifyContent:'space-around',alignItems:'center',zIndex:50,paddingBottom:10}}>
      <button style={{background:'none',border:'none',fontSize:58,filter:'drop-shadow(0 0 8px rgba(255,106,0,0.5))'}}>🏠</button>
      <button style={{background:'none',border:'none',fontSize:58}}>🔍</button>
      <button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(45deg,#ff6a00,#ff006a)',border:'3px solid #fff',width:88,height:88,borderRadius:44,fontSize:54,color:'#fff',fontWeight:900,boxShadow:'0 8px 30px rgba(255,106,0,0.8)'}}>+</button>
      <button style={{background:'none',border:'none',fontSize:58}}>🎬</button>
      <button style={{background:'none',border:'none',fontSize:58}}>👤</button>
    </div>
  </div>)
}
