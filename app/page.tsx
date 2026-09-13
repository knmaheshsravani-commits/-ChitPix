"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage(){
  const [userId, setUserId] = useState("")
  const router = useRouter()
  const handleLogin = () => {
    if(!userId.trim()) return alert("User ID pettu bro!")
    localStorage.setItem("chitpix_user", userId)
    router.push("/")
  }
  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', padding:'20px'}}>
      <div style={{background:'white', padding:'30px', borderRadius:'20px', width:'100%', maxWidth:'320px', textAlign:'center'}}>
        <h1 style={{fontSize:'36px', fontWeight:'bold', marginBottom:'10px'}}>ChitPix</h1>
        <p style={{color:'#666', marginBottom:'20px'}}>Holalkere Reels 🔥</p>
        <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="User ID (ex: mahesh_07)" style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'12px'}} />
        <input type="password" placeholder="Password" style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'20px'}} />
        <button onClick={handleLogin} style={{width:'100%', background:'#0095f6', color:'white', padding:'12px', border:'none', borderRadius:'8px', fontWeight:'bold'}}>Log In</button>
      </div>
    </div>
  )
}
