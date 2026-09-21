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
  const [posts, setPosts] = useState<any[]>([{ id: 1, image_url: "https://picsum.photos/seed/1/600/800", caption: "First post beo!", likes: 12, liked: false, comments: [] }]);
  const [profilePic, setProfilePic] = useState("");
  const [bio, setBio] = useState("ChitPix beo 💖");
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
      if (isSignup) { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; else alert("Check email!"); }
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
    try { const n = `${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if(error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setUrl(data.publicUrl); } catch(e:any){ alert(e.message) } finally { setUploading(false) }
  };

  const toggleLike = (id: number) => setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes-1 : p.likes+1 } : p));

  const addComment = (postId: number) => {
    const txt = commentInputs[postId];
    if(!txt ||!txt.trim()) return;
    setPosts(posts.map(p => p.id === postId? {...p, comments: [...(p.comments||[]), { user: session?.user?.email?.split('@')[0] || 'beo', text: txt }] } : p));
    setCommentInputs({...commentInputs, [postId]: ""});
  };

  const filtered = posts.filter(p => p.caption.toLowerCase().includes(search.toLowerCase()));
  const myName = session?.user?.email?.split('@')[0] || 'mahesh';
  const displayName = newName || myName;

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8"><h1 className="text-[48px] font-black">ChitPix</h1><p className="text-zinc-400">Made for beo's</p></div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-zinc-900 p-3 rounded-xl mb-3 outline-none" />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-zinc-900 p-3 rounded-xl mb-4 outline-none" />
          <button onClick={handleAuth} className="w-full bg-white text-black p-3 rounded-xl font-bold">{loading? "..." : isSignup? "Sign Up" : "Login"}</button>
          <button onClick={()=>setIsSignup(!isSignup)} className="w-full mt-3 text-sm text-zinc-400">{isSignup? "Have account? Login" : "New? Sign Up"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* HEADER */}
      <div className="sticky top-0 bg-black border-b border-zinc-800 p-3 flex justify-between items-center max-w-[470px] mx-auto">
        <h1 className="font-black text-xl">ChitPix</h1>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="bg-zinc-900 px-3 py-1.5 rounded-full text-sm outline-none" />
      </div>

      {tab === "home" && (
        <div className="max-w-[470px] mx-auto">
          <div className="p-3 border-b border-zinc-800 flex gap-2">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="What's up beo?" className="flex-1 bg-zinc-900 rounded-full px-4 py-2 text-sm outline-none" />
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Image URL" className="flex-1 bg-zinc-900 rounded-full px-4 py-2 text-sm outline-none" />
            <button onClick={addPost} className="bg-white text-black px-4 rounded-full font-bold text-sm">Post</button>
          </div>
          {filtered.map(p=>(
            <div key={p.id} className="border-b border-zinc-800">
              <div className="p-3 flex gap-2 items-center"><div className="w-8 h-8 bg-zinc-700 rounded-full"/><b className="text-sm">{displayName}</b></div>
              <img src={p.image_url} className="w-full" alt="" />
              <div className="p-3 flex gap-4">
                <button onClick={()=>toggleLike(p.id)}>{p.liked?"❤️":"🤍"} {p.likes}</button>
                <button onClick={()=>setShowComments({...showComments, [p.id]:!showComments[p.id]})}>💬 {p.comments?.length||0}</button>
              </div>
              <div className="px-3 pb-3 text-sm"><b>{displayName}</b> {p.caption}</div>
              {showComments[p.id] && (
                <div className="px-3 pb-3">
                  <div className="space-y-1 mb-2 max-h-32 overflow-auto">{p.comments?.map((c:any,i:number)=><div key={i} className="text-[13px]"><b>{c.user}</b> {c.text}</div>)}</div>
                  <div className="flex gap-2"><input value={commentInputs[p.id]||""} onChange={e=>setCommentInputs({...commentInputs,[p.id]:e.target.value})} placeholder="Add comment..." className="flex-1 bg-zinc-900 rounded-full px-3 py-1.5 text-sm outline-none" onKeyDown={e=>{if(e.key==='Enter')addComment(p.id)}} /><button onClick={()=>addComment(p.id)} className="text-sm font-bold">Post</button></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "reels" && (
        <div className="h-[calc(100vh-96px)] overflow-y-scroll snap-y snap-mandatory bg-black">
          {posts.map(p => (
            <div key={p.id} className="h-[calc(100vh-96px)] snap-start relative w-full bg-black flex items-center justify-center">
              <img src={p.image_url} className="h-full w-full object-cover max-w-[470px] mx-auto" alt="" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none max-w-[470px] mx-auto" />

              {/* RIGHT BUTTONS */}
              <div className="absolute right-3 bottom-28 flex flex-col gap-5 items-center">
                <button onClick={() => toggleLike(p.id)} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl">{p.liked? "❤️" : "🤍"}</div>
                  <span className="text-[12px] font-bold mt-1">{p.likes}</span>
                </button>
                <button onClick={() => setShowComments({[p.id]:!showComments[p.id]})} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-[22px]">💬</div>
                  <span className="text-[12px] font-bold mt-1">{p.comments?.length || 0}</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">↗️</div>
                  <span className="text-[10px] mt-1">Share</span>
                </button>
              </div>

              {/* BOTTOM CAPTION */}
              <div className="absolute bottom-6 left-3 right-20 max-w-[470px]">
                <div className="font-bold">@{displayName}</div>
                <div className="text-[15px] mt-1">{p.caption}</div>
                <div className="text-xs mt-2 opacity-70">🎵 Original audio • ChitPix</div>
              </div>

              {/* COMMENT BOX - MATRAM EDI MUKHYAM */}
              {showComments[p.id] && (
                <div className="absolute inset-0 bg-black/60 flex flex-col justify-end max-w-[500px] mx-auto z-20">
                  <div className="bg-[#121212] rounded-t-[20px] max-h-[55%] flex flex-col">
                    <div className="p-4 flex justify-between border-b border-zinc-800"><b>Comments</b><button onClick={() => setShowComments({})} className="bg-zinc-800 w-7 h-7 rounded-full">✕</button></div>
                    <div className="flex-1 overflow-auto p-4 space-y-3 text-[13px]">
                      {p.comments?.map((c:any,i:number)=><div key={i}><b>{c.user}</b> {c.text}</div>)}
                      {(!p.comments || p.comments.length===0) && <div className="text-zinc-500 text-center py-6">No comments yet beo! Be first 💬</div>}
                    </div>
                    <div className="p-3 flex gap-2 border-t border-zinc-800">
                      <input value={commentInputs[p.id]||""} onChange={e=>setCommentInputs({...commentInputs,[p.id]:e.target.value})} placeholder="Add a comment..." className="flex-1 bg-zinc-900 rounded-full px-4 py-2.5 text-sm outline-none" onKeyDown={e=>{if(e.key==='Enter')addComment(p.id)}} />
                      <button onClick={()=>addComment(p.id)} className="bg-white text-black px-5 rounded-full text-sm font-bold">Post</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "profile" && (
        <div className="max-w-[500px] mx-auto p-6 text-center">
          <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full overflow-hidden">{profilePic && <img src={profilePic} className="w-full h-full object-cover"/>}</div>
          <div className="font-bold text-xl mt-3">{displayName}</div>
          <div className="text-sm text-zinc-400 mt-1">{bio}</div>
          <div className="flex justify-around mt-6 border-t border-zinc-800 pt-4"><div><b>{posts.length}</b><div className="text-xs text-zinc-500">Posts</div></div><div><b>0</b><div className="text-xs text-zinc-500">Followers</div></div><div><b>0</b><div className="text-xs text-zinc-500">Following</div></div></div>
          <button onClick={async()=>{await supabase.auth.signOut()}} className="mt-8 w-full bg-zinc-900 p-3 rounded-xl">Logout</button>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around p-3 max-w-[470px] mx-auto">
        <button onClick={(52px)=>setTab('home')} className={tab==='home'?"font-bold":"opacity-60"}>🏠 Home</button>
        <button onClick={(52px)=>setTab('reels')} className={tab==='reels'?"font-bold":"opacity-60"}>🎬 Reels</button>
        <button onClick={(52px)=>setTab('profile')} className={tab==='profile'?"font-bold":"opacity-60"}>👤 Profile</button>
      </div>
    </div>
  );
                  }
