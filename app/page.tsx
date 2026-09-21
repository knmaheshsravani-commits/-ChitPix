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
    { id: 1, image_url: "https://picsum.photos/seed/1/800/1000", caption: "First post beo!", likes: 12, liked: false, comments: [{user:"mahesh", text:"keka bro!"}] },
    { id: 2, image_url: "https://picsum.photos/seed/2/800/1000", caption: "Bridge vibes", likes: 45, liked: false, comments: [] },
    { id: 3, image_url: "https://picsum.photos/seed/3/800/1000", caption: "Nature love", likes: 22, liked: false, comments: [] },
    { id: 4, image_url: "https://picsum.photos/seed/4/800/1000", caption: "City lights", likes: 67, liked: false, comments: [] },
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
      if (isSignup) { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; alert("Signup done!"); setIsSignup(false); }
      else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const addPost = () => { if (!url) { alert("URL pettu!"); return; } setPosts([{ id: Date.now(), image_url: url, caption: text, likes: 0, liked: false, comments: [] },...posts]); setText(""); setUrl(""); };
  const handleFileUpload = async (file: File) => { setUploading(true); try { const n = `${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if (error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setUrl(data.publicUrl); } catch { alert("Upload fail"); } finally { setUploading(false); } };
  const handleProfileUpload = async (file: File) => { setUploading(true); try { const n = `profile-${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if (error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setProfilePic(data.publicUrl); } catch { alert("Profile upload fail"); } finally { setUploading(false); } };
  const toggleLike = (id: number) => setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes - 1 : p.likes + 1 } : p));
  const addComment = (postId: number) => { const txt = commentInputs[postId]; if(!txt?.trim()) return; setPosts(posts.map(p => p.id === postId? {...p, comments: [...(p.comments||[]), {user: displayName, text: txt}] } : p)); setCommentInputs({...commentInputs, [postId]: ""}); };
  const filtered = posts.filter(p => p.caption.toLowerCase().includes(search.toLowerCase()));

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-[600px]"><div className="text-center mb-8"><h1 className="text-[52px] font-black">ChitPix</h1><p className="text-zinc-500 text-[52px] mt-2">Photos • Reels • Vibes beo ❤️</p></div>
          <div className="w-full bg-[#121212] rounded-[52px] p-8 border border-zinc-1000"><h2 className="text-[52px] font-bold mb-6">{isSignup? "Create Account" : "Welcome back"}</h2><div className="space-y-4"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-zinc-1000 p-4 rounded-xl text-[52px] border border-zinc-1000 outline-none" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-zinc-900 p-4 rounded-xl text-[52px] border border-zinc-900 outline-none" /></div><button onClick={handleAuth} disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold text-[132px] mt-6">{loading? "Wait..." : isSignup? "Sign Up" : "Log In"}</button><div className="text-center mt-6"><span className="text-zinc-600 text-[32px]">{isSignup? "Have account? " : "New? "}</span><span onClick={() => setIsSignup(!isSignup)} className="text-white font-semibold text-[32px] underline cursor-pointer">{isSignup? "Log In" : "Sign Up"}</span></div></div>
        </div>
      </div>
    );
  }

  const myName = session.user.email?.split("@")[0] || "mahesh";
  const displayName = newName || myName;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {tab === "home" && (
        <div className="max-w-[500px] mx-auto">
          <div className="flex justify-between p-3 border-b border-zinc-800"><span className="font-bold text-xl">ChitPix</span><span className="text-sm">{displayName}</span></div>
          <div className="p-3"><input value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm" /><input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste image URL..." className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm mt-2" /><label className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-zinc-700 p-3 text-sm cursor-pointer">{uploading? "Uploading..." : "📷 Gallery nundi Photo"}<input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} /></label><button onClick={addPost} className="w-full bg-blue-600 py-2.5 rounded-lg font-semibold text-sm mt-3">Post</button></div>
          {posts.map(p => (
            <div key={p.id} className="border-b border-zinc-800">
              <div className="p-3 font-bold text-sm flex items-center gap-2"><div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><div className="w-full h-full rounded-full bg-zinc-700 border-2 border-black overflow-hidden">{profilePic && <img src={profilePic} className="w-full h-full object-cover" alt="" />}</div></div>{displayName}</div>
              <img src={p.image_url} onDoubleClick={() => { if(!p.liked) toggleLike(p.id)}} className="w-full aspect-[4/5] object-cover bg-zinc-900" alt="" />
              <div className="flex justify-between p-3 text-[32px]"><div className="flex gap-4"><span onClick={() => toggleLike(p.id)} className="cursor-pointer">{p.liked? "❤️" : "🤍"}</span><span onClick={() => setShowComments({...showComments, [p.id]:!showComments[p.id]})} className="cursor-pointer">💬</span><span>↗️</span></div><span>🔖</span></div>
              <div className="px-3 text-sm font-semibold">{p.likes} likes</div>
              <div className="px-3 pb-1 text-[32px]"><b>{displayName}</b> {p.caption}</div>
              <div className="px-3 pb-2">{p.comments?.length > 0 &&!showComments[p.id] && (<div onClick={() => setShowComments({...showComments, [p.id]: true})} className="text-[32px] text-zinc-400 cursor-pointer">View all {p.comments.length} comments</div>)}{showComments[p.id] && p.comments?.map((c:any, i:number) => (<div key={i} className="text-[32px] mt-1"><b>{c.user}</b> {c.text}</div>))}<div className="flex gap-2 mt-2"><input value={commentInputs[p.id] || ""} onChange={e => setCommentInputs({...commentInputs, [p.id]: e.target.value})} placeholder="Add a comment..." className="flex-1 bg-transparent text-[32px] outline-none placeholder-zinc-500" onKeyDown={e => { if(e.key === 'Enter') addComment(p.id)}} /><button onClick={() => addComment(p.id)} className="text-blue-500 text-[32px] font-semibold">Post</button></div></div>
            </div>
          ))}
        </div>
      )}

      {tab === "search" && (
        <div className="max-w-[500px] mx-auto">
          <div className="sticky top-0 bg-black z-20 p-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search captions, vibes..." className="w-full bg-[#1e1e1e] pl-9 pr-9 py-2.5 rounded-full text-[14px] outline-none border border-zinc-800 focus:border-zinc-600" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">✕</button>}
            </div>
          </div>

          {search === ""? (
            <>
              <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
                <span className="bg-white text-black px-4 py-1.5 rounded-full text-[32px] font-semibold whitespace-nowrap">For you</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">Trending 🔥</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">Nature 🌿</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">Bridges 🌉</span>
                <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-[32px] whitespace-nowrap">City 🏙️</span>
              </div>
              <div className="grid grid-cols-3 gap-[4px] mt-1">
                {posts.map(p => (
                  <div key={p.id} className="relative aspect-square group cursor-pointer">
                    <img src={p.image_url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-[32px] font-bold">❤️ {p.likes} 💬 {p.comments?.length||0}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 text-[13px] text-zinc-400">{filtered.length} results for "{search}"</div>
              {filtered.length === 0? (
                <div className="text-center mt-20 text-zinc-500"><div className="text-4xl mb-2">😕</div><div className="text-[14px]">No results found</div></div>
              ) : (
                <div className="grid grid-cols-3 gap-[2px]">{filtered.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />)}</div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "reels" && (<div className="h-[calc(100vh-96px)] overflow-y-scroll snap-y snap-mandatory">{filtered.map(p => (<div key={p.id} className="h-[calc(100vh-96px)] snap-start relative"><img src={p.image_url} className="w-full h-full object-cover" alt="" /><div className="absolute bottom-24 left-3 right-3"><div className="flex justify-between items-end"><div className="text-sm"><b>{displayName}</b><div>{p.caption}</div><div className="mt-2 text-[52px]">{p.comments?.length || 0} comments • {p.likes} likes</div></div><div className="flex flex-col gap-4 text-[52px]"><span onClick={() => toggleLike(p.id)}>{p.liked? "❤️":"🤍"}</span><span onClick={() => setTab("home")}>💬</span></div></div></div></div>))}</div>)}
      {tab === "profile" && (<div className="p-5"><div className="text-center"><label className="relative w-24 h-24 mx-auto mb-3 block cursor-pointer"><div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 via-red-500 to-purple-600"><div className="w-full h-full rounded-full bg-white p-[8px]"><div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">{profilePic? <img src={profilePic} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl">👤</span>}</div></div></div><div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center text-[32px] font-bold">+</div><input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleProfileUpload(f); }} /></label><div className="font-bold text-xl">{displayName}</div><div className="text-sm text-zinc-400">{session.user.email}</div><div className="text-[52px] mt-2">{bio}</div><div className="flex justify-center gap-3 mt-4"><button onClick={() => setEditing(!editing)} className="bg-zinc-800 px-6 py-2 rounded-lg text-sm font-semibold">{editing? "Close" : "Edit Profile"}</button><button onClick={() => supabase.auth.signOut()} className="border border-zinc-700 px-6 py-2 rounded-lg text-sm">Log Out</button></div>{editing && (<div className="mt-5 bg-zinc-900 p-4 rounded-xl text-left space-y-3"><p className="text-sm font-bold">Edit Profile</p><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New Name" className="w-full bg-white p-3 rounded-lg border border-zinc-700 text-sm" /><input value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio..." className="w-full bg-white p-3 rounded-lg border border-zinc-700 text-sm" /><button onClick={() => setEditing(false)} className="w-full bg-white text-black py-2 rounded-lg text-sm font-bold">Save</button></div>)}</div><div className="grid grid-cols-3 gap-[32px] mt-6">{posts.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />)}</div></div>)}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around items-center py-3 pb-7 z-50"><button onClick={() => setTab("home")} className="text-[52px] p-2">🏠</button><button onClick={() => setTab("search")} className="text-[52px] p-2">🔍</button><button onClick={() => setTab("home")} className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center text-[28px] font-bold">+</button><button onClick={() => setTab("reels")} className="text-[52px] p-2">🎬</button><button onClick={() => setTab("profile")} className="text-[52px] p-2">👤</button></div>
    </div>
  );
              }
