{tab === "home" && (
  <div className="bg-gray-50 min-h-screen pb-20">
    {/* Top Header */}
    <div className="bg-white p-3 flex justify-between items-center border-b sticky top-0 z-10">
      <h1 className="font-black text-xl" style={{background:"linear-gradient(135deg,#7B2FFF,#FF3CAC)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ChitPix</h1>
      <div className="flex gap-3 items-center">
        <button onClick={()=>setShowCreate(true)} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">+</button>
        <button onClick={()=>setTab("dm")} className="text-xl">✈</button>
      </div>
    </div>

    {/* Stories */}
    <div className="bg-white p-3 flex gap-3 overflow-x-auto border-b">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
            {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">K</span>}
          </div>
        </div>
        <span className="text-[10px] mt-1">Your story</span>
      </div>
      {["user1","user2","user3","user4"].map(u=>(
        <div key={u} className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gray-200"></div>
          <span className="text-[10px] mt-1">{u}</span>
        </div>
      ))}
    </div>

    {/* Posts Feed */}
    <div>
      {threads.length===0 && <p className="text-center text-gray-400 mt-20">No posts yet. + click chey bro!</p>}
      {threads.map((t)=>(
        <div key={t.id} className="bg-white mb-2 border-b">
          <div className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">{t.user[0].toUpperCase()}</div>
            <span className="font-bold text-sm">@{t.user}</span>
            <span className="text-[10px] text-gray-400 ml-auto">{t.time || "just now"}</span>
          </div>

          {t.image && <img src={t.image} className="w-full h-auto max-h-[400px] object-cover" />}

          <div className="p-3">
            <div className="flex gap-4 text-xl mb-2">
              <button onClick={()=>likePost(t.id)}>❤️ {t.likes || 0}</button>
<button>💬 {t.comments?.length || 0}</button>
<button onClick={()=>setSharePost(t)} className="ml-auto">↗</button>
            </div>
            <p className="text-sm"><span className="font-bold">@{t.user}</span> {t.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
