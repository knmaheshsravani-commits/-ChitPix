'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()
  const icon = (active: boolean, d: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'black' : 'none'} stroke="black" strokeWidth={active ? '2.2' : '1.8'}><path d={d}/></svg>
  )
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '50px', background: '#fff', borderTop: '1px solid #dbdbdb', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100, maxWidth: '470px', margin: '0 auto' }}>
      <Link href="/"><div style={{ padding: '8px', background: path==='/'?'#efefef':'transparent', borderRadius: '20px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill={path==='/'?'black':'none'} stroke="black" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div></Link>
      
      <Link href="/reels"><div style={{ padding: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M10 8l6 4-6 4V8z"/></svg>
      </div></Link>

      <Link href="/messages"><div style={{ padding: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
      </div></Link>

      <Link href="/search"><div style={{ padding: '8px', background: path==='/search'?'#efefef':'transparent', borderRadius: '20px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div></Link>

      <Link href="/profile"><div style={{ padding: '8px', background: path==='/profile'?'#efefef':'transparent', borderRadius: '50%' }}>
        <img src="https://i.pravatar.cc/100?img=3" style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />
      </div></Link>
    </div>
  )
}
