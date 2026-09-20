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
  ];

  const filteredStories = stories.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
  const handleShare = async () => {
    if(navigator.share){ await navigator.share({title:"ChitPix", text:"Check this post!", url: window.location.href}); }
    else { await navigator.clipboard.writeText(window.location.href); alert("Link Copied! ✅"); }
  };
  const addComment = () => { if(newComment.trim()){ setComments([...comments, newComment]); setNewComment(""); } };

  return (
    <div className="min-h-screen bg-white text-black w-full pb-[80px]">
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-10 border-b">
        <h1 className="text-[26px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf)", WebkitBackgroundClip:"text", color:"transparent"}}>ChitPix</h1>
        <div className="flex gap-4 text-[22px]"><span>♡</span><span onClick={handleShare}>✈️</span></div>
      </div>

      {tab==="home" && (
        <>
          {/* STORY - PEDDAGA INSTAGRAM LA */}
          <div className="flex gap-5 p-4 overflow-x-auto bg-white border-b scrollbar-hide">
            {stories.map((s,i)=>(
              <div key={i} className="flex flex-col items-center min-w-[75px]">
                <div className="w-[75px] h-[75px] rounded-full p-[3.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-[3px]">
                    <img src={s.img} className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
                <p className="text-[12px] mt-2 truncate w-[75px] text-center">{s.name}</p>
              </div>
            ))}
          </div>

          {/* POST - CHINNAGA */}
          <div className="w-full bg-white max-w-[500px] mx-auto">
            <div className="flex justify-between items-center p-3">
              <div className="flex items-center gap-2">
                <img src="https://picsum.photos/100?random=10" className="w-8 h-8 rounded-full" />
                <div><p className="font-bold text-[13px]">_sankar_001</p><p className="text-[11px] text-gray-500">Original audio</p></div>
              </div>
              <span className="font-bold">...</span>
            </div>

            {/* PHOTO CHINNAGA - 1:1 square */}
            <div onDoubleClick={()=>{setLiked(true); setShowHeart(true); setTimeout(()=>setShowHeart(false),1000);}} className="relative bg-gray-100">
              <img src="https://picsum.photos/500/500?random=50" className="w-full h-[380px] object-cover mx-auto" />
              {showHeart && <div className="absolute inset-0 flex items-center justify-center text-[80px] animate-pulse">❤️</div>}
            </div>

            {/* ICONS CHINNAGA */}
            <div className="px-3 py-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-[20px]">
                  <button onClick={()=>setLiked(!liked)} className="active:scale-90">{liked? "❤️" : "🤍"}</button>
                  <button onClick={()=>setShowComments(true)} className="text-[18px]">💬</button>
                  <button onClick={handleShare} className="text-[18px]">✈️</button>
                </div>
                <span className="text-[18px]">🔖</span>
              </div>
              <p className="font-bold text-[13px] mt-2">{liked?"1,247":"1,246"} likes</p>
              <p className="text-[13px]"><b>_sankar_001</b> Snow city vibes ❄️ #winter</p>
            </div>
          </div>
        </>
      )}

      {tab==="search" && (
        <div className="p-4">
          <input autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="w-full bg-gray-100 rounded-lg px-4 py-2 text-[14px] outline-none" />
          <div className="grid grid-cols-3 gap-1 mt-4">
            {filteredStories.map((s,i)=>(<img key={i} src={s.img} className="w-full h-[120px] object-cover" />))}
          </div>
        </div>
      )}

      {tab==="reels" && (
        <div className="bg-black h-[calc(100vh-120px)] overflow-y-scroll snap-y snap-mandatory max-w-[400px] mx-auto">
          {reels.map((reel)=>(
            <div key={reel.id} className="h-[calc(100vh-120px)] w-full relative snap-start flex items-center justify-center">
              <video src={reel.video} autoPlay loop muted playsInline className="h-[70%] w-[85%] object-cover rounded-xl" />
              <div className="absolute bottom-5 left-5 text-white text-[12px]"><p className="font-bold">@{reel.user}</p></div>
              <div className="absolute bottom-20 right-3 flex flex-col gap-4 items-center text-white text-[20px]">
                <div>❤️<p className="text-[10px]">{reel.likes}</p></div>
                <div>💬<p className="text-[10px]">342</p></div>
                <div onClick={handleShare}>✈️</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="profile" && <div className="p-4 text-center mt-10"><img src="https://picsum.photos/100?random=10" className="w-[80px] h-[80px] rounded-full mx-auto" /><h2 className="font-bold mt-3">knmahesh_ravani</h2></div>}

      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[20px] p-4 max-h-[60vh]">
            <div className="flex justify-between border-b pb-2"><h3 className="font-bold text-[14px]">Comments</h3><button onClick={()=>setShowComments(false)}>✕</button></div>
            <div className="mt-3 space-y-2 text-[13px] overflow-y-auto max-h-[30vh]">{comments.map((c,i)=>(<div key={i}><b>rxtagur</b> {c}</div>))}</div>
            <div className="flex gap-2 mt-3 border-t pt-3"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[13px] outline-none" /><button onClick={addComment} className="text-blue-500 font-bold text-[13px]">Post</button></div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-20 text-[20px]">
        <button onClick={()=>setTab("home")}>⌂</button>
        <button onClick={()=>setTab("search")}>🔍</button>
        <button onClick={()=>setTab("reels")}>🎬</button>
        <button onClick={()=>setTab("shop")}>🛍️</button>
        <button onClick={()=>setTab("profile")}>M</button>
      </div>
    </div>
  );
}
