'use client'
import { useEffect, useState } from 'react'

// Supabase unte idi use chey, lekapote mockData nundi vastundi
import { supabase } from '../../lib/supabase'
import { mockStories } from '../../lib/mockData'

type Story = {
  id: string
  username: string
  avatar: string
  image_url?: string
  image?: string
  created_at?: string
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>(mockStories || [])
  const [viewed, setViewed] = useState<string[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        if (!supabase) return
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setStories(data)
        }
      } catch (e) {
        console.log('Using mock stories')
      }
    }
    fetchStories()
  }, [])

  const openStory = (story: Story) => {
    setActiveStory(story)
    if (!viewed.includes(story.id)) {
      setViewed([...viewed, story.id])
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
        {/* Your Story */}
        <div style={{ textAlign: 'center', minWidth: '64px', cursor: 'pointer' }}>
          <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', fontSize: '28px' }}>+</div>
          <p style={{ fontSize: '11px', marginTop: '6px' }}>Your Story</p>
        </div>

        {stories.map((story) => {
          const isViewed = viewed.includes(story.id)
          return (
            <div key={story.id} onClick={() => openStory(story)} style={{ textAlign: 'center', minWidth: '64px', cursor: 'pointer' }}>
              <div style={{
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                padding: '2.5px',
                background: isViewed ? '#dbdbdb' : 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)'
              }}>
                <div style={{ background: '#fff', borderRadius: '50%', padding: '2px' }}>
                  <img
                    src={story.avatar || story.image_url || story.image}
                    alt={story.username}
                    style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '11px', marginTop: '6px', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{story.username}</p>
            </div>
          )
        })}
      </div>

      {/* Story Viewer */}
      {activeStory && (
        <div onClick={() => setActiveStory(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100%', maxHeight: '700px' }}>
            <img src={activeStory.image_url || activeStory.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="story" />
            <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>✕</button>
            <div style={{ position: 'absolute', top: '20px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={activeStory.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{activeStory.username}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
