"use client"
import { useState, useEffect } from "react"

export default function Home(){
  const [user, setUser] = useState("")
  useEffect(()=>{
    const u = localStorage.getItem("chitpix_user")
    if(!u){ window.location.href="/login" } 
    else { setUser(u) }
  },[])

  const logout = () => {
    localStorage.removeItem("chitpix_user")
    window.location.href="/login"
  }

  if(!user) return <div style={{padding:20}}>Loading...</div>

  return(
    <div style={{minHeight:'100vh', background:'black', color:'white'}}>
      <div style={{display:'flex', justifyContent:'space-between', padding:'15px', borderBottom:'1px solid #333', background:'black'}}>
        <h1 style={{fontWeight:'bold', fontSize:'20px'}}>ChitPix</h1>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <span style={{fontSize:'12px'}}>@{user}</span>
          <button onClick={logout} style={{background:'red', color:'white', padding:'5px 10px', borderRadius:'20px', border:'none', fontSize:'12px'}}>Logout</button>
        </div>
      </div>
      <div style={{maxWidth:'400px', margin:'0 auto'}}>
        <div style={{height:'70vh', background:'linear-gradient(to bottom, #222, #000)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'20px', borderBottom:'1px solid #333'}}>
          <h3>@travel_lover</h3>
          <p style={{fontSize:'14px', opacity:0.8}}>My First ChitPix Reel 🔥</p>
          <p>❤️ 120 likes</p>
        </div>
        <div style={{height:'70vh', background:'linear-gradient(to bottom, #331111, #000)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'20px'}}>
          <h3>@foodie_king</h3>
          <p style={{fontSize:'14px', opacity:0.8}}>Holalkere Vibes ❤️</p>
          <p>❤️ 89 likes</p>
        </div>
      </div>
    </div>
  )
}
