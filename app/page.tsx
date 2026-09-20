<div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] h-[75px] flex items-center justify-around bg-white border-t z-50">

  {/* Home */}
  <button
    onClick={()=>setTab("home")}
    className="text-[34px] leading-none p-2"
  >
    🏠
  </button>

  {/* Search */}
  <button
    onClick={()=>setTab("search")}
    className="text-[34px] leading-none p-2"
  >
    🔍
  </button>

  {/* Plus */}
  <button
    onClick={()=>setTab("plus")}
    className="text-[38px] leading-none p-1 font-bold"
  >
    ＋
  </button>

  {/* Reels / Video */}
  <button
    onClick={()=>setTab("reels")}
    className="text-[34px] leading-none p-2"
  >
    🎬
  </button>

  {/* Profile */}
  <button
    onClick={()=>setTab("profile")}
    className="text-[34px] leading-none p-2"
  >
    👤
  </button>

</div>
