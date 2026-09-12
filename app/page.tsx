"use client";
import { useState, useEffect, useRef } from "react";
export default function ChitPix() {
  const USERS = [{ n: "You", l: "Y", c: "from-yellow-400 to-pink-500" }, { n: "Mahesh", l: "M", c: "from-blue-500 to-cyan-400" }, { n: "Sravani", l: "S", c: "from-purple-500 to-pink-500" }];
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState<any[]>([{ id: 1, u: 1, cap: "First post on ChitPix 🔥 Welcome!", like: 12, liked: false }]);
  const [cap, setCap] = useState("");
  const [msgs, setMsgs] = useState([{ u: 1, t: "Hey bro! ChitPix ready ah?" }]);
  const [inp, setInp] = useState("");
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs]);
  const addPost = () => {
    if (!cap.trim()) return;
    setPosts([{ id: Date.now(), u: 0, cap, like: 0, liked: false },...posts]);
    setCap(""); setTab("home");
  };
  const like = (id: number) => {
    setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, like: p.liked? p.like - 1 : p.like + 1 } : p));
  };
  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col max-w-[480px] mx-auto border-x border-zinc-900">
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-zinc-900 p-3 flex justify-between items-center">
        <h1 className="text-[22px] font-black tracking-tighter">ChitPix</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab("home")} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border ${tab === 'home'? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800'}`}>Home</button>
          <button onClick={() => setTab("chat")} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border ${tab === 'chat'? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800'}`}>Chat</
