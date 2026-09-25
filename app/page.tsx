"use client";
import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState("home");
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPost, setNewPost] = useState("");

  // COMMENT FIX STATES
  const [showComments, setShowComments] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [allComments, setAllComments] = useState({});

  const [threads, setThreads] = useState([
    { id: 1, user: "knmahesh30", text: "Hi brother good morning 🌟 Welcome!", likes: 13 },
    { id: 2, user: "knmahesh30", text: "Hello 🤗 Reels + Stories add chesa!", likes: 5, isReel: true },
  ]);

  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-sm">
          <h1 className="text-3xl font-black text-center mb-6" style={{fontFamily:'cursive'}}>ChitPix 📸</h1>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full border p-3 rounded-xl mb-3 outline-none"/>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border p-3 rounded-xl mb-4 outline-none"/>
          <button onClick={()=>setIsLogin(true)} className="w-full bg-black text-white py-3 rounded-xl font-bold">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-[80px]">
      {/* TOP HEADER - CHITPIX */}
      <div className="sticky top-0 z-50 w-full h-[60px] flex items-center justify-between px-4 shadow-sm" style={{background: 'linear-gradient(90deg, #7B2FFF 0%, #FF3CAC 100%)'}}>
        <h1 className="text-white text-[28px] font-black" style={{fontFamily:'cursive'}}>ChitPix</h1>
        <div className="flex gap-3 items-center">
          <button onClick={()=>setTab("dm")} className="text-white text-xl">✈️</button>
          <button onClick={()=>setIsLogin(false)} className="border border-white/50 text-white px-3 py-1 rounded-full text-xs">Logout</button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto">
        <div className="p-2 text-sm font-bold">Welcome Knmahesh 🔥</div>

        {/* STORIES */}
        <div className="flex gap-4 p-3 overflow-x-auto border-b">
          {["Your Story","knmahesh","friend1","friend2","dev_bro"].map((s,i)=>(
            <div key={i} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center border-2 border-pink-500">{s[0].toUpperCase()}</div>
              <span className="text-[10px] mt-1">{s}</span>
            </div>
          ))}
        </div>

        {/* POSTS */}
        {threads.map((t, idx)=>(
          <div key={t.id} className="p-3 border-b">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">{t.user[0].toUpperCase()}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{t.user}</div>
                <div className="text-sm mt-1">{t.text}</div>
                {t.isReel && <div className="mt-2 h-[200px] rounded-xl flex items-center justify-center text-white text-3xl" style={{background:'linear-gradient(90deg,#8b5cf6,#ec4899)'}}>▶️ Reel</div>}

                {/* LIKE COMMENT SHARE */}
                <div className="flex gap-4 mt-3 text-sm">
                  <span>❤️ {t.likes}</span>
                  <button onClick={()=>setShowComments(t.id)} className="flex items-center gap-1">💬 {(allComments[t.id]?.length || 0) > 0? allComments[t.id].length : ""} Comment</button>
                  <span>↗ Share</span>
                </div>

                {/* SHOW 2 COMMENTS PREVIEW */}
                {allComments[t.id] && (
                  <div className="mt-2 text-xs text-gray-600">
                    {allComments[t.id].slice(-2).map((c,i)=><div key={i}><b>{c.user}</b> {c.text}</div>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ COMMENT BOX POPUP - IDI MAIN FIX */}
      {showComments!== null && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end justify-center" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[600px] rounded-t-[20px] max-h-[70vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Comments</h3>
              <button onClick={()=>setShowComments(null)} className="w-7 h-7 bg-gray-100 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(allComments[showComments] || []).map((c,i)=>(
                <div key={i} className="flex gap-2 text-sm"><b>{c.user}</b><span>{c.text}</span></div>
              ))}
              {(!allComments[showComments] || allComments[showComments].length===0) && <p className="text-gray-400 text-sm text-center mt-10">No comments yet. Be first! 💬</p>}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input value={commentInput} onChange={e=>setCommentInput(e.target.value)} placeholder="Add a comment..." className="flex-1 border rounded-full px-4 py-2.5 text-sm outline-none bg-gray-50"/>
              <button onClick={()=>{
                if(!commentInput.trim()) return;
                const newC = {user: "knmahesh30", text: commentInput};
                setAllComments(prev=>({...prev, [showComments]: [...(prev[showComments]||[]), newC]}));
                setCommentInput("");
              }} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-full text-sm font-bold">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3">
        <button onClick={()=>setTab("home")}>🏠</button>
        <button>🔍</button>
        <button className="bg-black text-white w-8 h-8 rounded-lg">+</button>
        <button onClick={()=>setTab("dm")}>✈️</button>
        <button>○</button>
      </div>
    </div>
  );
}
