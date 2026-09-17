"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChitPix() {
  const [posts, setPosts] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  const handlePost = async () => {
    if (!file) return alert("Photo select chey bro!");
    setLoading(true);
    const fileName = Date.now() + "-" + file.name;
    const { error: uploadError } = await supabase.storage.from("posts").upload(fileName, file);
    if (uploadError) { alert(uploadError.message); setLoading(false); return; }
    const { data } = supabase.storage.from("posts").getPublicUrl(fileName);
    await supabase.from("posts").insert({ image_url: data.publicUrl, caption });
    setCaption(""); setFile(null); setLoading(false); fetchPosts();
  };

  return (
    <div className="min-h-screen bg-black text-white max-w-[500px] mx-auto border-x border-zinc-800">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <h1 className="text-[22px] font-bold">ChitPix</h1>
        <div className="flex gap-2">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-[10px] w-[120px]" />
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption..." className="bg-zinc-900 px-2 py-1 rounded text-[12px] w-[100px] outline-none" />
          <button onClick={handlePost} disabled={loading} className="bg-orange-500 text-black px-3 py-1 rounded-full text-[12px] font-bold">{loading? "..." : "Post"}</button>
        </div>
      </div>

      {posts.length === 0? (
        <div className="p-20 text-center text-zinc-500">No posts yet. First photo nuvve pettu bro!</div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border-b border-zinc-800 pb-2">
            <img src={post.image_url} alt="" className="w-full aspect-square object-cover bg-zinc-900" />

            {/* ICONS - 40px ULTRA MASS */}
            <div className="flex justify-between items-center p-4">
              <div className="flex gap-6 items-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </div>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </div>

            <div className="px-4 pb-2">
              <p className="text-[15px]"><span className="font-bold">You </span>{post.caption}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
      }
