"use client";
import { useState } from "react";

type Thread = { id:number; user:string; text:string; likes:number; liked:boolean; time:string };

export default function Page(){
  const [isLogin,setIsLogin]=useState(false);
  const [user,setUser]=useState("");
  const [pass,setPass]=useState("");
  const [tab,setTab]=useState("home");
  const [threads,setThreads]=useState<Thread[]>([
    {id:1,user:"knmahesh30",text:"Hi brother good morning ☀️ Welcome to my Threads clone!",likes:12,liked:false,time:"2h"},
    {id:2,user:"knmahesh30",text:"Hello 🤗 How is this new design?",likes:5,liked:false,time:"5h"},
  ]);
  const [show,setShow]=useState(false);
  const [txt,setTxt]=useState("");

  const like = (id:number)=>{
    setThreads(threads.map(t=> t.id===id? {...t, liked:!t.liked, likes: t.liked? t.likes-1 : t.likes+1} : t));
  }

  if(!isLogin){
    return(
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-black tracking-tight">Kn Threads</h1>
        <p className="text-sm text-gray-500 mt-2">Login to continue</p>
        <div className="w-full max-w-sm mt-8">
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Username" className="w-full border border-zinc-300 rounded-2xl p-4 text-[16px] outline-none"/>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password" className="w-full border border-zinc-300 rounded-2xl p-4 mt-3 text-[16px] outline-none"/>
          <button onClick={()=>{if(user)setIsLogin(true)}} className="bg-black text-white w-full rounded-2xl py-4 mt-5 font-bold">Log in</button>
        </div>
      </div>
    )
  }

  return(
    <div className="min-h-screen bg-white text-black pb-[90px]">
      {/* TOP BAR */}
      <div className="h-[60px] bg-white border-b flex items-center justify-between px-4 sticky top-0 z-20">
        <p className="font-bold text-[32px]">Welcome {user} 🔥</p>
        <button onClick={()=>setIsLogin(false)} className="text-xs border px-3 py-1 rounded-full">Logout</button>
      </div>

      <div className="max-w-[600px] mx-auto">
        {/* HOME FEED */}
        {tab==="home" && (
          <div>
            {threads.map(t=>(
              <div key={t.id} className="border-b border-zinc-100 py-4 px-4 flex gap-3">
                <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">{t.user[0].toUpperCase()}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[32px]">{t.user}</p>
                    <p className="text-[32px] text-zinc-500">{t.time}</p>
                  </div>
                  <p className="mt-1 text-[15px] leading-5">{t.text}</p>

                  {/* LIKE COMMENT SHARE - PRO DESIGN */}
                  <div className="flex gap-4 mt-3">
                    <button onClick={()=>like(t.id)} className="flex items-center gap-1">
                      <span className={`text-[32px] ${t.liked? "text-red-500" : "text-zinc-600"}`}>{t.liked? "♥" : "♡"}</span>
                      <span className="text-[32px] text-zinc-500">{t.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-zinc-600">
                      <span className="text-[32px]">💬</span>
                      <span className="text-[32px]">Reply</span>
                    </button>
                    <button className="flex items-center gap-1 text-zinc-600">
                      <span className="text-[32px]">↗</span>
                      <span className="text-[32px]">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab!=="home" && (
          <div className="p-10 text-center text-zinc-500">
            <p className="text-5xl mb-3">{tab==="search"?"⌕":tab==="activity"?"♡":"◯"}</p>
            <p className="font-bold capitalize">{tab} Page - Coming Soon</p>
          </div>
        )}
      </div>

      {/* BIG ICONS - 200% SAFE - NEVER CHANGE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 h-[100px] flex justify-around items-center px-4 pb-2">
        <button onClick={()=>setTab("home")} className={`text-[52px] ${tab==="home"?"text-black":"text-zinc-500"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[52px] ${tab==="search"?"text-black":"text-zinc-500"}`}>⌕</button>
        <button onClick={()=>setShow(true)} className="bg-black text-white w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[52px] font-bold">+</button>
        <button onClick={()=>setTab("activity")} className={`text-[52px] ${tab==="activity"?"text-black":"text-zinc-500"}`}>♡</button>
        <button onClick={()=>setTab("profile")} className={`text-[52px] ${tab==="profile"?"text-black":"text-zinc-500"}`}>◯</button>
      </div>

      {/* POST POPUP */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <p className="font-bold mb-3">New Thread</p>
            <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="What's new?" className="w-full border rounded-xl p-3 h-24 outline-none"></textarea>
            <button onClick={()=>{if(txt){setThreads([{id:Date.now(),user:user,text:txt,likes:0,liked:false,time:"now"},...threads]); setTxt(""); setShow(false)}} } className="bg-black text-white w-full py-3 rounded-xl mt-3 font-bold">Post</button>
            <button onClick={()=>setShow(false)} className="w-full mt-2 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
