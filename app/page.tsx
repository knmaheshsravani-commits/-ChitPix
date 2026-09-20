"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [user, setUser] = useState<string|null>(null);
  const [loginName, setLoginName] = useState("");
  const [tab, setTab] = useState("home");
  const stories = [
    { id:1, name:"nani", img:"https://picsum.photos/200/200?1", storyImg:"https://picsum.photos/400/700?1" },
    { id:2, name:"sravani", img:"https://picsum.photos/200/200?2", storyImg:"https://picsum.photos/400/700?2" },
    { id:3, name:"mahesh", img:"https://picsum.photos/200/200?3", storyImg:"https://picsum.photos/400/700?3" },
    { id:4, name:"chaitu", img:"https://picsum.photos/200/200?4", storyImg:"https://picsum.photos/400/700?4" },
  ];
  const [posts, setPosts] = useState([
    { id: 1, user:"mahesh", img: "https://picsum.photos/500/600?10", likes: 120, liked: false, comments: ["Nice!", "Super"] },
    { id: 2, user:"sravani", img: "https://picsum.photos/500/600?11", likes: 89, liked: false, comments: [] },
  ]);
  const [showComments, setShowComments] = useState<number|null>(null);
  const [text, setText] = useState("");
  const [activeStory, setActiveStory] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newImg, setNewImg] = useState("");

  useEffect(()=>{
    const saved = localStorage.getItem("chitpix_user");
    if(saved) setUser(saved);
  },[]);

  useEffect(()=>{
    if(!activeStory) return;
    setProgress(0);
    const id = setInterval(()=>setProgress(p=>p+2),100);
    const t = setTimeout(()=>setActiveStory(null),5000);
    return ()=>{clearInterval(id); clearTimeout(t);}
  },[activeStory]);

  const handleLogin = () => {
    if(!loginName) return;
    setUser(loginName);
    localStorage.setItem("chitpix_user", loginName);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("chitpix_user");
  };

  const addPost = () => {
    if(!newImg) return;
    setPosts([{ id: Date.now(), user: user||"you", img: newImg, likes:0, liked:false, comments:[] },...posts]);
    setNewImg(""); setShowAdd(false); setTab("home");
  };

  // LOGIN SCREEN
  if(!user){
    return (
      <div className="max-w-[400px] mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-black mb-2" style={{fontFamily:"cursive"}}>ChitPix</h1>
        <p className="text-gray-500 mb-8 text-sm">Login to see photos from friends</p>
        <input value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Your name" className="w-full border rounded-lg p-3 mb-3"/>
        <input type="password" placeholder="Password (any)" className="w-full border rounded-lg p-3 mb-4"/>
        <button onClick={handleLogin} className="w-full bg-blue-500 text-white rounded-lg py-3 font-bold">Log In</button>
        <p className="text-xs mt-6 text-gray-400">Demo login - any name works bro</p>
      </div>
    )
  }

  return (
    <div className="max-w-[400px] mx-auto bg-white min-h-screen pb-16 relative">
      <div className="flex justify-between p-3 border-b sticky top-0 bg-white z-10">
        <h1 className="font-black text-xl" style={{fontFamily:"cursive"}}>ChitPix</h1>
        <div className="flex gap-3 items-center"><span className="text-sm">Hi, {user}</span><button onClick={handleLogout} className="text-xs text-red-500">Logout</button></div>
      </div>

      {tab==="home" && <>
        <div className="flex gap-3 p-3 overflow-x-auto border-b">
          {stories.map(s=>(
            <div key={s.id} onClick={()=>setActiveStory(s)} className="flex flex-col items-center cursor-pointer">
              <img src={s.img} className="w-14 h-14 rounded-full border-2 border-pink-500 p-[2px]"/>
              <span className="text-[10px]">{s.name}</span>
            </div>
          ))}
        </div>
        {posts.map(p=>(
          <div key={p.id} className="border-b">
            <div className="p-2 flex gap-2 items-center"><img src={`https://picsum.photos/30/30?${p.id}`} className="w-6 h-6 rounded-full"/><span className="text-sm font-bold">{p.user}</span></div>
            <img src={p.img} className="w-full" alt="post"/>
            <div className="p-2 flex gap-4">
              <button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}:x))} className={p.liked?"text-red-500":""}>❤️ {p.likes}</button>
              <button onClick={()=>setShowComments(p.id)}>💬 {p.comments.length}</button>
            </div>
            {showComments===p.id && (
              <div className="p-3 bg-gray-50">
                {p.comments.map((c,i)=><p key={i} className="text-sm">• {c}</p>)}
                <div className="flex gap-2 mt-2">
                  <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add comment" className="flex-1 border rounded-full px-3 py-1 text-sm"/>
                  <button onClick={()=>{if(!text)return; setPosts(posts.map(x=>x.id===p.id?{...x,comments:[...x.comments,`${user}: ${text}`]}:x)); setText("");}} className="text-blue-500 text-sm font-bold">Post</button>
                </div>
                <button onClick={()=>setShowComments(null)} className="text-xs mt-2">Close</button>
              </div>
            )}
          </div>
        ))}
      </>}

      {tab==="profile" && <div className="p-4">
        <div className="flex gap-4 items-center">
          <img src="https://picsum.photos/200/200?9" className="w-20 h-20 rounded-full"/>
          <div className="flex gap-6"><p><b>{posts.filter(p=>p.user===user).length}</b><br/>Posts</p><p><b>1.2k</b><br/>Followers</p></div>
        </div>
        <h1 className="font-bold mt-3">{user}</h1>
        <div className="grid grid-cols-3 gap-1 mt-6">{posts.filter(p=>p.user===user).map(p=><img key={p.id} src={p.img} className="h-28 object-cover" alt="post"/> )}</div>
        {posts.filter(p=>p.user===user).length===0 && <p className="text-sm text-gray-400 mt-4">No posts yet - click ＋ to add!</p>}
      </div>}

      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black max-w-[400px] mx-auto">
          <div className="h-1 bg-gray-600 w-full"><div className="h-1 bg-white" style={{width:`${progress}%`}}></div></div>
          <div className="flex justify-between p-3 text-white"><div className="flex gap-2 items-center"><img src={activeStory.img} className="w-8 h-8 rounded-full"/><span className="text-sm font-bold">{activeStory.name}</span></div><button onClick={()=>setActiveStory(null)} className="text-2xl">×</button></div>
          <img src={activeStory.storyImg} className="w-full h-[85vh] object-cover"/>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 max-w-[400px] mx-auto">
          <div className="bg-white rounded-xl p-4 w-full">
            <h2 className="font-bold mb-2">New Post 📸 {user}</h2>
            <input value={newImg} onChange={e=>setNewImg(e.target.value)} placeholder="Paste image URL" className="w-full border rounded p-2 text-sm mb-3"/>
            <div className="flex gap-2"><button onClick={addPost} className="flex-1 bg-black text-white rounded-full py-2 text-sm">Share</button><button onClick={()=>setShowAdd(false)} className="flex-1 border rounded-full py-2 text-sm">Cancel</button></div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 w-full max-w-[400px] bg-white border-t flex justify-around py-3">
        <button onClick={()=>setTab("home")}>🏠</button>
        <button onClick={()=>setShowAdd(true)} className="text-xl font-bold">＋</button>
        <button onClick={()=>setTab("profile")}>👤</button>
      </div>
    </div>
  );
                                                   }
