"use client"

import { useState } from "react"
import CommentAZ from "./CommentAZ"

export default function PostCard({ post }: { post: any }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const postId = String(post.id ?? post.post_id ?? "")

  const avatar =
    post.avatar || "https://i.pravatar.cc/100?img=5"

  const username = post.user || "user_kadur"

  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        {/* USER HEADER */}
        <div className="px-3 py-3 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2.5 text-left"
          >
            <img
              src={avatar}
              alt={username}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div>
              <div className="text-sm font-bold flex items-center gap-1">
                {username}
                {post.verified && (
                  <span className="text-blue-500">✓</span>
                )}
              </div>

              <div className="text-xs text-neutral-500 mt-1">
                {post.location || "Kadur • Original audio"}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${
                isFollowing
                  ? "border-neutral-300 text-neutral-600"
                  : "border-black text-black"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            <button
              type="button"
              aria-label="Post options"
              className="text-xl px-1"
              onClick={() => setShowProfile(true)}
            >
              ⋯
            </button>
          </div>
        </div>

        {/* POST IMAGE */}
        <div className="w-full bg-neutral-100">
          <img
            src={
              post.imageUrl ||
              post.url ||
              "https://picsum.photos/500/600"
            }
            alt="Post"
            className="w-full aspect-[4/5] object-cover"
          />
        </div>

        {/* POST ACTIONS */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Like post"
              className="text-3xl leading-none"
            >
              ♡
            </button>

            <button
              type="button"
              aria-label="Open comments"
              onClick={() => setShowComments(true)}
              className="text-3xl leading-none"
            >
              ♧
            </button>

            <button
              type="button"
              aria-label="Share post"
              className="text-2xl"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: username,
                    url: window.location.origin,
                  }).catch(() => {})
                }
              }}
            >
              ↗
            </button>
          </div>

          <button
            type="button"
            aria-label="Save post"
            className="text-2xl"
          >
            ♧
          </button>
        </div>

        {/* CAPTION AND COMMENTS LINK */}
        <div className="px-4 pt-2 pb-4">
          {post.likes_count > 0 && (
            <div className="text-sm font-bold mb-2">
              {post.likes_count} likes
            </div>
          )}

          <div className="text-sm">
            <b className="mr-2">{username}</b>
            {post.caption || ""}
          </div>

          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="text-sm text-neutral-500 mt-2"
          >
            View comments
          </button>
        </div>
      </div>

      {/* COMMENTS MODAL */}
      {showComments && (
        <CommentAZ
          postId={postId}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white w-full max-w-[420px] rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <b>Profile</b>
              <button
                type="button"
                onClick={() => setShowProfile(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <img
              src={avatar}
              alt={username}
              className="w-24 h-24 rounded-full object-cover mx-auto mt-5"
            />

            <div className="text-center font-bold mt-3">
              {username}
            </div>

            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`w-full mt-5 py-3 rounded-xl font-bold ${
                isFollowing
                  ? "bg-neutral-200 text-black"
                  : "bg-black text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
