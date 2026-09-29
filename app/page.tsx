"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("home");
  const [profilePic, setProfilePic] = useState("");

  // Load posts from Supabase
  useEffect(() => {
    const load = async () => {
      const savedPic = localStorage.getItem("chitpix_profile");
      if (savedPic) setProfilePic(savedPic);

      const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (data) setPosts(data);
    };
    load();
  }, []);

  // Photo upload -> Supabase lo permanent save
  const uploadPost = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `post_${Date.now()}.png`;
    const { error } = await supabase.storage.from("posts").upload(fileName, file);
    if (error) { alert("Upload failed: " + error.message); return; }

    const { data: { publicUrl } } = supabase.storage.from("posts").getPublicUrl(fileName);

    const { data, error: dbError } = await supabase.from("posts").insert({
      image_url: publicUrl,
      caption: "My new post ❤️ #chitpix",
      username: "aesthetic_vibes"
    }).select().single();

    if (!dbError && data) setPosts([data,...posts]);
  };

  const filteredPosts = posts.filter(p =>
    p.caption?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-black text-white min-h-screen flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold">ChitPix</h1>
          <label className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            +<input type="file" hidden accept="image/*" onChange={uploadPost} />
          </label>
        </div>

        {/* SEARCH BAR - Idi neeku kavali */}
        {tab === "search" && (
          <div className="p-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users, captions..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm outline-none"
            />
          </div>
        )}

        {/* HOME FEED */}
        {tab === "home" && (
          <>
            <div className="flex gap-3 p-3 overflow-x-auto border-b border-zinc-800">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-white p-1">
                  <img src={profilePic || "https://i.pravatar.cc/100"} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-[10px] mt-1">Your Story</span>
              </div>
              {["aestheti", "travel", "food_lov"].map(s => (
                <div key={s} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-sm">{s[0]}</div>
                  </div>
                  <span className="text-[10px] mt-1">{s}</span>
                </div>
              ))}
            </div>

            <div className="flex-1">
              {filteredPosts.length === 0? (
                <div className="text-center py-20 text-zinc-500">
                  <p>No posts yet.</p>
                  <label className="mt-3 inline-block bg-white text-black px-4 py-2 rounded-full text-sm cursor-pointer">
                    Upload First Photo<input type="file" hidden accept="image/*" onChange={uploadPost} />
                  </label>
                </div>
              ) : filteredPosts.map((post) => (
                <div key={post.id} className="border-b border-zinc-800">
                  <div className="flex items-center gap-2 p-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-700" />
                    <span className="text-sm font-semibold">@{post.username}</span>
                  </div>
                  <img src={post.image_url} className="w-full aspect-square object-cover" />
                  <div className="p-3 flex gap-4 text-sm">❤️ 12.4K 💬 1 ✈️ Share</div>
                  <div className="px-3 pb-3 text-sm">{post.caption}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "search" && (
          <div className="grid grid-cols-3 gap-[2px] p-[2px]">
            {filteredPosts.map(p => (
              <img key={p.id} src={p.image_url} className="aspect-square object-cover" />
            ))}
          </div>
        )}

        {/* BOTTOM NAV */}
        <div className="sticky bottom-0 bg-black border-t border-zinc-800 flex justify-around py-3">
          <button onClick={() => setTab("home")}>🏠</button>
          <button onClick={() => setTab("search")}>🔍</button>
          <label className="cursor-pointer">🎬<input type="file" hidden accept="image/*" onChange={uploadPost} /></label>
          <button>❤️</button>
          <button><div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs">M</div></button>
        </div>
      </div>
    </div>
  );
}
