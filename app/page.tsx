"use client";
import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState("home");
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ALL FEATURES STATE
  const [showComments, setShowComments] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [allComments, setAllComments] = useState<any>({});
  const [searchText, setSearchText] = useState("");
  const [viewStory, setViewStory] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<any>({});

  const [threads, setThreads] = useState([
    { id: 1, user: "knmahesh30", text: "Hi brother good morning 🌟 Welcome to ChitPix!", likes: 13, isReel: false },
    { id: 2, user: "knmahesh30", text: "My first reel on ChitPix 🔥", likes: 25, isReel: true },
    { id: 3, user: "friend_dev", text: "ChitPix is awesome app bro! Keep going 💯", likes: 8, isReel: false },
  ]);

  // LIKE FUNCTION
  const handleLike = (id: number) => {
    if (likedPosts[id]) {
      setLikedPosts({...likedPosts, [id]: false });
      setThreads(threads.map(t => t.id === id? {...t, likes: t.likes - 1 } : t));
    } else {
      setLikedPosts({...likedPosts, [id]: true });
      setThreads(threads.map(t => t.id === id? {...t, likes: t.likes + 1 } : t));
    }
  };

  // SHARE FUNCTION
  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({ title: "ChitPix", text: text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert("Link Copied! 📋 " + text);
    }
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
          <h1 className="text-3xl font-black text-center mb-6 text-black">ChitPix 📸</h1>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full border-2 border-gray-200 p-3 rounded-xl mb-3 outline-none text-black bg-white"/>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border-2 border-gray-200 p-3 rounded-xl mb-4 outline-none text-black bg-white"/>
          <button onClick={()=>setIsLogin(true)} className="w-full bg-black text-white py-3 rounded-xl font-bold">Login</button>
          <p className="text-center text-xs mt-3 text-gray-500">Any username/password works</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-[80px]">
      {/* HEADER */}
      <div className="sticky top-0 z-40 w-full h-[60px] flex items-center justify-between px-4 shadow-sm" style={{background: 'linear-gradient(90deg, #7B2FFF 0%, #FF3CAC 100%)'}}>
        <h1 className="text-white text-[28px] font-black">ChitPix</h1>
        <div className="flex gap-3 items-center">
          <button onClick={()=>setTab("dm")} className="text-white text-xl">✈️</button>
          <button onClick={()=>setIsLogin(false)} className="border border-white text-white px-3 py-1 rounded-full text-xs">Logout</button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto bg-white">
        {/* HOME TAB */}
        {tab==="home" && (
          <>
            <div className="p-2 text-sm font-bold text-black">Welcome {username || "Knmahesh"} 🔥</div>

            {/* STORIES */}
            <div className="flex gap-4 p-3 overflow-x-auto border-b">
              {["Your Story","knmahesh","friend1","friend2","dev_bro"].map((s,i)=>(
                <div key={i} className="flex flex-col items-center cursor-pointer" onClick={()=>setViewStory(s)}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center border-2 border-white font-bold shadow-md">{s[0].toUpperCase()}</div>
                  <span className="text-[10px] mt-1 text-black">{s}</span>
                </div>
              ))}
            </div>

            {/* POSTS & REELS */}
            {threads.filter(t=> searchText==="" || t.text.toLowerCase().includes(searchText.toLowerCase())).map((t)=>(
              <div key={t.id} className="p-3 border-b bg-white">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">{t.user[0].toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-black">{t.user}</div>
                    <div className="text-sm mt-1 text-black">{t.text}</div>
                    {t.isReel && <div className="mt-2 h-[300px] rounded-xl flex flex-col items-center justify-center text-white text-4xl gap-2" style={{background:'linear-gradient(135deg,#8b5cf6,#ec4899,#f59e0b)'}}><span>▶️</span><span className="text-sm">Reel Video</span></div>}
                    <div className="flex gap-5 mt-3 text-sm">
                      <button onClick={()=>handleLike(t.id)} className="flex gap-1">{likedPosts[t.id]?"❤️":"🤍"} {t.likes}</button>
                      <button onClick={()=>setShowComments(t.id)} className="flex gap-1">💬 {(allComments[t.id]?.length || 0)} </button>
                      <button onClick={()=>handleShare(t.text)}>↗ Share</button>
                    </div>
                    {allComments[t.id] && allComments[t.id].length>0 && (
                      <div className="mt-2 text-xs bg-gray-50 p-2 rounded-lg">
                        {allComments[t.id].slice(-2).map((c:any,i:number)=><div key={i} className="text-black"><b>{c.user}</b> {c.text}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* SEARCH TAB */}
        {tab==="search" && (
          <div className="p-4">
            <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search users, posts, reels..." className="w-full border-2 border-purple-200 rounded-full px-4 py-3 text-black bg-white placeholder:text-gray-400 outline-none"/>
            <div className="mt-4 space-y-3">
              {["knmahesh30","friend_dev","reels_king","story_girl"].filter(u=>u.includes(searchText.toLowerCase())).map(u=>(
                <div key={u} className="flex items-center gap-3 p-2 border rounded-xl">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">{u[0].toUpperCase()}</div>
                  <div className="text-black font-bold text-sm">{u}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DM TAB */}
        {tab==="dm" && (
          <div className="p-4">
            <h2 className="font-bold text-lg text-black">Messages ✈️</h2>
            {["friend1: Hi bro!","dev_bro: ChitPix super","knmahesh: Welcome"].map((m,i)=>(
              <div key={i} className="flex gap-3 p-3 border-b">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">💬</div>
                <div className="text-black text-sm">{m}</div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE TAB */}
        {tab==="profile" && (
          <div className="p-4 text-center">
            <div className="w-20 h-20 bg-black text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold">K</div>
            <h2 className="font-bold mt-2 text-black">{username || "knmahesh30"}</h2>
            <p className="text-sm text-gray-500">ChitPix Creator 📸 | Reels + Stories</p>
            <div className="flex justify-around mt-6 border-t pt-4 text-black">
              <div><b>{threads.length}</b><br/><span className="text-xs">Posts</span></div>
              <div><b>120</b><br/><span className="text-xs">Followers</span></div>
              <div><b>180</b><br/><span className="text-xs">Following</span></div>
            </div>
            <button onClick={()=>{const txt=prompt("Edit Bio:"); if(txt) alert("Bio Updated: "+txt)}} className="mt-6 border border-black px-6 py-2 rounded-full text-black text-sm font-bold">Edit Profile</button>
          </div>
        )}
      </div>

      {/* STORY VIEWER */}
      {viewStory && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center" onClick={()=>setViewStory(null)}>
          <div className="relative w-full max-w-[400px] h-[80vh] bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center flex-col text-white">
            <div className="absolute top-4 left-4 font-bold">{viewStory}</div>
            <div className="text-6xl">📸</div>
            <div className="mt-4 text-xl">{viewStory} Story</div>
            <button className="absolute top-4 right-4" onClick={()=>setViewStory(null)}>✕</button>
          </div>
        </div>
      )}

      {/* COMMENT BOX - FIXED WHITE ISSUE */}
      {showComments!== null && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end justify-center" onClick={()=>setShowComments(null)}>
          <div className="bg-white w-full max-w-[600px] rounded-t-[20px] max-h-[70vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-black">Comments</h3>
              <button onClick={()=>setShowComments(null)} className="w-7 h-7 bg-gray-100 rounded-full text-black">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(allComments[showComments] || []).map((c:any,i:number)=>(
                <div key={i} className="flex gap-2 text-sm text-black"><b>{c.user}</b><span>{c.text}</span></div>
              ))}
              {(!allComments[showComments] || allComments[showComments].length===0) && <p className="text-gray-400 text-sm text-center mt-10">No comments yet. Be first! 💬</p>}
            </div>
            <div className="p-3 border-t flex gap-2 bg-white">
              <input value={commentInput} onChange={e=>setCommentInput(e.target.value)} placeholder="Add a comment..." className="flex-1 border-2 border-purple-200 rounded-full px-4 py-2.5 text-sm outline-none bg-white text-black placeholder:text-gray-400"/>
              <button onClick={()=>{
                if(!commentInput.trim()) return;
                const newC = {user: username || "knmahesh30", text: commentInput};
                setAllComments((prev:any)=>({...prev, [showComments!]: [...(prev[showComments!]||[]), newC]}));
                setCommentInput("");
              }} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-full text-sm font-bold">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV - ALL WORKING */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
        <button onClick={()=>setTab("home")} className={`text-xl ${tab==="home"?"text-purple-600":""}`}>🏠</button>
        <button onClick={()=>setTab("search")} className={`text-xl ${tab==="search"?"text-purple-600":""}`}>🔍</button>
        <button onClick={()=>{const txt=prompt("New Post / Reel text:"); if(txt){const isReel=confirm("Is this a Reel? OK=Reel, Cancel=Post"); setThreads([{id:Date.now(), user: username||"knmahesh30", text:txt, likes:0, isReel},...threads]); setTab("home")}}} className="bg-black text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold">+</button>
        <button onClick={()=>setTab("dm")} className={`text-xl ${tab==="dm"?"text-purple-600":""}`}>✈️</button>
        <button onClick={()=>setTab("profile")} className={`text-xl ${tab==="profile"?"text-purple-600":""}`}>👤</button>
      </div>
    </div>
  );
        }
