"use client";
import { useState } from "react";
import { 
  Plus, X, Eye, Heart, Flame, Laugh, Crown, Infinity, 
  Music, MapPin, Link2, Timer, ShoppingBag, Mic, Video, Sparkles 
} from "lucide-react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// --- R2 STORAGE CONNECT ---
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!,
  },
});

export default function StoriesPage() {
  const [isR2Permanent, setIsR2Permanent] = useState(false);
  const [isPaidStory, setIsPaidStory] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);

  // R2 Upload Function - NEW
  const uploadToR2 = async (file: File) => {
    const fileName = `stories/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    
    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
      Key: fileName,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
    }));
    
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
  };

  return (
    <div className="home-stories-bar flex gap-3 p-2 overflow-x-auto">
      {/* YOUR STORY - with R2 Badge - From your screenshot */}
      <div className="story-item relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
          <div className="bg-black rounded-full w-full h-full flex items-center justify-center">
            M
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
              <Plus size={12} />
            </div>
          </div>
        </div>
        <p className="text-[10px] mt-1 text-center">Your Story</p>
        {isR2Permanent && <span className="absolute -top-1 text-[8px] bg-blue-500 px-1 rounded">R2 Permanent views</span>}
      </div>
    </div>
  )
}
// --- FEATURES 14-25 LOGIC ---

const STORY_FEATURES = {
  // 14. Close Friends - Green Ring
  closeFriends: true,
  // 15. Mute / Hide
  muteStory: (id: string) => console.log("Muted", id),
  // 16. R2 Permanent - NO 24H DELETE
  r2Permanent: isR2Permanent, // true ayite DB lo expiresAt = null
  // 17. Story to Reel Convert
  convertToReel: (storyUrl: string) => {
    // 1 click lo /api/reels/create ki storyUrl pampu
    fetch("/api/reels/create", { method: "POST", body: JSON.stringify({ videoUrl: storyUrl }) })
  },
  // 18. Voice Story
  voiceStory: true, // Mic icon tho
  // 19. Paid Story - R2 Coins
  paidStory: { enabled: isPaidStory, price: 10 },
  // 20. Dual Camera
  dualCamera: true,
  // 21. AI Background - Sparkles Icon
  aiBackground: ["Dubai", "Lion Rock", "Motivation Stage"],
  // 22. Motivation Templates - Nee style
  templates: ["Revenge is waste of time...", "You have to make mistakes..."],
  // 23. Collaborate Story - 2 users
  collabStory: true,
  // 24. Shopping Tag - Bag Icon
  shoppingTag: true,
  // 25. View Once / Anti Screenshot
  viewOnce: true,
};

// --- NEW ICONS UI FOR ADD STORY MODAL ---
function AddStoryModal() {
  return (
    <div className="modal bg-zinc-900 p-4 rounded-2xl">
      <div className="flex justify-between">
        <h3 className="flex items-center gap-2"><Sparkles size={16}/> Add Story</h3>
        <X />
      </div>
      
      <div className="grid grid-cols-4 gap-3 mt-4">
        <button className="flex flex-col items-center gap-1"><Music size={20}/> Music</button>
        <button className="flex flex-col items-center gap-1"><MapPin size={20}/> Location</button>
        <button className="flex flex-col items-center gap-1"><Link2 size={20}/> Link</button>
        <button className="flex flex-col items-center gap-1"><Mic size={20}/> Voice</button>
        <button className="flex flex-col items-center gap-1"><Video size={20}/> Dual</button>
        <button className="flex flex-col items-center gap-1"><ShoppingBag size={20}/> Shop</button>
        <button className="flex flex-col items-center gap-1"><Timer size={20}/> Once</button>
        <button className="flex flex-col items-center gap-1"><Crown size={20}/> Paid</button>
      </div>

      <div className="mt-4 space-y-2">
        <label className="flex items-center justify-between bg-zinc-800 p-2 rounded">
          <span className="flex gap-2"><Infinity size={16}/> R2 Permanent views - 24H kadu lifetime</span>
          <input type="checkbox" checked={isR2Permanent} onChange={e=>setIsR2Permanent(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between bg-zinc-800 p-2 rounded">
          <span className="flex gap-2"><Crown size={16}/> Paid Story - 10 coins</span>
          <input type="checkbox" checked={isPaidStory} onChange={e=>setIsPaidStory(e.target.checked)} />
        </label>
      </div>

      <button onClick={()=>storyFile && uploadToR2(storyFile)} className="w-full mt-4 bg-white text-black rounded-full py-2 font-bold">
        Upload to R2 + Post
      </button>
    </div>
  )
}
