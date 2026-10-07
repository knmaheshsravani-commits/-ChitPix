'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Stories() {
  const [stories, setStories] = useState<any[]>([])

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    // 24 hours lopu stories matrame
    const { data } = await supabase
     .from('stories')
     .select('*')
     .gt('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())

    if(data) setStories(data)
  }

  return (
    <div style={{display:'flex', gap:'10px', overflowX:'auto'}}>
      {stories.map(s => (
        <div key={s.id}>
          <img src={s.image_url} style={{width:'60px', height:'60px', borderRadius:'50%', border:'2px solid #ff3040'}} />
        </div>
      ))}
    </div>
  )
}
