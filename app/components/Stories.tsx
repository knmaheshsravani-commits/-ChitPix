"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

type Story = { id: string; username: string; image_url: string; created_at: string; };

export default function Stories() {
  const users = ["You","arjun","sweety","rahul","priya","vizag","hyd","ani","tej"];
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [viewed, setViewed] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStories = async () => {
    const { data } = await supabase.from("stories").select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false });
    if (data) setStories(data);
  };
  useEffect(() => { fetchStories(); }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const idx = users.indexOf(selectedUser);
          setViewed(prev => prev.includes(selectedUser)? prev : [...prev, selectedUser]);
          setSelectedUser(idx < users.length-1? users[idx+1] : null);
          return 0;
        }
        return p + 1.5;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fileName = `story_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("stories").upload(fileName, file);
    if (error) { alert("Storage lo 'stories' public bucket create chey bro!"); return; }
    const { data } = supabase.storage.from("stories").getPublicUrl(fileName);
    await supabase.from("stories").insert({ username: "You", image_url: data.publicUrl });
    fetchStories(); alert("Story added! 24h lo auto delete ✅");
  };

  const hasStory = (u:string) => stories.some(s=>s.username===u);
  const isViewed = (u:string) => viewed.includes(u);

  return (
    <>
      <div style={{ display: "flex", gap: "14px", padding: "12px", overflowX: "auto", background: "white", borderBottom: "1px solid #efefef" }}>
        {users.map(u => (
          <div key={u} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "64px", cursor: "pointer" }} onClick={() => u==="You"? fileRef.current?.click() : setSelectedUser(u)}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", padding: "2.5px", background: u==="You"? "#dbdbdb" : hasStory(u)? (isViewed(u)? "#dbdbdb" : "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)") : "#eee" }}>
              <div style={{ width: "100%", height: "100%", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{u[0].toUpperCase()}</div>
            </div>
            <span style={{ fontSize: "11px" }}>{u}</span>
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "black", zIndex: 99999, display: "flex", flexDirection: "column" }}>
          <div style={{ height: "3px", background: "#ffffff40", margin: "8px", borderRadius: "3px" }}><div style={{ width: `${progress}%`, height: "100%", background: "white", borderRadius: "3px" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", color: "white" }}><div style={{ display: "flex", gap: "8px", alignItems: "center" }}><div style={{ width: "32px", height: "32px", background: "white", borderRadius: "50%", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{selectedUser[0]}</div><b>{selectedUser}</b></div><span onClick={() => setSelectedUser(null)} style={{ fontSize: "28px", cursor: "pointer" }}>×</span></div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedUser(null)}><img src={stories.find(s => s.username===selectedUser)?.image_url || `https://picsum.photos/seed/${selectedUser}/600/900`} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }} /></div>
        </div>
      )}
    </>
  );
}
