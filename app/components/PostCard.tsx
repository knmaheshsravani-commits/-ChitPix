"use client"
import { useState } from 'react'

export default function PostCard({post}:any){
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 11)

  const handleLike = () => {
    if(liked){
      setLikeCount(likeCount-1)
    } else {
      setLikeCount(likeCount+1)
    }
    setLiked(!liked)
  }

  return (
    <div className="bg-white border-b border-neutral-200">
      {/* User Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 p-[1.5px]">
            <div className="w-full h-full rounded-full bg-white p-[1.5px]">
              <img src={post.userAvatar || `https://i.pravatar.cc/100?u=${post.user}`} className="w-full h-full rounded-full object-cover" alt="user" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-none">{post.user || post.username || 'chitpix_user'}</p>
            {post.location && <p className="text-[11px] text-neutral-500">{post.location}</p>}
          </div>
        </div>
        <button className="p-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
        </button>
      </div>

      {/* Image */}
      <div className="w-full bg-neutral-100 aspect-[4/5] relative overflow-hidden">
        <img src={post.imageUrl || post.url || post.image} alt="post" className="w-full h-full object-cover" />
      </div>

      {/* 5 ICONS ACTION BAR - NEW DESIGN */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-4">
          {/* 1. LIKE - Heart */}
          <button onClick={handleLike} className="flex items-center gap-1">
            {liked ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff3040" stroke="#ff3040" strokeWidth="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            )}
            <span className="text-[14px] font-medium">{likeCount}</span>
          </button>

          {/* 2. COMMENT - Bubble */}
          <button className="flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </button>

          {/* 3. REPOST / REPEAT */}
          <button className="flex items-center gap-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span className="text-[14px] font-medium">1</span>
          </button>

          {/* 4. SEND / SHARE - Paper Plane */}
          <button className="flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>

        {/* 5. SAVE - Bookmark Right */}
        <button onClick={()=>setSaved(!saved)}>
          {saved ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          )}
        </button>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-[13px] leading-[1.3]"><span className="font-semibold mr-2">{post.user || 'chitpix_user'}</span>{post.caption || 'Risk or loose #deepthoughts'}</p>
        <p className="text-[12px] text-neutral-500 mt-1">{post.createdAt || '14 October'} • See translation</p>
      </div>
    </div>
  )
}
