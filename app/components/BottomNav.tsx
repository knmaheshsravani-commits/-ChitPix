"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Search, Plus, Clapperboard } from "lucide-react"
import { useState, useEffect } from "react"

type BottomNavProps = {
  active?: string
  avatar?: string
}

export default function BottomNav({ active, avatar: propAvatar }: BottomNavProps) {
  const pathname = usePathname()
  const [avatar, setAvatar] = useState(propAvatar || "")

  const getCookieAvatar = () => {
    if(typeof document === 'undefined') return ""
    const match = document.cookie.match(/(?:^|; )avatar=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : ""
  }

  const loadR2Avatar = async () => {
    try{
      if(propAvatar){
        setAvatar(propAvatar)
        return
      }
      const cookieAv = getCookieAvatar()
      if(cookieAv) setAvatar(cookieAv)
      
      // ✅ FIX - current user - not hardcoded knmahesh
      const sessionMatch = document.cookie.match(/chitpix_session=([^;]+)/)
      const sessionId = sessionMatch?.[1]
      if(sessionId){
        const res = await fetch(`/api/users/current?sessionId=${sessionId}`, {cache:"no-store"}).then(r=>r.json()).catch(()=>null)
        if(res?.photo || res?.avatar_url){
          setAvatar(res.photo || res.avatar_url)
          document.cookie = `avatar=${encodeURIComponent(res.photo || res.avatar_url)}; path=/; max-age=2592000`
        }
      }
    }catch{}
  }

  useEffect(()=>{
    if(propAvatar){
      setAvatar(propAvatar)
    } else {
      loadR2Avatar()
    }
    const onAvatarUpdate = () => loadR2Avatar()
    window.addEventListener("avatarUpdated", onAvatarUpdate)
    return () => window.removeEventListener("avatarUpdated", onAvatarUpdate)
  },[propAvatar])

  const isHome = active ? active==="home" : pathname === "/"
  const isSearch = active ? active==="search" : pathname === "/search"
  const isReels = active ? active==="reels" : pathname === "/reels"
  const isProfile = active ? active==="profile" : pathname?.startsWith("/profile")
  const isCreate = active ? active==="create" : pathname === "/create"

  return (
    // ✅ FIX - Full black - No white pill - No red dots - Profile style = Home style
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] h-[56px] bg-black border-t border-zinc-800 flex justify-around items-center z-[100]">
      
      {/* 1. HOME */}
      <Link href="/" className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <House size={26} fill={isHome ? "white" : "none"} strokeWidth={isHome ? 2.7 : 1.8} className="text-white" />
      </Link>

      {/* 2. SEARCH */}
      <Link href="/search" className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <Search size={26} strokeWidth={isSearch ? 2.7 : 1.8} className="text-white" />
      </Link>

      {/* 3. CREATE + */}
      <Link href="/create" className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <div className={`w-[26px] h-[26px] border-[1.8px] rounded-[7px] flex items-center justify-center ${isCreate ? "bg-white border-white" : "border-white"}`}>
          <Plus size={16} strokeWidth={2.8} className={isCreate ? "text-black" : "text-white"} />
        </div>
      </Link>

      {/* 4. REELS */}
      <Link href="/reels" className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <Clapperboard size={26} strokeWidth={isReels ? 2.7 : 1.8} className="text-white" />
      </Link>

      {/* 5. PROFILE - R2 DP - NO RED DOT */}
      <Link href="/profile" className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <div className={`w-[28px] h-[28px] rounded-full overflow-hidden ${isProfile ? "ring-[2px] ring-white ring-offset-2 ring-offset-black" : "border border-zinc-600"}`}>
          <img 
            src={avatar || propAvatar || "https://i.pravatar.cc/100?u=knmahesh"} 
            alt="profile" 
            className="w-full h-full object-cover"
            onError={(e:any)=> e.target.src="https://i.pravatar.cc/100?u=knmahesh"}
          />
        </div>
      </Link>
    </div>
  )
}
