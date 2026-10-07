'use client'
import BottomNav from '../components/BottomNav'
export default function Search() {
  return (<div style={{ paddingBottom: '60px', maxWidth: '470px', margin: '0 auto', paddingTop: '20px' }}>
    <input placeholder="Search ChitPix" style={{ width: '90%', margin: '0 5%', padding: '12px', borderRadius: '10px', border: '1px solid #dbdbdb', background: '#efefef' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', marginTop: '20px' }}>
      {[1,2,3,4,5,6,7,8,9].map(i => <img key={i} src={`https://picsum.photos/200/200?random=${i+10}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} alt="" />)}
    </div>
    <BottomNav />
  </div>)
}
