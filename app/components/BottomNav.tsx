'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav(){
  const path = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] z-[100]">
      <div className="max-w-[470px] mx-auto h-[52px] flex justify-between items-center px-1">

        {/* 1 HOME - House */}
        <Link href="/" className="flex-1 flex justify-center">
          <div className={`w-11 h-11 flex items-center justify-center rounded-full ${path==='/'?'bg-[#efefef]':''}`}>
            {path==='/'? (
              <svg width="25" height="25" viewBox="0 0 24 24" fill="black"><path d="M12 2.5L2 12.5h3v8h6v-6h2v6h6v-8h3L12 2.5z"/></svg>
            ) : (
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M12 2.5L2 12.5h3v8h6v-6h2v6h6v-8h3L12 2.5z"/></svg>
            )}
          </div>
        </Link>

        {/* 2 SEARCH - Magnifying - VERU ICON */}
        <Link href="/search" className="flex-1 flex justify-center">
          <div className={`w-11 h-11 flex items-center justify-center rounded-full ${path==='/search'?'bg-[#efefef]':''}`}>
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={path==='/search'?'2.7':'1.8'}><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
          </div>
        </Link>

        {/* 3 CREATE + */}
        <Link href="/" className="flex-1 flex justify-center">
          <div className="w-11 h-11 flex items-center justify-center">
            <div className="w-6 h-6 border-[2px] border-black rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </div>
        </Link>

        {/* 4 REELS - Clapper - VERU ICON - SEARCH KI DIFFERENT */}
        <Link href="/reels" className="flex-1 flex justify-center">
          <div className={`w-11 h-11 flex items-center justify-center rounded-full ${path==='/reels'?'bg-black':''}`}>
            {path==='/reels'? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="black"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="black"/></svg>
            )}
          </div>
        </Link>

        {/* 5 PROFILE - M */}
        <Link href="/profile" className="flex-1 flex justify-center">
          <div className={`w-11 h-11 flex items-center justify-center rounded-full ${path==='/profile'?'bg-[#efefef]':''}`}>
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">M</div>
          </div>
        </Link>

      </div>
    </div>
  )
}
