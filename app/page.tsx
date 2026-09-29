 "use client";
import { useState, useEffect } from "react";

type Post = { id: number; user: string; text: string; image: string; likes: number; liked: boolean };
type Story = { id: number; user: string; image: string };

export default function Page() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [text, setText] = useState("");
  const [tempImage, setTempImage] = useState("");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load - Vercel fix
  useEffect(() => {
    setMounted(true);
    const p = localStorage.getItem("old_chitpix_posts");
    const s = localStorage.getItem("old_chitpix_stories");
    if (p) setPosts(JSON.parse(p));
    else setPosts([{ id: 1, user: "@Sravani m", text: "Hi friends", image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600", likes: 12401, liked: true }]);

    if (s) setStories(JSON.parse(s));
    else setStories([
      { id: 1, user: "@Sravani", image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=200" },
      { id: 2, user: "@knmahes", image: "https://i.pravatar.cc/100?img=12" },
      { id: 3, user: "@mahesh1", image: "https://i.pravatar.cc/100?img=20" },
    ]);
  }, []);

  useEffect(() => { if(mounted) localStorage.setItem("old_chitpix_posts", JSON.stringify(posts)); }, [posts, mounted]);
  useEffect(() => { if(mounted) localStorage.setItem("old_chitpix_stories", JSON.stringify(stories)); }, [stories, mounted]);

  if(!mounted) return <div className="min-h-screen bg-white flex items-center justify-center">Loading ChitPix...</div>;

  const handleImage = (e: any, type: "post" | "story") => {
    const file = e.target.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    if(type==="post") setTempImage(url);
    else setStories([{id: Date.now(), user: "@You", image: url},...stories]);
  };

  const addPost = () => {
    if(!text &&!tempImage) return;
    const newPost = { id: Date.now(), user: "@Sravani m", text: text || "Festival vibes 🌸", image: tempImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", likes: 0, liked: false };
    setPosts([newPost,...posts]);
    setText(""); setTempImage("");
  };

  const toggleLike = (id: number) => {
    setPosts(posts.map(p => p.id===id? {...p, liked:!p.liked, likes: p.liked? p.likes-1 : p.likes+1 } : p));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen pb-[70px] relative">
        {/* TOP - Purple Bar */}
        <div className="h-12 bg-[#8a4cf5]" />
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h1 className="text-xl font-bold text-[#8a4cf5]">ChitPix 🌸</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">@knmahesh30</span>
            <label className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer">+<input type="file" hidden accept="image/*" onChange={(e)=>handleImage(e,"post")} /></label>
          </div>
        </div>

        {tab==="home" && (
          <>
            {/* STORIES - Add Story Working */}
            <div className="flex gap-4 px-4 py-3 overflow-x-auto border-b">
              <label className="flex flex-col items-center shrink-0 cursor-pointer">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#8a4cf5] flex items-center justify-center text-2xl">+</div>
                <span className="text-xs mt-1">Add Story</span>
                <input type="file" hidden accept="image/*" onChange={(e)=>handleImage(e,"story")} />
              </label>
              {stories.map(s => (
                <div key={s.id} className="flex flex-col items-center shrink-0">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-[#8a4cf5]"><img src={s.image} className="w-full h-full rounded-full object-cover border-2 border-white" /></div>
                  <span className="text-xs mt-1">{s.user}</span>
                </div>
              ))}
            </div>

            {/* POST INPUT */}
            <div className="flex gap-2 p-3 border-b">
              <input value={text} onChange={e=>setText(e.target.value)} placeholder="Em undi bro? Photo kuda!" className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-sm outline-none" />
              <label className="w-12 h-10 bg-zinc-100 rounded-full flex items-center justify-center cursor-pointer">📷<input type="file" hidden accept
