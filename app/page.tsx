"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [tab, setTab] = useState("home");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<any[]>([
    { id: 1, image_url: "https://picsum.photos/seed/1/600/800", caption: "First post beo!", likes: 12, liked: false, comments: [{user:"mahesh", text:"keka bro!"}] }
  ]);
  const [profilePic, setProfilePic] = useState("");
  const [bio, setBio] = useState("ChitPix beo ❤️");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [commentInputs, setCommentInputs] = useState<{[key:number]:string}>({});
  const [showComments, setShowComments] = useState<{[key:number]:boolean}>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email ||!password) { alert("Email & Password pettu!"); return; }
    setLoading(true);
    try {
      if (isSignup) { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; alert("Signup done! Login chey"); setIsSignup(false); }
      else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const addPost = () => {
    if (!url) { alert("URL pettu!"); return; }
    setPosts([{ id: Date.now(), image_url: url, caption: text, likes: 0, liked: false, comments: [] },...posts]);
    setText(""); setUrl("");
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try { const n = `${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if (error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setUrl(data.publicUrl); } catch { alert("Upload fail"); } finally { setUploading(false); }
  };

  const handleProfileUpload = async (file: File) => {
    setUploading(true);
    try { const n = `profile-${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if (error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setProfilePic(data.publicUrl); } catch { alert("Profile upload fail"); } finally { setUploading(false); }
  };

  const toggleLike = (id: number) => setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes - 1 : p.likes + 1 } : p));

  const addComment = (postId: number) => {
    const txt = commentInputs[postId];
    if(!txt ||!txt.trim()) return;
    setPosts(posts.map(p => p.id === postId? {...p, comments: [...(p.comments||[]), {user: myName, text: txt}] } : p));
    setCommentInputs({...commentInputs, [postId]: ""});
  };

  const filtered = posts.filter(p => p.caption.toLowerCase().includes(search.toLowerCase()));

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-[600px]">
          <div className="text-center mb-8"><h1 className="text-[48px] font-black">ChitPix</h1><p className="text-zinc-500 text-[32px] mt-2">Photos • Reels • Vibes beo ❤️</p></div>
          <div className="w-full bg-[#121212] rounded-[32px] p-8 border border-zinc-800">
            <h2 className="text-[32px] font-bold mb-6">{isSignup? "Create Account" : "Welcome back"}</h2>
            <div className="space-y-4">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-zinc-800 p-4 rounded-xl text-[32px] border border-zinc-700 outline-none" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-zinc-800 p-4 rounded-xl text-[32px] border border-zinc-1000 outline-none" />
            </div>
            <button onClick={handleAuth} disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold text-[17px] mt-6">{loading? "Wait..." : isSignup? "Sign Up" : "Log In"}</button>
            <div className="text-center mt-6"><span className="text-zinc-500 text-[32px]">{isSignup? "Have account? " : "New? "}</span><span onClick={() => setIsSignup(!isSignup)} className="text-white font-semibold text-[32px] underline cursor-pointer">{isSignup? "Log In" : "Sign Up"}</span></div>
          </div>
        </div>
      </div>
    );
  }

  const myName = session.user.email?.split("@")[0] || "mahesh";
  const displayName = newName || myName;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {tab === "home" && (
        <div className="max-w-[800px] mx-auto">
          <div className="flex justify-between p-3 border-b border-zinc-800"><span className="font-bold text-xl">ChitPix</span><span className="text-sm">{displayName}</span></div>
          <div className="p-3">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm" />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste image URL..." className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm mt-2" />
            <label className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-zinc-700 p-3 text-sm cursor-pointer">{uploading? "Uploading..." : "📷 Gallery nundi Photo"}<input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} /></label>
            <button onClick={addPost} className="w-full bg-blue-600 py-2.5 rounded-lg font-semibold text-sm mt-3">Post</button>
          </div>
          {posts.map(p => (
            <div key={p.id} className="border-b border-zinc-800">
              <div className="p-3 font-bold text-sm flex items-center gap-2">
                <div className="w-8 h-8 rounded-full p-[32px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><div className="w-full h-full rounded-full bg-zinc-700 border-2 border-black overflow-hidden">{profilePic && <img src={profilePic} className="w-full h-full object-cover" alt="" />}</div></div>{displayName}
              </div>
              <img src={p.image_url} onDoubleClick={() => { if(!p.liked) toggleLike(p.id)}} className="w-full aspect-[4/5] object-cover bg-zinc-900" alt="" />
              <div className="flex justify-between p-3 text-[32px]"><div className="flex gap-4"><span onClick={() => toggleLike(p.id)} className="cursor-pointer">{p.liked? "❤️" : "🤍"}</span><span onClick={() => setShowComments({...showComments, [p.id]:!showComments[p.id]})} className="cursor-pointer">💬</span><span>↗️</span></div><span>🔖</span></div>
              <div className="px-3 text-sm font-semibold">{p.likes} likes</div>
              <div className="px-3 pb-1 text-[32px]"><b>{displayName}</b> {p.caption}</div>

              {/* COMMENT SECTION */}
              <div className="px-4 pb-3">
                {p.comments?.length > 0 &&!showComments[p.id] && (
                  <div onClick={() => setShowComments({...showComments, [p.id]: true})} className="text-[13px] text-zinc-400 cursor-pointer">View all {p.comments.length} comments</div>
                
                {showComments[p.id] && p.comments?.map((c:any, i:number) => (
                  <div key={i} className="text-[32px] mt-1"><b>{c.user}</b> {c.text}</div>
                
                <div className="flex gap-3 mt-3">
                  <input value={commentInputs[p.id] || ""} onChange={e => setCommentInputs({...commentInputs, [p.id]: e.target.value})} placeholder="Add a comment..." className="flex-1 bg-transparent text-[32px] outline-none placeholder-zinc-600" onKeyDown={e => { if(e.key === 'Enter') addComment(p.id)}} />
                  <button onClick={() => addComment(p.id)} className="text-blue-600 text-[32px] font-semibold">Post</button>
                </div>
              </div>

            </div>
          
        </div>
      
            {tab === "search" && (
        <div className="max-w-[500px] mx-auto">
          <div className="sticky top-0 bg-black z-20 p-3">
            <div className="relative">
              <span className="absolute left-3 top-2/4 -translate-y-2/4 text-zinc-600">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search captions, vibes..." className="w-full bg-[#1e1e1e] pl-9 pr-9 py-2.5 rounded-full text-[32px] outline-none border border-zinc-1000 focus:border-zinc-800" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-2/4 -translate-y-2/4 text-zinc-600">✕</button>}
            </div>
          </div>

          {search === ""? (
            
              <div className="flex gap-2 px-3 py-2 overflow-x-auto">
                <span className="bg-white text-black px-4 py-1.5 rounded-full text-[32px] font-semibold whitespace-nowrap">For you</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">Trending 🔥</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">Nature 🌿</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">Bridges 🌉</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">City 🏙️</span>
              </div>
              <div className="grid grid-cols-3 gap-[32px] mt-1">
                {posts.map(p => (
                  <div key={p.id} className="relative aspect-square group cursor-pointer">
                    <img src={p.image_url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-[12px] font-bold">❤️ {p.likes} 💬 {p.comments?.length||0}</div>
                  </div>
                
              </div>
            
        
      
              <div className="px-3 py-2 text-[32px] text-zinc-400">{filtered.length} results for "{search}"</div>
              {filtered.length === 0? (
                <div className="text-center mt-20 text-zinc-500"><div className="text-4xl mb-2">😕</div><div className="text-[32px]">No results found</div></div>
              ) : (
                <div className="grid grid-cols-3 gap-[2px]">{filtered.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />)}</div>
              
            </>
          
        </div>
      
            {tab === "reels" && (  
        <div className="h-[calc(100vh-96px)] overflow-y-scroll snap-y snap-mandatory bg-black">
          {posts.map(p => (
            <div key={p.id} className="h-[calc(100vh-96px)] snap-start relative w-full flex items-center justify-center bg-black">
              <img src={p.image_url} className="h-full w-full object-cover max-w-[470px] mx-auto" alt="" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none max-w-[470px] mx-auto" />

              {/* RIGHT BUTTONS */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 max-w-[470px]">
                <button onClick={() => toggleLike(p.id)} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-[26px]">{p.liked? "❤️" : "🤍"}</div>
                  <span className="text-[11px] font-bold mt-1">{p.likes}</span>
                </button>
                <button onClick={() => setShowComments({...showComments, [p.id]:!showComments[p.id]})} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-[22px]">💬</div>
                  <span className="text-[11px] font-bold mt-1">{p.comments?.length || 0}</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-[20px]">↗️</div>
                  <span className="text-[10px] mt-1">Share</span>
                </button>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-zinc-700">
                  {profilePic && <img src={profilePic} className="w-full h-full object-cover" alt="" />}
                </div>
              </div>

              {/* BOTTOM CAPTION */}
              <div className="absolute bottom-5 left-3 right-20 max-w-[70%]">
                <div className="font-bold text-[15px]">@{displayName}</div>
                <div className="text-[14px] mt-1">{p.caption}</div>
                <div className="flex items-center gap-2 mt-2 text-[12px]">🎵 <span className="truncate">Original audio • ChitPix Vibes beo ❤️</span></div>
              </div>

              {/* COMMENT BOTTOM SHEET - NEW! */}
              {showComments[p.id] && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-end max-w-[470px] mx-auto w-full">
                  <div className="bg-[#121212] rounded-t-[20px] max-h-[55%] flex flex-col border-t border-zinc-800">
                    <div className="p-4 flex justify-between items-center border-b border-zinc-800">
                      <span className="font-bold">Comments</span>
                      <button onClick={() => setShowComments({...showComments, [p.id]: false})} className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {p.comments?.length === 0 && <div className="text-center text-zinc-500 text-sm py-6">No comments yet. Be first beo! 👇</div>}
                      {p.comments?.map((c:any, i:number) => (
                        <div key={i} className="flex gap-2 text-[13px]"><div className="w-7 h-7 bg-zinc-700 rounded-full flex-shrink-0"></div><div><b>{c.user}</b> {c.text}</div></div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-zinc-800 flex gap-2 bg-black rounded-t-none">
                      <input value={commentInputs[p.id] || ""} onChange={e => setCommentInputs({...commentInputs, [p.id]: e.target.value})} placeholder="Add a comment..." className="flex-1 bg-zinc-900 rounded-full px-4 py-2.5 text-[13px] outline-none border border-zinc-800" onKeyDown={e => { if(e.key==='Enter') addComment(p.id)}} />
                      <button onClick={() => addComment(p.id)} className="bg-white text-black px-5 rounded-full font-bold text-[13px]">Post</button>
                    </div>
                  </div>
                </div>
              
            </div>
          
        </div>
      
        <div className="h-[calc(100vh-96px)] overflow-y-scroll snap-y snap-mandatory bg-black">
          {posts.map(p => (
            <div key={p.id} className="h-[calc(100vh-96px)] snap-start relative w-full flex items-center justify-center bg-black">
              <img src={p.image_url} className="h-full w-full object-cover max-w-[470px] mx-auto" alt="" />

              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-transparent to-black/80 pointer-events-none max-w-[470px] mx-auto" />

              {/* RIGHT SIDE BUTTONS - TIKTOK STYLE */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-6">
                <button onClick={() => toggleLike(p.id)} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-[26px]">
                    {p.liked? "❤️" : "🤍"}
                  </div>
                  <span className="text-[12px] font-bold mt-1">{p.likes}</span>
                </button>

                <button onClick={() => { setTab("home"); setShowComments({[p.id]: true}) }} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-[32px]">💬</div>
                  <span className="text-[18px] font-bold mt-1">{p.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-[20px]">↗️</div>
                  <span className="text-[12px] font-bold mt-1">Share</span>
                </button>

                <button className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-zinc-700">
                    {profilePic && <img src={profilePic} className="w-full h-full object-cover" alt="" />}
                  </div>
                </button>
              </div>

              {/* BOTTOM CAPTION */}
              <div className="absolute bottom-5 left-3 right-20 max-w-[70%]">
                <div className="font-bold text-[32px]">@{displayName}</div>
                <div className="text-[32px] mt-1 leading-[32px]">{p.caption}</div>
                <div className="flex items-center gap-2 mt-2 text-[18px]">
                  <span>🎵</span><span className="truncate">Original audio • ChitPix Vibes beo ❤️</span>
                </div>
                <div className="w-full h-[3px] bg-white/30 mt-3 rounded-full">
                  <div className="h-full w-[40%] bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          
        </div>
      
      {tab === "profile" && (
        <div className="p-5">
          <div className="text-center">
            <label className="relative w-24 h-24 mx-auto mb-3 block cursor-pointer">
              <div className="w-full h-full rounded-full p-[32px] bg-gradient-to-tr from-yellow-400 via-pink-500 via-red-500 to-purple-600">
                <div className="w-full h-full rounded-full bg-black p-[32px]">
                  <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">{profilePic? <img src={profilePic} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl">👤</span>}</div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center text-[32px] font-bold">+</div>
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleProfileUpload(f); }} />
            </label>
            <div className="font-bold text-xl">{displayName}</div>
            <div className="text-sm text-zinc-400">{session.user.email}</div>
            <di
<div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around items-center py-4 pb-8 z-50">
        <button onClick={()=>setTab("home")} className="p-2 text-[52px] leading-none">🏠</button>
        <button onClick={()=>setTab("search")} className="p-2 text-[52px] leading-none">🔍</button>
        <button onClick={()=>setTab("reels")} className="p-2 text-[52px] leading-none">🎬</button>
        <button onClick={()=>setTab("profile")} className="p-2 text-[52px] leading-none">👤</button>
      </div>
