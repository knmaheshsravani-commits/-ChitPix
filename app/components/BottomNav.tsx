"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav(){
  const path = usePathname()
  return(
    <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t flex justify-around items-center max-w-[500px] mx-auto z-50">
      <Link href="/"><svg width="24" height="24" viewBox="0 0 24 24" fill={path=="/"?"black":"none"} stroke="black" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></Link>
      <Link href="/search"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></Link>
      <Link href="/create"><div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></Link>
      <Link href="/reels"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10 8 16 12 10 16 10 8"/></svg></Link>
      <Link href="/profile"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></Link>
    </div>
  )
}
