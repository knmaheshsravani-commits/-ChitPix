"use client";
import { useState, useRef } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [showShare, setShowShare] = useState<number | null>(null);
  const [dmOpen, setDmOpen] = useState(false);
  const [activeDm, setActiveDm] = useState<string | null>(null);

  const postRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newComment, setNewComment] = useState("");
  const [dmText, setDmText] = useState("");
  const [copied, setCopied] = useState(false);

  const [reels, setReels] = useState<any[]>([
    { id: 1, user: "aesthetic_vibes", likes: 12400, liked: false, comments: [{user:"travel", text:"Super bro 🔥"}], media: null, color: "from-purple-600 to-pink-600", following: true, desc: "Sunset vibes 🌅 #aesthetic" },
    { id: 2, user: "travel", likes: 8900, liked: false, comments: [], media: null, color: "from-blue-600 to-cyan-400", following: false, desc: "Goa beach life 🏖️" },
    { id: 3, user: "food_lover", likes: 23000, liked: true, comments: [{user:"you", text:"Biryani 😋"}], media: null, color: "from-orange-600 to-red-600", following: false, desc: "Biryani time" },
  ]);

  const [messages, setMessages] = useState<any>({
    aesthetic_vibes: [{from:"them", text:"Hey! ChitPix super undi bro"}],
    travel: [{from:"them", text:"Goa plan cheddama?"}]
  });

  const handlePostUpload = (e:any) => {
    const file = e.target.files[0]; if(!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video");
    setReels([{ id: Date.now(), user: "mahesh_chitpix", likes: 0, liked: false, comments: [], media: url, isVideo, color: "from-zinc-900 to-zinc-800", following: false, desc: "My new post from Gallery ❤️" },...reels]);
    setTab("home");
  };

  const handleProfileUpload = (e:any) => {
    const file = e.target.files[0]; if(!file) return;
    setProfilePic(URL.createObjectURL(file));
  };

  const handleShare = async (id:number) => {
    const link = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: "ChitPix", text: "Check this reel on ChitPix", url: link });
      else { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(()=>setCopied(false),2000); }
    } catch {}
  };

  const handleLogin = () => {
    if (email === "mahesh@gmail.com" && password === "mahesh123") { setIsAdmin(true); setShowLogin(false); alert("Admin login success 👑"); }
    else alert("Email / Password wrong bro! Line 33 lo nee email pettu");
  };

  return (
    <div className="h-[100dvh] w-screen bg-black text-white flex flex-col overflow-hidden">
      {/* HEADER - IKKADA DM + ADMIN FIX CHESA */}
      <div className="h-[56px] shrink-0 flex justify-between items-center px-4 bg-black border-b border-zinc-800">
        <h1 className="font-black text-[22px] tracking-tight">ChitPix</h1>
        <div className="flex gap-2 items-center">
          <button onClick={()=>postRef.current?.click()} className="w-8 h-8 bg-white text-black rounded-full font-bold text-xl flex items-center justify-center">+</button>
          <button onClick={()=>setDmOpen(true)} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">✈️</button>
          <button onClick={()=> isAdmin? setIsAdmin(false) : setShowLogin(true)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${isAdmin?"bg-yellow-400 text-black":"bg-white text-black"}`}>{isAdmin?"👑 Admin":"Login"}</button>
        </div>
      </div>

      <input ref={postRef} type="file" accept="image/*,video/*" hidden onChange={handlePostUpload} />
      <input ref={profileRef} type="file" accept="image/*" hidden onChange={handleProfileUpload} />

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-sm p-6 rounded-2xl">
            <h2 className="font-bold mb-4">Admin Login</h2>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (mahesh@gmail.com)" className="w-full p-3 mb-3 bg-black border border-zinc-700 rounded-xl text-sm" />
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password (mahesh123)" className="w-full p-3 mb-3 bg-black border border-zinc-700 rounded-xl text-sm" />
            <button onClick={handleLogin} className="w-full bg-white text-black py-3 rounded-xl font-bold">Login</button>
            <button onClick={()=>setShowLogin(false)} className="w-full mt-3 text-gray-400 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* DM - WORKING */}
      {dmOpen && (
        <div className="fixed inset-0 z-[90] bg-black flex flex-col">
          <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-800"><button onClick={()=> activeDm? setActiveDm(null) : setDmOpen(false)}>←</button><b>{activeDm? "@"+activeDm : "Messages • DM"}</b></div>
          {!activeDm? (
            <div className="flex-1 overflow-y-scroll">{Object.keys(messages).map(u=><div key={u} onClick={()=>setActiveDm(u)} className="flex gap-3 p-4 border-b border-zinc-900"><div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 flex items-center justify-center font-bold">{u[0].toUpperCase()}</div><div><p className="font-bold text-sm">@{u}</p><p className="text-xs text-gray-400">{messages[u].slice(-1)[0]?.text}</p></div></div>)}</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-scroll p-4 space-y-2">{messages[activeDm]?.map((m:any,i:number)=><div key={i} className={`max-w-[75%] p-3 rounded-2xl text-sm ${m.from==="me"?"bg-blue-600 ml-auto rounded-br-none":"bg-zinc-800 rounded-bl-none"}`}>{m.text}</div>)}</div>
              <div className="p-3 flex gap-2 border-t border-zinc-800"><input value={dmText} onChange={e=>setDmText(e.target.value)} placeholder="Message..." className="flex-1 bg-zinc-900 p-3 rounded-full text-sm" /><button onClick={()=>{if(!dmText) return; setMessages({...messages, [activeDm]: [...messages[activeDm], {from:"me", text:dmText}]}); setDmText("")}} className="bg-white text-black px-5 rounded-full font-bold text-sm">Send</button></div>
            </>
          )}
        </div>
      )}

      {/* COMMENTS - REELS + HOME RENDITLO WORKING */}
      {showComments!==null && (
        <div className="fixed inset-0 z-[80] bg-black flex flex-col">
          <div className="h-14 flex justify-between items-center px-4 border-b border-zinc-800"><b>Comments ({reels.find(r=>r.id===showComments)?.comments.length})</b><button onClick={()=>setShowComments(null)} className="w-8 h-8 bg-zinc-800 rounded-full">✕</button></div>
          <div className="flex-1 overflow-y-scroll p-4 space-y-3">{reels.find(r=>r.id===showComments)?.comments.map((c:any,i:number)=><div key={i} className="flex gap-2"><div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">{c.user[0]}</div><div><span className="font-bold text-sm mr-2">@{c.user}</span><span className="text-sm">{c.text}</span></div></div>)}</div>
          <div className="p-3 flex gap-2 border-t border-zinc-800"><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-zinc-900 p-3 rounded-full text-sm" /><button onClick={()=>{if(!newComment) return; setReels(reels.map(r=>r.id===showComments? {...r, comments:[...r.comments,{user:"you", text:newComment}]}:r)); setNewComment("")}} className="bg-white text-black px-5 rounded-full font-bold text-sm">Post</button></div>
        </div>
      )}

      {/* SHARE - WORKING */}
      {showShare!==null && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-end"><div className="bg-zinc-900 w-full rounded-t-3xl p-6"><h3 className="font-bold">Share</h3><p className="text-xs text-gray-400 mb-4">Share this reel with friends</p><div className="grid grid-cols-2 gap-3"><button onClick={()=>handleShare(showShare!)} className="bg-white text-black py-3 rounded-xl font-bold text-sm">{copied?"✅ Copied!":"🔗 Copy Link"}</button><button onClick={()=>{window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`); setShowShare(null)}} className="bg-green-600 py-3 rounded-xl font-bold text-sm">WhatsApp Share</button></div><button onClick={()=>setShowShare(null)} className="w-full mt-4 bg-zinc-800 py-3 rounded-full">Close</button></div></div>
      )}

      {/* HOME FEED */}
      {tab==="home" && (
        <div className="flex-1 overflow-y-scroll">
          <div className="flex gap-3 p-3 overflow-x-auto border-b border-zinc-900">
            <div onClick={()=>profileRef.current?.click()} className="flex flex-col items-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border-2 border-white">{profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <span>＋</span>}</div><span className="text-[10px] mt-1">Your Story</span></div>
            {reels.map(r=><div key={r.id} className="flex flex-col items-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs">{r.user[0].toUpperCase()}</div></div><span className="text-[10px] mt-1">{r.user.slice(0,8)}</span></div>)}
          </div>
          {reels.map(r=>(
            <div key={r.id} className="border-b border-zinc-900">
              <div className="flex justify-between items-center p-3"><div className="flex gap-2 items-center"><div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">{r.user[0]}</div><span className="font-bold text-sm">@{r.user}</span></div><div className="flex gap-2"><button onClick={()=>setReels(reels.map(x=>x.id===r.id?{...x, following:!x.following}:x))} className={`text-xs px-3 py-1 rounded-full font-bold ${r.following?"bg-zinc-800":"bg-white text-black"}`}>{r.following?"Following":"Follow"}</button>{isAdmin && <button onClick={()=>setReels(reels.filter(x=>x.id!==r.id))} className="text-xs bg-red-600 px-2 py-1 rounded-full">Delete</button>}</div></div>
              <div className="w-full h-[380px] bg-zinc-900 overflow-hidden flex items-center justify-center">{r.media? (r.isVideo? <video src={r.media} controls className="w-full h-full object-cover" /> : <img src={r.media} className="w-full h-full object-cover" />) : <div className={`w-full h-full bg-gradient-to-br ${r.color} flex items-center justify-center font-black text-2xl opacity-30`}>ChitPix</div>}</div>
              <div className="flex gap-5 p-3 text-sm"><button onClick={()=>setReels(reels.map(x=>x.id===r.id?{...x, liked:!x.liked, likes: x.liked? x.likes-1 : x.likes+1}:x))} className="font-bold">{r.liked?"❤️":"🤍"} {r.likes.toLocaleString()}</button><button onClick={()=>setShowComments(r.id)}>💬 {r.comments.length}</button><button onClick={()=>setShowShare(r.id)}>↗️ Share</button></div>
              <div className="px-3 pb-3 text-sm"><span className="font-bold">@{r.user}</span> {r.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* REELS - TIKTOK STYLE + COMMENT + SHARE WORKING */}
      {tab==="reels" && (
        <div className="flex-1 overflow-y-scroll snap-y snap-mandatory bg-black">
          {reels.map(r=>(
            <div key={r.id} className="h-full w-full snap-start relative flex items-center justify-center bg-black">
              {r.media? (r.isVideo? <video src={r.media} autoPlay loop muted playsInline className="w-full h-full object-cover" /> : <img src={r.media} className="w-full h-full object-cover" />) : <div className={`w-full h-full bg-gradient-to-br ${r.color} flex items-center justify-center`}><span className="text-5xl font-black opacity-20">ChitPix</span></div>}
              <div className="absolute bottom-20 left-0 right-0 p-4 flex justify-between items-end">
                <div className="flex-1 mr-4"><p className="font-bold text-sm">@{r.user} • {r.likes} likes</p><p className="text-sm mt-1">{r.desc}</p><div className="flex gap-2 mt-2"><button onClick={()=>setReels(reels.map(x=>x.id===r.id?{...x, following:!x.following}:x))} className="text-xs border border-white px-3 py-1 rounded-full">{r.following?"Following ✓":"Follow +"}</button>{isAdmin && <button onClick={()=>setReels(reels.filter(x=>x.id!==r.id))} className="text-xs bg-red-600 px-3 py-1 rounded-full">Delete</button>}</div></div>
                <div className="flex flex-col gap-4 items-center">
                  <button onClick={()=>setReels(reels.map(x=>x.id===r.id?{...x, liked:!x.liked, likes: x.liked? x.likes-1 : x.likes+1}:x))} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl">{r.liked?"❤️":"🤍"}</div><span className="text-[11px] mt-1">{r.likes}</span></button>
                  <button onClick={()=>setShowComments(r.id)} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">💬</div><span className="text-[11px] mt-1">{r.comments.length}</span></button>
                  <button onClick={()=>setShowShare(r.id)} className="flex flex-col items-center"><div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">↗️</div><span className="text-[11px] mt-1">Share</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE - PHOTO UPLOAD WORKING */}
      {tab==="profile" && (
        <div className="flex-1 overflow-y-scroll p-4">
          <div className="flex gap-4 items-center">
            <div onClick={()=>profileRef.current?.click()} className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden border-2 border-white flex items-center justify-center relative shrink-0">
              {profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
              <div className="absolute bottom-0 bg-black/70 w-full text-center text-[9px] py-0.5">EDIT</div>
            </div>
            <div className="flex gap-6 flex-1 justify-around text-center"><div><p className="font-bold">{reels.length}</p><p className="text-xs text-gray-400">Posts</p></div><div><p className="font-bold">1.2K</p><p className="text-xs text-gray-400">Followers</p></div><div><p className="font-bold">340</p><p className="text-xs text-gray-400">Following</p></div></div>
          </div>
          <h2 className="font-bold mt-4">mahesh_chitpix</h2><p className="text-sm text-gray-400">📸 ChitPix Creator • Bangalore</p>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>profileRef.current?.click()} className="flex-1 bg-zinc-800 py-2 rounded-lg text-sm font-bold">Edit Profile Photo</button>
            <button onClick={()=>postRef.current?.click()} className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-bold">+ New Post</button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Profile photo meedha click cheste gallery open avutadi bro!</p>
          <div className="grid grid-cols-3 gap-1 mt-6">{reels.map(r=><div key={r.id} className="h-28 bg-zinc-900 rounded overflow-hidden">{r.media? <img src={r.media} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${r.color}`}></div>}</div>)}</div>
        </div>
      )}

      {tab==="search" && <div className="flex-1 p-3"><div className="grid grid-cols-3 gap-1">{reels.map(r=><div key={r.id} className="h-32 bg-zinc-900 rounded overflow-hidden">{r.media? <img src={r.media} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${r.color}`}></div>}</div>)}</div></div>}
      {tab==="likes" && <div className="flex-1 p-4"><h2 className="font-bold">Liked ({reels.filter(r=>r.liked).length})</h2>{reels.filter(r=>r.liked).map(r=><div key={r.id} className="mt-3 bg-zinc-900 p-3 rounded-xl">❤️ @{r.user} - {r.likes} likes</div>)}</div>}

      {/* BOTTOM NAV - INSTAGRAM STYLE */}
      <div className="h-[56px] shrink-0 flex justify-around items-center bg-black border-t border-zinc-800">
        <button onClick={()=>setTab("home")} className={`text-xl ${tab==="home"?"":"opacity-50"}`}>🏠</button>
        <button onClick={()=>setTab("search")} className={`text-xl ${tab==="search"?"":"opacity-50"}`}>🔍</button>
        <button onClick={()=>setTab("reels")} className={`text-xl ${tab==="reels"?"":"opacity-50"}`}>🎬</button>
        <button onClick={()=>setTab("likes")} className={`text-xl ${tab==="likes"?"":"opacity-50"}`}>❤️</button>
        <button onClick={()=>setTab("profile")} className={`w-7 h-7 rounded-full overflow-hidden border ${tab==="profile"?"border-white":"border-zinc-700 opacity-60"}`}>{profilePic? <img src={profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs">M</div>}</button>
      </div>
    </div>
  );
      }
