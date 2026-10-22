"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // AUTO REDIRECT - already logged in ante direct home ki
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.replace("/")
      }
    }
    check()
  }, [router])

  const handleGmailLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' } // direct gmail chooser
      }
    })
    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-[360px] text-center">
        <h1 className="text-[32px] font-extrabold tracking-tight">ChitPix <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full ml-1">R2</span></h1>
        <p className="text-[13px] text-zinc-500 mt-2">R2 Permanent • Gmail Only</p>
        
        <div className="mt-10 p-4 border rounded-2xl bg-zinc-50">
          <p className="text-[13px] font-bold">Username + Gmail Only</p>
          <p className="text-[12px] text-zinc-500 mt-1">knmaheshsravani@gmail.com → knmaheshsravani</p>
          <p className="text-[11px] text-zinc-400 mt-2">Only Gmail • No OTP • No Mobile • R2 Permanent • Username Auto</p>
        </div>

        <button 
          onClick={handleGmailLogin}
          disabled={loading}
          className="mt-8 w-full h-[52px] bg-black text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Opening Gmail..." : "Continue with Gmail"}
        </button>
        
        <p className="text-[11px] text-zinc-400 mt-4">Direct Gmail • Auto login next time</p>
      </div>
    </div>
  )
}
