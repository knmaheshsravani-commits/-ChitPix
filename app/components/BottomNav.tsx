"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Search, Plus, Clapperboard } from "lucide-react"
import { useState, useEffect } from "react"

type BottomNavProps = {
  active?: string
  activeTab?: string // ✅ NEW - page.tsx nundi vastundi
  setActiveTab?: (tab: string) => void // ✅ NEW
  avatar?: string
}

export default function BottomNav({ active, activeTab, setActiveTab, avatar: propAvatar }: BottomNavProps) {
  const pathname = usePathname()
  const [avatar, setAvatar] = useState(propAvatar || "")

  const getCookieAvatar = () => {
    if(typeof document === 'undefined') return ""
    const match = document.cookie.match(/(?:^|; )avatar=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : ""
  }

  const loadR2Avatar = async () => {
    try{
      if(propAvatar){ setAvatar(propAvatar); return }
      const cookieAv = getCookieAvatar()
      if(cookieAv) setAvatar(cookieAv)
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
    if(propAvatar){ setAvatar(propAvatar) } 
    else { loadR2Avatar() }
    const onAvatarUpdate = () => loadR2Avatar()
    window.addEventListener("avatarUpdated", onAvatarUpdate)
    return () => window.removeEventListener("avatarUpdated", onAvatarUpdate)
  },[propAvatar])

  // ✅ FIX - activeTab OR active - rendu support
  const currentActive = activeTab || active || ""

  const isHome = currentActive ? currentActive==="home" : pathname === "/"
  const isSearch = currentActive ? currentActive==="search" : pathname === "/search"
  const isReels = currentActive ? currentActive==="reels" : pathname === "/reels"
  const isProfile = currentActive ? currentActive==="profile" : pathname?.startsWith("/profile")
  const isCreate = currentActive ? currentActive==="create" : pathname === "/create"

  const handleClick = (tab: string)=>{
    if(setActiveTab) setActiveTab(tab)
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[470px] h-[56px] bg-black border-t border-zinc-800 flex justify-around items-center z-[100]">
      <Link href="/" onClick={()=>handleClick('home')} className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <House size={26} fill={isHome ? "white" : "none"} strokeWidth={isHome ? 2.7 : 1.8} className="text-white" />
      </Link>
      <Link href="/search" onClick={()=>handleClick('search')} className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <Search size={26} strokeWidth={isSearch ? 2.7 : 1.8} className="text-white" />
      </Link>
      <Link href="/create" onClick={()=>handleClick('create')} className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <div className={`w-[26px] h-[26px] border-[1.8px] rounded-[7px] flex items-center justify-center ${isCreate ? "bg-white border-white" : "border-white"}`}>
          <Plus size={16} strokeWidth={2.8} className={isCreate ? "text-black" : "text-white"} />
        </div>
      </Link>
      <Link href="/reels" onClick={()=>handleClick('reels')} className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <Clapperboard size={26} strokeWidth={isReels ? 2.7 : 1.8} className="text-white" />
      </Link>
      <Link href="/profile" onClick={()=>handleClick('profile')} className="w-[48px] h-[48px] flex items-center justify-center active:scale-90">
        <div className={`w-[28px] h-[28px] rounded-full overflow-hidden ${isProfile ? "ring-[2px] ring-white ring-offset-2 ring-offset-black" : "border border-zinc-600"}`}>
          <img src={avatar || propAvatar || "https://i.pravatar.cc/100?u=knmahesh"} alt="profile" className="w-full h-full object-cover" onError={(e:any)=> e.target.src="https://i.pravatar.cc/100?u=knmahesh"} />
        </div>
      </Link>
    </div>
  )
}
