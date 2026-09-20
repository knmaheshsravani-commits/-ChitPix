"use client";
import { useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
];

export default function Page() {
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [newImg, setNewImg] = useState("");  const [posts, setPosts] = useState([
    { id: 1, user: "nani_tours", img: IMAGES[0], likes: 124, liked: true, comments: [] },
    { id: 2, user: "sravani", img: IMAGES[1], likes: 89, liked: false, comments: [] },
    { id: 3, user: "mahesh", img: IMAGES[2], likes: 210, liked: true, comments: ["Wow 😍"] },
  ]);

  const stories = [
    { id: 1, name: "nani", img: "https://i.pravatar.cc/100?img=11" },
    { id: 2, name: "sravani", img: "https://i.pravatar.cc/100?img=5" },
    { id: 3, name: "mahesh", img: "https://i.pravatar.cc/100?img=3" },
    { id: 4, name: "chaitu", img: "https://i.pravatar.cc/100?img=8" },
  ];

  const [activeStory, setActiveStory] = useState<any>(null);
  const [showComments, setShowComments] = useState<number|null>(null);
  const [text, setText] = useState("");

  const addPost = () => {
    if (!newImg) return;
    setPosts([{ id: Date.now(), user: "you", img: newImg, likes: 0, liked: false, comments: [] },...posts]);
    setNewImg(""); setShowAdd(false);
  };  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen relative shadow">

        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
          <h1 className="text-[24px] font-black tracking-tight" style={{fontFamily:"cursive"}}>ChitPix</h1>
          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">FIXED</span>
        </div>

        {tab==="home" && (
          <div className="pb-16">
            <div className="flex gap-4 p-3 overflow-x-auto border-b">
              {stories.map(s=>(
                <div key={s.id} onClick={()=>setActiveStory(s)} className="flex flex-col items-center min-w-[60px] cursor-pointer">
                  <div className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600">
                    <img src={s.img} className="w-full h-full rounded-full border-2 border-white object-cover"/>
                  </div>
                  <span className="text-[11px] mt-1">{s.name}</span>
                </div>
              ))}
            </div>

            {posts.map(p=>(
              <div key={p.id} className="border-b bg-white">
                <div className="flex items-center gap-2 p-3">
                  <img src={`https://i.pravatar.cc/100?img=${p.id+20}`} className="w-8 h
