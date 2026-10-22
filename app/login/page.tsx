"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Phone, ShieldCheck, Crown } from "lucide-react"
import { supabase } from "@/lib/supabase" // FIXED: Shared client!

export default function Login(){
  const router = useRouter()
  const [tab, setTab] = useState<'gmail'|'mobile'>('gmail')
  const [gmail, setGmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState("")

  const sendOtp = async () => {
    if(tab==='gmail' && !gmail.includes('@')) return alert("Valid Gmail pettu bro!")
    if(tab==='mobile' && mobile.length<10) return alert("Valid Mobile pettu bro!")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:tab, value: tab==='gmail'?gmail:mobile })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || "Failed")
      setGeneratedOtp(data.otp)
      setSent(true)
      alert(`OTP: ${data.otp} - R2 lo save ayindi!`)
    } catch(e) {
      alert("OTP send fail ayindi bro, R2 keys check chey!")
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    if(!otp) return alert("OTP pettu")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:tab, value: tab==='gmail'?gmail:mobile, otp })
      })
      const data = await res.json()
      if(data.success){
        const username = (tab==='gmail'? gmail.split('@')[0] : `user${mobile.slice(-4)}`).toLowerCase().replace(/[^a-z0-9_]/g,'')
        await fetch("/api/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username, name:username, email:gmail, mobile, photo:`https://i.pravatar.cc/150?u=${username}`})})
        await fetch("/api/users/current",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username, email:gmail, mobile})})
        
        // FIXED: OTP tarvata localStorage flag pettali - AuthContext kosam
        localStorage.setItem('chitpix_custom_user', JSON.stringify({username, email:gmail, mobile}))
        router.push("/")
      } else {
        alert("Wrong OTP bro!")
      }
    } catch(e) {
      alert("Verify fail!")
    }
    setLoading(false)
  }

  const googleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if(error){
      alert("Google login fail: " + error.message)
      setLoading(false)
    }
  }

  return(
    <div className="min-h-[100dvh] bg-white max-w-[470px] mx-auto flex flex-col items-center px-6 py-10">
      <h1 className="text-[36px] font-black flex items-center gap-2">ChitPix <Crown className="text-amber-500"/></h1>
      <p className="text-[12px] text-zinc-500 mt-1">R2 Permanent • Login Required</p>

      <div className="flex bg-zinc-100 rounded-full p-1 mt-8 w-full">
        <button onClick={()=>setTab('gmail')} className={`flex-1 py-2 rounded-full text-[13px] font-bold flex items-center justify-center gap-1 ${tab==='gmail'?'bg-black text-white':'text-zinc-500'}`}><Mail size={14}/> Gmail</button>
        <button onClick={()=>setTab('mobile')} className={`flex-1 py-2 rounded-full text-[13px] font-bold flex items-center justify-center gap-1 ${tab==='mobile'?'bg-black text-white':'text-zinc-500'}`}><Phone size={14}/> Mobile</button>
      </div>

      <div className="w-full mt-6 space-y-3">
        {tab==='gmail'? (
          <input value={gmail} onChange={e=>setGmail(e.target.value)} placeholder="yourname@gmail.com" className="w-full border border-zinc-200 rounded-full px-4 py-3 text-[14px] outline-none"/>
        ) : (
          <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="+91 98765 43210" className="w-full border border-zinc-200 rounded-full px-4 py-3 text-[14px] outline-none"/>
        )}

        {!sent? (
          <button onClick={sendOtp} disabled={loading} className="w-full bg-black text-white py-3 rounded-full font-bold text-[14px]">{loading?'Sending...':'Send OTP • R2'}</button>
        ) : (
          <>
            <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="w-full border-2 border-black rounded-full px-4 py-3 text-[16px] font-bold tracking-[8px] text-center outline-none"/>
            {generatedOtp && <p className="text-[11px] text-center text-zinc-400">Dev OTP: {generatedOtp}</p>}
            <button onClick={verifyOtp} disabled={loading} className="w-full bg-black text-white py-3 rounded-full font-bold flex items-center justify-center gap-2"><ShieldCheck size={16}/> {loading?'Verifying...':'Verify & Login'}</button>
            <button onClick={()=>setSent(false)} className="w-full text-[12px] text-zinc-500">Change {tab}</button>
          </>
        )}

        <div className="flex items-center gap-2 my-4"><div className="flex-1 h-[1px] bg-zinc-200"/><span className="text-[11px] text-zinc-400">OR</span><div className="flex-1 h-[1px] bg-zinc-200"/></div>

        <button onClick={googleLogin} disabled={loading} className="w-full border border-zinc-200 py-3 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-zinc-50">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4"/> Continue with Google
        </button>

        <p className="text-[10px] text-zinc-400 text-center mt-6">🔒 R2 Device Connected • No Direct Use • Login Required • Gmail + Mobile Verified • Permanent</p>
      </div>
    </div>
  )
}
