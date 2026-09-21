        {/* STORIES BAR */}
<div className="flex gap-3 p-3 overflow-x-auto border-b border-zinc-800">
  <div className="flex flex-col items-center min-w-[60px]">
    <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl border-2 border-dashed border-zinc-600">+</div>
    <span className="text-[10px] mt-1">Your Story</span>
  </div>
  {posts.slice(0,10).map((p:any)=>(
    <div key={p.id} className="flex flex-col items-center min-w-[60px]">
      <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600">
        <img src={p.image_url} className="w-full h-full rounded-full border-2 border-black object-cover" />
      </div>
      <span className="text-[10px] mt-1">User</span>
    </div>
  ))}
</div>
          <div className="m-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3.5 text-[14px] outline-none placeholder:text-zinc-500"/>
            <div className="flex gap-3 mt-3">
              <label className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3.5 text-center text-[13px] cursor-pointer">📸 Choose Photo<input type="file" className="hidden" onChange={upload}/></label>
              <button onClick={addPost} className="flex-1 bg-blue-600 rounded-xl font-bold text-[14px]">Post</button>
            </div>
            {url && <img src={url} className="mt-3 w-full aspect-[4/5] object-cover bg-black rounded-xl"/>}
          </div>
          {posts.map(p=>(
            <div key={p.id} className="border-b border-zinc-800">
              <div className="p-3 flex items-center gap-2 font-bold text-[14px]">M <span className="text-[13px]">Mahesh-07</span></div>
              <img src={p.image_url} className="w-full aspect-[4/5] object-cover bg-zinc-900"/>
              <div className="flex justify-between items-center p-3 text-[26px]">
                <div className="flex gap-4"><span>♡</span><span>💬</span><span>✈</span></div>
                <span>🔖</span>
              </div>
              <div className="px-3 pb-4 text-[14px]"><span className="font-bold mr-2">You</span>{p.caption}</div>
            </div>
          ))}
        </>}

        {tab==="search" && <>
          <div className="p-3 sticky top-[57px] bg-black z-10">
            <input id="searchInput" placeholder="🔍 Search posts..." className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 text-[14px] outline-none" onChange={(e)=>{
              const v=e.target.value.toLowerCase();
              const filtered=document.querySelectorAll(".search-item");
              filtered.forEach((el:any)=>{
                const cap=el.getAttribute("data-cap").toLowerCase();
                el.style.display=cap.includes(v)? "block" : "none";
              })
            }}/>
          </div>
          <div className="p-1 grid grid-cols-3 gap-[2px]">
            {posts.map(p=>(
              <div key={p.id} className="search-item relative" data-cap={p.caption}>
                <img src={p.image_url} className="aspect-square object-cover w-full"/>
              </div>
            ))}
          </div>
          {posts.length===0 && <p className="text-center p-10 text-zinc-500">No posts yet beo!</p>}
        </>}

        {tab==="reels" && <div className="h-[calc(100vh-130px)] overflow-y-scroll snap-y snap-mandatory">
          {posts.map(p=>(
            <div key={p.id} className="h-[calc(100vh-130px)] w-full snap-start relative bg-black flex items-center justify-center border-b border-zinc-900">
              <img src={p.image_url} className="h-full w-full object-contain bg-zinc-950"/>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">
                <p className="font-bold text-[14px]">@Mahesh-07</p>
                <p className="text-[13px] mt-1">{p.caption}</p>
                <p className="mt-3 text-[24px]">❤️ 💬 ✈️</p>
              </div>
              <div className="absolute right-3 bottom-28 flex flex-col gap-6 text-[28px]">
                <span>❤️</span><span>💬</span><span>✈️</span><span>⋮</span>
              </div>
            </div>
          ))}
          {posts.length===0 && <div className="p-20 text-center text-zinc-500">🎬 No reels yet, post chey beo!</div>}
        </div>}
