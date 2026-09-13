"use client"
import { useState } from "react"
export default function LoginPage(){
  const [userId, setUserId] = useState("")
  const handleLogin = () => {
    if(!userId.trim()) return alert("Enter User ID")
    localStorage.setItem("chitpix_user", userId)
    window.location.href = "/"
  }
  return(
    <div style={{minHeight:'100vh', background:'black', color:'white', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <h1 style={{fontSize:'50px', fontWeight:'bold', marginBottom:'30px', fontFamily:'cursive'}}>ChitPix</h1>
      <div style={{width:'100%', maxWidth:'350px', border:'1px solid #333', padding:'30px', borderRadius:'12px', background:'#111'}}>
        <input placeholder="User ID (ex: mahesh_07)" value={userId} onChange={e=>setUserId(e.target.value)} style={{width:'100%', padding:'12px', marginBottom:'12px', background:'#222', border:'1px solid #444', borderRadius:'8px', color:'white'}}/>
        <input placeholder="Password" type="password" style={{width:'100%', padding:'12px', marginBottom:'20px', background:'#222', border:'1px solid #444', borderRadius:'8px', color:'white'}}/>
        <button onClick={handleLogin} style={{width:'100%', background:'#0095f6', color:'white', padding:'12px', borderRadius:'8px', border:'none', fontWeight:'bold', fontSize:'16px'}}>Log In</button>
      </div>
    </div>
  )
}
