"use client"
export default function Stories(){
  return (
    <div className="flex gap-3 p-3 overflow-x-auto border-b border-black/5 bg-white">
      {Array.from({length:8}).map((_,i)=>(
        <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
          <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs">S{i+1}</div>
          </div>
          <span className="text-[10px]">user{i+1}</span>
        </div>
      ))}
    </div>
  )
}
