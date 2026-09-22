"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    { id: 1, image_url: "https://picsum.photos/seed/1/600/800", caption: "First post beo!", likes: 12, liked: false },
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email ||!password) { alert("Email & Password pettu bro!"); return; }
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Signup ayindi! Ippudu Login chey!");
        setIsSignup(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const addPost = () => {
    if (!url) { alert("Photo URL pettu!"); return; }
    setPosts([{ id: Date.now(), image_url: url, caption: text, likes: 0, liked: false },...posts]);
    setText(""); setUrl("");
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("chitpix").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("chitpix").getPublicUrl(fileName);
      setUrl(data.publicUrl);
    } catch { alert("Upload fail!"); }
    finally { setUploading(false); }
  };

  const toggleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes - 1 : p.likes + 1 } : p));
  };

  const filtered = posts.filter(p => p.caption.toLowerCase().includes(search.toLowerCase()));

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-[380px]">
          <div className="text-center mb-8">
            <h1 className="text-[48px] font-black tracking-tighter">ChitPix</h1>
            <p className="text-zinc-400 text-[15px] mt-2">Photos • Reels • Vibes beo ❤️</p>
          </div>
          <div className="w-full bg-[#121212] rounded-[28px] p-8 border border-zinc-800">
            <h2 className="text-[24px] font-bold mb-6">{isSignup? "Create Account" : "Welcome back"}</h2>
            <div className="space-y-4">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full bg-zinc-800 p-4 rounded-xl text-[16px] border border-zinc-700 outline-none" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-zinc-800 p-4 rounded-xl text-[16px] border border-zinc-700 outline-none" />
            </div>
            <button onClick={handleAuth} disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold text-[17px] mt-6">{loading? "Wait beo..." : isSignup? "Sign Up" : "Log In"}</button>
            <div className="text-center mt-6">
              <span className="text-zinc-500 text-[14px]">{isSignup? "Already have?" : "New user?"} </span>
              <span onClick={() => setIsSignup(!isSignup)} className="text-white font-semibold text-[14px] cursor-pointer underline">{isSignup? "Log In" : "Sign Up"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const myName = session.user.email?.split("@")[0] || "mahesh";

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {tab === "home" && (
        <div className="max-w-[470px] mx-auto">
          <div className="flex justify-between p-3 border-b border-zinc-800"><span className="font-bold text-xl">ChitPix</span><span className="text-sm">{myName}</span></div>
          <div className="p-3">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm" />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste image URL..." className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm mt-2" />
            <label className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-zinc-700 p-3 text-sm cursor-pointer">{uploading? "Uploading..." : "📷 Gallery nundi Photo"}<input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} /></label>
            <button onClick={addPost} className="w-full bg-blue-600 py-2.5 rounded-lg font-semibold text-sm mt-3">Post</button>
          </div>
          {posts.map(p => (
            <div key={p.id} className="border-b border-zinc-800">
              <div className="p-3 font-bold text-sm">{myName}</div>
              <img src={p.image_url} className="w-full aspect-[4/5] object-cover bg-zinc-900" alt="" />
              <div className="flex justify-between p-3 text-[22px]"><div className="flex gap-4"><span onClick={() => toggleLike(p.id)} className="cursor-pointer">{p.liked? "❤️" : "🤍"}</span><span>💬</span><span>↗️</span></div><span>🔖</span></div>
              <div className="px-3 text-sm font-semibold">{p.likes} likes</div>
              <div className="px-3 pb-3 text-[14px]"><b>{myName}</b> {p.caption}</div>
            </div>
          ))}
        </div>
      )}
      {tab === "search" && (<><div className="p-3 sticky top-0 bg-black"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900 p-2.5 rounded-lg" /></div><div className="grid grid-cols-3 gap-[2px]">{filtered.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />)}</div></>)}
      {tab === "reels" && (<div className="h-[calc(100vh-100px)] overflow-y-scroll snap-y snap-mandatory"><>{filtered.map(p => (<div key={p.id} className="h-[calc(100vh-96px)] snap-start relative"><img src={p.image_url} className="w-full h-full object-cover" alt="" /><div className="absolute bottom-20 left-3 text-sm"><b>{myName}</b><div>{p.caption}</div></div></div>))}</></div>)}
            {tab === "profile" && (
        <div className="p-5 text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 via-red-500 to-purple-600">
              <div className="w-full h-full rounded-full bg-black p-[3px]">
                <div className="w-full h-full rounded-full bg-zinc-700 flex items-center justify-center text-3xl">👤</div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center text-[18px] font-bold">+</div>
          </div>
          <div className="font-bold text-xl">{myName}</div>
          <div className="text-sm text-zinc-400 mb-4">{session.user.email}</div>
          <button onClick={() => supabase.auth.signOut()} className="border border-zinc-700 px-6 py-2 rounded-lg text-sm">Log Out</button>
          <div className="grid grid-cols-3 gap-1 mt-6">{posts.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />)}</div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around items-center py-3 pb-7 z-50">
        <button onClick={() => setTab("home")} className="text-[52px] p-2">🏠</button>
        <button onClick={() => setTab("search")} className="text-[52px] p-2">🔍</button>
        <button onClick={() => setTab("home")} className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center text-[36px] font-bold">+</button>
        <button onClick={() => setTab("reels")} className="text-[52px] p-2">🎬</button>
        <button onClick={() => setTab("profile")} className="text-[52px] p-2">👤</button>
      </div>
    </div>
  );
            }
