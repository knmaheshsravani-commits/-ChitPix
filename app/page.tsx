"use client";
import { useState, useRef } from "react";

type User = { id: string; name: string; username: string; avatar: string; bio: string };
type Comment = { id: string; user: string; text: string };
type Post = { id: string; user: User; image: string; caption: string; likes: number; liked: boolean; saved: boolean; comments: Comment[] };

const CURRENT_USER: User = { id: "me", name: "You", username: "chitpix_user", avatar: "https://i.pravatar.cc/150?img=12", bio: "ChitPix Creator 🚀" };
const USERS: User[] = [
  CURRENT_USER,
  { id: "1", name: "Siri Film Meter", username: "siri.film.meter", avatar: "https://i.pravatar.cc/150?img=32", bio: "Movies" },
  { id: "2", name: "Tharun", username: "tharun_hero", avatar: "https://i.pravatar.cc/150?img=15", bio: "Actor" },
  { id: "3", name: "Guruji", username: "guruji_comedy", avatar: "https://i.pravatar.cc/150?img=8", bio: "Comedy king" },
];

const INITIAL_POSTS: Post[] = [
  { id: "p1", user: USERS[1], image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600", caption: "Guruji + Tharun is all time classic Combo 😂 What's ur fav?", likes: 107000, liked: false, saved: false, comments: [{id:"c1", user:"tharun_hero", text:"Super combo!"}] },
  { id: "p2", user: USERS[2], image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600", caption: "One idea became software used by Olympians.", likes: 2450, liked: false, saved: false, comments: [] },
];

export default function ChitPixFull() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [view, setView] = useState("home");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [search, setSearch] = useState("");
  const [dmOpen, setDmOpen] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editBio, setEditBio] = useState(CURRENT_USER.bio);
  const [isAdmin, setIsAdmin] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = posts.filter(p =>
    p.caption.toLowerCase().includes(search.toLowerCase()) ||
    p.user.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes-1 : p.likes+1} : p));
  };

  const toggleSave = (id: string) => {
    setPosts(posts.map(p => p.id === id? {...p, saved:!p.saved} : p));
  };

  const addComment = (postId: string) => {
    if(!newComment.trim()) return;
    setPosts(posts.map(p => p.id === postId? {...p, comments: [...p.comments, {id: Date.now().toString(), user: CURRENT_USER.username, text: newComment}]} : p));
    setNewComment("");
  };

  const handleGalleryOpen = () => fileInputRef.current?.click();
  const handleFileSelect = (e: any) => {
    const file = e.target.files[0];
    if(file){
      const url = URL.createObjectURL(file);
      const newPost: Post = { id: Date.now().toString(), user: CURRENT_USER, image: url, caption: "New upload from gallery 🔥", likes: 0, liked: false, saved: false, comments: [] };
      setPosts([newPost,...posts]);
    }
  };

  const sharePost = (post: Post, type: string) => {
    const url = `https://chitpix.vercel.app/post/${post.id}`;
    if(type==="copy"){ navigator.clipboard.writeText(url); alert("Link copied!"); }
    if(type==="whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
    if(type==="telegram") window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}`);
  };

  if(!loggedIn){
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-sm text-center">
          <h1 className="text-3xl font-black mb-6">ChitPix</h1>
          <button onClick={()=>setLoggedIn(true)} className="w-full bg-black text-white py-3 rounded-xl font-semibold">Login as {CURRENT_USER.username}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex justify-center">
      <div className="w-full max-w-[1300px] bg-white flex min-h-screen relative">

        {/* LEFT SIDEBAR */}
        <div className="w-[240px] border-r p-4 hidden md:flex flex-col gap-2 sticky top-0 h-screen">
          <h1 className="text-2xl font-black mb-6 px-2">ChitPix</h1>
          {[
            {k:"home", l:"🏠 Home"},
            {k:"search", l:"🔍 Search"},
            {k:"reels", l:"▶️ Reels"},
            {k:"profile", l:"👤 Profile"},
            {k:"admin", l:"🛠️ Admin"},
          ].map(i=>(
            <button key={i.k} onClick={()=>setView(i.k)} className={`text-left px-3 py-3 rounded-xl font-medium ${view===i.k? "bg-black text-white" : "hover:bg-zinc-100"}`}>{i.l}</button>
          ))}
          <button onClick={handleGalleryOpen} className="mt-4 bg-gradient-to-tr from-yellow-400 to-pink-600 text-white py-3 rounded-xl font-bold">+ Create (Gallery)</button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
        </div>

        {/* CENTER */}
        <div className="flex-1 max-w-[630px] border-r min-h-screen">
          {/* STORIES */}
          <div className="flex gap-4 p-4 overflow-x-auto border-b">
            {USERS.map(u=>(
              <div key={u.id} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600">
                  <img src={u.avatar} className="w-full h-full rounded-full border-2 border-white object-cover" alt="" />
                </div>
                <span className="text-xs truncate w-14 text-center">{u.username}</span>
              </div>
            ))}
          </div>

          {/* SEARCH BAR - FULL WORKING */}
          {(view==="home" || view==="search") && (
            <div className="p-3 sticky top-0 bg-white z-10 border-b">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search caption, username..." className="w-full bg-zinc-100 px-4 py-2.5 rounded-full outline-none" />
            </div>
          )}

          {/* HOME FEED */}
          {view==="home" && (
            <div>
              {filteredPosts.map(post=>(
                <div key={post.id} className="border-b pb-3">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2"><img src={post.user.avatar} className="w-8 h-8 rounded-full" alt="" /><b className="text-sm">{post.user.username}</b></div>
                    {isAdmin && <button onClick={()=>setPosts(posts.filter(p=>p.id!==post.id))} className="text-xs text-red-500 border px-2 py-1 rounded">Delete (Admin)</button>}
                  </div>
                  <img src={post.image} className="w-full aspect-square object-cover bg-zinc-100" alt="" />
                  <div className="flex justify-between p-3">
                    <div className="flex gap-4">
                      <button onClick={()=>toggleLike(post.id)} className="text-xl">{post.liked? "❤️" : "🤍"} </button>
                      <button onClick={()=>setSelectedPost(post)} className="text-xl">💬</button>
                      <button onClick={()=>setSelectedPost(post)} className="text-xl">✈️</button>
                    </div>
                    <button onClick={()=>toggleSave(post.id)} className="text-xl">{post.saved? "🔖 Saved" : "🔖"}</button>
                  </div>
                  <div className="px-3 text-sm"><b>{post.likes.toLocaleString()} likes</b><p><b>{post.user.username}</b> {post.caption}</p><button onClick={()=>setSelectedPost(post)} className="text-zinc-500">View {post.comments.length} comments</button></div>
                  {/* SHARE OPTIONS */}
                  <div className="flex gap-2 px-3 mt-2">
                    <button onClick={()=>sharePost(post, "whatsapp")} className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">WhatsApp</button>
                    <button onClick={()=>sharePost(post, "telegram")} className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">Telegram</button>
                    <button onClick={()=>sharePost(post, "copy")} className="text-xs bg-zinc-800 text-white px-3 py-1 rounded-full">Copy Link</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REELS */}
          {view==="reels" && (
            <div className="grid grid-cols-2 gap-1 p-1">
              {posts.map(post=>(
                <div key={post.id} className="relative group">
                  <img src={post.image} className="w-full h-[400px] object-cover" alt="" />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                    <div className="flex gap-3 text-sm">
                      <button onClick={()=>toggleLike(post.id)}>❤️ {post.likes}</button>
                      <button onClick={()=>setSelectedPost(post)}>💬 {post.comments.length}</button>
                      <button onClick={()=>toggleSave(post.id)}>{post.saved? "💾 Saved" : "💾 Save"}</button>
                      <button onClick={()=>sharePost(post, "whatsapp")}>✈️ Share</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROFILE */}
          {view==="profile" && (
            <div className="p-6">
              <div className="flex gap-6">
                <img src={CURRENT_USER.avatar} className="w-20 h-20 rounded-full" alt="" />
                <div>
                  <h2 className="font-bold text-xl">{CURRENT_USER.username}</h2>
                  <input value={editBio} onChange={e=>setEditBio(e.target.value)} className="border px-2 py-1 rounded text-sm mt-2 w-full" />
                  <button onClick={()=>alert("Profile Updated: "+editBio)} className="mt-2 bg-black text-white px-4 py-1 rounded-full text-sm">Edit Profile</button>
                </div>
              </div>
              <h3 className="font-bold mt-8 mb-3">My Photos ({posts.filter(p=>p.user.id==="me").length})</h3>
              <div className="grid grid-cols-3 gap-1">
                {posts.filter(p=>p.user.id==="me").map(p=><img key={p.id} src={p.image} className="aspect-square object-cover" alt="" />)}
              </div>
            </div>
          )}

          {/* ADMIN */}
          {view==="admin" && (
            <div className="p-6">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <p className="text-sm text-zinc-500 mb-4">All posts list - you can delete any post</p>
              {posts.map(p=>(
                <div key={p.id} className="flex items-center justify-between border p-2 rounded mb-2">
                  <div className="flex gap-2 items-center"><img src={p.image} className="w-10 h-10 rounded object-cover" alt="" /><span className="text-sm">{p.user.username}: {p.caption.slice(0,20)}</span></div>
                  <button onClick={()=>setPosts(posts.filter(x=>x.id!==p.id))} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE - DM + LOGIN SYSTEM */}
        <div className={`${dmOpen? "w-[320px]" : "w-0"} hidden lg:block border-l sticky top-0 h-screen transition-all overflow-hidden`}>
          <div className="p-4 border-b flex justify-between">
            <b>Messages / DM</b>
            <button onClick={()=>setDmOpen(false)}>✕</button>
          </div>
          <div className="p-2">
            {USERS.slice(1).map(u=>(
              <div key={u.id} className="flex gap-3 p-3 hover:bg-zinc-100 rounded-xl cursor-pointer">
                <img src={u.avatar} className="w-10 h-10 rounded-full" alt="" />
                <div><p className="font-semibold text-sm">{u.username}</p><p className="text-xs text-zinc-500">Active now</p></div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0
