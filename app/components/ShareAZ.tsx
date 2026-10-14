'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ShareAZ({ post, onClose }: { post: any, onClose: () => void }) {
  const rawUrl = post?.image_url || post?.image || post?.video_url || post?.url || ""
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : rawUrl
  const [copied, setCopied] = useState(false)

  const track = async (platform: string) => {
    const myName = localStorage.getItem("chitpix_username") || "guest"
    await supabase.from("shares").insert({ post_id: String(post.id), username: myName, platform })
  }

  const doWhatsApp = async () => {
    await track("whatsapp")
    window.open(`https://wa.me/?text=${encodeURIComponent("Check this 🔥 on ChitPix " + shareUrl)}`, "_blank")
    onClose()
  }

  const doCopy = async () => {
    await track("copy")
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(()=>{ alert("Link Copied! ✅"); onClose() }, 300)
  }

  const doInsta = async () => {
    await track("instagram")
    if (navigator.share) {
      try { await navigator.share({ title: 'ChitPix', text: 'Check this reel 🔥', url: shareUrl }) } catch {}
    } else {
      doCopy()
    }
    onClose()
  }

  const doSaveR2 = async () => {
    await track("save_r2")
    try {
      const res = await fetch(rawUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chitpix-${post.id}.${rawUrl.includes('.mp4') ? 'mp4' : 'jpg'}`
      a.click()
      URL.revokeObjectURL(url)
      alert("Saved from R2 ✅ 200MB Original!")
    } catch {
      window.open(rawUrl, "_blank")
    }
    onClose()
  }

  const doNative = async () => {
    await track("native")
    if (navigator.share) {
      await navigator.share({ title: 'ChitPix', url: shareUrl })
    }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '470px', borderRadius: '16px 16px 0 0', padding: '20px 16px 30px' }} onClick={e=>e.stopPropagation()}>
        <div style={{ width: '40px', height: '4px', background: '#dbdbdb', borderRadius: '2px', margin: '0 auto 16px' }}></div>
        <h3 style={{ textAlign: 'center', fontWeight: 700, marginBottom: '20px' }}>Share A to Z</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          <button onClick={doWhatsApp} style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '22px' }}>W</div><span style={{ fontSize: '12px' }}>WhatsApp</span>
          </button>
          <button onClick={doInsta} style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>IG</div><span style={{ fontSize: '12px' }}>Instagram</span>
          </button>
          <button onClick={doCopy} style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: copied? '#000' : '#efefef', color: copied? '#fff':'#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{copied? '✓':'🔗'}</div><span style={{ fontSize: '12px' }}>{copied? 'Copied':'Copy'}</span>
          </button>
          <button onClick={doSaveR2} style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#fff' }}>⬇️</div><span style={{ fontSize: '12px' }}>Save R2</span>
          </button>
        </div>
        <button onClick={doNative} style={{ width: '100%', marginTop: '20px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 700 }}>More Options...</button>
      </div>
    </div>
  )
}
