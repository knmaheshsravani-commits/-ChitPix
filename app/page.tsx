"use client";
import { useState, useRef } from "react";

type Comment = { id:number; user:string; text:string };
type Thread = { id:number; user:string; text:string; likes:number; liked:boolean; time:string; comments:Comment[]; isReel?:boolean };
type Story = { id:number; user:string; seen:boolean; image?:string };

export default function Page(){
  const [isLogin,setIsLogin]=useState(false);
  const [user,setUser]=useState("");
  const [tab,setTab]=useState("home");
  const [profileTab,setProfileTab]=useState("threads");
  const [searchQ,setSearchQ]=useState("");
  const [activeComment,setActiveComment]=useState<number|null>(null);
  const [commentTxt,setCommentTxt]=useState("");
  const [avatar,setAvatar]=useState<string|null>(null);
  const [stories,setStories]=useState<Story[]>([
    {id:1,user:"Your Story",seen:false,image:undefined},
    {id:2,user:"knmahesh",seen:false},
    {id:3,user:"friend1",seen:false},
    {id:4,user:"friend2",seen:true},
    {id:5,user:"dev_bro",seen:false},
  ]);
  const [activeStory,setActiveStory]=useState<Story|null>(null);
  const [progress,setProgress]=useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  const [threads,setThreads]=useState<Thread[]>([
    {id:1,user:"knmahesh30",text:"Hi brother good morning ☀️ Welcome!",likes:12,liked:false,time:"2h",comments:[{id:1,user:"friend1",text:"Super bro!"}]},
    {id:2,user:"knmahesh30",text:"Hello 🤗 Reels + Stories add chesa!",likes:5,liked:true,time:"5h",comments:[],isReel:true},
  ]);
  const [show,setShow]=useState(false);
  const [txt,setTxt]=useState("");
  const [bio,setBio]=useState("Developer | Threads Clone Builder 🚀");
  const [showEdit,setShowEdit]=useState(false);

  const onPhotoPick = (e:any)=>{ const file=e.target.files?.[0]; if(file){ setAvatar(URL.createObjectURL(file)); setStories(s=>s.map(st=>st.id===1?{...st,image:URL.createObjectURL(file)}:st)) } }
  const onStoryPick = (e:any)=>{
    const file=e.target.files?.[0];
    if(file){
      const url=URL.createObjectURL(file);
      const newStory:Story={id:Date.now(),user:user||"You",seen:false,image:url};
      setStories([newStory,...stories]);
      setActiveStory(newStory);
    }
  }

  const openStory = (st:Story)=>{
    setActiveStory(st);
    setStories(stories.map(s=>s.id===st.id?{...s,seen:true}:s));
    setProgress(0);
    let p=0;
    const inter=setInterval(()=>{ p+=2; setProgress(p); if(p>=100){ clearInterval(inter); setActiveStory(null);} },60);
  }

  const like = (id:number)=> setThreads(threads.map(t=> t.id===id? {...t, liked:!t.liked, likes: t.liked? t.likes-1 : t.likes+1} : t));
  const addComment = (id:number)=>{ if(!commentTxt) return; setThreads(threads.map(t=> t.id===id? {...t, comments:[...t.comments,{id:Date.now(),user:user,text:commentTxt}]}:t)); setCommentTxt(""); setActiveComment(null); }
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

  return(
    <div className="min-h-screen bg-white text-black pb-[90px]">
      <div className="h-[60px] border-b flex items-center justify-between px-4 sticky top-0 z-20 bg-white">
        <p className="font-bold text-[18px]">Welcome {user} 🔥</p>
        <button onClick={()=>setIsLogin(false)} className="text-xs border px-3 py-1 rounded-full">Logout</button>
      </div>

      <div className="max-w-[600px] mx-auto">
        {tab==="home" && (
          <div>
            {/* STORIES BAR - INSTA STYLE */}
            <div className="border-b border-zinc-100 py-3 px-2 flex gap-4 overflow-x-auto scrollbar-none">
              {stories.map(s=>(
                <div key={s.id} className="flex flex-col items-center min-w-[60px]">
                  <button onClick={()=> s.id===1? storyFileRef.current?.click() : openStory(s)} className={`w-[60px] h-[60px] rounded-full p-[3px] ${s.seen? "bg-zinc-300" : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"}`}>
                    <div className="w-full h-full bg-white rounded-full p-[2px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        {s.image? <img src={s.image} className="w-full h-full object-cover"/> : <span className="text-white font-bold">{s.user[0].toUpperCase()}</span>}
                      </div>
                    </div>
                    {s.id===1 && <div className="relative -top-3 left-9 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] border-2 border-white">+</div>}
                  </button>
                  <p className="text-[11px] mt-1 truncate w-[60px] text-center">{s.user}</p>
                </div>
              ))}
            </div>

            {threads.map(t=>(
              <div key={t.id} className="border-b py-4 px-4 flex gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-black flex items-center justify-center">{avatar && t.user===user? <img src={avatar} className="w-full h-full object-cover"/> : <span className="text-white font-bold text-sm">{t.user[0].toUpperCase()}</span>}</div>
                <div className="flex-1">
                  <p className="font-bold text-[15px]">{t.user}</p>
                  <p className="text-[15px]">{t.text}</p>
                  {t.isReel && <div className="mt-3 w-full h-[280px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-5xl">▶️ Reel</div>}
                  <div className="flex gap-4 mt-3 text-[14px]">
                    <button onClick={()=>like(t.id)} className={`${t.liked? "text-red-500":""}`}>{t.liked? "♥":"♡"} {t.likes}</button>
                    <button onClick={()=>setActiveComment(activeComment===t.id?null:t.id)}>💬 {t.comments.length}</button>
                    <button onClick={()=>share(t.text)}>↗ Share</button>
                  </div>
                  {activeComment===t.id && (
                    <div className="mt-2">{t.comments.map(c=><div key={c.id} className="text-[13px]"><b>{c.user}:</b> {c.text}</div>)}<div className="flex gap-2 mt-2"><input value={commentTxt} onChange={e=>setCommentTxt(e.target.value)} placeholder="Add comment" className="flex-1 border rounded-full px-3 py-1 text-[13px] outline-none"/><button onClick={()=>addComment(t.id)} className="text-[13px] font-bold">Post</button></div></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="profile" && (
          <div className="p-4">
            <div className="flex justify-between"><div><h1 className="text-[22px] font-bold">{user}</h1><p className="text-[14px] text-zinc-500">{user.toLowerCase()}@threads</p><p className="text-[14px] mt-2">{bio}</p></div>
              <button onClick={()=>fileRef.current?.click()} className="w-[64px] h-[64px] rounded-full overflow-hidden bg-black">{avatar? <img src={avatar} className="w-full h-full object-cover"/> : <span className="text-white font-bold text-xl flex h-full items-center justify-center">{user[0]?.toUpperCase()}</span>}</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhotoPick}/>
            <input ref={storyFileRef} type="file" accept="image/*" hidden onChange={onStoryPick}/>
            <button onClick={()=>setShowEdit(true)} className="w-full border rounded-xl py-2 mt-4 font-semibold text-[14px]">Edit profile</button>
            <button onClick={()=>storyFileRef.current?.click()} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-2 mt-2 font-semibold text-[14px]">+ Add Story ✨</button>
            <div className="flex border-b mt-5"><button onClick={()=>setProfileTab("threads")} className={`flex-1 py-2 font-bold text-[14px] border-b ${profileTab==="threads"?"border-black":"text-zinc-400 border-transparent"}`}>Threads</button><button onClick={()=>setProfileTab("reels")} className={`flex-1 py-2 font-bold text-[14px] border-b ${profileTab==="reels"?"border-black":"text-zinc-400 border-transparent"}`}>Reels</button><button onClick={()=>setProfileTab("stories")} className={`flex-1 py-2 font-bold text-[14px] border-b ${profileTab==="stories"?"border-black":"text-zinc-400 border-transparent"}`}>Stories</button></div>
            {profileTab==="stories" && <div className="grid grid-cols-3 gap-1 mt-2">{stories.map(s=> s.image && <div key={s.id} className="h-[150px] rounded-lg overflow-hidden"><img src={s.image} className="w-full h-full object-cover"/></div>)}</div>}
          </div>
        )}

        {tab==="search" && <div className="p-4"><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Search..." className="w-full border bg-zinc-50 rounded-full px-4 py-3 outline-none"/><div className="grid grid-cols-3 gap-1 mt-4">{[1,2,3,4,5,6].map(i=><div key={i} className="h-[120px] bg-gradient-to-br from-purple-600 to-pink-400 rounded flex items-center justify-center text-white">Reel {i}</div>)}</div></div>}
        {tab==="activity" && <div className="p-10 text-center"><p className="text-5xl">♡</p><p className="mt-2 font-bold">Likes Activity</p></div>}
      </div>

      {/* STORY VIEWER - FULL SCREEN INSTA STYLE */}
      {activeStory && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="h-1 bg-zinc-800 w-full mt-2"><div className="h-full bg-white" style={{width:`${progress}%`}}></div></div>
          <div className="flex justify-between items-center p-4 text-white">
            <div className="flex gap-2 items-center"><div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">{activeStory.user[0]}</div><p className="font-bold text-sm">{activeStory.user}</p></div>
            <button onClick={()=>setActiveStory(null)} className="text-2xl">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {activeStory.image? <img src={activeStory.image} className="max-h-[80vh] w-full object-contain"/> : <div className="text-white text-3xl">Story by {activeStory.user}</div>}
          </div>
          <div className="p-4"><input placeholder="Reply to story..." className="w-full bg-zinc-800 text-white rounded-full px-4 py-3 text-sm outline-none"/></div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-[80px] flex justify-around items-center px-4">
        <button onClick={()=>setTab("home")} className={`text-[52px] ${tab==="home"?"text-black":"text-zinc-400"}`}>⌂</button>
        <button onClick={()=>setTab("search")} className={`text-[52px] ${tab==="search"?"text-black":"text-zinc-400"}`}>⌕</button>
        <button onClick={()=>setShow(true)} className="bg-black text-white w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[52px] font-bold">+</button>
        <button onClick={()=>setTab("activity")} className={`text-[52px] ${tab==="activity"?"text-black":"text-zinc-400"}`}>♡</button>
        <button onClick={()=>setTab("profile")} className={`text-[52px] ${tab==="profile"?"text-black":"text-zinc-400"}`}>◯</button>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="What's new?" className="w-full border rounded-xl p-3 h-24 outline-none"></textarea>
            <button onClick={()=>{if(txt){setThreads([{id:Date.now(),user:user,text:txt,likes:0,liked:false,time:"now",comments:[],isReel:txt.toLowerCase().includes("reel")},...threads]); setTxt(""); setShow(false)}} } className="bg-black text-white w-full py-3 rounded-xl mt-3 font-bold">Post</button>
            <button onClick={()=>setShow(false)} className="w-full mt-2 text-sm text-zinc-500">Cancel</button>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <p className="font-bold">Edit Profile</p>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full border rounded-xl p-3 h-20 mt-3 outline-none"></textarea>
            <button onClick={()=>setShowEdit(false)} className="bg-black text-white w-full py-3 rounded-xl mt-3 font-bold">Save</button>
          </div>
        </div>
      )}
    </div>
  )
            }
