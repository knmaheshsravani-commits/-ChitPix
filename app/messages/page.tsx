"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MessagesPage(){
  const [users,setUsers]=useState<any[]>([]);
  const [sel,setSel]=useState<any>(null);
  const [msgs,setMsgs]=useState<any[]>([]);
  const [text,setText]=useState("");
  const [myId,setMyId]=useState("");

  useEffect(()=>{
    (async()=>{
      const {data:{user}} = await supabase.auth.getUser();
      if(user) setMyId(user.id);
      const {data} = await supabase.from("profiles").select("*");
      if(data) setUsers(data.filter((u:any)=>u.id!==user?.id));
    })();
  },[]);

  useEffect(()=>{
    if(!sel) return;
    const load=async()=>{
      const {data}=await supabase.from("direct_messages").select("*").or(`and(sender_id.eq.${myId},receiver_id.eq.${sel.id}),and(sender_id.eq.${sel.id},receiver_id.eq.${myId})`).order("created_at");
      if(data) setMsgs(data);
    };
    load();
    const ch=supabase.channel("dm").on("postgres_changes",{event:"*",schema:"public",table:"direct_messages"},load).subscribe();
    return()=>{supabase.removeChannel(ch)};
  },[sel]);

  const send=async()=>{
    if(!text.trim()) return;
    await supabase.from("direct_messages").insert({sender_id:myId,receiver_id:sel.id,content:text});
    setText("");
  };

  return(
    <div className="flex h-screen bg-black text-white">
      <div className="w-1/3 border-r border-zinc-800 p-3">
        <h2 className="font-bold mb-3">Messages</h2>
        {users.map(u=>(
          <div key={u.id} onClick={()=>setSel(u)} className={`p-3 rounded cursor-pointer hover:bg-zinc-800 ${sel?.id===u.id?'bg-zinc-800':''}`}>
            {u.username||u.email?.split('@')[0]}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        {sel?(
          <>
            <div className="p-4 border-b border-zinc-800 font-bold">{sel.username||'Chat'}</div>
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {msgs.map(m=>(
                <div key={m.id} className={`p-2 px-3 rounded-xl max-w-[70%] ${m.sender_id===myId?'bg-blue-600 ml-auto':'bg-zinc-800'}`}>{m.content}</div>
              ))}
            </div>
            <div className="p-3 flex gap-2 border-t border-zinc-800">
              <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Message..." className="flex-1 bg-zinc-900 rounded-full px-4 py-2 outline-none"/>
              <button onClick={send} className="bg-blue-600 px-4 py-2 rounded-full font-bold">Send</button>
            </div>
          </>
        ):(
          <div className="m-auto opacity-50">Select a user 💬</div>
        )}
      </div>
    </div>
  );
}
