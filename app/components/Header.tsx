"use client"
export default function Header({count}:{count:number}){
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-black/5 p-3 flex items-center justify-between">
      <h1 className="font-black text-[20px]">ChitPix</h1>
      <div className="text-xs bg-black text-white px-2 py-1 rounded-full">{count || 0} posts</div>
    </div>
  )
}
