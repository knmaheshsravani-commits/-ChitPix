"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const [isSignup, setIsSignup] = useState(false);
  const [tab, setTab] = useState("home"); const [text, setText] = useState(""); const [url, setUrl] = useState(""); const [search, setSearch] = useState(""); const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<any[]>([
    { id: 1, image_url: "https://picsum.photos/seed/1/800/1000", caption: "First post beo!", likes: 12, liked: false, comments: [] },
    { id: 2, image_url: "https://picsum.photos/seed/2/800/1000", caption: "Bridge vibes", likes: 45, liked: false, comments: [] },
    { id: 3, image_url: "https://picsum.photos/seed/3/800/1000", caption: "Nature love", likes: 22, liked: false, comments: [] },
  ]);
  const [profilePic, setProfilePic] = useState(""); const [bio, setBio] = useState("ChitPix beo ❤️"); const [editing, setEditing] = useState(false); const [newName, setNewName] = useState("");
  const [commentInputs, setCommentInputs] = useState<{[key:number]:string}>({}); const [showComments, setShowComments] = useState<{[key:number]:boolean}>({});

  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); return () => l.subscription.unsubscribe(); }, []);
  const handleAuth = async () => { if (!email ||!password) { alert("Email & Password pettu!"); return; } setLoading(true); try { if (isSignup) { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; alert("Signup done!"); setIsSignup(false); } else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; } } catch (e: any) { alert(e.message); } finally { setLoading(false); } };
  const addPost = () => { if (!url) { alert("URL pettu!"); return; } setPosts([{ id: Date.now(), image_url: url, caption: text, likes: 0, liked: false, comments: [] },...posts]); setText(""); setUrl(""); };
  const handleFileUpload = async (file: File) => { setUploading(true); try { const n = `${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if (error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setUrl(data.publicUrl); } catch { alert("Upload fail"); } finally { setUploading(false); } };
  const handleProfileUpload = async (file: File) => { setUploading(true); try { const n = `profile-${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("chitpix").upload(n, file); if (error) throw error; const { data } = supabase.storage.from("chitpix").getPublicUrl(n); setProfilePic(data.publicUrl); } catch { alert("Profile upload fail"); } finally { setUploading(false); } };
  const toggleLike = (id: number) => setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes - 1 : p.likes + 1 } : p));
  const addComment = (postId: number) => { const txt = commentInputs[postId]; if(!txt?.trim()) return; setPosts(posts.map(p => p.id === postId? {...p, comments: [...(p.comments||[]), {user: displayName, text: txt}] } : p)); setCommentInputs({...commentInputs, [postId]: ""}); };
  if (!session) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p>Please login bro</p>
    </div>
  );
}

const myName = session.user.email?.split("@")[0] || "mahesh";
const displayName = myName;

return (
  <div className="min-h-screen bg-white text-black pb-24">
    {tab === "home" && (
      <div className="max-w-[1000px] mx-auto">

      {tab === "search" && (
        <div className="max-w-[800px] mx-auto">
          <div className="sticky top-0 bg-white p-3 border-b border-zinc-1000 z-10">
            <div className="flex items-center bg-zinc-100 rounded-lg px-3 py-2">
              <span className="mr-2">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="bg-transparent outline-none text-sm w-full" />
              {search && <button onClick={() => setSearch("")} className="text-zinc-700 ml-2">✕</button>}
            </div>
          </div>
          <div className="flex gap-2 p-3">
            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">For you</span>
            <span className="bg-zinc-100 px-3 py-1 rounded-full text-xs">Trending</span>
            <span className="bg-zinc-100 px-3 py-1 rounded-full text-xs">Nature</span>
            <span className="bg-zinc-100 px-3 py-1 rounded-full text-xs">Bridges</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(search? filtered : posts).map(p => (
              <img key={p.id} src={p.image_url} className="aspect-square object-cover w-full" alt="" />
            ))}
          </div>
        </div>
      )}

      {tab === "reels" && (<div className="h-[calc(100vh-100px)] overflow-y-scroll snap-y snap-mandatory bg-black">{filtered.map(p => (<div key={p.id} className="h-[calc(200vh-200px)] snap-start relative"><img src={p.image_url} className="w-full h-full object-cover" alt="" /><div className="absolute bottom-24 left-3 text-sm text-white"><b>{displayName}</b><div>{p.caption}</div></div></div>))}</div>)}
      {tab === "profile" && (<div className="p-5 bg-white min-h-screen"><div className="text-center"><label className="relative w-24 h-24 mx-auto mb-3 block cursor-pointer"><div className="w-full h-full rounded-full p-[48x] bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-200"><div className="w-full h-full rounded-full bg-white p-[48px]"><div className="w-full h-full rounded-full bg-zinc-1000 flex items-center justify-center overflow-hidden">{profilePic? <img src={profilePic} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl">👤</span>}</div></div></div><div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-6
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  1000 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold text-white">+</div><input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleProfileUpload(f); }} /></label><div className="font-bold text-xl">{displayName}</div><div className="text-sm text-zinc-800">{session.user.email}</div><div className="text-sm mt-2">{bio}</div><div className="flex justify-center gap-3 mt-4"><button onClick={() => setEditing(!editing)} className="bg-zinc-800 px-6 py-2 rounded-lg text-sm font-semibold">{editing? "Close" : "Edit Profile"}</button><button onClick={() => supabase.auth.signOut()} className="border border-zinc-800 px-6 py-2 rounded-lg text-sm">Log Out</button></div>{editing && (<div className="mt-5 bg-zinc-600 p-4 rounded-xl text-left space-y-3 border border-zinc-1000"><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New Name" className="w-full bg-white p-3 rounded-lg border border-zinc-1000 text-sm" /><input value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio..." className="w-full bg-white p-3 rounded-lg border border-zinc-1000 text-sm" /><button onClick={() => setEditing(false)} className="w-full bg-black text-white py-2 rounded-lg text-sm font-bold">Save</button></div>)}</div><div className="grid grid-cols-3 gap-1 mt-6">{posts.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />)}</div></div>)}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-zinc-400 flex justify-around items-center py-3 z-50">

  <button onClick={()=>setTab("home")} className="w-7 h-7 flex items-center justify-center">
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.5l-9 8.5V21h6v-6h6v6h6V11l-9-8.5z"/></svg>
  </button>

  <button onClick={()=>setTab("search")} className="w-7 h-7 flex items-center justify-center">
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.3-4.3"/></svg>
  </button>

  <button onClick={()=>setTab("create")} className="w-7 h-7 flex items-center justify-center">
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
  </button>

  <button onClick={()=>setTab("reels")} className="w-7 h-7 flex items-center justify-center">
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 9l5 3-5 3V9z"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
  </button>

  <button onClick={()=>setTab("profile")} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-[32px]">M</button>

</div>
