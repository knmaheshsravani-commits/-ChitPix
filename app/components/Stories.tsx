'use client'
import { useEffect, useState } from 'react'
import { mockStories } from '../../lib/mockData'
import { supabase } from '../../lib/supabase'

export default function Stories() {
  const [stories, setStories] = useState<any[]>(mockStories || [])
  const [viewed, setViewed] = useState<string[]>([])
  const [activeStory, setActiveStory] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) return
        const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false }).limit(20)
        if (data && data.length > 0) setStories(data)
      } catch {}
    }
    load()
  }, [])

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file ||!supabase) return
    setUploading(true)
    try {
      const fileName = `story_${Date.now()}_${file.name}`
      const { data: up } = await supabase.storage.from('chitpix-media').upload(fileName, file)
      if (up) {
        const { data: urlData } = supabase.storage.from('chitpix-media').getPublicUrl(fileName)
        const { data: userData } = await supabase.auth.getUser()
        await supabase.from('stories').insert({ image_url: urlData.publicUrl, user_id: userData.user?.id })
        alert('Story uploaded! 24h tarvata auto delete!')
        location.reload()
      }
    } catch (err) { alert('Upload failed') }
    setUploading(false)
  }

  const openStory = (s: any) => {
    setActiveStory(s)
    if (!viewed.includes(s.id)) setViewed([...viewed, s.id])
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
        <div style={{ textAlign: 'center', minWidth: '64px' }}>
          <label style={{ width: '62px', height: '62px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', fontSize: '28px', cursor: 'pointer' }}>
            {uploading? '...' : '+'}
            <input type="file" hidden accept="image/*" onChange={handleUpload} />
          </label>
          <p style={{ fontSize: '11px', marginTop: '6px' }}>Your Story</p>
        </div>

        {stories.map((story: any) => {
          const isViewed = viewed.includes(story.id)
          const img = story.avatar || story.user?.avatar || story.image_url || story.image || 'https://i.pravatar.cc/100'
          const name = story.username || story.user?.username || 'user'
          return (
            <div key={story.id} onClick={() => openStory(story)} style={{ textAlign: 'center', minWidth: '64px', cursor: 'pointer' }}>
              <div style={{ width: '62px', height: '62px', borderRadius: '50%', padding: '2.5px', background: isViewed? '#dbdbdb' : 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)' }}>
                <div style={{ background: '#fff', borderRadius: '50%', padding: '2px' }}>
                  <img src={img} alt={name} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
              <p style={{ fontSize: '11px', marginTop: '6px', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
            </div>
          )
        })}
      </div>

      {activeStory && (
        <div onClick={() => setActiveStory(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={activeStory.image_url || activeStory.image} style={{ width: '100%', maxWidth: '400px', height: '100%', maxHeight: '700px', objectFit: 'contain' }} alt="story" />
          <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>✕</button>
        </div>
      )}
    </>
  )
}
