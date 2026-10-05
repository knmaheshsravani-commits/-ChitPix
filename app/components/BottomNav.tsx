"use client"
export default function BottomNav(){
  const path = typeof window!== "undefined"? window.location.pathname : "/"
  const sz = 26
  return(
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 z-50">
      <button onClick={()=>window.location.href="/"} className="w-10 h-10 flex items-center justify-center">
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={path==="/"? 2.3 : 1.8} strokeLinecap="round"><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </button>
      <button onClick={()=>window.location.href="/search"} className="w-10 h-10 flex items-center justify-center">
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={path==="/search"? 2.3 : 1.8} strokeLinecap="round"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <button onClick={()=>window.location.href="/create"} className="w-10 h-10 flex items-center justify-center">
        <div className="w-[42px] h-[42px] rounded-[14px] bg-black flex items-center justify-center">
          <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
      </button>
      <button onClick={()=>window.location.href="/reels"} className="w-10 h-10 flex items-center justify-center">
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={path==="/reels"? 2.3 : 1.8} strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="6"/><polygon points="10 8 16 12 10 16 10 8" fill={path==="/reels"? "black" : "none"}/></svg>
      </button>
      <button onClick={()=>window.location.href="/profile"} className="w-10 h-10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>
    </div>
  )
}
