"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChitPix() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  return (
    <div className="min-h-screen bg-black text-white max-w-[500px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-800">
        <h1 className="text-[22px] font-bold tracking-tight">ChitPix</h1>
        <Send size={28} className="w-7 h-7" />
      </div>

      {/* Posts */}
      <div>
        {posts.map((post) => (
          <div key={post.id} className="border-b border-zinc-800">
            <img src={post.image_url} alt="" className="w-full aspect-square object-cover" />

            {/* ICONS - IKKADA BIG CHESA */}
            <div className="flex justify-between p-3">
              <div className="flex gap-4">
                <Heart size={28} className="w-7 h-7 cursor-pointer hover:text-red-500" />
                <MessageCircle size={28} className="w-7 h-7 cursor-pointer" />
                <Send size={28} className="w-7 h-7 cursor-pointer" />
              </div>
              <Bookmark size={28} className="w-7 h-7 cursor-pointer" />
            </div>

            <div className="px-3 pb-3">
              <p className="text-[15px]">{post.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
