'use client'
import PostCard from './components/PostCard'
import BottomNav from './components/BottomNav'

export default function Home() {
  // Dummy posts - build pass kosam, tarvata Supabase connect cheddam
  const posts = [
    {
      id: '1',
      image_url: 'https://picsum.photos/600/600?random=1',
      profiles: { username: 'mahesh_ravani', avatar_url: 'https://i.pravatar.cc/100?img=1' }
    },
    {
      id: '2',
      image_url: 'https://picsum.photos/600/600?random=2',
      profiles: { username: 'chitpix_official', avatar_url: 'https://i.pravatar.cc/100?img=2' }
    }
  ]

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: '70px' }}>
      <div style={{ maxWidth: '470px', margin: '0 auto', paddingTop: '10px' }}>
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
