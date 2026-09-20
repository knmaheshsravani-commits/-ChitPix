"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://babhmomckowpzwplxyls.supabase.co",
  "sb_publishable_W2cEY0Nn9bs4ZchKSQRghw_Fw2JKOGh"
);

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", {ascending:false});
    if(data) setPosts(data);
  };
  useEffect(()=>{ load(); }, []);

  const addPost = async () => {
    if(!url) return;
    await supabase.from("posts").insert({ image_url: url });
    setUrl(""); setOpen(false); load();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen shadow pb-20">
        <div className="p-4 border-b flex justify-between sticky top-0 bg-white z-10">
          <h1 className="font-black">ChitPix • LIVE</h1>
          <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full">{posts.length} POSTS DB NUNCHI</span>
        </div>

        {posts.map(p=>(
          <div key={p.id} className="border-b">
            <div className="p-3 text-sm font-bold">you • {new Date(p.created_at).toLocaleDateString()}</div>
            <img src={p.image_url} className="w-full aspect-square object-cover bg-gray-100" />
          </div>
        ))}

        {posts.length===0 && <p className="text-center p-10 text-gray-400">DB lo posts levu. + tho add chey!</p>}

        {open && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl p-5 w-full">
              <h2 className="font-bold mb-3">Real DB Post</h2>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https:// image link" className="w-full border p-3 rounded-xl text-sm" />
              <button onClick={addPost} className="w-full bg-black text-white py-3 rounded-xl mt-3 font-bold">Share to Supabase</button>
              <button onClick={()=>setOpen(false)} className="w-full mt-2 text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t flex justify-center py-3">
          <button onClick={()=>setOpen(true)} className="bg-black text-white px-10 py-2.5 rounded-full font-bold">+ NEW POST</button>
        </div>
      </div>
    </div>
  );
}
