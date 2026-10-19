"use client";
import { useState } from "react";
import { 
  Plus, X, Eye, Heart, Flame, Laugh, Crown, Infinity, 
  Music, MapPin, Link2, Timer, ShoppingBag, Mic, Video, Sparkles 
} from "lucide-react";

// --- R2 CLIENT - CLIENT SIDE SAFE VERSION ---
// Note: Secret keys ni client lo vadakudadu, so manam /api/upload/r2 route use chedam
const uploadToR2ViaAPI = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload/r2", { method: "POST", body: formData });
  const data = await res.json();
  return data.url as string;
};

export default function Stories() {
  // --- ALL STATES INSIDE COMPONENT - FIX FOR BUILD ERROR ---
  const [isR2Permanent, setIsR2Permanent] = useState(false);
  const [isPaidStory, setIsPaidStory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);

  // --- 25 FEATURES CONFIG - NOW INSIDE COMPONENT, ERROR RADU ---
  const STORY_FEATURES = {
    // 1-13 Core
    viewCount: true,
    reactions: true,
    replyBox: true,
    textTools: true,
    musicSticker: true,
    pollSticker: true,
    // 14-15
    closeFriends: true,
    muteStory: (id: string) => console.log("Muted", id),
    // 16. R2 Permanent - FIXED
    r2Permanent: isR2Permanent, // ✅ Ippudu scope lo undi!
    // 17. Story to Reel
    convertToReel: async (storyUrl: string) => {
      await fetch("/api/reels/create", { 
        method: "POST", 
        body: JSON.stringify({ videoUrl: storyUrl }) 
      });
    },
    // 18-25 New
    voiceStory: true,
    paidStory: { enabled: isPaidStory, price: 10 },
    dualCamera: true,
    aiBackground: ["Dubai", "Lion Rock"],
    templates: ["Revenge is waste of time..."],
    collabStory: true,
    shoppingTag: true,
    viewOnce: true,
  };

  return (
    <div className="flex flex-col">
      {/* HOME BAR - Your screenshot style */}
      <div className="flex gap-3 p-2 overflow-x-auto">
        <div onClick={() => setShowModal(true)} className="story-item relative cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
            <div className="bg-black rounded-full w-full h-full flex items-center justify-center text-white">
              M
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                <Plus size={12} color="white" />
              </div>
            </div>
          </div>
          <p className="text-[10px] mt-1 text-center text-white">Your Story</p>
          {STORY_FEATURES.r2Permanent && (
            <span className="absolute -top-1 left-0 text-[7px] bg-blue-500 text-white px-1 rounded">
              R2 Permanent views
            </span>
          )}
        </div>
      </div>

      {/* ADD STORY MODAL WITH NEW ICONS + R2 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-zinc-900 w-full p-4 rounded-t-2xl">
            <div className="flex justify-between text-white">
              <h3 className="flex items-center gap-2"><Sparkles size={16}/> Add Story</h3>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mt-4 text-white">
              <button className="flex flex-col items-center gap-1 text-xs"><Music size={20}/> Music</button>
              <button className="flex flex-col items-center gap-1 text-xs"><MapPin size={20}/> Location</button>
              <button className="flex flex-col items-center gap-1 text-xs"><Link2 size={20}/> Link</button>
              <button className="flex flex-col items-center gap-1 text-xs"><Mic size={20}/> Voice</button>
              <button className="flex flex-col items-center gap-1 text-xs"><Video size={20}/> Dual</button>
              <button className="flex flex-col items-center gap-1 text-xs"><ShoppingBag size={20}/> Shop</button>
              <button className="flex flex-col items-center gap-1 text-xs"><Timer size={20}/> Once</button>
              <button className="flex flex-col items-center gap-1 text-xs"><Crown size={20}/> Paid</button>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg text-white">
                <span className="flex gap-2 text-sm"><Infinity size={16}/> R2 Permanent - Lifetime</span>
                <input type="checkbox" checked={isR2Permanent} onChange={e=>setIsR2Permanent(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg text-white">
                <span className="flex gap-2 text-sm"><Crown size={16}/> Paid Story - 10 coins</span>
                <input type="checkbox" checked={isPaidStory} onChange={e=>setIsPaidStory(e.target.checked)} />
              </label>
            </div>

            <input type="file" onChange={e=>setStoryFile(e.target.files?.[0]||null)} className="mt-3 text-white w-full" />
            
            <button 
              onClick={async () => storyFile && await uploadToR2ViaAPI(storyFile)} 
              className="w-full mt-4 bg-white text-black rounded-full py-3 font-bold"
            >
              Upload to R2 + Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
