'use client'
import BottomNav from '../components/BottomNav'
export default function Page() {
  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', background: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
        <img src="https://i.pravatar.cc/150?img=3" style={{ width: '77px', height: '77px', borderRadius: '50%' }} alt="" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 300, fontSize: '20px' }}>mahesh_ravani</div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '12px' }}><span><b>9</b> posts</span><span><b>1K</b> followers</span><span><b>200</b> following</span></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px' }}>
        {Array.from({length: 9}).map((_,i)=><img key={i} src={`https://picsum.photos/300/300?random=${i+80}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} alt="" />)}
      </div>
      <BottomNav />
    </div>
  )
}
