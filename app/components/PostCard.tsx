'use client'
import { useEffect, useState } from 'react'

export default function PostCard({ post }: any) {
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    if (localStorage.getItem('chitpix_admin') === 'true') {
      setIsAdmin(true)
    }
  }, [])

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/admin/delete-post', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id })
    })
    if (res.ok) {
      alert('Post deleted!')
      window.location.reload()
    } else {
      alert('Failed to delete')
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', margin: '0 auto 16px', maxWidth: '470px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px' }}>
        <img src={post.profiles?.avatar_url || 'https://i.pravatar.cc/100'} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{post.profiles?.username || 'user'}</div>
        {isAdmin && (
          <button onClick={handleDelete} style={{ marginLeft: 'auto', background: '#ff3040', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            🗑️ Delete
          </button>
        )}
      </div>
      <img src={post.image_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '10px 12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Like - 24x24 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        {/* Comment - 24x24 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        {/* Share - 24x24 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        <div style={{ marginLeft: 'auto' }}>
          {/* Save - 24x24 */}
          
