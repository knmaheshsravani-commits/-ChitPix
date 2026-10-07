'use client'
import BottomNav from '../components/BottomNav'
export default function Page() {
  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', background: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ padding: '12px' }}>
        <input placeholder="Search ChitPix" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#efefef' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px' }}>
        {Array.from({length: 18}).map((_,i) => (
          <img key={i} src={`https://picsum.photos/300/300?random=${i+50}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} alt="" />
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
