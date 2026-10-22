"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function Page() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      if (data.session?.user) {
        setUser(data.session.user)
        setLoading(false)
      } else {
        router.replace("/login")
      }
    })
    // 2 sec lo loading off - stuck avvadu
    setTimeout(() => setLoading(false), 2000)
  }, [router])

  if (loading) return <div className="p-10 text-center font-bold">Loading ChitPix...<br/><button onClick={()=>router.replace("/login")} className="mt-4 px-4 py-2 bg-black text-white rounded">Go Login</button></div>
  
  return (
    <div className="p-5 max-w-[470px] mx-auto">
      <h1 className="text-2xl font-bold">ChitPix ✅</h1>
      <p className="mt-2">Welcome: {user?.email}</p>
      <p className="mt-4 text-green-600 font-bold">Login Success - Loop Fixed!</p>
      <button onClick={async()=>{await supabase.auth.signOut(); router.replace("/login")}} className="mt-6 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
    </div>
  )
}
