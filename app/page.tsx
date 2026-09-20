"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://babhmomckowpzwplxyls.supabase.co","sb_publishable_W2cEY0Nn9bs4ZchKSQRghw_Fw2JKOGh");

export default function Page(){
  const [posts,setPosts]=useState<any[]>([]);
  const [stories,setStories]=useState<any[]>([]);
  const [url,setUrl]=useState("");
  const [open,setOpen]=useState(false);
  const [storyOpen,setStoryOpen]=useState(false);
  const [storyUrl,setStoryUrl]=useState("");
  const [tab,setTab]=useState("home");
  const [liked,setLiked]=useState<string[]>([]);
  const [commentText,setCommentText]=useState<any>({});
  const [comments,setComments]=useState<any>({});
  const [activeStory,setActiveStory]=useState<any>(null);

  const load=async()=>{
    const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false});
    if(data) setPosts(data);
    const {data:s}=await supabase.from("stories").select("*").order("created_at",{ascending:false});
    if(s) setStories(s);
    const {data:c}=await supabase.from("comments").select("*");
    if(c){ const m:any={}; c.forEach((x:any)=>{ if(!m[x.post_id]) m[x.post_id]=[]; m[x.post_id].push(x); }); setComments(m); }
  };
  useEffect(()=>{load();},[]);

  const addPost=async()=>{ if(!url) return; await supabase.from("posts").insert({image_url:url,likes:0}); setUrl(""); setOpen(false); load(); };
  const addStory=async()=>{ if(!storyUrl) return; await supabase.from("stories").insert({image_url:storyUrl}); setStoryUrl(""); setStoryOpen(false); load(); };
  const addComment=async(pid:string)=>{ const t=commentText[pid]; if(!t) return; await supabase.from("comments").insert({post_id:pid,text:t}); setCommentText({...commentText,[pid]:""}); load(); };
  const like=async(id:string,c:number)=>{ if(liked.includes(id)) return; setLiked([...liked,id]); await supabase.from("posts").update({likes:c+1}).eq("id",id); load(); };

  return(
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen pb-[70px] relative border-x">

        {/* HEADER LIKE INSTA */}
        <div className="flex justify-between items-center p-4 sticky top-0 bg-white z-20">
          <button onClick={()=>setOpen(true)} className="text-[32px] font-light">+</button>
          <h1 className="text-[26px] font-['Billabong'] tracking-tight" style={{fontFamily:"cursive"}}>ChitPix ▾</h1>
          <div className="relative text-[26px]">♡<span className="absolute -top-0 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span></div>
        </div>

        {tab==="home" && <>
          {/* STORIES LIKE INSTA */}
          <div className="flex gap-4 px-3 py-2 overflow-x-auto border-b scrollbar-none">
            <div className="flex flex-col items-center min-w-[64px]" onClick={()=>setStoryOpen(true)}>
              <div className="relative">
                <div className="w-[64px] h-[64px] rounded-full bg-black flex items-center justify-center text-white text-xl">M</div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border"><div className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[12px]">+</div></div>
              </div>
              <span className="text-[11px] mt-1">Your story</span>
            </div>
            <div className="flex flex-col items-center min-w-[64px]">
              <div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                <img src="https://i.pravatar.cc/100?img=1" className="w-full h-full rounded-full border-[3px] border-white object-cover"/>
              </div>
              <span className="text-[11px] mt-1">rxtagur</span>
            </div>
            {stories.map(s=>(
              <div key={s.id} className="flex flex-col items-center min-w-[64px]" onClick={()=>setActiveStory(s)}>
                <div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  <img src={s.image_url} className="w-full h-full rounded-full border-[3px] border-white object-cover"/>
                </div>
                <span className="text-[11px] mt-1">user</span>
              </div>
            ))}
          </div>

          {/* POSTS */}
          {posts.map(p=>(
            <div key={p.id} className="border-b">
              <div className="flex justify-between items-center p-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600"><img src={p.image_url} className="w-full h-full rounded-full border-2 border-white object-cover"/></div>
                  <div className="leading-[14px]">
                    <div className="text-[13px] font-bold">mysore__adda</div>
                    <div className="text-[11px]">♫ Haricharan, S. N...</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-gray-100 px-4 py-1.5 rounded-lg text-[13px] font-bold">Follow</button>
                  <span className="text-lg">≡</span>
                </div>
              </div>
              <div className="bg-black">
                <img src={p.image_url} className="w-full aspect-[4/5] object-cover"/>
              </div>
              <div className="p-3">
                <div className="flex gap-4 text-[22px]"> <span onClick={()=>like(p.id,p.likes||0)}>♡</span> <span>💬</span> <span>↗</span> </div>
                <div className="text-[13px] font-bold mt-2">{p.likes||0} likes</div>
                <div className="text-[13px]"><span className="font-bold">mysore__adda</span> మనే జవాబ్దారి ముందే ఈ సౌందర్య ఎల్ల లెక్కకి బరల్ల ✨❤️</div>
                {comments[p.id]?.map((cm:any,i:number)=><div key={i} className="text-[12px]"><b>user</b> {cm.text}</div>)}
                <div className="flex gap-2 mt-2">
                  <input value={commentText[p.id]||""} onChange={e=>setCommentText({...commentText,[p.id]:e.target.value})} placeholder="Add a comment..." className="text-[12px] flex-1 outline-none"/>
                  <button onClick={()=>addComment(p.id)} className="text-blue-500 text-[12px] font-bold">Post</button>
                </div>
              </div>
            </div>
          ))}
        </>}

        {tab==="search" && <div className="p-4 grid grid-cols-3 gap-0.5">{posts.map(p=><img key={p.id} src={p.image_url} className="aspect-square object-cover"/>)}</div>}
        {tab==="reels" && <div className="p-4 text-center font-bold">🎬 Reels coming soon</div>}
        {tab==="profile" && <div className="p-6 text-center"><div className="w-20 h-20 rounded-full bg-black mx-auto text-white flex items-center justify-center">M</div><h2 className="font-bold mt-2">Your Profile</h2><div className="grid grid-cols-3 gap-0.5 mt-4">{posts.map(p=><img key={p.id} src={p.image_url} className="aspect-square"/>)}</div></div>}

        {/* NEW POST MODAL */}
        {open && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"><div className="bg-white rounded-2xl p-5 w-full"><h3 className="font-bold mb-3">New Post</h3><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Image URL https://..." className="w-full border p-3 rounded-xl text-sm"/><button onClick={addPost} className="w-full bg-black text-white py-3 rounded-xl mt-3 font-bold">Post</button><button onClick={()=>setOpen(false)} className="w-full mt-2 text-sm">Cancel</button></div></div>}
        {storyOpen && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"><div className="bg-white rounded-2xl p-5 w-full"><h3 className="font-bold mb-3">Add Story</h3><input value={storyUrl} onChange={e=>setStoryUrl(e.target.value)} placeholder="Story Image URL" className="w-full border p-3 rounded-xl text-sm"/><button onClick={addStory} className="w-full bg-black text-white py-3 rounded-xl mt-3 font-bold">Add</button><button onClick={()=>setStoryOpen(false)} className="w-full mt-2 text-sm">Cancel</button></div></div>}
        {activeStory && <div onClick={()=>setActiveStory(null)} className="fixed inset-0 bg-black z-[100] flex items-center justify-center"><img src={activeStory.image_url} className="max-h-screen"/></div>}

        {/* BOTTOM NAV LIKE INSTA */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t flex justify-between px-6 py-3 text-[24px] z-30">
          <button onClick={()=>setTab("home")} className={tab==="home"?"font-bold":""}>⌂</button>
          <button onClick={()=>setTab("search")}>◎</button>
          <button onClick={()=>setTab("reels")} className="text-[20px]">▷</button>
          <button onClick={()=>setTab("search")}>🔍</button>
          <button onClick={()=>setTab("profile")}><div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center">M</div></button>
        </div>
      </div>
    </div>
  )
        }
