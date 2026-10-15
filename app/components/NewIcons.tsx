"use client"
// Instagram / Threads style new thin icons - 100% working - R2

type IconProps = { filled?: boolean; size?: number; active?: boolean }

export const Icons = {
  // POST ACTIONS - New Design
  Heart: ({ filled=false }: {filled?:boolean}) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="1.7">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  Comment: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  Repost: () => ( // Threads style
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  Share: () => ( // IG paper plane
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Save: ({ filled=false }: {filled?:boolean}) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="1.7">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  // NEW DM - THIS WAS MISSING - NOW ADDED
  DM: ({ size=22 }: {size?:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),

  // BOTTOM NAV - Threads style
  Home: ({ active=false }: {active?:boolean}) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active?"white":"none"} stroke="white" strokeWidth="1.7"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Search: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  Create: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  ),
  Reels: ({ active=false }: {active?:boolean}) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active?"white":"none"} stroke="white" strokeWidth="1.7"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Profile: () => (
    <img src="https://pub-62904f82f9ea4d4eb7f29a4e6baf99d.r2.dev/m-logo.png" className="w-7 h-7 rounded-full border border-zinc-600 object-cover" alt="" />
  )
}
