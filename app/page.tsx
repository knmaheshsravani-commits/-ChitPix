"use client";
import { useState } from "react";

export default function Page(){
  const [showCreate,setShowCreate]=useState(false);
  const [newThread,setNewThread]=useState("");
  const [commentBox,setCommentBox]=useState<number|null>(null);
  const [commentText,setCommentText]=useState("");
  const [threads,setThreads]=useState<any[]>([
    {id:1,text:"Hi brother good morning",likes:0,liked:false,comments:[]}
  ]);

  const addThread=()=>{
    if(!newThread.trim()) return;
    setThreads([{id:Date.now(),text:newThread,likes:0,liked:false,comments:[]},...threads]);
    setNewThread(""); setShowCreate(false);
  }
  const toggleLike=(id:number)=>{
    setThreads(threads.map(t=>t.id===id?{...t,liked:!t.liked,likes:t.liked?t.likes-1:t.likes+1}:t));
  }
  const addComment=(id:number)=>{
    if(!commentText.trim()) return;
    setThreads(threads.map(t=>t.id===id?{...t,comments:[...t.comments,{id:Date.now(),text:commentText}]}:t));
    setCommentText(""); setCommentBox(null);
  }

  return(
    <div className="min-h-screen bg-white text-black pb-[70px]">
      <div className="h-[56px] bg-[#8B5CF6] w-full"></div>
      <div className="h-[20px] bg-[#A78BFA] w-full"></div>
      <div className="h-[12px] bg-[#C4B5FD] w-full"></div>

      <div className="max-w-[600px] mx-auto px-4 pt-4">
        <div className="flex justify-between items-center">
          <p className="font-bold text-[14px]">Stats</p>
          <div className="flex gap-4 text-[18px]"><span>🌐</span><span>📷</span></div>
        </div>

        <div className="flex justify-between mt-4">
          <div>
            <h1 className="text-[22px] font-bold">Kn Mahesh</h1>
            <p className="text-[14px]">knmahesh30</p>
            <p className="text-[14px] mt-3">🚀 Developer | Threads Clone Builder</p>
            <p className="text-[13px] text-gray-500 mt-1">knmahesh.dev • Bangalore</p>
            <p className="text-[13px] text-gray-500 mt-2">{threads.length} threads • 0 followers</p>
          </div>
          <div className="w-[64px] h-[64px] bg-black text-white rounded-full flex items-center justify-center text-[22px]">M</div>
        </div>

        <div className="mt-8 border-t pt-4">
          {threads.map(t=>(
            <div key={t.id} className="flex gap-3 py-4 border-b border-gray-100">
              <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center text-sm shrink-0">M</div>
              <div className="flex-1">
                <p className="font-bold text-[14px]">knmahesh30</p>
                <p className="mt-1 text-[15px] leading-5">{t.text}</p>
                <div className="flex gap-5 mt-3 text-[18px]">
                  <button onClick={()=>toggleLike(t.id)}>{t.liked?"❤️":"♡"} {t.likes>0 && <span className="text-xs">{t.likes}</span>}</button>
                  <button onClick={()=>setCommentBox(commentBox===t.id?null:t.id)}>💬 {t.comments.length>0 && <span className="text-xs">{t.comments.length}</span>}</button>
                  <button onClick={()=>navigator.share?navigator.share({text:t.text}):alert("Link copied")}>↗</button>
                </div>
                {t.comments.length>0 && (
                  <div className="mt-2 bg-zinc-50 rounded-xl p-2">
                    {t.comments.map((c:any)=><p key={c.id} className="text-[13px] py-1">↳ {c.text}</p>)}
                  </div>
                )}
                {commentBox===t.id && (
                  <div className="flex gap-2 mt-2">
                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Comment..." className="flex-1 border rounded-full px-3 py-1 text-sm outline-none"/>
                    <button onClick={()=>addComment(t.id)} className="bg-black text-white rounded-full px-4 text-sm">Post</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-[60px] flex justify-around items-center">
        <button>⌂</button>
        <button>⌕</button>
        <button onClick={()=>setShowCreate(true)} className="bg-black text-white w-9 h-9 rounded-lg font-bold text-xl">+</button>
        <button>➤</button>
        <button>◯</button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] p-5">
            <div className="flex justify-between mb-3"><button onClick={()=>setShowCreate(false)} className="text-gray-500">Cancel</button><b>New Thread</b><button onClick={addThread} className="font-bold">Post</button></div>
            <textarea value={newThread} onChange={e=>setNewThread(e.target.value)} placeholder="What's new?" className="w-full h-24 border rounded-xl p-3 outline-none"></textarea>
            <button onClick={addThread} className="bg-black text-white w-full rounded-xl py-3 mt-3 font-bold">Post</button>
          </div>
        </div>
      )}
    </div>
  )
}
