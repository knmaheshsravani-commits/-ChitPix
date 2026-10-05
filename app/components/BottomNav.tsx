"use client"
import { usePathname, useRouter } from "next/navigation"

export default function BottomNav(){
  const pathname = usePathname()
  const router = useRouter()

  return(
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center py-3 px-4 z-50">
      
      {/* 1 - HOME */}
      <button onClick={()=>router.push("/")} className="p-2">
        <svg width="26" height="26" fill={pathname==="/" ? "black" : "none"} stroke="currentColor" strokeWidth={pathname==="/" ? "2.5" : "1.8"} viewBox="0 0 24 24">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1V9.5z"/>
        </svg>
      </button>

      {/* 2 - SEARCH */}
      <button onClick={()=>router.push("/search")} className="p-2">
        <svg width="26" height="26" fill="none" stroke={pathname==="/search" ? "black" : "#555"} strokeWidth={pathname==="/search" ? "2.5" : "1.8"} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6"/><path d="M21 21l-3.5-3.5"/>
        </svg>
      </button>

      {/* 3 - CREATE - NEW DESIGN CENTER */}
      <button onClick={()=>router.push("/create")} className="p
