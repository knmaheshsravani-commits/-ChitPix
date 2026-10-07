'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (p: string) => pathname === p

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '60px', background: '#fff',
      borderTop: '1px solid #dbdbdb',
      display: 'flex', justifyContent: 'space-around',
      alignItems: 'center', zIndex: 9999
    }}>
      {/* HOME */}
      <Link href="/" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '60px', height: '36px',
        background: isActive('/') ? '#efefef' : 'transparent',
        borderRadius: '18px'
      }}>
        {isActive('/') ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M12 2.5L3 10.5V21a1 1 0 001 1h5v-5h6v5h5a1 1 0 001-1v-10.5L12 2.5z"/></svg>
        ) : (
          <svg width="24" height="24"
