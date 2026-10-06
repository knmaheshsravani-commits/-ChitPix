use ";
import { useState } from "react";
export default function BottomNav() {
  const [active,setActive] = useState("home");
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-black/90 backdrop-blur-xl rounded-full px-2 py-2 border border-white/10 shadow-2xl">
        {[
          {id:"home",ico:"⌂"},
          {id:"search",ico:"⌕"},
          {id:"create",ico:"+"},
          {id:"reels",ico:"▶"},
          {id:"profile",ico:"◉"},
        ].map(i=>(
          <button key={i.id} onClick={()=>setActive(i.id)} className={`w-11 h-11 rounded-full flex items-center justify-center text-[18px] transition ${i.id==="create"?"bg-white text-black scale-110":active===i.id?"bg-white/20 text-white":"text-white/60"}`}>{i.ico}</button>
        ))}
      </div>
    </div>
  );
}
