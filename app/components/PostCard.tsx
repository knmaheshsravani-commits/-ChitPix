"use client"
import { useState } from "react"

export default function PostCard({post}:{post:any}){
  const [isFollowing, setIsFollowing] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  return (
    <>
      <div className="border-b border-neutral-100">
        {/* HEADER - USER PROFILE + FOLLOW */}
        <div className="px-3 py-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5" onClick={()=>setShowProfile(true)}>
            <img src={post.avatar || `https://i.pravatar.cc/100?img=${Math.floor(Math.random()*30)}`} className="w-8 h-8 rounded-full" />
            <div>
              <div className="text-[13px] font-bold leading-none flex items-center gap-1">{post.user || 'user_kadur'} {post.verified && <span className="text-blue-500">✓</span>}</div>
              <div className="text-[11px] opacity-70 flex items-center gap-1 mt-0.5">♫ {post.location || 'Kadur • Original audio'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setIsFollowing(!isFollowing)} className={`px-4 py-1 rounded-md text-[12px] font-bold border ${isFollowing ? 'bg-white text-black border-neutral-300' : 'bg-white text-black border-black'}`}>{isFollowing ? 'Following' : 'Follow'}</button>
            <button>☰</button>
          </div>
        </div>

        {/* IMAGE */}
        <div className="w-full bg-neutral-100"><img src={post.imageUrl || post.url || 'https://picsum.photos/500/600?'+post.id} className="w-full aspect-[4/5] object-cover" /></div>

        {/* ICONS - LOCK - TOUCH LEADU */}
        <div className="px-3 py-2.5 flex justify-between">
          <div className="flex gap-4 text-[22px]"><span>♡</span><span>💬</span><span>↗</span></div>
          <div className="text-[22px]">🔖</div>
        </div>
      </div>

      {/* PROFILE MODAL - CLICK CHESI OPEN */}
      {showProfile && (
        <div className="fixed inset-0 z-[200] bg-white max-w-[480px] mx-auto">
          <div className="p-3 flex justify-between border-b"><button onClick={()=>setShowProfile(false)}>← {post.user}</button><button onClick={()=>setShowProfile(false)}>✕</button></div>
          <div className="p-4 text-center">
            <img src={post.avatar || 'https://i.pravatar.cc/100?img=5'} className="w-24 h-24 rounded-full mx-auto" />
            <div className="font-black mt-3">{post.user}</div>
            <div className="flex justify-center gap-8 mt-4">
              <div><div className="font-bold">64</div><div className="text-[12px]">Posts</div></div>
              <div><div className="font-bold">12.5k</div><div className="text-[12px]">Followers</div></div>
              <div><div className="font-bold">340</div><div className="text-[12px]">Following</div></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setIsFollowing(!isFollowing)} className={`flex-1 py-2 rounded-lg font-bold ${isFollowing ? 'bg-neutral-200' : 'bg-black text-white'}`}>{isFollowing ? 'Unfollow' : 'Follow'}</button>
              <button className="flex-1 bg-neutral-100 py-2 rounded-lg">Settings ⚙️</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
