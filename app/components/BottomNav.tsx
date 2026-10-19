"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Search, Plus, Clapperboard } from "lucide-react"
import { useState, useEffect } from "react"

export default function BottomNav() {
  const pathname = usePathname()
  const [avatar, setAvatar] = useState("")

  const getCookieAvatar = () => {
    const match = document.cookie.match(/(?:^|; )avatar=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : ""
  }

  const loadR2Avatar = async () => {
    try{
      // 1. First check cookie - instant
      const cookieAv = getCookieAvatar()
      if(cookieAv) setAvatar(cookieAv)

      // 2. Then check DB - latest
      const res = await fetch("/api/users?username=knmahesh", {cache:"no-store"})
      const data = await res.json()
      if(data?.avatar_url){
        setAvatar(data.avatar_url)
        document.cookie = `avatar=${encodeURIComponent(data.avatar_url)}; path=/; max-age=2592000`
      }
    }catch{}
  }

  useEffect(()=>{
    loadR2Avatar()

    // 🔥 MAIN FIX: Photo marinantha auto update avvali
    const onAvatarUpdate = () => loadR2Avatar()
    
    window.addEventListener("avatarUpdated", onAvatarUpdate)
    window.addEventListener("storage", onAvatarUpdate)
    
    // Every 2 sec check cookie - 100% sync
    const interval = setInterval(loadR2Avatar, 2000)

    return () => {
      window.removeEventListener("avatarUpdated", onAvatarUpdate)
      window.removeEventListener("storage", onAvatarUpdate)
      clearInterval(interval)
    }
  },[])

  const isHome = pathname === "/"
  const isSearch = pathname === "/search"
  const isReels = pathname === "/reels"
  const isProfile = pathname?.startsWith("/profile")

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] h-[62px] bg-white border-t border-zinc-200 flex justify-around items-center z-[40]">
      <Link href="/" className="w-[52px] h-[52px] flex items-center justify-center active:scale-90">
        <House size={26} fill={isHome ? "black" : "none"} strokeWidth={isHome ? 2.8 : 2.2} className={isHome ? "text-black" : "text-black opacity-60"} />
      </Link>

      <Link href="/search" className="w-[52px] h-[52px] flex items-center justify-center active:scale-90">
        <Search size={26} strokeWidth={isSearch ? 2.8 : 2.2} className={isSearch ? "text-black" : "text-black opacity-60"} />
      </Link>

      <Link href="/create" className="w-[52px] h-[52px] flex items-center justify-center active:scale-90">
        <div className="w-[30px] h-[30px] border-[2.5px] border-black rounded-[8px] flex items-center justify-center">
          <Plus size={18} strokeWidth={3} />
        </div>
      </Link>

      <Link href="/reels" className="w-[52px] h-[52px] flex items-center justify-center active:scale-90">
        <Clapperboard size={26} strokeWidth={isReels ? 2.8 : 2.2} className={isReels ? "text-black" : "text-black opacity-60"} />
      </Link>

      <Link href="/profile" className="w-[52px] h-[52px] flex items-center justify-center active:scale-90">
        <div className={`w-[28px] h-[28px] rounded-full overflow-hidden ${isProfile ? "ring-2 ring-black" : "border border-zinc-300"}`}>
          <img 
            src={avatar || "https://i.pravatar.cc/100?u=knmahesh"} 
            alt="profile" 
            className="w-full h-full object-cover"
            onError={(e:any)=> e.target.src="https://i.pravatar.cc/100?u=knmahesh"}
          />
        </div>
      </Link>
    </div>
  )
}
