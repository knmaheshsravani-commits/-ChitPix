{tab==="reels"&&(
  <div className="h-[calc(100vh-110px)] overflow-y-scroll snap-y snap-mandatory bg-black">
    {posts.map((p:any)=>
      <div key={p.id} className="h-[calc(100vh-110px)] snap-start relative w-full bg-zinc-900 flex items-center justify-center">
        {/* Image as Reel - Full Cover */}
        <img src={p.image||p.image_url} className="absolute inset-0 w-full h-full object-cover" />

        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>

        {/* Bottom Info */}
        <div className="absolute bottom-16 left-0 right-0 p-4 flex justify-between items-end z-10">
          <div className="max-w-[70%]">
            <p className="font-bold text-white text-[15px]">@mahesh123</p>
            <p className="text-white text-[14px] mt-1">{p.caption||"Live like a wolf 🐺"}</p>
            <p className="text-white/70 text-xs mt-2">🎵 Original audio - ChitPix • Ruchi Vantalu</p>
          </div>
          <div className="flex flex-col gap-5 items-center">
            <div className="flex flex-col items-center"><div className="w-8 h-8 flex items-center justify-center text-2xl">🤍</div><span className="text-white text-xs font-bold">28</span></div>
            <div className="flex flex-col items-center"><div className="text-2xl">💬</div><span className="text-white text-xs">12</span></div>
            <div className="flex flex-col items-center"><div className="text-2xl">📤</div></div>
            <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"><img src={p.image} className="w-full h-full object-cover"/></div>
          </div>
        </div>
      </div>
    )}
  </div>
)}
