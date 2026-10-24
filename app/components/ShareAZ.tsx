'use client';
import { useState } from "react";

// ✅ BUILD FIX - type any tho error pothundi
type Post = any;

const NewIcons = {
  Copy: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V7a2 2 0 0 1 2-2h8"/></svg>,
  WhatsApp: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.6"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M8.5 13.5c.5 1 2 2.5 4.5 2.5"/></svg>,
  Download: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M12 3v13"/><path d="m6 12 6 6 6-6"/><path d="M3 21h18"/></svg>,
  QR: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Story: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg>,
  Remix: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M12 3v18M3 12h18"/></svg>,
  Feed: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>,
  Repost: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6"><path d="M17 3v4H3"/><path d="M7 21v-4h14"/></svg>,
};

export default function ShareAZ({ post, onClose, onDownload, onShare, onToast }: any) {
  const [copied, setCopied] = useState(false);

  const handleAction = (type: string) => {
    const url = post?.image_url || window.location.href;
    
    if(type === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      onToast?.('Link Copied! ✅');
      setTimeout(()=>setCopied(false), 2000);
      return;
    }
    if(type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
    }
    if(type === 'download') {
      onDownload?.(post);
      onToast?.('Downloading... ⬇️');
    }
    if(type === 'qr') onToast?.('QR Code Opening... 🔳');
    if(type === 'story') { onToast?.('Added to Story! ✨'); onClose?.(); return; }
    if(type === 'remix') onToast?.('Remix Opening... ♻️');
    if(type === 'feed') { onShare?.(post); onToast?.('Shared to Feed ✅'); }
    if(type === 'repost') { onShare?.(post); onToast?.('Reposted! 🔁'); }
    
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-white rounded-t-[28px] p-5 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e=>e.stopPropagation()}>
        
        {/* Handle */}
        <div className="flex justify-center pb-3"><div className="w-10 h-1 bg-zinc-300 rounded-full"/></div>
        
        {/* Header like your photo */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-[18px]">Share</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">✕</button>
        </div>
        <p className="text-[12px] text-zinc-500 text-center mb-4">1.2M shares · 320K saves · Share this reel</p>

        {/* Recent Chats - Like your photo */}
        <p className="font-semibold text-[13px] mb-2">Recent Chats</p>
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
          {[
            {n:'Alex', c:'bg-orange-200'}, {n:'Mia', c:'bg-blue-200'}, 
            {n:'Jordan', c:'bg-pink-200'}, {n:'Priya', c:'bg-green-200'},
            {n:'Sam', c:'bg-purple-200'}, {n:'Rohan', c:'bg-yellow-200'},
            {n:'Tara', c:'bg-red-200'}
          ].map(p => (
            <div key={p.n} onClick={()=>handleAction('dm')} className="flex flex-col items-center gap-1 min-w-[56px] cursor-pointer active:scale-95">
              <div className={`w-14 h-14 rounded-full ${p.c} border-2 border-white shadow flex items-center justify-center font-bold text-xs`}>{p.n[0]}</div>
              <span className="text-[11px]">{p.n}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 min-w-[56px]">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xs">+36</div>
            <span className="text-[11px]">More</span>
          </div>
        </div>

        {/* Search bar - Like your photo */}
        <div className="mt-2 bg-zinc-100 rounded-full flex items-center px-4 py-2.5 gap-2">
          <span className="text-zinc-400">🔍</span>
          <input placeholder="Search people, apps, or places" className="bg-transparent w-full outline-none text-[13px] placeholder:text-zinc-400" />
          <span>🎤</span>
        </div>

        {/* Quick Actions - 8 GRID - Your NewIcons */}
        <p className="font-semibold text-[13px] mt-5 mb-3">✨ Quick Actions</p>
        <div className="grid grid-cols-4 gap-4">
          <button onClick={()=>handleAction('copy')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center"><NewIcons.Copy/></div><span className="text-[10px] text-center">{copied ? 'Copied!' : 'Copy Link'}</span></button>
          <button onClick={()=>handleAction('whatsapp')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center"><NewIcons.WhatsApp/></div><span className="text-[10px]">WhatsApp</span></button>
          <button onClick={()=>handleAction('download')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center"><NewIcons.Download/></div><span className="text-[10px]">Download</span></button>
          <button onClick={()=>handleAction('qr')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center"><NewIcons.QR/></div><span className="text-[10px]">QR Code</span></button>
          <button onClick={()=>handleAction('story')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center"><NewIcons.Story/></div><span className="text-[10px]">Add to Story</span></button>
          <button onClick={()=>handleAction('remix')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center relative"><NewIcons.Remix/><span className="absolute -top-1 -right-1 bg-black text-white text-[7px] px-1 rounded">PRO</span></div><span className="text-[10px]">Remix</span></button>
          <button onClick={()=>handleAction('feed')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center"><NewIcons.Feed/></div><span className="text-[10px]">Add to Feed</span></button>
          <button onClick={()=>handleAction('repost')} className="flex flex-col items-center gap-1.5 active:scale-90 transition"><div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center"><NewIcons.Repost/></div><span className="text-[10px]">Repost</span></button>
        </div>

        {/* More Options - Extra 22 */}
        <p className="font-semibold text-[13px] mt-5 mb-3">More Options</p>
        <div className="grid grid-cols-4 gap-4 opacity-80">
          {['Telegram','TikTok','Facebook','Email','Save Files','AI Caption','Embed','Message','Link Bio','Schedule','Collab','More...'].map(l=>(
            <button key={l} onClick={()=>{onToast?.(`${l} - Coming soon!`);}} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-[10px]">🔗</div>
              <span className="text-[9px] text-center">{l}</span>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-full mt-6 bg-black text-white py-3.5 rounded-full font-semibold active:scale-95 transition">Close</button>
        
        <p className="text-[10px] text-zinc-400 text-center mt-3">🔒 Privacy: Everyone can view and remix</p>
      </div>
    </div>
  );
}
