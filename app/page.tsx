"use client";
import { useState } from "react";

const HomeIcon = ()=> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1V9.5z"/></svg>
const SearchIcon = ()=> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>
const ShareIcon = ()=> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-4 20-7z"/></svg>
const UserIcon = ()=> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
const HeartIcon = ({liked}:{liked:boolean})=> <svg width="20" height="20" viewBox="0 0 24 24" fill={liked?"black":"none"} stroke="currentColor" strokeWidth="1.5"><path d="M12 20l-1.5-1.4C5 13.5 2 11.2 2 8.2A4.2 4.2 0 016.5 4c1.5 0 3.9 3.5 2.1C10.5 4.9 12 4 13.5 4A4.2 4.2 0 0118 8.2c0 3-3 5.3-8.5 10.4L12 20z"/></svg>
const CommentIcon = ()=> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.5 8.5 0 01-12.5 7.5L3 21l2-5.5A8.5 8.5 0 0121 11.5z"/></svg>

export default function Page(){
  const [showCreate,setShowCreate]=useState(false);
  const [newThread,setNewThread]=useState("");
  const [threads,setThreads]=useState<any[]>([{id:1,text:"Hi brother good morning",likes:0,liked:false,comments:[]}]);
  const [activeComment,setActiveComment]=useState<number|null>(null);
  const [commentText,setCommentText]=useState("");

  const addThread=()=>{ if(!newThread.trim()) return; setThreads([{id:Date.now(),text:newThread,likes:0,liked:false,comments:[]},...threads]); setNewThread(""); setShowCreate(false); }
  const toggleLike=(id:number)=>{ setThreads(threads.map(t=>t.id===id?{...t,liked:!t.liked,likes:t.liked?t.likes-1:t.likes+1}:t)); }
  const addComment=(id:number)=>{ if(!commentText.trim()) return; setThreads(threads.map(t=>t.id===id?{...t,comments:[...t.comments,{id:Date.now(),text:commentText}]}:t)); setCommentText(""); setActiveComment(null); }

  return(
    <div className="min-h-screen bg-white pb-20">
      <div className="h-[48px] bg-[#8B5CF6] w-full"></div>
      <div className="max-w-[700px] mx-auto p-5">
        <div className="flex justify-between items-center"><span className="font-bold text-sm">Stats</span><div className="flex gap-4"><SearchIcon/><span className="text-lg">📷</span></div></div>
        <div className="flex justify-between mt-4"><div><h1 className="text-2xl font-bold">Kn Mahesh</h1><p className="text-sm">knmahesh30</p><p className="text-xs text-zinc-500 mt-2">{threads.length} threads</p></div><div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center">M</div></div>

        <div className="mt-8">
          {threads.map(t=>(
            <div key={t.id} className="border-b border-zinc-200 py-4 flex gap-3">
              <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center text-sm shrink-0">M</div>
              <div className="flex-1">
                <p className="font-bold text-[15px]">knmahesh30</p>
                <p className="mt-1 text-[15px] leading-5">{t.text}</p>
                <div className="flex gap-4 mt-3">
                  <button onClick={()=>toggleLike(t.id)} className="flex items-center gap-1"><HeartIcon liked={t.liked}/>{t.likes>0 && <span className="text-xs">{t.likes}</span>}</button>
                  <button onClick={()=>setActiveComment(activeComment===t.id?null:t.id)} className="flex items-center gap-1"><CommentIcon/>{t.comments.length>0 && <span className="text-xs">{t.comments.length}</span>}</button>
                  <button onClick={()=>navigator.share?.({text:t.text})}><ShareIcon/></button>
                </div>
                {t.comments.length>0 && <div className="mt-3 bg-zinc-50 rounded-xl p-2">{t.comments.map((c:any)=><p key={c.id} className="text-sm py-1">💬 {c.text}</p>)}</div>}
                {activeComment===t.id && <div className="mt-3 flex gap-2"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 border rounded-full px-3 py-1.5 text-sm outline-none"/><button onClick={()=>addComment(t.id)} className="bg-black text-white rounded-full px-4 py-1 text-sm">Reply</button></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around items-center py-2.5">
        <button className="text-zinc-400"><HomeIcon/></button>
        <button className="text-zinc-400"><SearchIcon/></button>
        <button onClick={()=>setShowCreate(true)} className="bg-black text-white w-9 h-9 rounded-lg flex items-center justify-center text-xl font-bold">+</button>
        <button className="text-zinc-400"><ShareIcon/></button>
        <button className="text-zinc-400"><UserIcon/></button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"><div className="bg-white rounded-2xl w-full max-w-[500px] p-5"><div className="flex justify-between mb-3"><button onClick={()=>setShowCreate(false)}>Cancel</button><b>New Thread</b><button onClick={addThread} className="font-bold">Post</button></div><textarea value={newThread} onChange={e=>setNewThread(e.target.value)} placeholder="What's new?" className="w-full h-24 border rounded-xl p-3 outline-none"></textarea><button onClick={addThread} className="bg-black text-white w-full rounded-xl py-3 mt-3">Post</button></div></div>
      )}
    </div>
  )
}
