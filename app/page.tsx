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
    { name: "akhilesh", img: "https://picsum.photos/100?random=3" },
    { name: "abhichar", img: "https://picsum.photos/100?random=4" },
    { name: "your_story", img: "https://picsum.photos/100?random=5" },
  ];

  const reels = [
    { id: 1, user: "rxtagur", video: "https://www.w3schools.com/html/mov_bbb.mp4", likes: "1.2k" },
    { id: 2, user: "akhilesh", video: "https://www.w3schools.com/html/movie.mp4", likes: "2.4k" },
  ];

  const filteredStories = stories.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
  const handleShare = async () => {
    if(navigator.share){ await navigator.share({title:"ChitPix", url: window.location.href}); }
    else { await navigator.clipboard.writeText(window.location.href); alert("Link Copied! ✅"); }
  };
  const addComment = () => { if(newComment.trim()){ setComments([...comments, newComment]); setNewComment(""); } };

  return (
    <div className="min-h-screen bg-white text-black w-full pb-[80px]">
      <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-10 border-b">
        <h1 className="text-[26px] font-black" style={{fontFamily:"cursive", background:"linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf)", WebkitBackgroundClip:"text", color:"transparent"}}>ChitPix</h1>
        <div className="flex gap-4 text-[20px]"><span>♡</span><span onClick={handleShare}>✈️</span></div>
      </div>

      {tab==="home" && (
        <>
          <div className="flex gap-5 p-4 overflow-x-auto bg-white border-b">
            {stories.map((s,i)=>(
                            <div key={i} className="flex flex-col items-center min-w-[86px]">
                <div className="w-[86px] h-[86px] rounded-full p-[4px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-[3px]">
                    <img src={s.img} className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
                <p className="text-[13px] mt-2 truncate w-[86px] text-center font-medium">{s.name}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-white max-w-[500px] mx-auto">
            <div className="flex items-center gap-2 p-3">
              <img src="https://picsum.photos/100?random=10" className="w-8 h-8 rounded-full" />
              <p className="font-bold text-[13px]">_sankar_001</p>
            </div>
            <div onDoubleClick={()=>{setLiked(true); setShowHeart(true); setTimeout(()=>setShowHeart(false),1000);}} className="relative bg-gray-100">
              <img src="https://picsum.photos/500/500?random=50" className="w-full h-[480px] object-cover" />
              {showHeart && <div className="absolute inset-0 flex items-center justify-center text-[80px]">❤️</div>}
            </div>
            <div className="px-3 py-2 flex gap-3 text-[20px]">
              <button onClick={()=>setLiked(!liked)}>{liked?"❤️":"🤍"}</button>
              <button onClick={()=>setShowComments(true)}>💬</button>
              <button onClick={handleShare}>✈️</button>
            </div>
          </div>
        </>
      )}

      {tab==="search" && (
        <div className="p-4">
          <input autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="w-full bg-gray-100 rounded-lg px-4 py-2 text-[14px] outline-none" />
          <div className="grid grid-cols-3 gap-1 mt-4">{filteredStories.map((s,i)=>(<img key={i} src={s.img} className="w-full h-[120px] object-cover" />))}</div>
        </div>
      )}

      {tab==="reels" && (
        <div className="bg-black h-[calc(100vh-120px)] overflow-y-scroll snap-y snap-mandatory max-w-[400px] mx-auto">
          {reels.map((reel)=>(
            <div key={reel.id} className="h-[calc(100vh-120px)] w-full relative snap-start flex items-center justify-center">
              <video src={reel.video} autoPlay loop muted playsInline className="h-[70%] w-[85%] object-cover rounded-xl" />
              <div className="absolute bottom-5 left-5 text-white text-[12px] font-bold">@{reel.user}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="profile" && <div className="p-4 text-center mt-10"><img src="https://picsum.photos/100?random=10" className="w-[80px] h-[80px] rounded-full mx-auto" /><h2 className="font-bold mt-3">knmahesh_ravani</h2></div>}

      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[20px] p-4">
            <div className="flex justify-between border-b pb-2"><h3 className="font-bold text-[14px]">Comments</h3><button onClick={()=>setShowComments(false)}>✕</button></div>
            <div className="mt-3 text-[13px]">{comments.map((c,i)=>(<div key={i}><b>rxtagur</b> {c}</div>))}</div>
            <div className="flex gap-2 mt-3"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[13px] outline-none" /><button onClick={addComment} className="text-blue-500 font-bold">Post</button></div>
          </div>
        </div>
      )}

           <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 z-20">
        <button onClick={()=>setTab("home")}>
          {tab==="home" ? 
          <svg width="27" height="27" viewBox="0 0 24 24" fill="black"><path d="M12 2.2L3 11v9c0 .6.4 1 1 1h5v-5h6v5h5c.6 0 1-.4 1-1v-9L12 2.2z"/></svg>
          : 
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M3 11L12 2.5L21 11v9a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1v-9z"/></svg>
          }
        </button>

        <button onClick={()=>setTab("reels")}>
          {tab==="reels" ?
          <svg width="26" height="26" viewBox="0 0 24 24" fill="black"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5L16 12L10 15.5V8.5z" fill="white"/></svg>
          :
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5L16 12L10 15.5V8.5z" fill="none"/></svg>
          }
        </button>

        <button onClick={handleShare}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
        </button>

        <button onClick={()=>setTab("search")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={tab==="search"?"2.4":"1.7"}><circle cx="11" cy="11" r="6"/><path d="M21 21L16.65 16.65"/></svg>
        </button>

        <button onClick={()=>setTab("profile")}>
          <div className={`w-[28px] h-[28px] rounded-full p-[2.5px] ${tab==="profile"?"bg-black":"bg-transparent"}`}>
            <img src="https://picsum.photos/100?random=10" className="w-full h-full rounded-full border-2 border-white object-cover" />
          </div>
        </button>
      </div>
    </div>
  );
}
