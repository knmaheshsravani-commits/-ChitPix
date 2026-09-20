"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [user, setUser] = useState<string|null>("mahesh");
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState([
    { id: 1, user: "nature_lover", img: "https://picsum.photos/800/800?11", likes: 124, liked: true, comments: ["Wow 😍"] },
    { id: 2, user: "travel_dairies", img: "https://picsum.photos/800/800?12", likes: 89, liked: true, comments: [] },
  ]);
  const [showComments, setShowComments] = useState<number|null>(null);
  const [text, setText] = useState("");
  const [activeStory, setActiveStory] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newImg, setNewImg] = useState("");

  const stories = [
    { id:1, name:"nani", img:"https://picsum.photos/100/100?1" },
    { id:2, name:"sravani", img:"https://picsum.photos/100/100?2" },
    { id:3, name:"mahesh", img:"https://picsum.photos/100/100?3" },
    { id:4, name:"chaitu", img:"https://picsum.photos/100/100?4" },
  ];

  const addPost = () => {
    if(!newImg) return;
    setPosts([{ id: Date.now(), user: user!, img: newImg, likes:0, liked:false, comments:[] },...posts]);
    setNewImg(""); setShowAdd(false);
  };

  if(!user) return null;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen relative flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
          <h1 className="text-[22px] font-black tracking-tight" style={{fontFamily:"cursive"}}>ChitPix</h1>
          <button onClick={()=>setUser(null)} className="text-[12px] text-red-500 font-bold">Logout</button>
        </div>

        {tab==="home" && (
          <>
            {/* STORIES */}
            <div className="flex gap-4 px-3 py-3 overflow-x-auto border-b scrollbar-none">
              {stories.map(s=>(
                <div key={s.id} onClick={()=>setActiveStory(s)} className="flex flex-col items-center min-w-[60px] cursor-pointer">
                  <div className="w-[62px] h-[62px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600">
                    <img src={s.img} className="w-full h-full rounded-full border-2 border-white object-cover bg-white"/>
                  </div>
                  <span className="text-[11px] mt-1">{s.name}</span>
                </div>
              ))}
            </div>

            {/* POSTS */}
            <div className="flex-1 bg-gray-50">
              {posts.map(p=>(
                <div key={p.id} className="bg-white mb-2 border-b">
                  <div className="flex items-center gap-2 p-3">
                    <img src={`https://picsum.photos/100/100?${p.id+20}`} className="w-8 h-8 rounded-full"/>
                    <span className="text-sm font-semibold">{p.user}</span>
                  </div>
                  <img src={p.img} className="w-full aspect-square object-cover" alt="post"/>
                  <div className="flex gap-4 p-3">
                    <button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x, liked:!x.liked, likes: x.liked? x.likes-1 : x.likes+1}:x))} className={`text-xl ${p.liked?"text-red-500":""}`}>❤️</button>
                    <button onClick={()=>setShowComments(p.id)} className="text-xl">💬</button>
                  </div>
                  <p className="px-3 pb-1 text-sm font-bold">{p.likes} likes</p>
                  {showComments===p.id && (
                    <div className="px-3 pb-3">
                      {p.comments.map((c:any,i:number)=><p key={i} className="text-sm py-1">{c}</p>)}
                      <div className="flex gap-2 mt-2">
                        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a comment..." className="flex-1 text-sm border-b outline-none py-1"/>
                        <button onClick={()=>{ if(!text) return; setPosts(posts.map(x=>x.id===p.id?{...x, comments:[...x.comments, `${user}: ${text}`]}:x)); setText(""); }} className="text-blue-500 text-sm font-bold">Post</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="profile" && (
          <div className="p-5">
            <div className="flex gap-8 items-center">
              <img src="https://picsum.photos/200/200?9" className="w-20 h-20 rounded-full"/>
              <div><b>{posts.length}</b><p className="text-sm">Posts</p></div>
              <div><b>1.2k</b><p className="text-sm">Followers</p></div>
            </div>
            <p className="font-bold mt-4">{user}</p>
            <div className="grid grid-cols-3 gap-[2px] mt-5">
              {posts.map(p=><img key={p.id} src={p.img} className="aspect-square object-cover" />)}
            </div>
          </div>
        )}

        {/* STORY VIEWER */}
        {activeStory && (
          <div onClick={()=>setActiveStory(null)} className="fixed inset-0 z-50 bg-black flex justify-center">
            <div className="w-full max-w-[430px] bg-black relative">
              <div className="flex justify-between p-4 text-white"><span className="font-bold">{activeStory.name}</span><span>✕</span></div>
              <img src={`https://picsum.photos/800/1200?${activeStory.id}`} className="w-full h-[80vh] object-cover"/>
            </div>
          </div>
        )}

        {/* ADD POST MODAL */}
        {showAdd && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 w-full max-w-[350px]">
              <h2 className="font-bold text-center mb-4">Create new post</h2>
              <input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="https://picsum.photos/800/800?30" className="w-full border rounded-lg p-3 text-sm"/>
              <button onClick={addPost} className="w-full bg-blue-500 text-white rounded-lg py-3 mt-4 font-bold">Share</button>
              <button onClick={()=>setShowAdd(false)} className="w-full mt-2 text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* BOTTOM NAV - FIXED */}
        <div className="sticky bottom-0 bg-white border-t flex justify-around py-3 z-20">
          <button onClick={()=>setTab("home")} className={`text-xl ${tab==="home"?"":"opacity-40"}`}>🏠</button>
          <button onClick={()=>setShowAdd(true)} className="text-2xl border-2 border-black rounded-lg w-7 h-7 flex items-center justify-center">+</button>
          <button onClick={()=>setTab("profile")} className={`text-xl ${tab==="profile"?"":"opacity-40"}`}>👤</button>
        </div>
      </div>
    </div>
  );
      }
