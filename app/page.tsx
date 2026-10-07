'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import PostCard from './components/PostCard'
import BottomNav from './components/BottomNav'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getPosts() {
      if (!supabase) { setLoading(false); return }
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', { ascending: false })
      
      if (data) setPosts(data)
      setLoading(false)
    }
    getPosts()
  }, [])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>Loading...</div>
  }

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: '70px' }}>
      <div style={{ maxWidth: '470px', margin: '0 auto', paddingTop: '10px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#8e8e8e' }}>
            No posts yet bro! Upload chey!
          </div>
        ) : (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
      <BottomNav />
    </div>
  )
}
