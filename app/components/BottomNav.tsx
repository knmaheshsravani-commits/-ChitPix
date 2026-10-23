"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav({activeTab,setActiveTab}:any){
  const pathname = usePathname()
  const isHome = activeTab === 'home' || pathname === '/'
  const isReels = pathname === '/reels'
  const isSearch = activeTab === 'search'
  const isDM = pathname === '/messages'
  const isProfile = pathname === '/profile'

  const IconWrap = ({active, children, onClick, href}:any)=>{
    const content = (
      <div className={`flex items-center justify-center w-[56px] h-[36px] rounded-full transition ${active ? 'bg-[#f2f2f2]' : 'bg-transparent'}`}>
        {children}
      </div>
    )
    if(href){
      return <Link href={href} className="flex items-center justify-center">{content}</Link>
    }
    return <button onClick={onClick} className="flex items-center justify-center">{content}</button>
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-neutral-200 flex justify-around items-center h-[56px] z-[9999] pb-[2px]">
      
      {/* 1. HOME */}
      <IconWrap active={isHome} onClick={()=>setActiveTab?.('home')}>
        {isHome ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M12.004 3.004L4 9.5V20H9V14H15V20H20V9.5L12.004 3.004Z"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M9 21V13H15V21"/><path d="M4 10L12 3L20 10V20H4V10Z"/></svg>
        )}
      </IconWrap>

      {/* 2. REELS */}
      <IconWrap active={isReels} href="/reels">
        {isReels ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M3 5C3 3.34315 4.34315 2 6 2H18C19.6569 2 21 3.34315 21 5V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V5ZM9.5 8.5V15.5L15 12L9.5 8.5Z"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 8.5V15.5L14.5 12L10 8.5Z" strokeLinejoin="round"/></svg>
        )}
      </IconWrap>

      {/* 3. DM */}
      <IconWrap active={isDM} href="/messages">
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M22 3L11.5 13"/><path d="M22 3L15 22L11.5 13L2 9L22 3Z"/></svg>
          <span className="absolute -top-1 -right-1 w-[8px] h-[8px] bg-red-500 rounded-full border border-white"></span>
        </div>
      </IconWrap>

      {/* 4. SEARCH */}
      <IconWrap active={isSearch} onClick={()=>setActiveTab?.('search')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M16 16L20 20"/></svg>
      </IconWrap>

      {/* 5. PROFILE */}
      <IconWrap active={isProfile} href="/profile">
        <div className="relative">
          <div className={`w-[26px] h-[26px] rounded-full overflow-hidden ${isProfile ? 'ring-[1.5px] ring-black' : ''}`}>
            <img src="https://i.pravatar.cc/100?img=5" alt="profile" className="w-full h-full object-cover" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-[9px] h-[9px] bg-red-500 rounded-full border-2 border-white"></span>
        </div>
      </IconWrap>

    </nav>
  )
}
