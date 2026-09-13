"use client";
import {useState,useEffect,useRef} from "react"

export default function ChitPix(){
const USERS=[{n:"You",l:"Y",c:"from-orange-400 to-pink-500"},{n:"Ammu",l:"A",c:"from-purple-400 to-pink-500"},{n:"Rahul",l:"R",c:"from-blue-400 to-cyan-400"}]
const [tab,setTab]=useState("home")
const [posts,setPosts]=useState([{id:1,u:1,img:"https://picsum.photos/seed/1/600/600",cap:"My first post ❤️ #chitpix",likes:12,liked:false,comments:[]},{id:2,u:2,img:"https://picsum.photos/seed/2/600/800",cap:"Sunset vibes 🌅",likes:45,liked:true,comments:[{u:"Rahul",t:"Nice pic!"}]}])
const [cap,setCap]=useState("");const [showNew,setShowNew]=useState(false)
const [inp,setInp]=useState("");const [msgs,setMsgs]=useState([{f:0,t:"hi"},{f:1,t:"Hey! 😍"}])
const ref=useRef<HTMLDivElement>(null)
useEffect(()=>{ref.current?.scrollTo(0,99999)},[msgs,tab])

return(<div className="min-h-[100dvh] bg-white text-black flex flex-col">
<div className="sticky top-0 z-20 bg-white border-b flex items-center justify-between px-4 py-3">
<h1 className="text-[26px] font-black tracking-tight" style={{fontFamily:"cursive"}}>ChitPix</h1>
<div className="flex gap-4 text-[22px]"><span onClick={()=>setTab("chat")}>💬</span><span onClick={()=>setTab("profile")}>👤</span></div>
</div>

{tab==="home" && <div className="flex-1 max-w-[480px] w-full mx-auto">
<div className="flex gap-4 p-3 overflow-x-auto border-b">
{USERS.map((u,i)=><div key={i} className="flex flex-col items-center"><div className={`w-16 h-16 rounded-full bg-gradient-to-br ${u.c} p-[3px]`}><div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold">{u.l}</div></div><span className="text-[11px] mt-1">{u.n}</span></div>)}
</div>
{posts.map(p=><div key={p.id} className="border-b pb-3">
<div className="flex items-center gap-2 p-3"><div className={`w-8 h-8 rounded-full bg-gradient-to-br ${USERS[p.u].c} flex items-center justify-center text-white font-bold text-sm`}>{USERS[p.u].l}</div><b className="text-[14px]">{USERS[p.u].n}</b></div>
<img src={p.img} className="w-full"/>
<div className="flex gap-4 px-3 py-2 text-[22px]"><span onClick={()=>{setPosts(posts.map(x=>x.id===p.id?{...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}:x))}}>{p.liked?"❤️":"🤍"}</span><span>💬</span><span>✈️</span></div>
<div className="px-3 text-[14px]"><b>{p.likes} likes</b><div><b>{USERS[p.u].n}</b> {p.cap}</div>{p.comments.map((c:any,j:number)=><div key={j} className="text-[13px]"><b>{c.u}</b> {c.t}</div>)}</div>
</div>)}
</div>}

{tab==="chat" && <div className="flex-1 flex flex-col max-w-[480px] w-full mx-auto bg-white">
<div className="p-3 border-b font-bold">Messages</div>
<div ref={ref} className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#fafafa]">
{msgs.map((m,i)=><div key={i} className={`max-w-[75%] p-3 rounded-[18px] text-[14px] ${m.f===0?"ml-auto bg-[#0095f6] text-white rounded-br-[4px]":"bg-white border rounded-bl-[4px]"}`}>{m.t}</div>)}
</div>
<div className="p-3 border-t flex gap-2"><input value={inp} onChange={e=>setInp(e.target.value)} placeholder="Message..." className="flex-1 bg-[#efefef] rounded-full px-4 py-2 text-[14px] outline-none"/><button onClick={()=>{if(!inp)return;setMsgs([...msgs,{f:0,t:inp}]);setInp("")}} className="text-[#0095f6] font-bold text-[14px]">Send</button></div>
</div>}

{tab==="profile" && <div className="flex-1 max-w-[480px] w-full mx-auto p-6 text-center"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 mx-auto flex items-center justify-center text-white text-[30px] font-bold">Y</div><h2 className="mt-3 font-bold text-[18px]">You</h2><div className="grid grid-cols-3 gap-1 mt-6">{posts.filter(p=>p.u===0).map(p=><img key={p.id} src={p.img} className="aspect-square object-cover"/>)}</div></div>}

<div className="sticky bottom-0 bg-white border-t flex justify-around py-3 text-[22px] max-w-[480px] w-full mx-auto">
<span onClick={()=>setTab("home")} className={tab==="home"?"font-black":""}>🏠</span>
<span>🔍</span>
<span onClick={()=>setShowNew(true)} className="text-[26px]">➕</span>
<span onClick={()=>setTab("chat")}>💬</span>
<span onClick={()=>setTab("profile")}>👤</span>
</div>

{showNew && <div className="fixed inset-0 z-50 bg-white p-4 flex flex-col"><div className="flex justify-between items-center mb-4"><button onClick={()=>setShowNew(false)}>✕</button><b>New Post</b><button onClick={()=>{if(!cap)return;setPosts([{id:Date.now(),u:0,img:`https://picsum.photos/seed/${Date.now()}/600/600`,cap,likes:0,liked:false,comments:[]},...posts]);setCap("");setShowNew(false);setTab("home")}} className="text-[#0095f6] font-bold">Share</button></div><textarea value={cap} onChange={e=>setCap(e.target.value)} placeholder="Write a caption..." className="flex-1 border rounded p-3 outline-none"/><img src={`https://picsum.photos/seed/${Date.now()}/600/600`} className="mt-4 rounded"/></div>}
</div>)
                                           }
