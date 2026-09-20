"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://babhmomckowpzwplxyls.supabase.co","sb_publishable_W2cEY0Nn9bs4ZchKSQRghw_Fw2JKOGh");

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

  const addPost=async()=>{
    if(!url) return;
    await supabase.from("posts").insert({image_url:url, caption:text, likes:0});
    setUrl(""); setText(""); load();
  };

  return(
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[430px] bg-black min-h-screen pb-[70px] border-x border-zinc-800">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-20 border-b border-zinc-800">
          <h1 className="text-[26px] font-bold">ChitPix</h1>
          <div className="flex items-center gap-3">
            <span className="text-zinc-300">@Mahesh-07</span>
            <button className="bg-red-600 px-4 py-1.5 rounded-full text-[14px]">Logout</button>
          </div>
        </div>

        {/* STORIES - SAME AS YOUR OLD SCREENSHOT */}
        <div className="flex gap-4 p-4 overflow-x-auto border-b border-zinc-800">
          <div className="flex flex-col items-center gap-1 min-w-[66px]">
            <div className="w-[66px] h-[66px] rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center text-[28px]">+</div>
            <span className="text-[12px]">Your Story</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[66px]">
            <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
              <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200" className="w-full h-full rounded-full border-2 border-black object-cover"/>
            </div>
            <span className="text-[12px]">mahesh-07</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[66px]">
            <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200" className="w-full h-full rounded-full border-2 border-black object-cover"/>
            </div>
            <span className="text-[12px]">sravani</span>
          </div>
        </div>

        {tab==="home" && <>
          {/* CREATE POST BOX */}
          <div className="m-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-700">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-zinc-800 border border-zinc-600 rounded-xl p-3 text-[14px] outline-none"/>
            <div className="flex gap-3 mt-3">
              <label className="flex-1 bg-zinc-700 rounded-xl p-3 text-center cursor-pointer">
                <span>📸 Choose Photo</span>
                <input type="file" className="hidden" onChange={async(e:any)=>{
                  const f=e.target.files[0]; if(!f) return;
                  const name=Date.now()+"_"+f.name;
                  await supabase.storage.from("posts").upload(name,f);
                  const {data}=supabase.storage.from("posts").getPublicUrl(name);
                  setUrl(data.publicUrl);
                }}/>
              </label>
              <button onClick={addPost} className="flex-1 bg-blue-500 rounded-xl font-bold">Post</button>
            </div>
            {url && <img src={url} className="mt-3 rounded-xl h-40 w-full object-cover"/>}
          </div>

          {/* POSTS */}
          {posts.map(p=>(
            <div key={p.id} className="m-3 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700">
              <div className="p-3 font-bold">@{p.caption? "Mahesh-07" : "Mahesh-07"}</div>
              <img src={p.image_url} className="w-full"/>
            </div>
          ))}
        </>}

        {tab==="search" && <div className="p-3 grid grid-cols-3 gap-1">{posts.map(p=><img key={p.id} src={p.image_url} className="aspect-square object-cover rounded"/>)}</div>}
        {tab==="reels" && <div className="p-10 text-center text-zinc-400">🎬 Reels coming soon</div>}
        {tab==="profile" && <div className="p-10 text-center"><div className="w-24 h-24 rounded-full bg-zinc-700 mx-auto flex items-center justify-center text-3xl">M</div><h2 className="mt-3 font-bold">@Mahesh-07</h2></div>}

        {/* BOTTOM NAV SAME AS OLD */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-black border-t border-zinc-800 flex justify-around py-3 text-[26px] z-30">
          <button onClick={()=>setTab("home")} className={tab==="home"?"opacity-100":"opacity-60"}>🏠</button>
          <button onClick={()=>setTab("search")} className={tab==="search"?"opacity-100":"opacity-60"}>🔍</button>
          <button onClick={()=>setTab("reels")} className={tab==="reels"?"opacity-100":"opacity-60"}>🎬</button>
          <button onClick={()=>setTab("profile")} className={tab==="profile"?"opacity-100":"opacity-60"}>👤</button>
        </div>
      </div>
    </div>
  )
}
