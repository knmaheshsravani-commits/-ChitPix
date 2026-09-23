"use client";
import { useState } from "react";

type Comment = { id:number; user:string; text:string };
type Thread = { id:number; user:string; text:string; likes:number; liked:boolean; time:string; comments:Comment[]; isReel?:boolean };

export default function Page(){
  const [isLogin,setIsLogin]=useState(false);
  const [user,setUser]=useState("");
  const [tab,setTab]=useState("home");
  const [profileTab,setProfileTab]=useState("threads");
  const [searchQ,setSearchQ]=useState("");
  const [activeComment,setActiveComment]=useState<number|null>(null);
  const [commentTxt,setCommentTxt]=useState("");
  const [threads,setThreads]=useState<Thread[]>([
    {id:1,user:"knmahesh30",text:"Hi brother good morning ☀️ Welcome to my Threads clone!",likes:12,liked:false,time:"2h",comments:[{id:1,user:"friend1",text:"Super bro!"}]},
    {id:2,user:"knmahesh30",text:"Hello 🤗 How is this new design? Reels kuda add chesa!",likes:5,liked:true,time:"5h",comments:[],isReel:true},
  ]);
  const [show,setShow]=useState(false);
  const [txt,setTxt]=useState("");
  const [bio,setBio]=useState("Developer | Threads Clone Builder 🚀");
  const [showEdit,setShowEdit]=useState(false);

  const like = (id:number)=>{
    setThreads(threads.map(t=> t.id===id? {...t, liked:!t.liked, likes: t.liked? t.likes-1 : t.likes+1} : t));
  }
  const addComment = (id:number)=>{
    if(!commentTxt) return;
    setThreads(threads.map(t=> t.id===id? {...t, comments:[...t.comments,{id:Date.now(),user:user,text:commentTxt}]}:t));
    setCommentTxt(""); setActiveComment(null);
  }
  const share = async (text:string)=>{
    if(navigator.share){ try{ await navigator.share({title:"Kn Threads", text}); }catch{}}
    else { await navigator.clipboard.writeText(text); alert("Copied! ✅ Share cheseyachu!"); }
  }

  if(!isLogin){
    return(
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-black">Kn Threads</h1>
        <p className="text-sm text-gray-500 mt-2">Login to continue</p>
        <div className="w-full max-w-sm mt-8">
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Username" className="w-full border border-zinc-300 rounded-2xl p-4 text-[16px] outline-none"/>
          <input type="password" placeholder="Password" className="w-full border border-zinc-300 rounded-2xl p-4 mt-3 text-[16px] outline-none"/>
          <button onClick={()=>{if(user)setIsLogin(true)}} className="bg-black text-white w-full rounded-2xl py-4 mt-5 font-bold">Log in</button>
        </div>
      </div>
    )
  }

  const filtered = threads.filter(t=> t.text.toLowerCase().includes(searchQ.toLowerCase()) || t.user.toLowerCase().includes(searchQ.toLowerCase()));

  return(
    <div className="min-h-screen bg-white text-black pb-[90px]">
      <div className="h-[60px] bg-white border-b flex items-center justify-between px-4 sticky top-0 z-20">
        <p className="font-bold text-[32px]">Welcome {user} 🔥</p>
        <button onClick={()=>setIsLogin(false)} className="text-xs border px-3 py-1 rounded-full">Logout</button>
      </div>

      <div className="max-w-[600px] mx-auto">
        {tab==="home" && (
          <div>
            {threads.map(t=>(
              <div key={t.id} className="border-b border-zinc-100 py-4 px-4 flex gap-3">
                <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">{t.user[0].toUpperCase()}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><p className="font-bold text-[32px]">{t.user}</p><p className="text-[32px] text-zinc-500">{t.time}</p></div>
                  <p className="mt-1 text-[32px]">{t.text}</p>
                  {t.isReel && <div className="mt-3 w-full h-[280px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-5xl">▶️ Reel</div>}
                  <div className="flex gap-4 mt-3">
                    <button onClick={()=>like(t.id)} className="flex items-center gap-1"><span className={`text-[22px] ${t.liked? "text-red-500":"text-zinc-600"}`}>{t.liked? "♥":"♡"}</span><span className="text-[13px]">{t.likes}</span></button>
                    <button onClick={()=>setActiveComment(activeComment===t.id?null:t.id)} className="flex items-center gap-1 text-zinc-600"><span className="text-[18px]">💬</span><span className="text-[13px]">{t.comments.length>0? t.comments.length+" Comments":"Reply"}</span></button>
                    <button onClick={()=>share(t.text)} className="flex items-center gap-1 text-zinc-600"><span className="text-[18px]">↗</span><span className="text-[13px]">Share</span></button>
                  </div>
                  {activeComment===t.id && (
                    <div className="mt-3">
                      {t.comments.map(c=><div key={c.id} className="text-[32px] mt-1"><b>{c.user}:</b> {c.text}</div>)}
                      <div className="flex gap-2 mt-2"><input value={commentTxt} onChange={e=>setCommentTxt(e.target.value)} placeholder="Add comment..." className="flex-1 border rounded-full px-3 py-1 text-[32px] outline-none"/><button onClick={()=>addComment(t.id)} className="text-[32px] font-bold">Post</button></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="search" && (
          <div className="p-4">
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Search threads, users..." className="w-full border border-zinc-200 bg-zinc-50 rounded-full px-4 py-3 text-[32px] outline-none"/>
            <p className="text-[32px] text-zinc-600 mt-4 font-bold">REELS 🔥</p>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {[1,2,3,4,5,6].map(i=><div key={i} className="h-[140px] bg-gradient-to-br from-purple-600 to-pink-400 rounded-lg flex items-center justify-center text-white">Reel {i}</div>)}
            </div>
            <div className="mt-6">{filtered.map(t=><div key={t.id} className="border-b py-3 text-[14px]"><b>{t.user}</b>: {t.text}</div>)}</div>
          </div>
        )}

        {tab==="activity" && (
          <div className="p-4">
            <h2 className="font-bold text-[32px]">Activity - Likes ❤️</h2>
            {threads.filter(t=>t.liked).length===0 && <p className="text-zinc-400 text-sm mt-10 text-center">No likes yet - Like chesi chudu bro!</p>}
            {threads.filter(t=>t.liked).map(t=><div key={t.id} className="border-b py-3 flex gap-2"><span className="text-red-600">♥</span><p className="text-[32px]">You liked <b>{t.user}</b> - {t.text.slice(0,30)}</p></div>)}
          </div>
        )}

        {tab==="profile" && (
          <div className="p-4">
            <div className="flex justify-between"><div><h1 className="text-[32px] font-bold">{user}</h1><p className="text-[32px] text-zinc-500">{user.toLowerCase()}@threads</p><p className="text-[32px] mt-2">{bio}</p><div className="flex gap-3 mt-2 text-[32px]"><span><b>{threads.length}</b> threads</span><span><b>{threads.reduce((a,b)=>a+b.likes,0)}</b> likes</span><span><b>{threads.reduce((a,b)=>a+b.comments.length,0)}</b> comments</span></div></div><div className="w-[60px] h-[60px] bg-black text-white rounded-full flex items-center justify-center text-[24px] font-bold">{user[0]?.toUpperCase()}</div></div>
            <button onClick={()=>setShowEdit(true)} className="w-full border rounded-xl py-2 mt-4 font-semibold text-[32px]">Edit profile</button>
            <div className="flex border-b mt-5"><button onClick={()=>setProfileTab("threads")} className={`flex-1 py-2 font-bold text-[32px] border-b ${profileTab==="threads"?"border-black":"border-transparent text-zinc-400"}`}>Threads</button><button onClick={()=>setProfileTab("reels")} className={`flex-1 py-2 font-bold text-[32px] border-b ${profileTab==="reels"?"border-black":"border-transparent text-zinc-400"}`}>Reels</button><button onClick={()=>setProfileTab("likes")} className={`flex-1 py-2 font-bold text-[32px] border-b ${profileTab==="likes"?"border-black":"border-transparent text-zinc-400"}`}>Likes</button></div>
            {profileTab==="threads" && threads.map(t=><div key={t.id} className="border-b py-3 text-[32px]">{t.text} - ♡{t.likes} 💬{t.comments.length}</div>)}
            {profileTab==="reels" && <div className="grid grid-cols-3 gap-1 mt-2">{threads.filter(t=>t.isReel).map(t=><div key={t.id} className="h-[120px] bg-black text-white flex items-center justify-center rounded">▶️</div>)}<p className="col-span-3 text-center text-zinc-400 text-sm mt-4">Reels tab</p></div>}
            {profileTab==="likes" && <div className="mt-2">{threads.filter(t=>t.liked).map(t=><div key={t.id} className="py-2 text-[14px]">❤️ {t.text}</div>)}</div>}
          </div>
        )}
      </div>

      {/* BIG ICONS - 200% NEVER TOUCH */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 h-[100px] flex justify-around items-center px-4 pb-2">
        <button onClick={()=>setTab("home")} className={`text-[52px] ${tab==="home"?"text-black":"text-zinc-600"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[52px] ${tab==="search"?"text-black":"text-zinc-600"}`}>⌕</button>
        <button onClick={()=>setShow(true)} className="bg-black text-white w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[52px] font-bold">+</button>
        <button onClick={()=>setTab("activity")} className={`text-[52px] ${tab==="activity"?"text-black":"text-zinc-600"}`}>♡</button>
        <button onClick={()=>setTab("profile")} className={`text-[52px] ${tab==="profile"?"text-black":"text-zinc-600"}`}>◯</button>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <p className="font-bold mb-3">New Thread + Reel?</p>
            <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="What's new?" className="w-full border rounded-xl p-3 h-24 outline-none"></textarea>
            <button onClick={()=>{if(txt){setThreads([{id:Date.now(),user:user,text:txt,likes:0,liked:false,time:"now",comments:[],isReel:txt.toLowerCase().includes("reel")},...threads]); setTxt(""); setShow(false)}} } className="bg-black text-white w-full py-3 rounded-xl mt-3 font-bold">Post</button>
            <button onClick={()=>setShow(false)} className="w-full mt-2 text-sm text-gray-500">Cancel</button>
            <p className="text-[11px] text-zinc-400 mt-2 text-center">Type "reel" in post to make it a Reel 🔥</p>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <p className="font-bold">Edit Bio</p>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full border rounded-xl p-3 h-24 mt-2 outline-none"></textarea>
            <button onClick={()=>setShowEdit(false)} className="bg-black text-white w-full py-3 rounded-xl mt-3 font-bold">Save</button>
          </div>
        </div>
      )}
    </div>
  )
                                                                                                                   }
