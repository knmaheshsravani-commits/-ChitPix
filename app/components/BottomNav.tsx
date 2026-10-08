'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav(){
  const path = usePathname()

  const isHome = path === '/'
  const isReels = path === '/reels'
  const isSearch = path === '/search'
  const isMessages = path === '/messages'
  const isProfile = path === '/profile'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] z-[100]">
      <div className="max-w-[470px] mx-auto h-[52px] flex justify-between items-center px-2">

        {/* 1 - HOME */}
        <Link href="/" className="flex-1 flex justify-center">
          <div className={`px-5 py-2 rounded-full flex items-center justify-center ${isHome? 'bg-[#efefef]' : ''}`}>
            {isHome? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>
            )}
          </div>
        </Link>

        {/* 2 - REELS - New 2026 */}
        <Link href="/reels" className="flex-1 flex justify-center">
          <div className={`px-5 py-2 rounded-full flex items-center justify-center ${isReels? 'bg-black' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isReels? 'white' : 'none'} stroke={isReels? 'white' : 'black'} strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill={isReels? 'white' : 'black'} stroke="none"/></svg>
          </div>
        </Link>

        {/* 3 - DM / SHARE */}
        <Link href="/messages" className="flex-1 flex justify-center">
          <div className={`w-11 h-11 flex items-center justify-center relative rounded-full ${isMessages? 'bg-[#efefef]' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.9"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </Link>

        {/* 4 - SEARCH */}
        <Link href="/search" className="flex-1 flex justify-center">
          <div className={`px-5 py-2 rounded-full flex items-center justify-center ${isSearch? 'bg-[#efefef]' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={isSearch? '2.6' : '1.8'}><circle cx="11" cy="11" r="6"/><path d="M21 21l-3.5-3.5"/></svg>
          </div>
        </Link>

        {/* 5 - PROFILE - M Logo */}
        <Link href="/profile" className="flex-1 flex justify-center">
          <div className={`px-3 py-1 rounded-full flex items-center justify-center ${isProfile? 'bg-[#efefef]' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow">M</div>
          </div>
        </Link>

      </div>
    </div>
  )
}
