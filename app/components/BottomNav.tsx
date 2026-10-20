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
      // If prop avatar vachindi - Adi vaduko - 100% latest
      if(propAvatar){
        setAvatar(propAvatar)
        return
      }
      const cookieAv = getCookieAvatar()
      if(cookieAv) setAvatar(cookieAv)

      const res = await fetch("/api/users?username=knmahesh", {cache:"no-store"}).then(r=>r.json()).catch(()=>null)
      const u = Array.isArray(res) ? res.find((x:any)=>x.username==="knmahesh") : res
      if(u?.avatar_url){
        setAvatar(u.avatar_url)
        document.cookie = `avatar=${encodeURIComponent(u.avatar_url)}; path=/; max-age=2592000`
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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] h-[52px] bg-black border-t border-zinc-800 flex justify-around items-center z-50">
      
      {/* 1. HOME - 24px - Equal */}
      <Link href="/" className="w-[48px] h-[48px] flex items-center justify-center">
        <House size={24} fill={isHome ? "white" : "none"} strokeWidth={isHome ? 2.7 : 1.8} className="text-white" />
      </Link>

      {/* 2. SEARCH - 24px - Equal */}
      <Link href="/search" className="w-[48px] h-[48px] flex items-center justify-center">
        <Search size={24} strokeWidth={isSearch ? 2.7 : 1.8} className="text-white" />
      </Link>

      {/* 3. CREATE + - 24px box - Equal */}
      <Link href="/create" className="w-[48px] h-[48px] flex items-center justify-center">
        <div className={`w-[24px] h-[24px] border-[1.6px] rounded-[6px] flex items-center justify-center ${isCreate ? "bg-white border-white" : "border-white"}`}>
          <Plus size={16} strokeWidth={2.8} className={isCreate ? "text-black" : "text-white"} />
        </div>
      </Link>

      {/* 4. REELS - 24px - Equal */}
      <Link href="/reels" className="w-[48px] h-[48px] flex items-center justify-center">
        <Clapperboard size={24} strokeWidth={isReels ? 2.7 : 1.8} className="text-white" />
      </Link>

      {/* 5. PROFILE - DP - 26px - Equal - R2 DP */}
      <Link href="/profile" className="w-[48px] h-[48px] flex items-center justify-center">
        <div className={`w-[26px] h-[26px] rounded-full overflow-hidden ${isProfile ? "ring-[1.5px] ring-white ring-offset-1 ring-offset-black" : "border border-zinc-600"}`}>
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
