"use client"
import { usePathname, useRouter } from 'next/navigation'

export default function BottomNav({activeTab,setActiveTab}:any){
  const pathname = usePathname()
  const router = useRouter()
  // ✅ FIX - Instagram la exact route check - No mix!
  const isHome = pathname === '/' && (activeTab === 'home' || activeTab === undefined)
  const isSearch = pathname === '/search' // ✅ FIXED - /search page ki separate!
  const isDM = pathname === '/messages'
  const isReels = pathname === '/reels'
  const isProfile = pathname === '/profile'

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-neutral-200 flex justify-around items-center h-[60px] z-[99999]" style={{backgroundColor:'white'}}>
        <button onClick={()=>{ router.push('/'); setActiveTab('home'); window.scrollTo(0,0) }} className="flex items-center justify-center w-[56px] h-[38px] rounded-full" style={{background: isHome ? '#f2f2f2' : 'transparent'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill={isHome ? 'black' : 'none'} stroke="black" strokeWidth="1.8"><path d={isHome ? "M12.004 3L4 9.5V20H9V14H15V20H20V9.5L12.004 3Z" : "M9 21V13H15V21M4 10L12 3L20 10V20H4V10Z"}/></svg>
        </button>
        <button onClick={()=>router.push('/reels')} className="flex items-center justify-center w-[56px] h-[38px] rounded-full" style={{background: isReels ? '#f2f2f2' : 'transparent'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={isReels ? 'black' : 'none'} stroke="black" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M10 8.5V15.5L14.5 12L10 8.5Z" fill={isReels?'white':'none'}/></svg>
        </button>
        <button onClick={()=>router.push('/messages')} className="flex items-center justify-center w-[56px] h-[38px] rounded-full" style={{background: isDM ? '#f2f2f2' : 'transparent'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M22 3L11.5 13M22 3L15 22L11.5 13L2 9L22 3Z"/></svg>
        </button>
        {/* ✅ FIXED - Search ippudu /search page ki velthundi - Home tho mix kadu! */}
        <button onClick={()=>{ router.push('/search'); setActiveTab('search'); window.scrollTo(0,0) }} className="flex items-center justify-center w-[56px] h-[38px] rounded-full" style={{background: isSearch ? '#f2f2f2' : 'transparent'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.9"><circle cx="11" cy="11" r="6"/><path d="M16 16L20 20"/></svg>
        </button>
        <button onClick={()=>router.push('/profile')} className="flex items-center justify-center w-[56px] h-[38px] rounded-full" style={{background: isProfile ? '#f2f2f2' : 'transparent'}}>
          <div className={`w-[30px] h-[30px] rounded-full overflow-hidden ${isProfile ? 'ring-2 ring-black ring-offset-1' : 'border border-neutral-300'}`}>
            <img src="https://i.pravatar.cc/100?img=33" alt="profile" className="w-full h-full object-cover"/>
          </div>
        </button>
      </nav>
  )
}
