'use client'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [username, setUsername] = useState('ChitPix User')
  const [bio, setBio] = useState('Welcome to ChitPix! 🚀')
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('profile_name')
      const savedBio = localStorage.getItem('profile_bio')
      if (savedName) setUsername(savedName)
      if (savedBio) setBio(savedBio)
      setEditName(savedName || 'ChitPix User')
      setEditBio(savedBio || 'Welcome to ChitPix! 🚀')
    } catch {}
  }, [])

  const handleEdit = () => {
    setEditName(username)
    setEditBio(bio)
    setShowEdit(true)
  }

  const handleSave = () => {
    setUsername(editName || 'ChitPix User')
    setBio(editBio || 'Welcome to ChitPix!')
    localStorage.setItem('profile_name', editName)
    localStorage.setItem('profile_bio', editBio)
    setShowEdit(false)
    alert('Profile Updated! ✅')
  }

  const handleShare = async () => {
    const url = window.location.origin + '/profile'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My ChitPix Profile', text: `Check my profile: ${username}`, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link Copied! 🔗 ' + url)
      }
    } catch {
      await navigator.clipboard.writeText(url)
      alert('Link Copied! 🔗')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginTop: '20px' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>😎</div>
          <h2 style={{ marginTop: '12px', fontWeight: '700' }}>{username}</h2>
          <p style={{ color: '#666', marginTop: '6px' }}>{bio}</p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px' }}>
            <button onClick={handleEdit} style={{ padding: '10px 22px', borderRadius: '10px', border: '1px solid #dbdbdb', background: '#fff', fontWeight: '600', cursor: 'pointer' }}>
              Edit Profile
            </button>
            <button onClick={handleShare} style={{ padding: '10px 22px', borderRadius: '10px', border: '1px solid #dbdbdb', background: '#fff', fontWeight: '600', cursor: 'pointer' }}>
              Share Profile
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <div><b>0</b><p>Posts</p></div>
          <div><b>0</b><p>Followers</p></div>
          <div><b>0</b><p>Following</p></div>
        </div>
      </div>

      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: '22px', borderRadius: '16px', width: '90%', maxWidth: '340px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>Edit Profile</h3>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username" style={{ width: '100%', padding: '11px', margin: '8px 0', borderRadius: '10px', border: '1px solid #ccc' }} />
            <textarea value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Bio" rows={3} style={{ width: '100%', padding: '11px', margin: '8px 0', borderRadius: '10px', border: '1px solid #ccc' }} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '11px', background: '#000', color: '#fff', borderRadius: '10px', fontWeight: '600' }}>Save</button>
              <button onClick={()=>setShowEdit(false)} style={{ flex: 1, padding: '11px', background: '#efefef', borderRadius: '10px', fontWeight: '600' }}>Cancel</button>
            </div>
         
