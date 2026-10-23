"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav({activeTab,setActiveTab}:any){
  const pathname = usePathname()
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center max-w-[480px] mx-auto z-30 h-[60px] px-2">
      
      {/* 1. HOME */}
      <button 
        onClick={()=>setActiveTab && setActiveTab('home')} 
        className="flex items-center justify-center w-[48px] h-[48px]"
        aria-label="Home"
      >
        {activeTab==='home' ? (
          <svg aria-label="Home" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001.4a5.39 5.39 0 0 0-3.71 1.43L1.9 8.06A1 1 0 0 0 2 9.5V19a2 2 0 0 0 2 2h5V13h4v8h5a2 2 0 0 0 2-2V9.5a1 1 0 0 0-.1-.44L15.71 1.83A5.39 5.39 0 0 0 12 0Zm0 1.2a4.18 4.18 0 0 1 2.89 1.12l6.4 6.23V19a1 1 0 0 1-1 1h-4v-7H8v7H4a1 1 0 0 1-1-1V8.94l6.4-6.23A4.18 4.18 0 0 1 12.001 1.6Z"/></svg>
        ) : (
          <svg aria-label="Home" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.005 16.175H4.987V12.02L12 4.5l7.013 7.52v4.155h-4.015v-4.04h-6Z"/><path d="M12 21V13"/></svg>
        )}
      </button>

      {/* 2. SEARCH */}
      <button 
        onClick={()=>setActiveTab && setActiveTab('search')} 
        className="flex items-center justify-center w-[48px] h-[48px]"
        aria-label="Search"
      >
        <svg aria-label="Search" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5"/><path d="M15.5 15.5 19 19"/></svg>
      </button>

      {/* 3. DM - MESSAGES */}
      <Link 
        href="/messages" 
        className="flex items-center justify-center w-[48px] h-[48px] relative"
        aria-label="Messages"
      >
        <svg aria-label="Direct" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/><path d="m16 19 3 3 3-3"/><path d="M18 11v6"/></svg>
      </Link>

      {/* 4. REELS */}
      <Link 
        href="/reels" 
        className="flex items-center justify-center w-[48px] h-[48px]"
        aria-label="Reels"
      >
        {pathname === '/reels' ? (
          <svg aria-label="Reels" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.717 0H9.283A2.28 2.28 0 0 0 7 2.283V21.72A2.28 2.28 0 0 0 9.283 24h5.434A2.28 2.28 0 0 0 17 21.72V2.283A2.28 2.28 0 0 0 14.717 0ZM13 20H11V4h2Z"/></svg>
        ) : (
          <svg aria-label="Reels" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.5 9.5v5L14 12z" fill="currentColor" stroke="none"/></svg>
        )}
      </Link>

      {/* 5. PROFILE */}
      <Link 
        href="/profile" 
        className="flex items-center justify-center w-[48px] h-[48px]"
        aria-label="Profile"
      >
        <div className={`w-[28px] h-[28px] rounded-full overflow-hidden ${pathname === '/profile' ? 'ring-2 ring-black ring-offset-1' : 'border border-neutral-300'}`}>
          <img 
            src="https://picsum.photos/seed/profile/100/100" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

    </div>
  )
}
