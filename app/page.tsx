"use client";
import { useState, useRef } from "react";

export default function Page() {
  const [tab, setTab] = useState("home");
  const [searchText, setSearchText] = useState("");
  const [profilePic, setProfilePic] = useState<string|null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showComments, setShowComments] = useState<number|null>(null);
  const [showShare, setShowShare] = useState<number|null>(null);
  const [newComment, setNewComment] = useState("");
  const [copied, setCopied] = useState(false);

  const postRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [reels, setReels] = useState<any[]>([
    { id: 1, user: "travel", likes: 8900, liked: false, comments: [], media: null, color: "from-blue-600 to-cyan-400", following: false, desc: "Goa beach life 🏖️" },
    { id: 2, user: "food_lover", likes: 12400, liked: false, comments: [], media: null, color: "from-orange-600 to-red-600", following: false, desc: "Biryani time 😋" },
    { id: 3, user: "aesthetic_vibes", likes: 23000, liked: false, comments: [], media: null, color: "from-purple-600 to-pink-600", following: true, desc: "Sunset vibes 🌅" },
  ]);

  const filtered = reels.filter(r => r.user.toLowerCase().includes(searchText.toLowerCase()) || r.desc.toLowerCase().includes(searchText.toLowerCase()));

  const handlePost = (e:any) => {
    const file = e.target.files[0]; if(!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video");
    setReels([{ id: Date.now(), user: "mahesh", likes: 0, liked: false, comments: [], media: url, isVideo, color: "from-zinc-800 to-black", following: false, desc: "New post 🔥" },...reels]);
    setTab("home");
  };
  const handleProfile = (e:any) => {
    const file = e.target.files[0]; if(!file) return;
    setProfilePic(URL.createObjectURL(file));
  };

  const doShare = async (type: string) => {
    const url = window.location.href;
    const text = `Check this on ChitPix: ${url}`;
    if(type==="copy"){ await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000); }
    if(type==="whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    if(type==="telegram") window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    if(type==="native" && navigator.share){ try{ await navigator.share({title:"ChitPix", text, url}); }catch{} }
  };

  return (
    <div className="h-[100dvh] w-screen bg-black text-white flex flex-col">
      {/* HEADER - FIXED ALWAYS VISIBLE */}
      <div className="h-[60px] shrink-0 flex items-center justify-between px-4 bg-black border-b border-zinc-800 z-20">
        <h1 className="font-black text-xl">ChitPix</h1>
        <div className="flex gap-2">
          <button onClick={()=>postRef.current?.click()} className="w-8 h-8 bg-white text-black rounded-full font-bold">+</button>
          <button onClick={()=>setShowLogin(true)} className="bg-zinc-800 px-3 py-1 rounded-full text-xs">{isAdmin?"👑 Admin":"Login"}</button>
        </div>
      </div>

      <input ref={postRef} type="file" accept="image/*,video/*" hidden onChange={handlePost} />
      <input ref={profileRef} type="file" accept="image/*" hidden onChange={handleProfile} />

      {/* SEARCH TAB - SEARCH BAR FIXED TOP */}
      {tab==="search" && (
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          <div className="p-3 shrink-0">
            <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="🔍 Search users, reels..." className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-full text-sm outline-none focus:border-white" autoFocus />
          </div>
          <div className="flex-1 overflow-y-scroll p-3">
            <div className="grid grid-cols-3 gap-1">
              {filtered.map(r=>(
                <div key={r.id} className={`h-36 rounded-lg overflow-hidden bg-gradient-to-br ${r.color} flex flex-col justify-end p-2`}>
                  <span className="text-xs font-bold">@{r.user}</span>
                </div>
              ))}
            </div>
            {filtered.length===0 && <p className="text-center text-gray-500 mt-10 text-sm">No results for "{searchText}"</p>}
          </div>
        </div>
      )}

      {tab==="home" && (
        <div className="flex-1 overflow-y-scroll">
          {reels.map(r=>(
            <div key={r.id} className="border-b border-zinc-900">
              <div className="flex justify-between p-3"><span className="font-bold text-sm">@{r.user}</span><button onClick={()=>setReels(reels.map(x=>x.id===r.id?{...x, following:!x.following}:x))} className={`text-xs px-3 py-1 rounded-full font-bold ${r.following?"bg-zinc-800":"bg-white text-black"}`}>{r.following?"Following":"Follow"}</button></div>
              <div className="w-full h-[350px] bg-zinc-900 flex items-center justify-center overflow-hidden">{r.media? <img src={r.media} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${r.color}`}></div>}</div>
              <div className="flex gap-4 p-
