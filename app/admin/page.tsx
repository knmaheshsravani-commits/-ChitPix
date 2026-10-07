'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Admin() {
  const [pass, setPass] = useState('')
  const [ok, setOk] = useState(false)

  const login = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: pass })
    })
    if (res.ok) setOk(true)
    else alert('Wrong Password bro!')
  }

  if (!ok) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
        <h2>👑 Admin Login</h2>
        <input type="password" placeholder="Enter Password" value={pass} onChange={e => setPass(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dbdbdb', marginTop: '12px' }} />
        <button onClick={login} style={{ marginTop: '12px', background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 700, border: 'none' }}>Login</button>
      </div>
    )
  }
  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', background: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h2>👑 ChitPix Admin Panel</h2>
      <p style={{ color: 'green' }}>✅ Secure Login Success!</p>
      <Link href="/" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, display: 'block', marginTop: '20px' }}>Go to ChitPix</Link>
    </div>
  )
}
