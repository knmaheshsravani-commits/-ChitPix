"use client";
import {useState,useEffect,useRef} from "react";
export default function ChitPix(){
const USERS=[{n:"You",l:"Y",c:"from-yellow-400 to-pink-500"},{n:"Mahesh",l:"M",c:"from-blue-500 to-cyan-400"},{n:"Sravani",l:"S",c:"from-purple-500 to-pink-500"}];
const[tab,setTab]=useState("home");
const[posts,setPosts]=useState([{id:1,u:1,cap:"First post on ChitPix 🔥",like:12,liked:false}]);
const[cap,setCap]=useState("");const[msgs,setMsgs]=useState([{u:1,t:"Hey bro! ChitPix ready ah?"}]);
const[inp,setInp]=useState("");const ref=useRef<HTMLDivElement>(null);
useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[msgs]);
return(<div className="min-h-[100dvh] bg-black text-white flex flex-col max-w-[480px] mx-auto border-x border-zinc-900">
<div className="sticky top-0 z-20 bg-black border-b border-zinc-900 p-3 flex justify-between items-center">
<h1 className="text-[22px] font-black">ChitPix</h1>
<div className="flex gap-2">
<button onClick={()=>setTab("home")} className={`px-3.5 py-1.5 rounded-full text-[13px] border ${tab==='home'?'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>Home</button>
<button onClick={()=>setTab("chat")} className={`px-3.5 py-1.5 rounded-full text-[13px] border ${tab==='chat'?'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>Chat</button>
<button onClick={()=>setTab("post")} className="px-3.5 py-1.5 rounded-full text-[13px] bg-white text-black font-bold">+ Post</button>
</div></div>
<div className="flex-1 overflow-auto">
{tab==='post'&&<div className="p-4 space-y-4"><textarea value={cap} onChange={e=>setCap(e.target.value)} placeholder="What's happening? ✨" className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none"/><button onClick={()=>{if(!cap.trim())return;setPosts([{id:Date.now(),u:0,cap,like:0,liked:false},...posts]);setCap("");setTab("home")}} className="w-full py-3 bg-white text-black rounded-full font-bold">Share Post</button></div>}
{tab==='home'&&<div><div className="flex gap-4 p-4 overflow-x-auto border-b border-zinc-900">{USERS.map((u,i)=><div key={i} className="flex flex-col items-center gap-1.5 shrink-0"><div className={`w-[60px] h-[60px] rounded-full bg-gradient-to-br ${u.c} p-[2px]`}><div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold">{u.l}</div></div><span className="text-[11px] text-zinc-400">{u.n}</span></div>)}</div><div className="divide-y divide-zinc-900">{posts.map(p=>{const u=USERS[p.u];return(<div key={p.id} className="p-4"><div className="flex items-center gap-2 mb-3"><div className={`w-8 h-8 rounded-full bg-gradient-to-br ${u.c} flex items-center justify-center font-bold text-[12px]`}>{u.l}</div><span className="font-semibold text-[14px]">{u.n}</span></div><p className="text-[14px] mb-3">{p.cap}</p><div className="flex gap-4 text-[13px]"><button onClick={()=>setPosts(posts.map(x=>x.id===p.id?{...x,liked:!x.liked,like:x.liked?x.like-1:x.like+1}:x))} className={p.liked?'text-red-500 font-bold':'text-zinc-400'}>❤️ {p.like} Like</button><button className="text-zinc-400">💬 Comment</button><button className="text-zinc-400">↗️ Share</button></div></div>)})}</div></div>}
{tab==='chat'&&<div className="flex flex-col h-[calc(100dvh-60px)]"><div className="flex-1 p-4 space-y-3 overflow-auto">{msgs.map((m,i)=><div key={i} className={`flex ${m.u===0?'justify-end':''}`}><div className={`px-3.5 py-2 rounded-2xl text-[14px] max-w-[70%] ${m.u===0?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}>{m.t}</div></div>)}<div ref={ref}/></div><div className="p-3 border-t border-zinc-900 flex gap-2"><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){setMsgs([...msgs,{u:0,t:inp}]);setInp("")}}} placeholder="Message..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2.5 outline-none"/><button onClick={()=>{if(!inp.trim())return;setMsgs([...msgs,{u:0,t:inp}]);setInp("")}} className="px-5 bg-white text-black rounded-full font-bold">Send</button></div></div>}
</div>
<div className="sticky bottom-0 bg-black border-t border-zinc-900 flex justify-around py-2.5"><button onClick={()=>setTab("home")} className="text-xl">🏠</button><button className="text-xl">🔍</button><button onClick={()=>setTab("post")} className="text-xl">➕</button><button className="text-xl">🎬</button><button className="text-xl">👤</button></div>
</div>)}
