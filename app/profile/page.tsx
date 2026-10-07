'use client'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [bio, setBio] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('chitpix_user')
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
      setBio(u.bio || '')
      setName(u.username || '')
    }
  }, [])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: 'ChitPix Profile', url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Profile link copied! 🔗')
    }
  }

  const handleSave = async () => {
    const updated = { ...user, username: name, bio }
    localStorage.setItem('chitpix_user', JSON.stringify(updated))
    setUser(updated)
    setShowEdit(false)
    alert('Profile updated! ✅')
    // Backend save
    await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, bio })
    }).catch(()=>{})
  }

  if (!user) return <p style={{padding:20}}>Loading...</p>

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.username}`} 
             style={{ width: '90px', height: '90px', borderRadius: '50%' }} />
        <h2>{user.username}</h2>
        <p>{bio || 'No bio yet'}</p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
          <button onClick={() => setShowEdit(true)} 
            style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', fontWeight: '600' }}>
            Edit Profile
          </button>
          <button onClick={handleShare}
            style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', fontWeight: '600' }}>
            Share Profile
          </button>
        </div>
      </div>

      {showEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '350px' }}>
            <h3>Edit Profile</h3>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Username" 
              style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ccc' }} />
            <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio"
              style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ccc' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: 'black', color: 'white', borderRadius: '8px' }}>Save</button>
              <button onClick={()=>setShowEdit(false)} style={{ flex: 1, padding: '10px', background: '#eee', borderRadius: '8px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
