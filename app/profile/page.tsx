'use client'
import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import Link from 'next/link'

export default function ProfilePage() {
  const [tab, setTab] = useState('posts')
  const isAdmin = true // Neevu admin kabatti true - tarvata email tho check cheddam

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', background: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', alignItems: 'center', borderBottom: '1px solid #efefef' }}>
        <div style={{ fontWeight: 800, fontSize: '18px' }}>mahesh_ravani <span style={{ color: '#0095f6' }}>✓</span></div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAdmin && (
            <Link href="/admin" style={{ background: '#000', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
              👑 Admin
            </Link>
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </div>
      </div>

      {/* Migatha profile code same */}
      <div style={{ padding: '16px', display: 'flex', gap: '28px', alignItems: 'center' }}>
        <img src="https://i.pravatar.cc/150?img=3" style={{ width: '86px', height: '86px', borderRadius: '50%' }} alt="" />
        <div style={{ display: 'flex', gap: '24px', flex: 1, justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700 }}>9</div><div style={{ fontSize: '14px' }}>posts</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700 }}>1K</div><div style={{ fontSize: '14px' }}>followers</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700 }}>200</div><div style={{ fontSize: '14px' }}>following</div></div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontWeight: 700 }}>Mahesh Ravani</div>
        <div style={{ fontSize: '14px', marginTop: '2px' }}>🚀 Founder @ChitPix</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '14px 16px' }}>
        <button style={{ flex: 1, background: '#efefef', border: 'none', padding: '7px', borderRadius: '8px', fontWeight: 600 }}>Edit profile</button>
        <button style={{ flex: 1, background: '#efefef', border: 'none', padding: '7px', borderRadius: '8px', fontWeight: 600 }}>Share profile</button>
      </div>

      {isAdmin && (
        <div style={{ margin: '0 16px 12px', background: 'linear-gradient(90deg, #000, #333)', color: '#fff', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 700, fontSize: '14px' }}>Admin Dashboard</div><div style={{ fontSize: '12px', opacity: 0.7 }}>Manage ChitPix</div></div>
          <Link href="/admin" style={{ background: '#fff', color: '#000', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>Open</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <img key={i} src={`https://picsum.photos/300/300?random=${i+100}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} alt="" />
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
