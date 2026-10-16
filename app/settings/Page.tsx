"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SettingsPage(){
  const router = useRouter()

  const handleLogout = () => {
    // ONLY R2 APP - No Supabase
    localStorage.removeItem('chitpix_user')
    localStorage.removeItem('username')
    localStorage.removeItem('user')
    localStorage.clear()
    sessionStorage.clear()

    // Clear R2 session if any
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    console.log("R2 Logout success")

    // Force redirect to login
    router.push("/login")
    setTimeout(() => {
      window.location.href = "/login"
    }, 200)
  }

  const Item = ({icon, title, on}:{icon:any, title:string, on?:()=>void}) => (
    <button onClick={on} className="w-full flex justify-between items-center p-4 hover:bg-zinc-50 active:bg-zinc-100 transition">
      <div className="flex items-center gap-4">
        <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
        <span className="text-[16px]">{title}</span>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  )

return(
  <div className="max-w-[470px] mx-auto bg-white min-h-screen text-black">
    {/* HEADER */}
    <div className="flex items-center gap-4 p-4 sticky top-0 bg-white z-10 border-b">
      <Link href="/profile"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></Link>
      <h1 className="font-bold text-[20px]">Settings and activity</h1>
    </div>

    {/* SEARCH */}
    <div className="px-3 pb-3 pt-3">
      <div className="bg-[#efefef] rounded-lg px-3 py-2.5 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input placeholder="Search" className="bg-transparent outline-none text-[15px] w-full" />
      </div>
    </div>

    {/* YOUR ACCOUNT */}
    <div className="p-4 border-b border-zinc-100">
      <h3 className="font-bold text-[15px] text-[#8e8e8e]">Your account</h3>
      <Link href="#" className="flex justify-between items-start mt-4">
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full border-[1.5px] border-black flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="pr-6">
            <p className="font-normal text-[16px]">Accounts Centre - R2 Storage</p>
            <p className="text-[#8e8e8e] text-[13px] mt-1">R2 bucket: chitpix / data/posts.json</p>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </Link>
    </div>

    {/* HOW YOU USE */}
    <div className="p-4 border-b border-zinc-100">
      <h3 className="font-bold text-[15px] text-[#8e8e8e] mb-2">How you use ChitPix</h3>
      <Item title="Saved - R2" icon={<span>🔖</span>} />
      <Item title="Archive - R2" icon={<span>📦</span>} />
      <Item title="Storage - 64 files in R2" icon={<span>☁️</span>} />
    </div>

    {/* LOG OUT - ONLY R2 - FIXED */}
    <div className="p-4">
      <button
        onClick={handleLogout}
        className="w-full p-4 bg-white border-2 border-red-100 hover:bg-red-50 active:bg-red-100 rounded-xl font-bold text-[16px] text-red-500 cursor-pointer touch-manipulation"
        style={{ pointerEvents: 'auto' }}
      >
        Log out - Clear R2 Session
      </button>

      <p className="text-[12px] text-[#8e8e8e] mt-4 text-center">
        ChitPix • R2 Storage Only • No Supabase
      </p>
    </div>

    <div className="h-20" />
  </div>
)
}
