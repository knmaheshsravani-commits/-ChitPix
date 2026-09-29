"use client";
import { useState, useEffect } from "react";

type Post = { id: number; username: string; image: string; likes: number; liked: boolean; caption: string; };
type Story = { id: number; username: string; image: string; viewed: boolean; };

export default function Page() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([
    { id: 1, username: "Your Story", image: "https://i.pravatar.cc/100?img=32", viewed: false },
    { id: 2, username: "aestheti", image: "", viewed: false },
    { id: 3, username: "travel", image: "", viewed: false },
    { id: 4, username: "food_lov", image: "", viewed: false },
  ]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [search, setSearch] = useState("");

  // LOAD FROM LOCALSTORAGE - refresh aina povakunda
  useEffect(() => {
    const savedPosts = localStorage.getItem("chitpix_posts_final");
    const savedStories = localStorage.getItem("chitpix_stories_final");
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    else setPosts([{ id: 1, username: "Sravani m", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", likes: 12400, liked: false, caption: "My festival look 🌸 #festival" }]);
    if (savedStories) setStories(JSON.parse(savedStories));
  }, []);

  useEffect(() => {
    if (posts.length > 0) localStorage.setItem("chitpix_posts_final", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("chitpix_stories_final", JSON.stringify(stories));
  }, [stories]);

  // FUNCTIONS
  const toggleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleUpload = (e: any, type: "post" | "story" | "reel") => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "post") {
      const newPost = { id: Date.now(), username: "Sravani m", image: url, likes: 0, liked: false, caption: "New post ❤️" };
      setPosts([newPost,...posts]);
    } else if (type === "story") {
      setStories([{ id: Date.now(), username: "Your Story", image: url, viewed: false },...stories]);
    }
  };

  const filtered = posts.filter(p => p.username.toLowerCase().includes(search.toLowerCase()) || p.caption.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-black text-white min-h-screen relative pb-[70px]">

        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-black flex justify-between items-center px-4 py-3 border-b border-zinc-800">
          <h1 className="text-[22px] font-bold tracking-tight">ChitPix</h1>
          <label className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold cursor-pointer">+<input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "post")} /></label>
        </div>

        {/* STORY POPUP */}
        {activeStory && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setActiveStory(null)}>
            <div className="h-1 w-full bg-zinc-800"><div className="h-full bg
