"use client";
export default function Stories() {
  const users = ["You","arjun","sweety","rahul","priya","vizag","hyd"];
  return (
    <div className="flex gap-4 p-3 border-b border-zinc-100 overflow-x-auto">
      {users.map((u,i)=>(
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-[58px] h-[58px] rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 p-[2px]">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[12px] font-bold">{u[0].toUpperCase()}</div>
          </div>
          <span className="text-[10px]">{u}</span>
        </div>
      ))}
    </div>
  );
}
