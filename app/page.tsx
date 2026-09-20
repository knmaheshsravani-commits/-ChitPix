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
  const [liked, setLiked] = useState<string[]>([]);
  const [tab, setTab] = useState("home");
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };
  useEffect(() => { load(); }, []);

  const addPost = async () => {
    if (!url) return;
    await supabase.from("posts").insert({ image_url: url, likes: 0 });
    setUrl(""); setOpen(false); load();
  };
  const like = async (id: string, cur: number) => {
    if (liked.includes(id)) return;
    setLiked([...liked, id]);
    await supabase.from("posts").update({ likes: cur + 1 }).eq("id", id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete cheyala beo?")) return;
    await supabase.from("posts").delete().eq("id", id);
    load();
  };

  const filtered = posts.filter(p => p.image_url.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen pb-[70px] relative">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h1 className="font-black text-[22px]">ChitPix</h1>
          <span className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full font-bold">{posts.length} POSTS</span>
        </div>

        {tab === "home" && (
          <div>
            {posts.map(p => (
              <div key={p.id} className="border-b border-gray-100">
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full"></div>
                    <span className="text-[13px] font-bold">you • {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => del(p.id)} className="text-[10px] text-gray-400">DELETE</button>
                </div>
                <img src={p.image_url} className="w-full aspect-square object-cover bg-gray-50" />
                <div className="p-3 flex gap-2 items-center">
                  <button onClick={() => like(p.id, p.likes || 0)} className="text-xl">❤️</button>
                  <span className="text-[13px] font-bold">{p.likes || 0} likes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "search" && (
          <div className="p-4">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search posts..." className="w-full border border-black p-3 rounded-xl text-sm" />
            <div className="grid grid-cols-3 gap-1 mt-4">
              {filtered.map(p=> <img key={p.id} src={p.image_url} className="aspect-square object-cover" />)}
            </div>
          </div>
        )}

        {tab === "reels" && (
          <div className="p-4 text-center mt-10">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="font-black">Reels Coming Soon!</h2>
            <p className="text-sm text-gray-500 mt-2">Videos feature ni next update lo add cheddam beo!</p>
            <div className="mt-6 space-y-4">
              {posts.map(p=> (
                <div key={p.id} className="rounded-[20px] overflow-hidden bg-black">
                  <img src={p.image_url} className="w-full aspect-[9/16] object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full mx-auto mb-3"></div>
            <h2 className="font-black text-xl">your_profile</h2>
            <p className="text-sm text-gray-500">{posts.length} posts • 0 followers • 0 following</p>
            <div className="grid grid-cols-3 gap-1 mt-6">
              {posts.map(p=> <img key={p.id} src={p.image_url} className="aspect-square object-cover" />)}
            </div>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-[24px] p-6 w-full">
              <h2 className="font-black text-lg mb-4">New Post 🔥</h2>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full border border-black p-3.5 rounded-xl text-sm outline-none" />
              <button onClick={addPost} className="w-full bg-black text-white py-3.5 rounded-xl mt-4 font-black">POST NOW</button>
              <button onClick={() => setOpen(false)} className="w-full mt-3 text-sm text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        {/* Instagram Bottom Nav */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t flex justify-around items-center py-2.5 z-20">
          <button onClick={()=>setTab("home")} className={`text-xl p-2 ${tab==="home"?"":"opacity-40"}`}>🏠</button>
          <button onClick={()=>setTab("search")} className={`text-xl p-2 ${tab==="search"?"":"opacity-40"}`}>🔍</button>
          <button onClick={()=>setOpen(true)} className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">+</button>
          <button onClick={()=>setTab("reels")} className={`text-xl p-2 ${tab==="reels"?"":"opacity-40"}`}>🎬</button>
          <button onClick={()=>setTab("profile")} className={`text-xl p-2 ${tab==="profile"?"":"opacity-40"}`}>👤</button>
        </div>
      </div>
    </div>
  );
}
