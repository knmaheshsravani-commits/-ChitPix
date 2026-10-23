"use client"
export default function BottomNav({activeTab,setActiveTab}:any){
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 flex justify-around py-3 max-w-[480px] mx-auto z-20">
      <button onClick={()=>setActiveTab && setActiveTab('home')} className={`text-sm ${activeTab==='home'?'font-bold':''}`}>🏠 Home</button>
      <button onClick={()=>setActiveTab && setActiveTab('search')} className={`text-sm ${activeTab==='search'?'font-bold':''}`}>🔍 Search</button>
      <a href="/reels" className="text-sm">🎬 Reels</a>
    </div>
  )
}
