"use client"

export default function BottomNav() {
  const iconSize = 26
  const strokeW = 1.8
  const activeStroke = 2.3

  // Simple active check without hooks - build error radu
  const path = typeof window !== "undefined" ? window.location.pathname : "/"

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center py-3 px-2 z-50">
      
      {/* 1 HOME */}
      <button onClick={()=>window.location.href="/"} className="w-10 h-10 flex items-center justify-center">
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={path==="/" ? activeStroke : strokeW} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9L12 2
