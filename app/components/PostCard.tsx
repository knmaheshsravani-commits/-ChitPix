"use client"
import { useState } from 'react'

export default function PostCard({post}:any){
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 76)
  const [saved, setSaved] = useState(false)

  return (
    <div className="bg-white">
      {/* Post Image */}
      <div className="w-full bg-black aspect-[4/5] relative">
        <img src={post.imageUrl || post.url} alt="post" className="w-full h-full object-cover" />
      </div>

      {/* ACTION BAR - INSTAGRAM EXACT */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-5">
          
          {/* 1. HEART */}
          <button onClick={()=>{ setLiked(!liked); setLikeCount(liked?likeCount-1:likeCount+1)}} className="flex items-center gap-1.5">
            {liked ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#ed4956" stroke="#ed4956"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            )}
            <span className="text-[15px]">{likeCount}</span>
          </button>

          {/* 2. COMMENT */}
          <button className="flex items-center gap-1.5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><path d="M20.656 17.008a1.993 1.993 0 0 1-.347 1.2L18 20.5l-3.5-1.5a1.993 1.993 0 0 1-1.2-.347A9.001 9.001 0 0 1 3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9c0 2.5-1 4.8-2.344 6.008Z"/></svg>
            <span className="text-[15px]">{post.comments || 1}</span>
          </button>

          {/* 3. REPOST */}
          <button className="flex items-center gap-1.5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span className="text-[15px]">{post.shares || 1}</span>
          </button>

          {/* 4. SEND */}
          <button className="flex items-center gap-1.5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span className="text-[15px]">19</span>
          </button>
        </div>

        {/* 5. BOOKMARK - RIGHT */}
        <button onClick={()=>setSaved(!saved)}>
          {saved ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="black"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          )}
        </button>
      </div>

      {/* Username + Caption */}
      <div className="px-3 pb-2">
        <p className="text-[14px]"><span className="font-bold">{post.user || 'kannada_moviez_shorts'}</span> <span className="text-neutral-500">... more</span></p>
        <p className="text-[13px] text-neutral-500 mt-1">2 days ago • See translation</p>
      </div>

      <div className="h-[8px] bg-neutral-100 border-y border-neutral-100"></div>
    </div>
  )
}
