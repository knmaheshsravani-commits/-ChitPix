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
      <div style={{display:'flex', justifyContent:'space-between', padding:'15px', borderBottom:'1px solid #333'}}>
        <h1 style={{fontWeight:'bold'}}>ChitPix</h1>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <span>@{user}</span>
          <button onClick={logout} style={{background:'red', color:'white', padding:'5px 10px', borderRadius:'20px', border:'none'}}>Logout</button>
        </div>
      </div>
      <div style={{maxWidth:'400px', margin:'0 auto', textAlign:'center', paddingTop:'50px'}}>
        <h2>Welcome @{user} 🔥</h2>
        <p>ChitPix Reels Coming Soon!</p>
        <p style={{marginTop:20, opacity:0.6}}>❤️ Login Success!</p>
      </div>
    </div>
  )
}
