"use client";
import { useState, useRef } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [dmOpen, setDmOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showComments, setShowComments] = useState<number|null>(null);
  const [newComment, setNewComment] = useState("");

  const [reels, setReels] = useState<any[]>([
    { id: 1, user: "aesthetic_vibes", likes: 12400, liked: false, comments: [{user:"travel", text:"Nice!"}], media: null, color: "from-purple-600 to-pink-600", following: true, desc: "Sunset vibes 🌅 #aesthetic" },
    { id: 2, user: "travel", likes: 8900, liked: false, comments: [], media: null, color: "from-blue-600 to-cyan-400", following: false, desc: "Goa beach 🏖️" },
  ]);

  const [dms, setDms] = useState([{user:"aesthetic_vibes", last:"Hey bro!"}]);
  const [dmText, setDmText] = useState("");
  const [activeDm, setActiveDm] = useState<string|null>(null);
  const [messages, setMessages] = useState<any>({ aesthetic_vibes: [{from:"them", text:"Hey bro!"}] });

  const handleUpload = (e:any) => {
    const file = e.target.files[0]; if(!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video");
    setReels([{ id: Date.now(), user: "mahesh_chitpix", likes: 0, liked: false, comments: [], media: url, isVideo, color: "from-zinc-800 to-zinc-900", following: false, desc: "New post from gallery 🔥" },...reels]);
  };

  const handleLogin = () => {
    // IKKADA NEE EMAIL PETTU BRO - Line 27
    if (email === "knmaheshsravani@gmail.com" && password === "Mahesh@9848#") {
      setIsAdmin(true); setShowLogin(false); alert("Admin Login Success 👑");
    } else alert("Wrong email/password");
  };

  return (
    <div className="h-[100dvh] w-screen bg-black text-white flex flex-col overflow-hidden">
      {/* TOP HEADER - FIXED */}
      <div className="h-14 flex justify-between items-center px-4 bg-black border-b border-zinc-900 shrink-0 z-30">
        <h1 className="font-black text-xl tracking-wide">ChitPix</h1>
        <div className="flex gap-2 items-center">
          <button onClick={()=>fileRef.current?.click()} className="bg-white text-black w-8 h-8 rounded-full font-bold flex items-center justify-center">+</button>
          <button onClick={()=>setDmOpen(true)} className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">💬</button>
          <button onClick={()=> isAdmin? setIsAdmin(false) : setShowLogin(true)} className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold">
            {isAdmin? "👑 Admin" : "Login"}
          </button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleUpload} />

      {showLogin && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm">
            <h2 className="font-bold mb-4">Admin Login</h2>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Nee email pettu" className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl text-sm" />
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 mb-3 bg-black border border-zinc-800 rounded-xl text-sm" />
            <button onClick={handleLogin} className="w-full bg-white text-black py-3 rounded-xl font-bold">Login</button>
            <button onClick={()=>setShowLogin(false)} className="w-full mt-3 text-gray-400 text-sm">Cancel</button>
            <p className="text-[10px] text-gray-500 mt-3">Line 27 lo mahesh@gmail.com ni nee email tho marchu bro</p>
          </div>
        </div>
      )}

      {/* DM PAGE */}
      {dmOpen && (
        <div className="fixed inset-0 bg-black z-[90] flex flex-col">
          <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-900">
            <button onClick={()=>{setDmOpen(false); setActiveDm(null)}}>←</button>
            <b>{activeDm? "@"+activeDm : "Messages"}</b>
          </div>
          {!activeDm? (
            <div className="flex-1 overflow-y-scroll">{dms.map(d=><div key={d.user} onClick={()=>setActiveDm(d.user)} className="flex gap-3 p-4 border-b border-zinc-900"><div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">{d.user[0]}</div><div><p className="font-bold text-sm">@{d.user}</p><p className="text-xs text-gray-400">{d.last}</p></div></div>)}</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-scroll p-4 space-y-2">{(messages[activeDm]||[]).map((m:any,i:number)=><div key={i} className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.from==="me"?"bg-blue-600 ml-auto":"bg-zinc-800"}`}>{m.text}</div>)}</div>
              <div className="p-3 flex gap-2 border-t border-zinc-900"><input value={dmText} onChange={e=>setDmText(e.target.value)} placeholder="Message..." className="flex-1 bg-zinc-900 p-3 rounded-full text-sm" /><button onClick={()=>{if(!dmText) return; setMessages({...messages, [activeDm]: [...(messages[activeDm]||[]), {from:"me", text:dmText}]}); setDmText("")}} className="bg-white text-black px-4 rounded-full font-bold text-sm">Send</button></div>
            </>
          )}
        </div>
      )}

      {/* HOME */}
      {tab==="home" && (
        <div className="flex-1 overflow-y-scroll">
          <div className="flex gap-3 p-3 overflow-x-scroll border-b border-zinc-900">
            {["Your Story","aesthetic","travel","food_lover"].map(s=><div key={s} className="flex flex-col items-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs">{s[0].toUpperCase()}</div></div><span className="text-[10px] mt-1">{s}</span></div>)}
          </div>
          {reels.map(r=>(
            <div key={r.id} className="border-b border-zinc-900">
              <div className="flex justify-between items-center p-3"><span className="font-bold text-sm">@{r.user}</span><div className="flex gap-2"><button className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">{r.following?"Following":"Follow"}</button>{isAdmin && <button onClick={()=>setReels(reels.filter(x=>x.id!==r.id))} className="text-xs bg-red-600 px-2 py-1 rounded-full">Delete</button>}</div></div>
              <div className="w-full h-[400px] bg-zinc-900 flex items-center justify-center overflow-hidden">{r.media? (r.isVideo? <video src={r.media} controls className="w-full h-full object-cover" /> : <img src={r.media} className="w-full h-full object-cover" />) : <div className={`w-full h-full bg-gradient-to-br ${r.color} flex items-center justify-center font-black opacity-30`}>ChitPix</div>}</div>
              <div className="flex gap-4 p-3 text-sm"><button onClick={()=>setReels(reels.map(x=>x.id===r.id?{...x, liked:!x.liked, likes: x.liked? x.likes-1 : x.likes+1}:x))}>{r.liked?"❤️":"🤍"} {r.likes}</button><button onClick={()=>setShowComments(r.id)}>💬 {r.comments.length}</button></div>
              <div className="px-3 pb-3 text-sm"><b>@{r.user}</b> {r.desc}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="search" && <div className="flex-1 p-4"><input placeholder="Search..." className="w-full bg-zinc-900 p-3 rounded-full mb-4" /><div className="grid grid-cols-3 gap-1">{reels.map(r=><div key={r.id} className="h-32 bg-zinc-900 rounded overflow-hidden">{r.media && <img src={r.media} className="w-full h-full object-cover" />}</div>)}</div></div>}
      {tab==="reels" && <div className="flex-1 overflow-y-scroll snap-y snap-mandatory">{reels.map(r=><div key={r.id} className="h-full snap-start bg-black flex items-center justify-center">{r.media? <img src={r.media} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${r.color} flex items-center justify-center`}><span className="text-4xl font-black opacity-20">ChitPix</span></div>}</div>)}</div>}
      {tab==="profile" && <div className="flex-1 p-4"><p className="font-bold">mahesh_chitpix</p><p className="text-sm text-gray-400">{reels.length} posts • Followers 1.2K</p><button onClick={()=>fileRef.current?.click()} className="w-full mt-4 bg-white text-black py-2 rounded-lg font-bold">+ Upload from Gallery</button></div>}

      {showComments!==null && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col"><div className="flex justify-between p-4 border-b border-zinc-800"><b>Comments</b><button onClick={()=>setShowComments(null)}>✕</button></div><div className="flex-1 p-4 space-y-2">{reels.find(r=>r.id===showComments)?.comments.map((c:any,i:number)=><div key={i} className="text-sm"><b>@{c.user}</b> {c.text}</div>)}</div><div className="p-3 flex gap-2"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add comment..." className="flex-1 bg-zinc-900 p-3 rounded-full text-sm" /><button onClick={()=>{if(newComment){setReels(reels.map(r=>r.id===showComments?{...r, comments:[...r.comments,{user:"you", text:newComment}]}:r)); setNewComment("")}}} className="text-blue-500 font-bold">Post</button></div></div>
      )}

      <div className="h-14 flex justify-around items-center bg-black border-t border-zinc-900 shrink-0">
        <button onClick={()=>setTab("home")} className={tab==="home"?"text-white":"opacity-50"}>🏠</button>
        <button onClick={()=>setTab("search")} className={tab==="search"?"text-white":"opacity-50"}>🔍</button>
        <button onClick={()=>setTab("reels")} className={tab==="reels"?"text-white":"opacity-50"}>🎬</button>
        <button onClick={()=>setTab("profile")} className={tab==="profile"?"text-white":"opacity-50"}>👤</button>
      </div>
    </div>
  );
                                                                                                                        }
