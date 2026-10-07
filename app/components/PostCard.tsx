'use client'

export default function PostCard({ post }: any) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', margin: '0 auto 16px', maxWidth: '470px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px' }}>
        <img src={post.profiles?.avatar_url || 'https://i.pravatar.cc/100'} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{post.profiles?.username || 'user'}</div>
      </div>
      <img src={post.image_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} alt="" />
      <div style={{ padding: '10px 12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Like - 24x24 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        {/* Comment - 24x24 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 01-8.5 8.5H5l-3 3v-16a8.5 8.5 0 018.5-8.5H12a8.5 8.5 0 019 8.5z"/></svg>
        {/* Share - 24x24 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
        <div style={{ marginLeft: 'auto' }}>
          {/* Save - 24x24 */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        </div>
      </div>
    </div>
  )
}
