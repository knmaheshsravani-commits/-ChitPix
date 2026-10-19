"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
  const pathname = usePathname()
  const isActive = (p: string) => pathname === p

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black rounded-full px-7 py-3.5 flex gap-8 items-center z-50">
      <Link href="/" className={isActive("/") ? "text-white" : "text-white/60"}>Home</Link>
      <Link href="/search" className={isActive("/search") ? "text-white" : "text-white/60"}>Search</Link>
      <Link href="/create" className="bg-white text-black rounded-full w-9 h-9 flex items-center justify-center">+</Link>
      <Link href="/reels" className={isActive("/reels") ? "text-white" : "text-white/60"}>Reels</Link>
      <Link href="/profile" className={isActive("/profile") ? "text-white" : "text-white/60"}>Profile</Link>
    </div>
  )
}
