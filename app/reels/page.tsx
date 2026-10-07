'use client'
import BottomNav from '../components/BottomNav'

export default function Page() {
  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', background: '#000', minHeight: '100vh', position: 'relative', paddingBottom: '50px' }}>
      
      {/* REEL VIDEO */}
      <div style={{ height: 'calc(100vh - 50px)', position: 'relative' }}>
        <img src="https://picsum.photos/470/800?random=99" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        
        {/* RIGHT SIDE 5 ICONS - ANNI SAME 24x24 */}
        <div style={{ position: 'absolute', right: '12px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
          
          <div style={{ textAlign: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <div style={{ color: 'white', fontSize: '12px', marginTop: '4px' }}>1.2K</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 01-8.5 8.5H5l-3 3v-16a8.5 8.5 0 018.5-8.5H12a8.5 8.5 0 019 8.5z"/></svg>
            <div style={{ color: 'white', fontSize: '12px', marginTop: '4px' }}>345</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          </div>

          <div style={{ textAlign: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0
