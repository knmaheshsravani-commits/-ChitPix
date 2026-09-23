"use client";
import { useState } from "react";

export default function Page(){
  const [tab,setTab]=useState("home");
  const [threads,setThreads]=useState([{id:1,text:"Hi brother good morning"}]);
  const [show,setShow]=useState(false);
  const [txt,setTxt]=useState("");

  return(
    <div className="min-h-screen bg-white text-black pb-20">
      <div className="h-14 bg-[#8B5CF6] w-full"></div>

      <div className="max-w-[600px] mx-auto p-4">
        <h1 className="font-bold text-center text-xl">Kn Threads - Working ✅</h1>
        <p className="text-center text-sm text-gray-500 mt-2">Tab: {tab}</p>

        {threads.map(t=>(
          <div key={t.id} className="border-b py-4 flex gap-3 mt-4">
            <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center">M</div>
            <div><p className="font-bold text-sm">knmahesh30</p><p className="mt-1">{t.text}</p></div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 h-[75px] flex justify-around items-center px-2 pb-2">
  <button onClick={()=>setTab("home")} className={`text-[52px] p-2 ${tab==="home"?"text-black":"text-zinc-500"}`}>⌂</button>
  <button onClick={()=>setTab("search")} className={`text-[52px] p-2 ${tab==="search"?"text-black":"text-zinc-500"}`}>⌕</button>
  <button onClick={()=>setShow(true)} className="bg-black text-white w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[30px] font-bold shadow-lg">+</button>
  <button onClick={()=>setTab("activity")} className={`text-[52px] p-2 ${tab==="activity"?"text-black":"text-zinc-500"}`}>♡</button>
  <button onClick={()=>setTab("profile")} className={`text-[52px] p-2 ${tab==="profile"?"text-black":"text-zinc-500"}`}>◯</button>
</div>

      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="What's new?" className="w-full border rounded-xl p-3 h-24"></textarea>
            <button onClick={()=>{if(txt){setThreads([{id:Date.now(),text:txt},...threads]); setTxt(""); setShow(false)}} } className="bg-black text-white w-full py-3 rounded-xl mt-3">Post</button>
            <button onClick={()=>setShow(false)} className="w-full mt-2 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
