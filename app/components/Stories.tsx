"use client";
export default function Stories() {
  const names = ["You","arjun","sweety","rahul","priya","vizag","hyd","india"];
  return (
    <div className="bg-white border-b border-gray-200 p-3 flex gap-4 overflow-x-auto">
      {names.map((n,i)=>(
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 p-[3px]">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-xs">{n[0]}</div>
          </div>
          <span className="text-[11px]">{n}</span>
        </div>
      ))}
    </div>
  );
}
