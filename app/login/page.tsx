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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 p-4">
      <div className="bg-white p-8 rounded-[20px] w-full max-w-[320px] shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-6">ChitPix</h1>
        <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="User ID (ex: mahesh_07)" className="w-full border p-3 rounded-lg mb-3" />
        <input type="password" placeholder="Password" className="w-full border p-3 rounded-lg mb-5" />
        <button onClick={handleLogin} className="w-full bg-[#0095f6] text-white py-3 rounded-lg font-bold">Log In</button>
      </div>
    </div>
  )
}
