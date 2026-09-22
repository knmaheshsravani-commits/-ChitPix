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
  const filtered = posts.filter(p => p.caption.toLowerCase().includes(search.toLowerCase()));

  if (!session) { return (<div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-5"><div className="w-full max-w-[700px]"><div className="text-center mb-8"><h1 className="text-[52px] font-black">ChitPix</h1></div><div className="w-full bg-white rounded-[52px] p-8 border border-zinc-600 shadow-sm"><div className="space-y-4"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-zinc-400 p-4 rounded-xl border border-zinc-600 outline-none text-sm" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-zinc-400 p-4 rounded-xl border border-zinc-400 outline-none text-sm" /></div><button onClick={handleAuth} disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold mt-6">{loading? "Wait..." : isSignup? "Sign Up" : "Log In"}</button><div className="text-center mt-6"><span className="text-zinc-500 text-sm">{isSignup? "Have account? " : "New? "}</span><span onClick={() => setIsSignup(!isSignup)} className="text-black font-semibold text-sm underline cursor-pointer">{isSignup? "Log In" : "Sign Up"}</span></div></div></div></div>); }

  const myName = session.user.email?.split("@")[0] || "mahesh"; const displayName = newName || myName;

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {tab === "home" && (<div className="max-w-[800px] mx-auto"><div className="flex justify-between items-center p-3 border-b border-zinc-800 bg-white sticky top-0 z-10"><span className="font-bold text-xl">ChitPix</span><span className="text-sm font-medium">{displayName}</span></div><div className="p-3 bg-white"><input value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-zinc-200 border border-zinc-800 p-3 rounded-lg text-sm outline-none" /><input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste image URL..." className="w-full bg-zinc-700 border border-zinc-800 p-3 rounded-lg text-sm mt-2 outline-none" /><label className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-zinc-600 p-3 text-sm cursor-pointer bg-zinc-50">{uploading? "Uploading..." : "📷 Gallery nundi Photo"}<input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} /></label><button onClick={addPost} className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm mt-3">Post</button></div>{posts.map(p => (<div key={p.id} className="border-b border-zinc-800 bg-white"><div className="p-3 font-bold text-sm flex items-center gap-2"><div className="w-8 h-8 rounded-full p-[32px] bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600"><div className="w-full h-full rounded-full bg-white border-2 border-white overflow-hidden">{profilePic && <img src={profilePic} className="w-full h-full object-cover" alt="" />}</div></div>{displayName}</div><img src={p.image_url} onDoubleClick={() => { if(!p.liked) toggleLike(p.id)}} className="w-full aspect-[4/5] object-cover bg-zinc-100" alt="" />
      {/* NEE ICONS - SAME TO SAME */}
      <div className="flex justify-between p-3 text-[52px]"><div className="flex gap-4"><span onClick={() => toggleLike(p.id)} className="cursor-pointer">{p.liked? "❤️" : "🤍"}</span><span onClick={() => setShowComments({...showComments, [p.id]:!showComments[p.id]})} className="cursor-pointer">💬</span><span>↗️</span></div><span>🔖</span></div>
      <div className="px-3 text-sm font-semibold">{p.likes} likes</div><div className="px-3 pb-1 text-sm"><b>{displayName}</b> {p.caption}</div><div className="px-3 pb-2">{p.comments?.length > 0 &&!showComments[p.id] && (<div onClick={() => setShowComments({...showComments, [p.id]: true})} className="text-sm text-zinc-600 cursor-pointer">View all {p.comments.length} comments</div>)}{showComments[p.id] && p.comments?.map((c:any, i:number) => (<div key={i} className="text-sm mt-1"><b>{c.user}</b> {c.text}</div>))}<div className="flex gap-2 mt-2 border-t border-zinc-800 pt-2"><input value={commentInputs[p.id] || ""} onChange={e => setCommentInputs({...commentInputs, [p.id]: e.target.value})} placeholder="Add a comment..." className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-600" onKeyDown={e => { if(e.key === 'Enter') addComment(p.id)}} /><button onClick={() => addComment(p.id)} className="text-blue-700 text-sm font-semibold">Post</button></div></div></div>))}</div>)}

      {tab === "search" && (
        <div className="max-w-[800px] mx-auto">
          <div className="sticky top-0 bg-white p-3 border-b border-zinc-800 z-10">
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

      {tab === "reels" && (<div className="h-[calc(100vh-100px)] overflow-y-scroll snap-y snap-mandatory bg-black">{filtered.map(p => (<div key={p.id} className="h-[calc(100vh-100px)] snap-start relative"><img src={p.image_url} className="w-full h-full object-cover" alt="" /><div className="absolute bottom-24 left-3 text-sm text-white"><b>{displayName}</b><div>{p.caption}</div></div></div>))}</div>)}
      {tab === "profile" && (<div className="p-5 bg-white min-h-screen"><div className="text-center"><label className="relative w-24 h-24 mx-auto mb-3 block cursor-pointer"><div className="w-full h-full rounded-full p-[8px] bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700"><div className="w-full h-full rounded-full bg-white p-[8px]"><div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">{profilePic? <img src={profilePic} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl">👤</span>}</div></div></div><div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-6
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  700 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold text-white">+</div><input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleProfileUpload(f); }} /></label><div className="font-bold text-xl">{displayName}</div><div className="text-sm text-zinc-600">{session.user.email}</div><div className="text-sm mt-2">{bio}</div><div className="flex justify-center gap-3 mt-4"><button onClick={() => setEditing(!editing)} className="bg-zinc-100 px-6 py-2 rounded-lg text-sm font-semibold">{editing? "Close" : "Edit Profile"}</button><button onClick={() => supabase.auth.signOut()} className="border border-zinc-500 px-6 py-2 rounded-lg text-sm">Log Out</button></div>{editing && (<div className="mt-5 bg-zinc-50 p-4 rounded-xl text-left space-y-3 border border-zinc-500"><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New Name" className="w-full bg-white p-3 rounded-lg border border-zinc-500 text-sm" /><input value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio..." className="w-full bg-white p-3 rounded-lg border border-zinc-500 text-sm" /><button onClick={() => setEditing(false)} className="w-full bg-black text-white py-2 rounded-lg text-sm font-bold">Save</button></div>)}</div><div className="grid grid-cols-3 gap-1 mt-6">{posts.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />)}</div></div>)}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around items-center py-2 pb-6 max-w-[800px] mx-auto"><button onClick={() => setTab("home")} className="text-[52px] p-2">🏠</button><button onClick={() => setTab("search")} className="text-[52px] p-2">🔍</button><button onClick={() => setTab("home")} className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-[32px] font-bold">+</button><button onClick={() => setTab("reels")} className="text-[52px] p-2">🎬</button><button onClick={() => setTab("profile")} className="text-[52px] p-2">👤</button></div>
    </div>
  );
        }
