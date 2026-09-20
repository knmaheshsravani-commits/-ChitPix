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
    { name: "akhileshi...", img: "https://picsum.photos/100?random=3" },
    { name: "abhichar", img: "https://picsum.photos/100?random=4" },
    { name: "your_story", img: "https://picsum.photos/100?random=5" },
  ];

  const reels = [
    { id: 1, user: "rxtagur", video: "https://www.w3schools.com/html/mov_bbb.mp4", likes: "1.2k" },
    { id: 2, user: "akhilesh", video: "https://www.w3schools.com/html/movie.mp4", likes: "2.4k" },
    { id: 3, user: "chittuboi", video: "https://www.w3schools.com/html/mov_bbb.mp4", likes: "890" },
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
        <h1 className="text-[28px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg, orange, purple)", WebkitBackgroundClip:"text", color:"transparent"}}>ChitPix</h1>
        <div className="flex gap-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <svg onClick={handleShare} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
            <div className="flex justify-between items-center p-3"><div><p className="font-bold">_sankar_001</p><p className="text-[11px]">Original audio</p></div></div>
            <div onDoubleClick={()=>{setLiked(true); setShowHeart(true); setTimeout(()=>setShowHeart(false),1000);}} className="relative">
              <img src="https://picsum.photos/800/1200?random=50" className="w-full object-cover" />
              {showHeart && <div className="absolute inset-0 flex items-center justify-center text-[90px]">❤️</div>}
            </div>
            <div className="bg-white text-black px-3 py-3">
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <button onClick={()=>setLiked(!liked)}>{liked? "❤️" : "🤍"}</button>
                  <button onClick={()=>setShowComments(true)}>💬</button>
                  <button onClick={handleShare}>✈️</button>
                </div>
              </div>
              <p className="font-bold mt-2">{liked?"1,247":"1,246"} likes</p>
            </div>
          </div>
        </>
      )}

      {tab==="search" && (
        <div className="p-4">
          <input autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ChitPix..." className="w-full bg-gray-100 rounded-full px-4 py-3 text-[15px] outline-none" />
          <div className="mt-4">
            {filteredStories.map((s,i)=>(
              <div key={i} className="flex items-center gap-3 py-3">
                <img src={s.img} className="w-[50px] h-[50px] rounded-full" />
                <p className="font-bold">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="reels" && (
        <div className="bg-black h-[calc(100vh-120px)] overflow-y-scroll snap-y snap-mandatory">
          {reels.map((reel)=>(
            <div key={reel.id} className="h-[calc(100vh-120px)] w-full relative snap-start flex items-center justify-center bg-black">
              <video src={reel.video} autoPlay loop muted playsInline className="h-full w-full object-cover" />
              <div className="absolute bottom-5 left-3 text-white">
                <p className="font-bold">@{reel.user}</p>
                <p className="text-[13px] mt-1">ChitPix Trending Reel 🔥 #mass</p>
              </div>
              <div className="absolute bottom-20 right-3 flex flex-col gap-5 items-center text-white">
                <div className="flex flex-col items-center"><span className="text-[28px]">❤️</span><span className="text-[12px]">{reel.likes}</span></div>
                <div className="flex flex-col items-center"><span className="text-[26px]">💬</span><span className="text-[12px]">342</span></div>
                <div className="flex flex-col items-center" onClick={handleShare}><span className="text-[26px]">✈️</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="profile" && (
        <div className="p-4 text-center mt-10">
          <img src="https://picsum.photos/100?random=10" className="w-[90px] h-[90px] rounded-full mx-auto" />
          <h2 className="font-bold text-xl mt-3">knmahesh_ravani</h2>
          <p className="mt-2 text-gray-500">ChitPix Developer 🚀</p>
        </div>
      )}

      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[20px] p-4 max-h-[70vh]">
            <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold">Comments</h3><button onClick={()=>setShowComments(false)}>✕</button></div>
            <div className="mt-3 space-y-3 overflow-y-auto max-h-[40vh]">
              {comments.map((c,i)=>(<div key={i} className="flex gap-2"><b>rxtagur</b><p>{c}</p></div>))}
            </div>
            <div className="flex gap-2 mt-4 border-t pt-3">
              <input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none" />
              <button onClick={addComment} className="text-blue-500 font-bold">Post</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-20">
        <button onClick={()=>setTab("home")} className={tab==="home"?"text-black font-bold":"text-gray-400"}>⌂</button>
        <button onClick={()=>setTab("search")} className={tab==="search"?"text-black font-bold":"text-gray-400"}>🔍</button>
        <button onClick={()=>setTab("reels")} className={tab==="reels"?"text-black font-bold":"text-gray-400"}>🎬</button>
        <button onClick={()=>setTab("shop")} className={tab==="shop"?"text-black font-bold":"text-gray-400"}>🛍️</button>
        <button onClick={()=>setTab("profile")} className={tab==="profile"?"text-black font-bold":"text-gray-400"}>M</button>
      </div>
    </div>
  );
    }
