"use client"
export default function PostCard({post}:any){
  if(!post) return null
  return (
    <div className="border-b border-black/5 bg-white">
      <div className="flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold">
          {post?.user?.[0]?.toUpperCase() || 'C'}
        </div>
        <div className="text-sm font-semibold">{post?.user || 'user'}</div>
        <div className="ml-auto text-xs text-black/40">{post?.location || ''}</div>
      </div>
      <img src={post?.imageUrl || post?.image_url || 'https://picsum.photos/500'} alt="" className="w-full aspect-square object-cover bg-gray-100" />
      <div className="p-3 text-sm"><b>{post?.user}</b> {post?.caption || ''}</div>
    </div>
  )
}
