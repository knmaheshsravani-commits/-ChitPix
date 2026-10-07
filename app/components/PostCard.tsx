'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// --- INSTAGRAM SVG ICONS - SAME SIZE 24x24 ---
const Icons = {
  like: (filled: boolean) => filled ? (
    <svg width="24" height="24" viewBox="0 0 48 48"><path fill="#ed4956" d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-15.9 21.5a1 1 0 01-1.4 0C17.7 29.1 11.8 24.9 11.8 18.1c0-6.3 4.7-11.5 10.4-11.5 3 0 5.5 2.5 6.8 6.1 1.3-3.6 3.8-6.1 6.8-6.1z"/></svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  ),
  comment: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  share: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  download: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  bookmark: (saved: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={saved?"currentColor":"none"} stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
  )
}

export default function PostCard({ post }: any) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes_count || 0)
  const [comments, setComments] = useState<any[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [following, setFollowing] = useState(false)
  const [followCount, setFollowCount] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: lk } = await supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
        if (lk) setLiked(true)
        const { data: fl } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', post.user_id).maybeSingle()
        if (fl) setFollowing(true)
      }
      const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', post.user_id)
      setFollowCount(count || 0)
      const { data: comms } = await supabase.from('comments').select
