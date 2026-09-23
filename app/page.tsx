"use client";
import { useState } from "react";

export default function Page(){
  const [isLogin,setIsLogin]=useState(false);
  const [user,setUser]=useState("");
  const [pass,setPass]=useState("");
  const [tab,setTab]=useState("home");
  const [threads,setThreads]=useState([{id:1,text:"Hi brother good morning"}]);
  const [show,setShow]=useState(false);
  const [txt,setTxt]=useState("");

  // LOGIN SCREEN
  if(!isLogin){
    return(
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-black">Kn Threads</h1>
        <p className="text-sm text-gray-500 mt-2">Login to continue</p>
        <div className="w-full max-w-sm mt-8">
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Username" className="w-full border border-zinc-600 rounded-2xl p-4 outline-none text-[52px]"/>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password" className="w-full border border-zinc-500 rounded-2xl p-4 outline-none mt-3 text-[32px]"/>
          <button onClick={()=>{if(user){setIsLogin(true)}}} className="bg-black text-white w-full rounded-2xl py-4 mt-5 font-bold text-[52px]">Log in</button>
          <p className="text-xs text-center text-gray-400 mt-3">Type any username & click login</p>
        </div>
      </div>
    )
  }

  // MAIN APP - AFTER LOGIN
  return(
    <div className="min-h-screen bg-white text-black pb-[90px]">
      <div className="h-14 bg-[#8B5CF6] w-full flex items-center justify-between px-4">
        <p className="text-white font-bold">Welcome {user} 🔥</p>
        <button onClick={()=>setIsLogin(false)} className="text-white text-xs border border-white/30 px-3 py-1 rounded-full">Logout</button>
      </div>

      <div className="max-w-[800px] mx-auto p-4">
        <h1 className="font-bold text-center text-xl">Kn Threads - Working ✅</h1>
        <p className="text-center text-sm text-gray-500 mt-2">Tab: {tab}</p>
        {threads.map(t=>(
          <div key={t.id} className="border-b py-4 flex gap-3 mt-4">
            <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center">M</div>
            <div><p className="font-bold text-sm">{user}</p><p className="mt-1">{t.text}</p></div>
          </div>
        ))}
      </div>

      {/* BIG ICONS - 200% SIZE SAFE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-400 h-[32px] flex justify-around items-center px-4 pb-2">
        <button onClick={()=>setTab("home")} className={`text-[52px] ${tab==="home"?"text-black":"text-zinc-400"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[52px] ${tab==="search"?"text-black":"text-zinc-400"}`}>⌕</button>
        <button onClick={()=>setShow(true)} className="bg-black text-white w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[52px] font-bold shadow-lg">+</button>
        <button onClick={()=>setTab("activity")} className={`text-[52px] ${tab==="activity"?"text-black":"text-zinc-400"}`}>♡</button>
        <button onClick={()=>setTab("profile")} className={`text-[52px] ${tab==="profile"?"text-black":"text-zinc-400"}`}>◯</button>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="What's new?" className="w-full border rounded-xl p-3 h-24 outline-none"></textarea>
            <button onClick={()=>{if(txt){setThreads([{id:Date.now(),text:txt},...threads]); setTxt(""); setShow(false)}} } className="bg-black text-white w-full py-3 rounded-xl mt-3">Post</button>
            <button onClick={()=>setShow(false)} className="w-full mt-2 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
