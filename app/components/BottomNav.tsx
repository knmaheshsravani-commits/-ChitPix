'use client'
import Link from 'next/link'

export default function BottomNav() {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', background: '#fff', borderTop: '1px solid #dbdbdb', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 9999 }}>
      <Link href="/"><div style={{ width: '60px', height: '36px', background: '#efefef', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M12 2.5L3 10.5V21a1 1 0 001 1h5v-5h6v5h5a1 1 0 001-1v-10.5L12 2.5z"/></svg></div></Link>
      <Link href="/reels"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10,8 16,12 10,16" fill="black"/></svg></Link>
      <Link href="/dm"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></Link>
      <Link href="/search"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/></svg></Link>
      <Link href="/profile"><img src="https://i.pravatar.cc/100" alt="p" style={{ width: '26px', height: '26px', borderRadius: '50%' }}/></Link>
    </div>
  )
}
