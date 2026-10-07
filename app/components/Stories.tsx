'use client'
import { useEffect, useState } from 'react'
import { mockStories } from '../../lib/mockData'
// supabase kavali ante ee line uncomment chey
// import { supabase } from '../../lib/supabase'

export default function Stories() {
  // any[] petta — type clash radu
  const [stories, setStories] = useState<any[]>(mockStories || [])
  const [viewed, setViewed] = useState<string[]>([])
  const [activeStory, setActiveStory] = useState<any>(null)

  useEffect(() => {
    // Supabase logic tarvata add cheddam — ippudu mock tho build pass avuthundi
  }, [])

  const openStory = (story: any) => {
    setActiveStory(story)
    if (!viewed.includes(story.id)) {
      setViewed([...viewed, story.id])
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
        <div style={{ textAlign: 'center', minWidth: '64px', cursor: 'pointer' }}>
          <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', fontSize: '28px' }}>+</div>
          <p style={{ fontSize: '11px', marginTop: '6px' }}>Your Story</p>
        </div>

        {stories.map((story: any) => {
          const isViewed = viewed.includes(story.id)
          const img = story.avatar || story.user?.avatar || story.image_url || story.image
          const name = story.username || story.user?.username || 'user'
          return (
            <div key={story.id} onClick={() => openStory(story)} style={{ textAlign: 'center', minWidth: '64px', cursor: 'pointer' }}>
              <div style={{
                width: '62px', height: '62px', borderRadius: '50%', padding: '2.5px',
                background: isViewed ? '#dbdbdb' : 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)'
              }}>
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
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100%', maxHeight: '700px' }}>
            <img src={activeStory.image_url || activeStory.image || activeStory.user?.avatar} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="story" />
            <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}
