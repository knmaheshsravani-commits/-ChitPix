'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()
  const isActive = (p: string) => path === p

  const iconStyle = (active: boolean) => ({
    width: '26px', height: '26px', stroke: active ? '#000' : '#000',
    strokeWidth: active ? '2.6' : '1.8', fill: active ? '#000' : 'none'
  })

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
      background: '#fff', borderTop: '1px solid #dbdbdb',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      zIndex: 9999, paddingBottom: '6px'
    }}>
      {/* HOME */}
      <Link href="/" style={{ padding: '8px 20px', background: isActive('/') ? '#efefef' : 'transparent', borderRadius: '24px' }}>
        <svg style={iconStyle(isActive('/'))} viewBox="0 0 24 24">
          {isActive('/') ? <path d="M12 2L3 10v10a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V10L12 2z" fill="currentColor" stroke="none"/> : <path d="M12 2L3 10v10a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10L12 2z"/>}
        </svg>
      </Link>

      {/* REELS */}
      <Link href="/reels" style={{ padding: '8px 20px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10 8 16 12 10 16 10 8" fill={isActive('/reels')?'#000':'none'} stroke="none"/></svg>
      </Link>

      {/* DM / SHARE */}
      <Link href="/dm" style={{ padding: '8px 20px', position: 'relative' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <span style={{ position: 'absolute', top: '6px', right: '16px', width: '8px', height: '8px', background: '#ff3040', borderRadius: '50%' }}></span>
      </Link>

      {/* SEARCH */}
      <Link href="/search" style={{ padding: '8px 20px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={isActive('/search')?'2.6':'1.8'}><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="21" y2="21"/></svg>
      </Link>

      {/* PROFILE */}
      <Link href="/profile" style={{ padding: '8px 20px', position: 'relative' }}>
        <img src="https://i.pravatar.cc/100" style={{ width: '28px', height: '28px', borderRadius: '50%', border: isActive('/profile')?'2px solid #000':'1.5px solid #000' }} alt="profile"/>
        <span style={{ position: 'absolute', bottom: '6px', right: '14px', width: '8px', height: '8px', background: '#ff3040', borderRadius: '50%', border: '1.5px solid #fff' }}></span>
      </Link>
    </div>
  )
}
