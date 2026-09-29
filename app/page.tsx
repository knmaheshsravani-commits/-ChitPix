"use client";
import { useState, useEffect } from "react";

type Post = { id: number; username: string; image: string; likes: number; liked: boolean; caption: string; };
type Story = { id: number; username: string; image: string; };

export default function Page() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [mounted, setMounted] = useState(false);

  // Vercel error fix - localStorage only after mount
  useEffect(() => {
    setMounted(true);
    const savedPosts = typeof window!== "undefined"? localStorage.getItem("chitpix_posts_v3") : null;
    const savedStories = typeof window!== "undefined"? localStorage.getItem("chitpix_stories_v3") : null;

    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts([{ id: 1, username: "Sravani m", image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600", likes: 12400, liked: false, caption: "Festival vibes 🌸" }]);
    }

    if (savedStories) {
      setStories(JSON.parse(savedStories));
    } else {
      setStories([
        { id: 1, username: "Your Story", image: "https://i.pravatar.cc/100?img=32" },
        { id: 2, username: "aestheti", image: "" },
        { id: 3, username: "travel", image: "" },
        { id: 4, username: "food_lov", image: "" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (mounted && posts.length > 0) {
      localStorage.setItem("chitpix_posts_v3", JSON.stringify(posts));
    }
  }, [posts, mounted]);

  useEffect(() => {
    if (mounted && stories.length > 0) {
      localStorage.setItem("chitpix_stories_v3", JSON.stringify(stories));
    }
  }, [stories, mounted]);

  if (!mounted) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading ChitPix...</div>;

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleUpload = (e: any, type: "post" | "story") => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "post") {
      setPosts(prev => [{ id: Date.now(), username: "Sravani m", image: url, likes: 0, liked: false, caption: "My new post ❤️" },...prev]);
    } else {
      setStories(prev => [{ id: Date.now(), username: "Your Story", image: url },...prev]);
    }
  };

  const filtered = posts.filter(p => p.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-black text-white min-h-screen pb-[70px] relative">
        <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800"><h1 className="text-xl font-bold">ChitPix</h1><label className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold cursor-pointer">+<input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "post")} /></label></div>

        {activeStory && <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setActiveStory(null)}><div className="p-4 flex gap-2 items-center"><img src={activeStory.image} className="w-8 h-8 rounded-full" /><span className="text-sm">{activeStory.username}</span></div><div className="flex-1 flex items-center justify-center"><img src={activeStory.image} className="max-h-[80vh] w-full object-contain" /></div></div>}

        {tab === "home" && (
          <>
            <div className="flex gap-3 p-3 overflow-x-auto border-b border-zinc-800">
              <label className="flex flex-col items-center shrink-0 cursor-pointer"><div className="w-[62px] h-[62px] rounded-full overflow-hidden border-2 border-white"><img src={stories[0]?.image || "https://i.pravatar.cc/100"} className="w-full h-full object-cover" /></div><span className="text-[10px] mt-1">Your Story</span><input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "story")} /></label>
              {stories.slice(1).map(s => <div key={s.id} className="flex flex-col items-center shrink-0" onClick={() => s.image && setActiveStory(s)}><div className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600"><div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-sm">{s.username[0]}</div></div><span className="text-[10px] mt-1">{s.username}</span></div>)}
            </div>
            {filtered.map(post => (
              <div key={post.id} className="border-b border-zinc-800">
                <div className="flex items-center gap-2 p-3"><div className="w-7 h-7 rounded-full bg-zinc-700" /><span className="text-sm font-semibold">@{post.username}</span></div>
                <img src={post.image} alt="post" className="w-full aspect-[4/5] object-cover" />
                <div className="flex gap-4 p-3 items-center text-xl"><button onClick={() => toggleLike(post.id)} className="active:scale-125 transition">{post.liked? "❤️" : "🤍"}</button><span>💬</span><span>✈️</span></div>
                <div className="px-3 pb-4 text-sm"><span className="font-bold">{post.likes.toLocaleString()} likes</span><br /><b>@{post.username}</b> {post.caption}</div>
              </div>
            ))}
          </>
        )}

        {tab === "search" && <div className="p-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900 rounded-full px-4 py-2 text-sm border border-zinc-800 outline-none" /><div className="grid grid-cols-3 gap-[2px] mt-3">{filtered.map(p => <img key={p.id} src={p.image} className="aspect-square object-cover" />)}</div></div>}

        {tab === "reels" && <div>{posts.map(p => <div key={p.id} className="relative h-[70vh] bg-zinc-900 mb-[2px]"><img src={p.image} className="w-full h-full object-cover" /><div className="absolute bottom-0 p-4 bg-gradient-to-t from-black w-full"><p className="text-sm font-bold">@{p.username}</p><p className="text-xs">{p.caption}</p></div><button onClick={() => toggleLike(p.id)} className="absolute right-4 bottom-20 text-2xl">{p.liked? "❤️" : "🤍"}<p className="text-xs">{p.likes}</p></button></div>)}</div>}

        {tab === "profile" && <div className="p-4"><div className="flex gap-4 items-center"><img src={stories[0]?.image} className="w-20 h-20 rounded-full object-cover" /><div className="flex gap-6"><div className="text-center"><p className="font-bold">{posts.length}</p><p className="text-xs text-zinc-400">Posts</p></div><div className="text-center"><p className="font-bold">12.4K</p><p className="text-xs text-zinc-400">Followers</p></div></div></div><div className="grid grid-cols-3 gap-[2px] mt-4">{posts.map(p => <img key={p.id} src={p.image} className="aspect-square object-cover" />)}</div></div>}

        <div className="fixed bottom-0 w-full max-w-[430px] bg-black border-t border-zinc-800 flex justify-around py-3">
          <button onClick={() => setTab("home")}>🏠</button><button onClick={() => setTab("search")}>🔍</button><button onClick={() => setTab("reels")}>🎬</button><button onClick={() => setTab("reels")}>❤️</button><button onClick={() => setTab("profile")} className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs">M</button>
        </div>
      </div>
    </div>
  );
}
