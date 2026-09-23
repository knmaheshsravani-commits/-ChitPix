"use client";
import { useState } from "react";
export default function Page(){
  const [showCreate,setShowCreate]=useState(false);
  const [newThread,setNewThread]=useState("");
  const [threads,setThreads]=useState<any[]>([{id:1,text:"Hi brother good morning",likes:0,liked:false,comments:[]}]);

  const addThread=()=>{
    if(!newThread.trim()) return;
    setThreads([{id:Date.now(),text:newThread,likes:0,liked:false,comments:[]},...threads]);
    setNewThread(""); setShowCreate(false);
  }

  return(
    <div className="min-h-screen bg-white text-black pb-20">
      <div className="h-12 bg-[#8B5CF6] w-full"></div>
      <div className="h-8 bg-[#A78BFA] w-full"></div>

      <div className="max-w-[600px] mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[20px] font-bold text-black">Kn Mahesh</h1>
            <p className="text-[14px] text-black">knmahesh30</p>
            <p className="text-[13px] text-gray-500 mt-1">{threads.length} threads</p>
          </div>
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl">M</div>
        </div>

        <div className="mt-8">
          {threads.map(t=>(
            <div key={t.id} className="border-b border-gray-200 py-4 flex gap-3">
              <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center text-sm">M</div>
              <div className="flex-1">
                <p className="font-bold text-[14px] text-black">knmahesh30</p>
                <p className="mt-1 text-[16px] text-black">{t.text}</p>
                <div className="flex gap-4 mt-3">
                  <button className="text-gray-500">♡</button>
                  <button className="text-gray-500">💬</button>
                  <button className="text-gray-500">↗</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-[60px]">
        <span className="text-xl">⌂</span>
        <span className="text-xl">⌕</span>
        <button onClick={()=>setShowCreate(true)} className="bg-black text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xl">+</button>
        <span className="text-xl">➤</span>
        <span className="text-xl">◯</span>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] p-5">
            <div className="flex justify-between mb-4">
              <button onClick={()=>setShowCreate(false)} className="text-gray-500">Cancel</button>
              <b className="text-black">New Thread</b>
              <button onClick={addThread} className="font-bold text-black">Post</button>
            </div>
            <textarea value={newThread} onChange={e=>setNewThread(e.target.value)} placeholder="What's new?" className="w-full h-24 border border-gray-200 rounded-xl p-3 outline-none text-black bg-white"></textarea>
            <button onClick={addThread} className="bg-black text-white w-full rounded-xl py-3 mt-4 font-bold">Post</button>
          </div>
        </div>
      )}
    </div>
  )
}
