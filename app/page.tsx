"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://babhmomckowpzwplxyls.supabase.co","sb_publishable_W2cEY0Nn9bs4ZchKSQRghw_Fw2JKOGh");

export default function Page(){
  const [posts,setPosts]=useState<any[]>([]);const [stories,setStories]=useState<any[]>([]);const [url,setUrl]=useState("");const [open,setOpen]=useState(false);const [storyOpen,setStoryOpen]=useState(false);const [storyUrl,setStoryUrl]=useState("");const [tab,setTab]=useState("home");const [search,setSearch]=useState("");const [liked,setLiked]=useState<string[]>([]);const [commentText,setCommentText]=useState<{[k:string]:string}>({});const [comments,setComments]=useState<{[k:string]:any[]}>({});const [activeStory,setActiveStory]=useState<any>(null);

  const load=async()=>{
    const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}); if(data) setPosts(data);
    const {data:s}=await supabase.from("stories").select("*").order("created_at",{ascending:false}); if(s) setStories(s);
    const {data:c}=await supabase.from("comments").select("*").order("created_at",{ascending:true});
    if(c){ const map:any={}; c.forEach((x:any)=>{ if(!map[x.post_id]) map[x.post_id]=[]; map[x.post_id].push(x); }); setComments(map); }
  };
  useEffect(()=>{load();},[]);

  const addPost=async()=>{if(!url) return; await supabase.from("posts").insert({image_url:url,likes:0}); setUrl(""); setOpen(false); load();};
  const addStory=async()=>{if(!storyUrl) return; await supabase.from("stories").insert({image_url:storyUrl}); setStoryUrl(""); setStoryOpen(false); load();};
  const addComment=async(pid:string)=>{const t=commentText[pid]; if(!t) return; await supabase.from("comments").insert({post_id:pid,text:t}); setCommentText({...commentText,[pid]:""}); load();};
  const like=async(id:string,c:number)=>{if(liked.includes(id))return; setLiked([...liked,id]); await supabase.from("posts").update({likes:c+1}).eq("id",id); load();};
  const del=async(id:string)=>{if(!confirm("Delete?"))return; await supabase.from("posts").delete().eq("id",id); load();};

  const filtered=posts.filter(p=>p.image_url.toLowerCase().includes(search.toLowerCase()));

  return(<div className="min-h-screen bg-black flex justify-center"><div className="w-full max-w-[430px] bg-white min-h-screen pb-[80px] relative">
    <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10"><h1 className="font-black text-[22px]">ChitPix</h1><span className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full font-bold">{posts.length} POSTS</span></div>

    {tab==="home"&&<div>
      {/* STORIES */}
      <div className="flex gap-3 p-3 overflow-x-auto border-b">
        <div onClick={()=>setStoryOpen(true)} className="flex flex-col items-center min-w-[60px]"><div className="w-[60px] h-[60px] rounded-full bg-gray-100 border-2 border-dashed flex items-center justify-center text-2xl">+</div><span className="text-[10px] mt-1">Your Story</span></div>
        {stories.map(st=><div key={st.id} onClick={()=>setActiveStory(st)} className="flex flex-col items-center min-w-[60px]"><div className="w-[60px] h-[60px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={st.image_url} className="w-full h-full rounded-full object-cover border-2 border-white"/></div><span className="text-[10px] mt-1">story</span></div>)}
      </div>
      {/* POSTS */}
      {posts.map(p=>(<div key={p.id} className="border-b"><div className="p-3 flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full"></div><span className="text-[13px] font-bold">you</span></div><button onClick={()=>del(p.id)} className="text-[9px] text-gray-400">DELETE</button></div><img src={p.image_url} className="w-full aspect-square object-cover"/><div className="p-3"><div className="flex gap-3"><button onClick={()=>like(p.id,p.likes||0)}>❤️ {p.likes||0}</button><span className="text-sm">💬 {comments[p.id]?.length||0}</span></div><div className="mt-2 space-y-1">{comments[p.id]?.map((cm:any)=><div key={cm.id} className="text-[13px]"><b>user: </b>{cm.text}</div>)}</div><div className="flex gap-2 mt-2"><input value={commentText[p.id]||""} onChange={e=>setCommentText({...commentText,[p.id]:e.target.value})} placeholder="Add a comment..." className="flex-1 border p-2 rounded-full text-[12px]"/><button onClick={()=>addComment(p.id)} className="text-blue-600 text-[12px] font-bold">Post</button></div></div></div>))}
    </div>}

    {tab==="search"&&<div className="p-4"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full border-2 border-black p-3 rounded-xl"/><div className="grid grid-cols-3 gap-1 mt-4">{filtered.map(p=><img key={p.id} src={p.image_url} className="aspect-square object-cover"/>)}</div></div>}
    {tab==="reels"&&<div className="p-4"><h2 className="font-black text-center mt-10">🎬 Reels</h2><div className="mt-6 space-y-4">{posts.map(p=><div key={p.id} className="rounded-[20px] overflow-hidden"><img src={p.image_url} className="w-full aspect-[9/16] object-cover"/></div>)}</div></div>}
    {tab==="profile"&&<div className="p-6 text-center"><div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full mx-auto"></div><h2 className="font-black mt-3">your_profile</h2><p className="text-sm text-gray-500">{posts.length} posts | {stories.length} stories</p><div className="grid grid-cols-3 gap-1 mt-6">{posts.map(p=><img key={p.id} src={p.image_url} className="aspect-square object-cover"/>)}</div></div>}

    {open&&<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5"><div className="bg-white rounded-[24px] p-6 w-full"><h2 className="font-black mb-4">New Post 🔥</h2><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." className="w-full border border-black p-3.5 rounded-xl"/><button onClick={addPost} className="w-full bg-black text-white py-3.5 rounded-xl mt-4 font-black">POST NOW</button><button onClick={()=>setOpen(false)} className="w-full mt-3 text-sm">Cancel</button></div></div>}
    {storyOpen&&<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5"><div className="bg-white rounded-[24px] p-6 w-full"><h2 className="font-black mb-4">Add Story ✨</h2><input value={storyUrl} onChange={e=>setStoryUrl(e.target.value)} placeholder="https://..." className="w-full border border-black p-3.5 rounded-xl"/><button onClick={addStory} className="w-full bg-black text-white py-3.5 rounded-xl mt-4 font-black">ADD STORY</button><button onClick={()=>setStoryOpen(false)} className="w-full mt-3 text-sm">Cancel</button></div></div>}
    {activeStory&&<div onClick={()=>setActiveStory(null)} className="fixed inset-0 bg-black z-[60] flex items-center justify-center p-4"><img src={activeStory.image_url} className="max-h-[90vh] rounded-[20px]"/><div className="absolute top-5 right-5 text-white text-xl">✕</div></div>}

    <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t flex justify-around items-center py-2.5 z-20">
      <button onClick={()=>setTab("home")} className={`text-2xl p-2 ${tab!=="home"&&"opacity-30"}`}>🏠</button><button onClick={()=>setTab("search")} className={`text-2xl p-2 ${tab!=="search"&&"opacity-30"}`}>🔍</button><button onClick={()=>setOpen(true)} className="bg-black text-white w-12 h-12 rounded-full text-2xl">+</button><button onClick={()=>setTab("reels")} className={`text-2xl p-2 ${tab!=="reels"&&"opacity-30"}`}>🎬</button><button onClick={()=>setTab("profile")} className={`text-2xl p-2 ${tab!=="profile"&&"opacity-30"}`}>👤</button>
    </div>
  </div></div>);}
