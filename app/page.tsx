      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 z-20">
        <button onClick={()=>setTab("home")} className="flex flex-col items-center">
          {tab==="home" ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M12 2.5L3 11v9a1 1 0 0 0 1 1h5v-5h6v5h5a1 1 0 0 0 1-1v-9L12 2.5z"/></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M3 11L12 2.5L21 11v9a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1v-9z"/></svg>
          )}
        </button>
        
        <button onClick={()=>setTab("search")} className="flex flex-col items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tab==="search"?"black":"black"} strokeWidth={tab==="search"?"2.5":"1.8"}><circle cx="11" cy="11" r="6"></circle><path d="M21 21L16.5 16.5"></path></svg>
        </button>

        <button onClick={()=>setTab("reels")} className="flex flex-col items-center">
          {tab==="reels" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M10 8.5L16 12L10 15.5V8.5z"/><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="black" strokeWidth="2.5"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M10 8.5L16 12L10 15.5V8.5z" fill="none" stroke="black" strokeWidth="1.8"/></svg>
          )}
        </button>

        <button onClick={()=>setTab("shop")} className="flex flex-col items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={tab==="shop"?"2.5":"1.8"}><path d="M6 7h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7z"></path><path d="M9 7V5a3 3 0 0 1 6 0v2"></path></svg>
        </button>

        <button onClick={()=>setTab("profile")} className="flex flex-col items-center">
          <div className={`w-[28px] h-[28px] rounded-full p-[2px] ${tab==="profile"?"bg-black":""}`}>
            <img src="https://picsum.photos/100?random=10" className="w-full h-full rounded-full border-2 border-white object-cover" />
          </div>
        </button>
      </div>
