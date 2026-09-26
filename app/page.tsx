"use client";
import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState("home");
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showComments, setShowComments] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [allComments, setAllComments] = useState<any>({});
  const [searchText, setSearchText] = useState("");
  const [viewStory, setViewStory] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<any>({});
  const [sharePost, setSharePost] = useState<any>(null);
  const [threads, setThreads] = useState([
    { id: 1, user: "knmahesh30", text: "Hi brother good morning 🌟 Welcome to ChitPix!", likes: 13, isReel: false },
    { id: 2, user: "knmahesh30", text: "My first reel on ChitPix 🔥", likes: 25, isReel: true },
    { id: 3, user: "friend_dev", text: "ChitPix is awesome app bro! Keep going 💯", likes: 8, isReel: false },
  ]);

  const handleLike = (id: number) => {
    if (likedPosts[id]) {
      setLikedPosts({...likedPosts, [id]: false });
      setThreads(threads.map((t: any) => (t.id === id? {...t, likes: t.likes - 1 } : t)));
    } else {
      setLikedPosts({...likedPosts, [id]: true });
      setThreads(threads.map((t: any) => (t.id === id? {...t, likes: t.likes + 1 } : t)));
    }
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
          <h1 className="text-3xl font-black text-center mb-6 text-black">ChitPix 📸</h1>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full border-2 border-gray-400 p-3 rounded-xl mb-3 outline-none text-black bg-white" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border-2 border-gray-400 p-3 rounded-xl mb-4 outline-none text-black bg-white" />
          <button onClick={() => setIsLogin(true)} className="w-full bg-black text-white py-3 rounded-xl font-bold">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-[100px]">
      <div className="sticky top-0 z-40 w-full h-[60px] flex items-center justify-between px-4 shadow-sm" style={{ background: "linear-gradient(90deg, #7B2FFF 0%, #FF3CAC 100%)" }}>
  <h1 className="text-white text-[32px] font-black tracking-tight">ChitPix</h1>
  <div className="flex gap-4 items-center">
    <button onClick={() => {
      const txt = prompt("New Post / Reel Text:");
      if (txt) {
        const isReel = confirm("Reel ga post cheyala? OK = Reel, Cancel = Normal Post");
        setThreads([{ id: Date.now(), user: username || "knmahesh30", text: txt, likes: 0, isReel },...threads]);
      }
    }} className="text-white text-[72px] font-bold leading-none">+</button>
    <button onClick={() => setTab("dm")} className="text-white text-[72px]">✈️</button>
    <button onClick={() => setIsLogin(false)} className="border border-white text-white px-3 py-1 rounded-full text-[32px] font-bold">Logout</button>
  </div>
</div>

      <div className="max-w-[600px] mx-auto bg-white">
        {tab === "home" && (
          <>
            <div className="p-2 text-sm font-bold text-black">Welcome {username || "Knmahesh"} 🔥</div>
            <div className="flex gap-4 p-3 overflow-x-auto border-b">
              {["Your Story", "knmahesh", "friend1", "friend2", "dev_bro"].map((s, i) => (
                <div key={i} className="flex flex-col items-center cursor-pointer" onClick={() => setViewStory(s)}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold">{s[0].toUpperCase()}</div>
                  <span className="text-[10px] mt-1 text-black">{s}</span>
                </div>
              ))}
            </div>
            {threads.map((t: any) => (
              <div key={t.id} className="p-3 border-b bg-white">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">{t.user[0].toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-black">{t.user}</div>
                    <div className="text-sm mt-1 text-black">{t.text}</div>
                    {t.isReel && <div className="mt-2 h-[300px] rounded-xl flex flex-col items-center justify-center text-white text-4xl" style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899,#f59e0b)" }}>▶️<span className="text-sm mt-2">Reel Video</span></div>}
                    <div className="flex gap-6 mt-3 text-[13px] text-black">
                      <button onClick={() => handleLike(t.id)}>{likedPosts[t.id]? "❤️" : "🤍"} {t.likes}</button>
                      <button onClick={() => setShowComments(t.id)}>💬 {allComments[t.id]?.length || 0}</button>
                      <button onClick={() => setSharePost(t)} className="font-bold">↗ Share</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {tab === "search" && (
          <div className="p-4">
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search..." className="w-full border-2 border-purple-200 rounded-full px-4 py-3 text-black bg-white outline-none" />
            <div className="mt-4 text-center text-gray-400">🔍 Search for friends</div>
          </div>
        )}
        {tab === "dm" && <div className="p-4"><h2 className="font-bold text-black">Messages ✈️</h2><p className="text-sm text-gray-400 mt-4">No messages yet</p></div>}
        {tab === "profile" && (
          <div className="p-4 text-center">
            <div className="w-20 h-20 bg-black text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold">K</div>
            <h2 className="font-bold mt-2 text-black">{username || "knmahesh30"}</h2>
            <p className="text-sm text-gray-500">ChitPix Creator | Reels + Stories</p>
            <div className="flex justify-around mt-6 border-t pt-4 text-black"><div><b>{threads.length}</b><br/><span className="text-xs">Posts</span></div><div><b>120</b><br/><span className="text-xs">Followers</span></div><div><b>180</b><br/><span className="text-xs">Following</span></div></div>
          </div>
        )}
      </div>

      {viewStory && <div className="fixed inset-0 z-[400] bg-black flex items-center justify-center" onClick={() => setViewStory(null)}><div className="bg-gradient-to-br from-purple-700 to-pink-600 w-[90%] max-w-[500px] h-[80vh] rounded-2xl flex flex-col items-center justify-center text-white"><div className="text-6xl">📸</div><div className="mt-4">{viewStory} Story</div></div></div>}

      {showComments!== null && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end justify-center" onClick={() => setShowComments(null)}>
          <div className="bg-white w-full max-w-[600px] rounded-t-[20px] max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between"><h3 className="font-bold text-black">Comments</h3><button onClick={() => setShowComments(null)} className="bg-gray-100 rounded-full w-7 h-7">✕</button></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">{(allComments[showComments] || []).map((c: any, i: number) => <div key={i} className="text-black text-sm"><b>{c.user}</b> {c.text}</div>)}</div>
            <div className="p-3 border-t flex gap-2"><input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Add a comment..." className="flex-1 border-2 border-purple-200 rounded-full px-4 py-2.5 text-black bg-white outline-none" /><button onClick={() => { if (!commentInput.trim()) return; setAllComments({...allComments, [showComments!]: [...(allComments[showComments!] || []), { user: username || "knmahesh", text: commentInput }] }); setCommentInput(""); }} className="bg-black text-white px-5 py-2.5 rounded-full font-bold">Post</button></div>
          </div>
        </div>
      )}

      {sharePost && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end justify-center" onClick={() => setSharePost(null)}>
          <div className="bg-white w-full max-w-[600px] rounded-t-[72px] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-black text-center mb-4">Share Post</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(sharePost.text + " - via ChitPix")}`, "_blank"); }} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">W</div><span className="text-[11px] text-black">WhatsApp</span></button>
              <button onClick={() => { navigator.clipboard.writeText(sharePost.text); alert("Link Copied! 📋"); setSharePost(null); }} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white">🔗</div><span className="text-[11px] text-black">Copy</span></button>
              <button onClick={() => { if (navigator.share) navigator.share({ title: "ChitPix", text: sharePost.text }); setSharePost(null); }} className="flex flex-col items-center gap-1"><div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">↗</div><span className="text-[11px] text-black">More</span></button>
            </div>
            <button onClick={() => setSharePost(null)} className="w-full bg-black text-white py-3 rounded-full font-bold">Close</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[68px] z-50 px-2">
  {/* 1. HOME - Old fill + New shape */}
  <button onClick={() => setTab("home")} className="flex flex-col items-center">
    <div className={`w-7 h-7 flex items-center justify-center text-[52px] ${tab==="home"? "text-black" : "text-gray-400"}`}>
      {tab==="home"? "⌂" : "⌂"}
    </div>
    {tab==="home" && <div className="w-1 h-1 bg-black rounded-full mt-1"></div>}
  </button>

  {/* 2. REELS - Fixed Icon */}
<button onClick={() => setTab("reels")} className="flex flex-col items-center">
  <div className={`w-8 h-8 flex items-center justify-center text-[32px] rounded-lg ${tab==="reels"? "bg-black text-white" : "text-gray-500"}`}>
    🎬
  </div>
</button>

  {/* 3. SHARE - OLD gradient + NEW look - CENTER HERO */}
  <button onClick={() => setTab("share")} className="flex flex-col items-center -mt-3">
    <div className={`w-[72px] h-[72px] rounded-[32px] flex items-center justify-center text-[32px] shadow-lg transition-all ${tab==="share"? "scale-110" : ""}`} style={{background: tab==="share"? "linear-gradient(135deg,#7B2FFF,#FF3CAC)" : "linear-gradient(135deg,#7B2FFF,#FF3CAC)", color:"white"}}>
      ↗
    </div>
  </button>

  {/* 4. SEARCH */}
  <button onClick={() => setTab("search")} className="flex flex-col items-center">
    <div className={`text-[72px] ${tab==="search"? "text-black" : "text-gray-400"}`}>⌕</div>
    {tab==="search" && <div className="w-1 h-1 bg-black rounded-full mt-1"></div>}
  </button>

  {/* 5. PROFILE - Old K + New ring */}
  <button onClick={() => setTab("profile")} className="flex flex-col items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[72px] font-black border-[4px] ${tab==="profile"? "border-black bg-black text-white" : "border-gray-300 bg-gray-100 text-black"}`}>
      K
    </div>
  </button>
</div>
    </div>
  );
          }
