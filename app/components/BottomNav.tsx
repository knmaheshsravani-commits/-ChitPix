'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function BottomNav() {
  const path = usePathname()
  const [photo, setPhoto] = useState("")

  useEffect(()=>{
    const p = localStorage.getItem("chitpix_profile_photo")
    if(p) setPhoto(p)
  },[])

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #dbdbdb', zIndex: 100 }}>
      <div style={{ maxWidth: '470px', margin: '0 auto', height: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>

        {/* HOME - 2026 pill active */}
        <Link href="/">
          <div style={{ padding: '8px 20px', background: path==='/'?'#efefef':'transparent', borderRadius: '20px', display:'flex', alignItems:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={path==='/'?'black':'none'} stroke="black" strokeWidth={path==='/'? 2.5 : 2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill={path==='/'?'white':'none'}/></svg>
          </div>
        </Link>
      
        {/* REELS - 2026 New icon - okkate icon */}
        <Link href="/reels">
          <div style={{ padding: '8px 20px', background: path==='/reels'?'#000':'transparent', borderRadius: '20px', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={path==='/reels'?'white':'none'} stroke={path==='/reels'?'white':'black'} strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8l6 4-6 4V8z" fill={path==='/reels'?'black':'black'} stroke="none"/></svg>
          </div>
        </Link>

        {/* DM / SHARE - separate icon - reels ki veru, DM ki veru */}
        <Link href="/messages">
          <div style={{ padding: '8px', width:'44px', height:'44px', display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
            <span style={{ position:'absolute', top:'6px', right:'6px', width:'7px', height:'7px', background:'red', borderRadius:'50%' }}></span>
          </div>
        </Link>

        {/* SEARCH - 2026 pill */}
        <Link href="/search">
          <div style={{ padding: '8px 20px', background: path==='/search'?'#efefef':'transparent', borderRadius: '20px', display:'flex', alignItems:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={path==='/search'? 2.6 : 2}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </Link>

        {/* PROFILE - M logo with ring */}
        <Link href="/profile">
          <div style={{ padding: '4px 12px', background: path==='/profile'?'#efefef':'transparent', borderRadius: '20px', display:'flex', alignItems:'center', position:'relative' }}>
            <div style={{ width:'26px', height:'26px', borderRadius:'50%', padding:'2px', background: path==='/profile'?'#000':'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)' }}>
              <div style={{ background:'#fff', borderRadius:'50%', padding:'2px', width:'100%', height:'100%' }}>
                {photo ? <img src={photo} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit:'cover' }} alt="" /> : <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'bold' }}>M</div>}
              </div>
            </div>
            {path!=='/profile' && <span style={{ position:'absolute', top:'2px', right:'6px', width:'7px', height:'7px', background:'red', borderRadius:'50%', border:'1px solid white' }}></span>}
          </div>
        </Link>

      </div>
    </div>
  )
}
