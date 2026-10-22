"use client"
import { useState } from "react"
import { Crown } from "lucide-react"
import { supabase } from "../../lib/supabase"

export default function Login(){
  const [loading, setLoading] = useState(false)

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
      <p className="text-[12px] text-zinc-500 mt-1">R2 Permanent • Gmail Only</p>

      <div className="w-full mt-10 space-y-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
          <p className="text-[13px] font-bold">Username + Gmail Only</p>
          <p className="text-[11px] text-zinc-500 mt-1">Login ayyaka ne Gmail nundi username auto-create avthadi. Ex: knmaheshsravani@gmail.com → knmaheshsravani</p>
        </div>

        <button onClick={googleLogin} disabled={loading} className="w-full bg-black text-white py-4 rounded-full font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 bg-white rounded-full p-0.5"/> 
          {loading ? "Redirecting..." : "Continue with Gmail"}
        </button>

        <p className="text-[10px] text-zinc-400 text-center mt-8">🔒 Only Gmail • No OTP • No Mobile • R2 Permanent • Username Auto</p>
      </div>
    </div>
  )
}
