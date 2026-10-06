"use client";
const users = ["You","arjun","sweety","rahul","priya","vizag_boy","hyd_girl","india"];
export default function Stories() {
  return (
    <div className="bg-white border-b border-gray-100 px-2 py-3 flex gap-4 overflow-x-auto scrollbar-hide">
      {users.map((u,i)=>(
        <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
          <div className="w-[56px] h-[56px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#FF6600] via-pink-500 to-yellow-400">
            <div className="w-full h-full bg-white rounded-full p-[2px]"><div className="w-full h-full bg-gray-200 rounded-full"></div></div>
          </div>
          <span className="text-[11px] truncate w-[60px] text-center">{u}</span>
        </div>
      ))}
    </div>
  );
}
