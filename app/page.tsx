"use client"
import { useState } from "react";

export default function Page() {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [tab, setTab] = useState("home");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(["Super bro! 🔥", "Mass pic anna!"]);
  const [newComment, setNewComment] = useState("");
  const [search, setSearch] = useState("");

  const stories = [
    { name: "rxtagur", img: "https://picsum.photos/100?random=2" },
    { name: "akhileshdi...", img: "https://picsum.photos/100?random=3" },
    { name: "abhichar", img: "https://picsum.photos/100?random=4" },
    { name: "your_story", img: "https://picsum.photos/100?random=5" },
  ];

  const filteredStories = stories.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));

  const handleShare = async () => {
    if(navigator.share){
      await navigator.share({title:"ChitPix", text:"Check this post on ChitPix!", url: window.location.href});
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link Copied! ✅");
    }
  };

  const addComment = () => {
    if(newComment.trim()){ setComments([...comments, newComment]); setNewComment(""); }
  };

  return (
    <div className="min-h-screen bg-white text-black w-full pb-[90px]">
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-10 border-b">
        <h1 className="text-[28px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ChitPix</h1>
        <div className="flex gap-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <svg onClick={handleShare} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
        </div>
      </div>

      {tab==="home" && (
        <>
          <div className="flex gap-4 p-4 overflow-x-auto bg-white border-b">
            {stories.map((s,i)=>(
              <div key={i} className="flex flex-col items-center min-w-[70px]">
                <div className="w-[65px] h-[65px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                  <img src={s.img} className="w-full h-full rounded-full border-2 border-white object-cover" />
                </div>
                <p className="text-[11px] mt-1 truncate w-[65px] text-center">{s.name}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-black text-white">
            <div className="flex justify-between items-center p-3"><div><p className="font-bold">_sankar_oo1_</p></div><div>•••</div></div>
            <div onDoubleClick={()=>{setLiked(true); setShowHeart(true); setTimeout(()=>setShowHeart(false),1000)}} className="relative w-full aspect-[4/5] bg-gray-900 overflow-hidden">
              <img src="https://picsum.photos/800/1200?random=50" className="w-full h-full object-cover" />
              {showHeart && <div className="absolute inset-0 flex items-center justify-center text-[90px]">❤️</div>}
              <div className="absolute top-1/2 left-0 right-0 text-center p-6"><p className="font-bold text-[22px]">Don't express feeling to everyone, not everyone will feel the same.</p></div>
            </div>
            <div className="bg-white text-black px-3 py-3">
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <button onClick={()=>setLiked(!liked)}><svg width="28" height="28" viewBox="0 0 24 24" fill={liked?"red":"none"} stroke={liked?"red":"black"} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
                  <button onClick={()=>setShowComments(true)}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>
                  <button onClick={handleShare}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                </div>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p className="font-bold mt-2">{liked?"1,247":"1,246"} likes</p>
              <p className="text-[14px] mt-1"><span className="font-bold">_sankar_oo1_</span> Don't express feeling...</p>
              <p onClick={()=>setShowComments(true)} className="text-gray-500 text-[14px] mt-1 cursor-pointer">View all {comments.length} comments</p>
            </div>
          </div>
        </>
      )}

      {tab==="search" && (
        <div className="p-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ChitPix..." className="w-full bg-gray-100 rounded-full px-4 py-3 text-[15px] outline-none" autoFocus />
          <div className="mt-4 space-y-3">
            {filteredStories.map((s,i)=><div key={i} className="flex gap-3 items-center"><img src={s.img} className="w-[45px] h-[45px] rounded-full"/><p className="font-bold">{s.name}</p></div>)}
            {filteredStories.length===0 && search && <p className="text-gray-500 text-center mt-10">No results for "{search}"</p>}
            {!search && <p className="text-gray-400 text-center mt-10">Type to search users...</p>}
          </div>
        </div>
      )}

      {tab==="reels" && (
        <div className="bg-black"><video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" autoPlay loop muted playsInline className="w-full h-[calc(100vh-140px)] object-cover" /></div>
      )}

      {tab==="profile" && (
        <div><div className="p-4 flex gap-6 items-center"><div className="w-[75px] h-[75px] rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><img src="https://picsum.photos/100?random=99" className="w-full h-full rounded-full border-2 border-white"/></div><div className="flex gap-6"><div className="text-center"><p className="font-bold">12</p><p className="text-sm">Posts</p></div><div className="text-center"><p className="font-bold">1.2K</p><p className="text-sm">Followers</p></div><div className="text-center"><p className="font-bold">340</p><p className="text-sm">Following</p></div></div></div><div className="grid grid-cols-3 gap-[2px]">{Array.from({length:12},(_,i)=><img key={i} src={`https://picsum.photos/300?random=${i+10}`} className="aspect-square object-cover"/>)}</div></div>
      )}

      {showComments && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[20px] max-h-[70vh] flex flex-col">
            <div className="p-4 border-b flex justify-between"><p className="font-bold">Comments</p><button onClick={()=>setShowComments(false)} className="text-xl">✕</button></div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {comments.map((c,i)=><div key={i} className="flex gap-2"><div className="w-8 h-8 bg-gray-300 rounded-full"/><p className="text-[14px]"><span className="font-bold">user_{i} </span>{c}</p></div>)}
            </div>
            <div className="p-3 border-t flex gap-2"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none"/><button onClick={addComment} className="text-blue-600 font-bold">Post</button></div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-[75px]">
        <button onClick={()=>setTab("home")} className="text-[28px]">{tab==="home"?"🏠":"⌂"}</button>
        <button onClick={()=>setTab("search")} className="flex-1 flex justify-center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tab==="search"?"black":"black"} strokeWidth={tab==="search"?"3":"2"}><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
        <button onClick={()=>setTab("reels")} className="flex-1 flex justify-center"><svg width="28" height="28" viewBox="0 0 24 24" fill={tab==="reels"?"black":"none"} stroke="black" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg></button>
        <button onClick={handleShare} className="flex-1 flex justify-center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><polygon points="23 7 13.5 15.5 8.5 10.5 1 17.5 1 7 23 7"/></svg></button>
        <button onClick={()=>setTab("profile")} className="flex-1 flex justify-center"><div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold ${tab==="profile"?"bg-black text-white":"bg-gray-300"}`}>M</div></button>
      </div>
    </div>
  );
      }
