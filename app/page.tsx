"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const { data: session } = useSession();
  const [tab, setTab] = useState("home");
  const [search, setSearch] = useState("");
  const [posts] = useState<any[]>([]);

  const filtered = posts.filter((p) =>
    p.id?.toString().includes(search)
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Please login bro</p>
      </div>
    );
  }

  const myName = session.user.email?.split("@")[0] || "mahesh";
  const displayName = myName;

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {tab === "home" && (
        <div className="max-w-[1000px] mx-auto">
          <h1 className="p-5 font-bold text-xl">Hi {displayName} bro 👋</h1>
          <p className="p-5">Home content coming...</p>
        </div>
      )}

      {tab === "search" && (
        <div className="max-w-[800px] mx-auto">
          <div className="sticky top-0 bg-white p-3 border-b">
            <div className="flex items-center bg-zinc-100 rounded-full px-4 py-2">
              <span className="mr-2">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="bg-transparent outline-none flex-1"
              />
              {search && <button onClick={() => setSearch("")}>X</button>}
            </div>
          </div>
          <div className="flex gap-2 p-3">
            <span className="bg-black text-white px-3 py-1 rounded-full text-sm">All</span>
            <span className="bg-zinc-100 px-3 py-1 rounded-full text-sm">Posts</span>
            <span className="bg-zinc-100 px-3 py-1 rounded-full text-sm">Users</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(search? filtered : posts).map(p => (
              <img key={p.id} src={p.image_url} className="aspect-square object-cover" alt="" />
            ))}
          </div>
        </div>
      )}

      {tab === "reels" && (<div className="h-[calc(100vh-100px)] flex items-center justify-center">Reels</div>)}
      {tab === "profile" && (<div className="p-5">Profile - {displayName}</div>)}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <button onClick={() => setTab("home")}>🏠</button>
        <button onClick={() => setTab("search")}>🔍</button>
        <button onClick={() => setTab("reels")}>🎬</button>
        <button onClick={() => setTab("profile")}>👤</button>
      </div>
    </div>
  );
}
