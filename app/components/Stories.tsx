"use client";
import { useState, useEffect } from "react";
import { 
  Plus, X, Heart, MessageCircle, Send, Eye, 
  Music, MapPin, Link2, Mic, Video, ShoppingBag, Timer, Crown, 
  Infinity, Sparkles, Repeat2, Users, Bookmark, MoreHorizontal 
} from "lucide-react";

type Story = {
  id: string;
  username: string;
  imageUrl: string;
  isR2Permanent?: boolean;
  isPaid?: boolean;
  views?: number;
  text?: string;
};

export default function Stories({ stories = [] }: { stories?: Story[] }) {
  // --- ALL STATES INSIDE - NO BUILD ERROR ---
  const [isR2Permanent, setIsR2Permanent] = useState(true);
  const [isPaidStory, setIsPaidStory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  // 1-25 Features List
  const features = {
    // CORE 1-13
    1: "Your Story Ring", 2: "Gradient Ring", 3: "Views Count",
    4: "Quick Reactions", 5: "Reply DM", 6: "Text/Draw",
    7: "Music Sticker", 8: "Poll/Quiz", 9: "Question Box",
    10: "Link Sticker", 11: "Mention Tag", 12: "Location",
    13: "24H + Archive",
    // ADVANCED 14-25 - NEW
    14: "Close Friends Green", 15: "Mute/Hide", 
    16: "R2 Permanent NO DELETE", // Nee screenshot feature
    17: "Story to Reel Convert", 18: "Voice Story",
    19: "Paid Story - Coins", 20: "Dual Camera",
    21: "AI Background", 22: "Motivation Templates",
    23: "Collab Story", 24: "Shopping Tag", 25: "View Once"
  };

  // Story Viewer Progress
  useEffect(() => {
    if (!activeStory) return;
    const i = setInterval(() => {
      setProgress(p => p >= 100 ? (setActiveStory(null), 0) : p + 1);
    }, 50);
    return () => clearInterval(i);
  }, [activeStory]);

  const uploadToR2 = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("isR2Permanent", String(isR2Permanent));
    fd.append("isPaid", String(isPaidStory));
    await fetch("/api/upload/r2", { method: "POST", body: fd });
    setShowAddModal(false);
    alert("R2 lo upload ayindi! R2 Permanent views active!");
  };

  return (
    <>
      {/* HOME BAR */}
      <div className="flex gap-3 p-2 overflow-x-auto bg-black">
        <div onClick={() => setShowAddModal(true)} className="flex flex-col items-center cursor-pointer min-w-[64px]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px] relative">
            <div className="bg-zinc-900 rounded-full w-full h-full flex items-center justify-center text-white font-bold">M</div>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1"><Plus size={12} color="white"/></div>
          </div>
          <span className="text-[10px] text-white mt-1">Your Story</span>
        </div>
        {stories.map((s) => (
          <div key={s.id} onClick={() => setActiveStory(s)} className="flex flex-col items-center cursor-pointer min-w-[64px]">
            <div className={`w-16 h-16 rounded-full p-[2px] ${s.isR2Permanent ? 'bg-blue-500' : 'bg-gradient-to-tr from-yellow-400 to-pink-600'}`}>
              <img src={s.imageUrl} className="w-full h-full rounded-full object-cover bg-black" />
            </div>
            <span className="text-[10px] text-white mt-1 truncate w-16 text-center">{s.username}</span>
            {s.isR2Permanent && <span className="text-[7px] bg-blue-500 text-white px-1 rounded mt-0.5">R2 Permanent views</span>}
          </div>
        ))}
      </div>

      {/* ADD MODAL - WITH ALL NEW ICONS */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-end">
          <div className="bg-zinc-900 w-full rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between text-white"><h3 className="flex gap-2 font-bold"><Sparkles size={18}/> Add Story - 25 Features</h3><button onClick={() => setShowAddModal(false)}><X/></button></div>
            
            <div className="grid grid-cols-4 gap-3 mt-4 text-white">
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Music size={20}/>Music</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><MapPin size={20}/>Location</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Link2 size={20}/>Link</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Mic size={20}/>Voice</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Video size={20}/>Dual Cam</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><ShoppingBag size={20}/>Shop Tag</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Timer size={20}/>View Once</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Users size={20}/>Collab</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Bookmark size={20}/>Template</button>
              <button className="bg-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 text-[10px]"><Crown size={20}/>Paid</button>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex justify-between bg-blue-600/20 border border-blue-500 p-3 rounded-xl text-white"><span className="flex gap-2 text-sm"><Infinity size={18}/> 16. R2 Permanent - 24H Delete Avadu - Lifetime</span><input type="checkbox" checked={isR2Permanent} onChange={e=>setIsR2Permanent(e.target.checked)} className="w-5 h-5"/></label>
              <label className="flex justify-between bg-yellow-600/20 border border-yellow-500 p-3 rounded-xl text-white"><span className="flex gap-2 text-sm"><Crown size={18}/> 19. Paid Story - 10 Coins</span><input type="checkbox" checked={isPaidStory} onChange={e=>setIsPaidStory(e.target.checked)} className="w-5 h-5"/></label>
            </div>

            <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="mt-4 text-white w-full" />
            <button onClick={uploadToR2} className="w-full mt-4 bg-white text-black py-3 rounded-full font-bold">Upload to R2 + Post - 25 Features Active</button>
          </div>
        </div>
      )}

      {/* VIEWER - NEE SCREENSHOT LA - KANI FULL FEATURES THO */}
      {activeStory && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
          <div className="h-1 w-full bg-white/20"><div className="h-full bg-white" style={{width:`${progress}%`}}/></div>
          <div className="flex justify-between p-3 text-white">
            <div className="flex gap-2 items-center"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600"/><div><p className="text-sm font-bold flex gap-2 items-center">{activeStory.username} {activeStory.isR2Permanent && <span className="bg-blue-500 text-[9px] px-1.5 py-0.5 rounded flex gap-1 items-center"><Infinity size={10}/>R2 Story</span>}</p><p className="text-[10px] opacity-70 flex gap-1 items-center"><Eye size={10}/>{activeStory.views || 0} R2 Permanent views</p></div></div>
            <button onClick={()=>setActiveStory(null)}><X/></button>
          </div>
          <div className="flex-1 flex items-center justify-center relative"><img src={activeStory.imageUrl} className="max-h-[80vh] object-contain"/><div className="absolute bottom-20 p-4"><h1 className="text-white text-3xl font-bold text-center">{activeStory.text || "Revenge is waste of time, I delete people"}</h1></div></div>
          <div className="p-3 space-y-2">
            <div className="flex gap-2"><input placeholder="Reply..." className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 text-sm"/><Heart className="text-white" size={24}/><Send className="text-white" size={20}/></div>
            <div className="flex gap-2"><button className="flex-1 bg-zinc-800 text-white py-2 rounded-full text-xs flex justify-center gap-1 items-center"><Repeat2 size={14}/>17. To Reel Convert</button><button className="flex-1 bg-white text-black py-2 rounded-full text-xs font-bold">24. Shop</button></div>
          </div>
        </div>
      )}
    </>
  );
            }
