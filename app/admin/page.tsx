'use client'
import Link from 'next/link'
export default function Admin() {
  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', background: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h2>👑 ChitPix Admin</h2>
      <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
        <div style={{ border: '1px solid #dbdbdb', padding: '14px', borderRadius: '10px' }}><b>Users:</b> 1K+<br/><small>Total registered</small></div>
        <div style={{ border: '1px solid #dbdbdb', padding: '14px', borderRadius: '10px' }}><b>Posts:</b> 9<br/><small>Pending: 0</small></div>
        <div style={{ border: '1px solid #dbdbdb', padding: '14px', borderRadius: '10px' }}><b>Reports:</b> 0<br/><small>No reports</small></div>
        <Link href="/profile" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>Back to Profile</Link>
      </div>
    </div>
  )
}
