"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
  const path = usePathname()
  const isActive = (p: string) => path === p

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-7 py-3.5 flex gap-8 items-center z-50 shadow-2xl">
      <Link href="/">
        <svg className={`w-6 h-6 ${isActive('/') ? 'fill-white stroke-white' : 'stroke-white/60 fill-none'}`} viewBox="0 0 24 24" strokeWidth={isActive('/') ? 2.5 : 2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </Link>

      <Link href="/search">
        <svg className={`w-6 h-6 ${isActive('/search') ? 'stroke-white' : 'stroke-white/60'}`} viewBox="0 0 24 24" fill="none" strokeWidth={isActive('/search') ? 2.5 : 2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </Link>

      <Link href="/create" className="bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 stroke-black" viewBox="0 0 24 24" fill="none" strokeWidth={3}><path d="M12 5v14M5 12h14"/></svg>
      </Link>

      <Link href="/reels">
        <svg className={`w-6 h-6 ${isActive('/reels') ? 'fill-white stroke-white' : 'stroke-white/60 fill-none'}`} viewBox="0 0 24 24" strokeWidth={isActive('/reels') ? 2.5 : 2}><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
      </Link>

      <Link href="/profile" className={`w-7 h-7 rounded-full overflow-hidden ${isActive('/profile') ? 'ring-2 ring-white' : 'opacity-60'}`}>
