"use client";
import { useState, useRef } from "react";

type Comment = { id:number; user:string; text:string };
type Thread = { id:number; user:string; text:string; likes:number; liked:boolean; time:string; comments:Comment[]; isReel?:boolean };
type Story = { id:number; user:string; seen:boolean; image?:string };
type Message = { id:number; text:string; fromMe:boolean; time:string };
type Chat = { id:number; user:string; avatar?:string; lastMsg:string; online:boolean; messages:Message[]; unread:number };

export default function Page(){
  const [isLogin,setIsLogin]=useState(false);
  const [user,setUser]=useState("");
  const [tab,setTab]=useState("home");
  const [profileTab,setProfileTab]=useState("threads");
  const [searchQ,setSearchQ]=useState("");
  const [activeComment,setActiveComment]=useState<number|null>(null);
  const [commentTxt,setCommentTxt]=useState("");
  const [avatar,setAvatar]=useState<string|null>(null);
  const [activeStory,setActiveStory]=useState<Story|null>(null);
  const [progress,setProgress]=useState(0);
  const [selectedChat,setSelectedChat]=useState<Chat|null>(null);
  const [dmText,setDmText]=useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  const [stories,setStories]=useState<Story[]>([
    {id:1,user:"Your Story",seen:false},
    {id:2,user:"knmahesh",seen:false},
    {id:3,user:"friend1",seen:false},
    {id:4,user:"friend2",seen:true},
    {id:5,user:"dev_bro",seen:false},
  ]);
  const [chats,setChats]=useState<Chat[]>([
    {id:1,user:"knmahesh",lastMsg:"Bro story super!",online:true,unread:2,messages:[{id:1,text:"Hi bro!",fromMe:false,time:"10:30"},{id:2,text:"Bro story super!",fromMe:false,time:"10:31"},{id:3,text:"Thanks bro 🔥",fromMe:true,time:"10:32"}]},
    {id:2,user:"friend1",lastMsg:"Reel chusa bro mass!",online:true,unread:0,messages:[{id:1,text:"Reel chusa bro mass!",fromMe:false,time:"9:15"}]},
    {id:3,user:"friend2",lastMsg:"DM feature ela add chesav?",online:false,unread:1,messages:[{id:1,text:"DM feature ela add chesav?",fromMe:false,time:"Yesterday"}]},
    {id:4,user:"dev_bro",lastMsg:"You: Code commit chesa",online:false,unread:0,messages:[{id:1,text:"Code commit chesa",fromMe:true,time:"Yesterday"}]},
  ]);

  const [threads,setThreads]=useState<Thread[]>([
    {id:1,user:"knmahesh30",text:"Hi brother good morning ☀️ Welcome!",likes:13,liked:false,time:"2h",comments:[{id:1,user:"friend1",text:"Super bro!"}],isReel:false},
    {id:2,user:"knmahesh30",text:"Hello 🤗 Reels + Stories add chesa!",likes:5,liked:true,time:"5h",comments:[],isReel:true},
  ]);
  const [show,setShow]=useState(false);
  const [txt,setTxt]=useState("");
  const [bio,setBio]=useState("Developer | Threads Clone Builder 🚀");
  const [showEdit,setShowEdit]=useState(false);

  const onPhotoPick = (e:any)=>{ const f=e.target.files?.[0]; if(f){ const url=URL.createObjectURL(f); setAvatar(url); } }
  const onStoryPick = (e:any)=>{ const f=e.target.files?.[0]; if(f){ const url=URL.createObjectURL(f); setStories([{id:Date.now(),user:"Your Story",seen:false,image:url},...stories]); } }

  const openStory = (st:Story)=>{
    setActiveStory(st); setStories(stories.map(s=>s.id===st.id?{...s,seen:true}:s)); setProgress(0);
    let p=0; const inter=setInterval(()=>{ p+=2; setProgress(p); if(p>=100){ clearInterval(inter); setActiveStory(null);} },60);
  }
  const sendDM = ()=>{
    if(!dmText ||!selectedChat) return;
    const newMsg:Message={id:Date.now(),text:dmText,fromMe:true,time:"now"};
    const updatedChats=chats.map(c=> c.id===selectedChat.id? {...c, lastMsg:"You: "+dmText, messages:[...c.messages,newMsg], unread:0}:c);
    setChats(updatedChats);
    setSelectedChat({...selectedChat, messages:[...selectedChat.messages,newMsg], lastMsg:"You: "+dmText});
    setDmText("");
  }

  const like = (id:number)=> setThreads(threads.map(t=> t.id===id? {...t, liked:!t.liked, likes: t.liked? t.likes-1 : t.likes+1} : t));
  const share = async (text:string)=>{ if(navigator.share){ try{ await navigator.share({title:"Kn Threads", text}); }catch{}} else { await navigator.clipboard.writeText(text); alert("Copied! ✅"); } }

  if(!isLogin){
    return(
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-black">Kn Threads</h1>
        <div className="w-full max-w-sm mt-8">
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Username" className="w-full border rounded-2xl p-4 outline-none"/>
          <button onClick={()=>{if(user)setIsLogin(true)}} className="bg-black text-white w-full rounded-2xl py-4 mt-5 font-bold">Log in</button>
        </div>
      </div>
    )
  }

  // CHAT VIEW
  if(selectedChat){
    return(
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-[60px] border-b flex items-center gap-3 px-4 sticky top-0 bg-white">
          <button onClick={()=>setSelectedChat(null)} className="text-[22px]">←</button>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">{selectedChat.user[0].toUpperCase()}</div>
          <div className="flex-1"><p className="font-bold text-[14px]">{selectedChat.user}</p><p className="text-[11px] text-green-500">{selectedChat.online?"Active now":"Offline"}</p></div>
          <button className="text-[20px]">📞</button><button className="text-[20px] ml-2">📹</button>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto pb-[80px]">
          {selectedChat.messages.map(m=>(
            <div key={m.id} className={`flex ${m.fromMe?"justify-end":"justify-start"}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-[14px] ${m.fromMe? "bg-black text-white rounded-br-sm":"bg-zinc-100 rounded-bl-sm"}`}>{m.text}<p className={`text-[10px] mt-1 ${m.fromMe?"text-zinc-300":"text-zinc-400"}`}>{m.time}</p></div>
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-2">
          <input value={dmText} onChange={e=>setDmText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendDM()} placeholder="Message..." className="flex-1 bg-zinc-100 rounded-full px-4 py-3 outline-none text-[14px]"/>
          <button onClick={sendDM} className="bg-black text-white rounded-full px-5 py-3 font-bold text-[14px]">Send</button>
        </div>
      </div>
    )
  }

  return(
    <div className="min-h-screen bg-white text-black pb-[90px]">
      <div className="h-[60px] border-b flex items-center justify-between px-4 sticky top-0 z-20 bg-white">
        <p className="font-bold text-[18px]">Welcome {user} 🔥</p>
        <div className="flex gap-4 items-center">
          <button onClick={()=>setTab("dm")} className="text-[24px]">✈️</button>
          <button onClick={()=>setIsLogin(false)} className="text-xs border px-3 py-1 rounded-full">Logout</button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto">
        {tab==="home" && (
          <div>
            <div className="border-b py-3 px-2 flex gap-4 overflow-x-auto">
              {stories.map(s=>(
                <div key={s.id} className="flex flex-col items-center min-w-[60px]">
                  <button onClick={()=> s.id===1? storyFileRef.current?.click() : openStory(s)} className={`w-[60px] h-[60px] rounded-full p-[3px] ${s.seen? "bg-zinc-300" : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"}`}>
                    <div className="w-full h-full bg-white rounded-full p-[2px]"><div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">{s.image? <img src={s.image} className="w-full h-full object-cover"/> : <span className="text-white font-bold">{s.user[0].toUpperCase()}</span>}</div></div>
                    {s.id===1 && <div className="relative -top-3 left-9 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] border-2 border-white">+</div>}
                  </button>
                  <p className="text-[11px] mt-1 truncate w-[60px] text-center">{s.user}</p>
                </div>
              ))}
            </div>
            {threads.map(t=>(
              <div key={t.id} className="border-b py-4 px-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold">{t.user[0].toUpperCase()}</div>
                <div className="flex-1"><p className="font-bold text-[15px]">{t.user}</p><p className="text-[15px]">{t.text}</p>{t.isReel && <div className="mt-3 w-full h-[280px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-5xl">▶️ Reel</div>}<div className="flex gap-4 mt-3 text-[14px]"><button onClick={()=>like(t.id)}>{t.liked? "♥":"♡"} {t.likes}</button><button onClick={()=>setActiveComment(t.id)}>💬</button><button onClick={()=>share(t.text)}>↗ Share</button></div></div>
              </div>
            ))}
          </div>
        )}

        {tab==="dm" && (
          <div>
            <div className="p-4 border-b flex justify-between items-center"><h2 className="font-bold text-[18px]">{user} ▾</h2><button className="text-[22px]">✎</button></div>
            <div className="p-3"><input placeholder="🔍 Search chats..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} className="w-full bg-zinc-100 rounded-full px-4 py-2 text-[13px] outline-none"/></div>
            {chats.filter(c=>c.user.toLowerCase().includes(searchQ.toLowerCase())).map(chat=>(
              <button key={chat.id} onClick={()=>setSelectedChat(chat)} className="w-full flex gap-3 p-3 hover:bg-zinc-50 text-left border-b border-zinc-50">
                <div className="relative"><div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold">{chat.user[0].toUpperCase()}</div>{chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}</div>
                <div className="flex-1"><div className="flex justify-between"><p className="font-semibold text-[14px]">{chat.user}</p><p className="text-[11px] text-zinc-400">{chat.messages[chat.messages.length-1]?.time}</p></div><div className="flex justify-between"><p className="text-[13px] text-zinc-500 truncate max-w-[180px]">{chat.lastMsg}</p>{chat.unread>0 && <span className="bg-blue-500 text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center">{chat.unread}</span>}</div></div>
              </button>
            ))}
          </div>
        )}

        {tab==="profile" && (
          <div className="p-4"><div className="flex justify-between"><div><h1 className="text-[22px] font-bold">{user}</h1><p className="text-[14px] text-zinc-500">{user}@threads</p><p className="text-[14px] mt-2">{bio}</p></div><button onClick={()=>fileRef.current?.click()} className="w-[64px] h-[64px] rounded-full bg-black overflow-hidden">{avatar? <img src={avatar} className="w-full h-full object-cover"/> : <span className="text-white flex h-full items-center justify-center font-bold">{user[0]?.toUpperCase()}</span>}</button></div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhotoPick}/><input ref={storyFileRef} type="file" accept="image/*" hidden onChange={onStoryPick}/>
            <button onClick={()=>setShowEdit(true)} className="w-full border rounded-xl py-2 mt-4 font-semibold text-[14px]">Edit profile</button><button onClick={()=>storyFileRef.current?.click()} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-2 mt-2 font-semibold text-[14px]">+ Add Story</button></div>
        )}
        {tab==="search" && <div className="p-4"><input placeholder="🔍 Search..." className="w-full bg-zinc-100 rounded-full px-4 py-3 outline-none"/></div>}
        {tab==="activity" && <div className="p-10 text-center">♡ Likes</div>}
      </div>

      {activeStory && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col"><div className="h-1 bg-zinc-800 w-full mt-2"><div className="h-full bg-white" style={{width:`${progress}%`}}></div></div><div className="flex justify-between p-4 text-white"><p className="font-bold">{activeStory.user}</p><button onClick={()=>setActiveStory(null)} className="text-2xl">✕</button></div><div className="flex-1 flex items-center justify-center">{activeStory.image? <img src={activeStory.image} className="max-h-[80vh] object-contain"/> : <p className="text-white text-2xl">{activeStory.user} Story</p>}</div></div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-[80px] flex justify-around items-center px-4">
        <button onClick={()=>setTab("home")} className={`text-[52px] ${tab==="home"?"text-black":"text-zinc-500"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[52px] ${tab==="search"?"text-black":"text-zinc-500"}`}>⌕</button>
        <button onClick={()=>setShow(true)} className="bg-black text-white w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[52px] font-bold">+</button>
        <button onClick={()=>setTab("dm")} className={`text-[52px] ${tab==="dm"?"text-black":"text-zinc-500"}`}>✈️{chats.reduce((a,b)=>a+b.unread,0)>0 && <span className="absolute bg-red-500 text-white text-[32px] rounded-full w-4 h-4 flex items-center justify-center -mt-8 ml-4">{chats.reduce((a,b)=>a+b.unread,0)}</span>}</button>
        <button onClick={()=>setTab("profile")} className={`text-[52px] ${tab==="profile"?"text-black":"text-zinc-500"}`}>◯</button>
      </div>

      {show && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl p-5 w-full max-w-sm"><textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="What's new?" className="w-full border rounded-xl p-3 h-24 outline-none"></textarea><button onClick={()=>{if(txt){setThreads([{id:Date.now(),user:user,text:txt,likes:0,liked:false,time:"now",comments:[],isReel:txt.toLowerCase().includes("reel")},...threads]); setTxt(""); setShow(false)}} } className="bg-black text-white w-full py-3 rounded-xl mt-3 font-bold">Post</button><button onClick={()=>setShow(false)} className="w-full mt-2 text-sm text-zinc-500">Cancel</button></div></div>)}
      {showEdit && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl p-5 w-full max-w-sm"><textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full border rounded-xl p-3 h-20 mt-3 outline-none"></textarea><button onClick={()=>setShowEdit(false)} className="bg-black text-white w-full py-3 rounded-xl mt-3 font-bold">Save</button></div></div>)}
    </div>
  )
              }
