"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://babhmomckowpzwplxyls.supabase.co",
  "sb_publishable_W2cEY0Nn9bs4ZchKSQRghw_Fw2JKOGh"
);

export default function Page(){
  const [posts,setPosts]=useState<any[]>([]);
  const [text,setText]=useState("");
  const [url,setUrl]=useState("");
  const [tab,setTab]=useState("home");

  const load=async()=>{
    const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false});
    if(data) setPosts(data);
  };
  useEffect(()=>{load();},[]);

  const upload=async(e:any)=>{
    const f=e.target.files[0]; if(!f) return;
    const name=Date.now()+"_"+f.name;
    await supabase.storage.from("posts").upload(name,f);
    const {data}=supabase.storage.from("posts").getPublicUrl(name);
    setUrl(data.publicUrl);
  };

  const addPost=async()=>{
    if(!url) return alert("Photo choose chey beo!");
    await supabase.from("posts").insert({image_url:url, caption:text || "Chitpix app use me all friends"});
    setUrl(""); setText(""); load();
  };

  return(
    <div className="min-h-screen bg-black text-white">
      <div className="w-full bg-black min-h-screen pb-[70px]">

        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-20 border-b border-zinc-800">
          <h1 className="text-[28px] font-black tracking-tight">ChitPix</h1>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-zinc-300">@Mahesh-07</span>
            <button className="bg-red-600 px-4 py-1.5 rounded-full text-[13px] font-bold">Logout</button>
          </div>
        </div>

        <div className="flex gap-4 p-4 overflow-x-auto border-b border-zinc-800 scrollbar-hide">
          <div className="flex flex-col items-center gap-1 min-w-[62px]">
            <div className="w-[62px] h-[62px] rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center text-[28px]">+</div>
            <span className="text-[11px]">Your Story</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[62px]">
            <div className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
              <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center font-bold">M</div>
            </div>
            <span className="text-[11px]">mahesh-07</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[62px]">
            <div className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200" className="w-full h-full rounded-full border-2 border-black object-cover"/>
            </div>
            <span className="text-[11px]">sravani</span>
          </div>
        </div>        {tab==="home" && <>
          <div className="m-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3.5 text-[14px] outline-none placeholder:text-zinc-500"/>
            <div className="flex gap-3 mt-3">
              <label className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3.5 text-center text-[13px] cursor-pointer">📸 Choose Photo<input type="file" className="hidden" onChange={upload}/></label>
              <button onClick={addPost} className="flex-1 bg-blue-600 rounded-xl font-bold text-[14px]">Post</button>
            </div>
            {url && <img src={url} className="mt-3 w-full aspect-[4/5] object-cover bg-black"/>}
          </div>

          {posts.map(p=>(
            <div key={p.id} className="border-b border-zinc-800">
              <div className="p-3 flex items-center gap-2 font-bold text-[14px]">M <span className="text-[13px]">Mahesh-07</span></div>
              <img src={p.image_url} className="w-full aspect-[4/5] object-cover bg-zinc-900"/>
              <div className="flex justify-between items-center p-3 text-[26px]">
                <div className="flex gap-4"><span>♡</span><span>💬</span><span>✈</span></div>
                <span>🔖</span>
              </div>
              <div className="px-3 pb-4 text-[14px]"><span className="font-bold mr-2">You</span>{p.caption}</div>
            </div>
          ))}
        </>}

        {tab==="search" && <div className="p-1 grid grid-cols-3 gap-[2px]">{posts.map(p=><img key={p.id} src={p.image_url} className="aspect-square object-cover"/>)}</div>}
        {tab==="reels" && <div className="p-20 text-center text-zinc-500">🎬 Reels coming soon beo!</div>}
        {tab==="profile" && <div className="p-10 text-center"><div className="w-20 h-20 rounded-full bg-zinc-800 mx-auto flex items-center justify-center text-2xl font-bold">M</div><h2 className="mt-3 font-bold">@Mahesh-07</h2><p className="text-zinc-500 text-[13px] mt-1">{posts.length} Posts</p></div>}

        <div className="fixed bottom-0 w-full bg-black border-t border-zinc-800 flex justify-around py-3.5 text-[24px] z-30">
          <button onClick={()=>setTab("home")} className={tab==="home"?"":"opacity-50"}>🏠</button>
          <button onClick={()=>setTab("search")} className={tab==="search"?"":"opacity-50"}>🔍</button>
          <button onClick={()=>setTab("reels")} className={tab==="reels"?"":"opacity-50"}>🎬</button>
          <button onClick={()=>setTab("profile")} className={tab==="profile"?"":"opacity-50"}>👤</button>
        </div>

      </div>
    </div>
  )
}
