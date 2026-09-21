"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function Page() {
  const [tab, setTab] = useState("home");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [commentPost, setCommentPost] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [myName, setMyName] = useState("Mahesh");
  const [myBio, setMyBio] = useState("ChitPix Creator beo ❤️");

  const [posts, setPosts] = useState<any[]>([
    { id: 1, image_url: "https://picsum.photos/seed/1/600/800", caption: "First post beo!", likes: 12, liked: false, comments: [{ user: "Ravi", text: "Super bro!" }] },
    { id: 2, image_url: "https://picsum.photos/seed/2/600/800", caption: "Bangalore vibes", likes: 5, liked: false, comments: [] },
  ]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("chitpix").upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage.from("chitpix").getPublicUrl(fileName);
      setUrl(data.publicUrl);
    } catch (error) {
      console.error("Photo upload failed:", error);
      alert("Photo upload avvaledu beo! Mallee try cheyandi.");
    } finally {
      setUploading(false);
    }
  };

  const addPost = () => {
    if (!url) { alert("Photo link pettu beo!"); return; }
    setPosts([{ id: Date.now(), image_url: url, caption: text, likes: 0, liked: false, comments: [] }, ...posts]);
    setText("");
    setUrl("");
  };

  const toggleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const doComment = () => {
    if (!commentText) return;
    setPosts(posts.map(p => p.id === commentPost.id ? { ...p, comments: [...p.comments, { user: myName, text: commentText }] } : p));
    setCommentText("");
    setCommentPost(null);
  };

  const doShare = async (p: any) => {
    if (navigator.share) {
      await navigator.share({ title: "ChitPix", text: p.caption, url: p.image_url });
    } else {
      navigator.clipboard.writeText(p.image_url);
      alert("Link copy ayindi beo!");
    }
  };

  const filtered = posts.filter(p => p.caption.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {tab === "home" && <>
        <div className="flex gap-3 p-3 overflow-x-auto border-b border-zinc-800 no-scrollbar">
          <div className="flex flex-col items-center min-w-[60px]"><div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-2xl border-2 border-dashed">+</div><span className="text-xs mt-1">Add</span></div>
          {posts.map(p => <div key={p.id} className="flex flex-col items-center min-w-[60px]"><div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={p.image_url} className="w-full h-full rounded-full object-cover" /></div><span className="text-xs mt-1">{myName}</span></div>)}
        </div>
        <div className="m-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-transparent outline-none p-2" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste image URL..." className="w-full bg-zinc-800 rounded-lg p-2.5 mt-2 text-sm outline-none" />
          <label className={`mt-2 flex items-center justify-center rounded-lg border border-dashed border-zinc-700 p-2.5 text-sm cursor-pointer ${uploading ? "opacity-50" : ""}`}>
            {uploading ? "Uploading..." : "📸 Gallery nundi Photo Select Chey"}
            <input type="file" accept="image/*" disabled={uploading} className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); e.currentTarget.value = ""; }} />
          </label>
          <div className="flex gap-3 mt-3"><button onClick={addPost} disabled={uploading} className="w-full bg-blue-600 rounded-xl py-3 font-bold disabled:opacity-50">Post</button></div>
        </div>
        {posts.map(p => <div key={p.id} className="border-b border-zinc-800">
          <div className="p-3 flex gap-2 font-bold text-sm"><img src={p.image_url} className="w-7 h-7 rounded-full object-cover" /> {myName}</div>
          <img src={p.image_url} className="w-full aspect-[4/5] object-cover bg-zinc-900" />
          <div className="flex justify-between p-3 text-[22px]"><div className="flex gap-4"><span onClick={() => toggleLike(p.id)} className="cursor-pointer">{p.liked ? "❤️" : "♡"}</span><span onClick={() => setCommentPost(p)} className="cursor-pointer">💬</span><span onClick={() => doShare(p)} className="cursor-pointer">↗</span></div></div>
          <div className="px-3 text-sm font-semibold">{p.likes} likes</div>
          <div className="px-3 pb-1 text-[14px]"><b className="mr-2">{myName}</b>{p.caption}</div>
          {p.comments.map((c: any, i: number) => <div key={i} className="px-3 text-[13px] text-zinc-300"><b>{c.user}</b> {c.text}</div>)}
          <div className="px-3 pb-3 pt-1 text-[13px] text-zinc-500 cursor-pointer" onClick={() => setCommentPost(p)}>View all {p.comments.length} comments</div>
        </div>)}
      </>}

      {tab === "search" && <><div className="p-3 sticky top-0 bg-black z-10"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none" /></div><div className="p-1 grid grid-cols-3 gap-[2px]">{filtered.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover w-full" />)}</div>{filtered.length === 0 && <p className="text-center p-10 text-zinc-500">No results beo</p>}</>}

      {tab === "reels" && <div className="h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory no-scrollbar">{posts.map(p => <div key={p.id} className="h-[calc(100vh-80px)] snap-start relative bg-black flex items-center justify-center border-b border-zinc-900"><img src={p.image_url} className="h-full w-full object-contain bg-zinc-950" /><div className="absolute bottom-5 left-3 right-12"><p className="font-bold text-sm">@{myName}</p><p className="text-[13px] mt-1">{p.caption}</p></div><div className="absolute right-3 bottom-20 flex flex-col gap-6 text-2xl"><span onClick={() => toggleLike(p.id)}>{p.liked ? "❤️" : "♡"}</span><span onClick={() => setCommentPost(p)}>💬</span><span onClick={() => doShare(p)}>↗</span></div></div>)}</div>}

      {tab === "profile" && <div className="p-5"><div className="flex gap-5 items-center"><div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[3px]"><img src={posts[0]?.image_url} className="w-full h-full rounded-full object-cover" /></div><div><p className="font-bold">{myName}</p><p className="text-sm text-zinc-400">{posts.length} posts</p></div></div><h2 className="font-bold mt-4">{myName}</h2><p className="text-sm text-zinc-300 mt-1">{myBio}</p><button onClick={() => setEditOpen(true)} className="w-full mt-4 bg-zinc-800 border border-zinc-700 rounded-lg py-2 font-semibold text-sm">Edit Profile</button><div className="grid grid-cols-3 gap-[2px] mt-5">{posts.map(p => <img key={p.id} src={p.image_url} className="aspect-square object-cover w-full" />)}</div></div>}

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around items-center py-4 pb-8 z-50">
        <button onClick={()=>setTab("home")} className="p-2 text-[42px] leading-none">🏠</button>
        <button onClick={()=>setTab("search")} className="p-2 text-[42px] leading-none">🔍</button>
        <button onClick={()=>setTab("reels")} className="p-2 text-[42px] leading-none">🎬</button>
        <button onClick={()=>setTab("profile")} className="p-2 text-[42px] leading-none">👤</button>
      </div>

      {commentPost && <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"><div className="bg-zinc-900 w-full max-h-[70vh] rounded-t-2xl p-4"><div className="flex justify-between font-bold mb-4"><span>Comments</span><button onClick={() => setCommentPost(null)}>✕</button></div>{commentPost.comments.map((c: any, i: number) => <p key={i} className="text-sm mb-2"><b>{c.user}</b> {c.text}</p>)}<div className="flex gap-2 mt-4"><input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-zinc-800 rounded-lg p-2 outline-none" /><button onClick={doComment} className="bg-blue-600 rounded-lg px-4">Post</button></div></div></div>}

      {editOpen && <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"><div className="bg-zinc-900 w-full rounded-2xl p-5 border border-zinc-800"><h3 className="font-bold text-lg">Edit Profile</h3><input value={myName} onChange={e => setMyName(e.target.value)} className="w-full bg-zinc-800 rounded-lg p-3 mt-4 outline-none" /><textarea value={myBio} onChange={e => setMyBio(e.target.value)} className="w-full bg-zinc-800 rounded-lg p-3 mt-3 outline-none" /><button onClick={() => setEditOpen(false)} className="w-full bg-blue-600 rounded-lg py-3 mt-4 font-bold">Save</button></div></div>}
    </div>
  );
      }
