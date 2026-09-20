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

  const like = async (id: string, currentLikes: number) => {
    if (liked.includes(id)) return;
    setLiked([...liked, id]);
    await supabase.from("posts").update({ likes: currentLikes + 1 }).eq("id", id);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete cheyala beo?")) return;
    await supabase.from("posts").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen pb-20 relative">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h1 className="font-black text-[22px] tracking-tight">ChitPix</h1>
          <span className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full font-bold">{posts.length} POSTS • LIVE</span>
        </div>

        {/* Posts */}
        {posts.map(p => (
          <div key={p.id} className="border-b border-gray-100">
            <div className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full"></div>
                <span className="text-[13px] font-bold">you • {new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              <button onClick={() => del(p.id)} className="text-[11px] text-gray-400">DELETE</button>
            </div>
            <img src={p.image_url} className="w-full aspect-square object-cover bg-gray-50" />
            <div className="p-3 flex gap-4 items-center">
              <button onClick={() => like(p.id, p.likes || 0)} className={`text-xl ${liked.includes(p.id)? '' : 'grayscale'}`}>❤️</button>
              <span className="text-[13px] font-bold">{p.likes || 0} likes</span>
            </div>
          </div>
        ))}

        {posts.length === 0 && <p className="text-center p-20 text-gray-400 text-sm">No posts beo. + tho start chey!</p>}

        {/* Add Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-[24px] p-6 w-full">
              <h2 className="font-black text-lg mb-1">New Post 🔥</h2>
              <p className="text-xs text-gray-500 mb-4">Image link paste chey</p>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full border border-black p-3.5 rounded-xl text-sm outline-none" />
              <button onClick={addPost} className="w-full bg-black text-white py-3.5 rounded-xl mt-4 font-black">POST NOW</button>
              <button onClick={() => setOpen(false)} className="w-full mt-3 text-sm text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t flex justify-between items-center px-6 py-3">
          <span className="text-[11px] font-bold tracking-widest text-gray-500">CHITPIX • MADE BY YOU</span>
          <button onClick={() => setOpen(true)} className="bg-black text-white px-8 py-2.5 rounded-full font-black text-sm">+ NEW POST</button>
        </div>
      </div>
    </div>
  );
}
