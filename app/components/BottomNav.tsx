"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function BottomNav({
  active,
  activeTab,
  setActiveTab,
  avatar = "",
}: any) {
  const pathname = usePathname()
  const router = useRouter()

  const [profilePhoto, setProfilePhoto] = useState(avatar || "")

  useEffect(() => {
    let cancelled = false

    const loadPhoto = async () => {
      try {
        // First preference: the photo supplied by the Profile page.
        if (avatar && !avatar.startsWith("blob:")) {
          setProfilePhoto(avatar)
          return
        }

        // Next preference: the signed-in user's saved Supabase profile.
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          if (!cancelled && !avatar) setProfilePhoto("")
          return
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .maybeSingle()

        if (!error && !cancelled && data?.avatar_url) {
          setProfilePhoto(data.avatar_url)
          return
        }

        // Backward compatibility with the previous localStorage value.
        const saved = localStorage.getItem("chitpix_profile_photo")
        if (!cancelled) {
          setProfilePhoto(avatar || saved || "")
        }
      } catch (error) {
        console.error("BottomNav profile photo error:", error)

        try {
          const saved = localStorage.getItem("chitpix_profile_photo")
          if (!cancelled) setProfilePhoto(avatar || saved || "")
        } catch {
          if (!cancelled) setProfilePhoto(avatar || "")
        }
      }
    }

    loadPhoto()

    window.addEventListener("storage", loadPhoto)
    window.addEventListener("chitpix-profile-photo-updated", loadPhoto)

    return () => {
      cancelled = true
      window.removeEventListener("storage", loadPhoto)
      window.removeEventListener("chitpix-profile-photo-updated", loadPhoto)
    }
  }, [avatar])

  const isHome = pathname === "/"
  const isSearch = pathname === "/search"
  const isDM = pathname === "/messages"
  const isReels = pathname === "/reels"
  const isProfile = pathname === "/profile"

  const goTo = (path: string, tab: string) => {
    if (setActiveTab) setActiveTab(tab)
    router.push(path)
    window.scrollTo(0, 0)
  }

  const iconStyle = (selected: boolean) => ({
    background: selected ? "#f2f2f2" : "transparent",
  })

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-neutral-200 flex justify-around items-center h-[60px] z-[99999]"
      style={{ backgroundColor: "white" }}
    >
      <button
        type="button"
        aria-label="Home"
        onClick={() => goTo("/", "home")}
        className="flex items-center justify-center w-[56px] h-[38px] rounded-full"
        style={iconStyle(isHome)}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8">
          <path d="M3 10L12 3L21 10V21H14V14H10V21H3Z" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Reels"
        onClick={() => goTo("/reels", "reels")}
        className="flex items-center justify-center w-[56px] h-[38px] rounded-full"
        style={iconStyle(isReels)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <path d="M10 8.5V15.5L15 12Z" fill={isReels ? "black" : "none"} />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Messages"
        onClick={() => goTo("/messages", "messages")}
        className="flex items-center justify-center w-[56px] h-[38px] rounded-full"
        style={iconStyle(isDM)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8">
          <path d="M22 3L11.5 13M22 3L15 22L11.5 13L2 9L22 3Z" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Search"
        onClick={() => goTo("/search", "search")}
        className="flex items-center justify-center w-[56px] h-[38px] rounded-full"
        style={iconStyle(isSearch)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.9">
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16L20 20" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Profile"
        onClick={() => goTo("/profile", "profile")}
        className="flex items-center justify-center w-[56px] h-[38px] rounded-full"
        style={iconStyle(isProfile)}
      >
        <div
          className={`w-[34px] h-[34px] rounded-full overflow-hidden ${
            isProfile
              ? "ring-2 ring-black ring-offset-1"
              : "border border-neutral-300"
          }`}
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="My profile"
              className="w-full h-full object-cover"
              onError={() => setProfilePhoto("")}
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="#666">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21C4 16 7 13 12 13S20 16 20 21Z" />
              </svg>
            </div>
          )}
        </div>
      </button>
    </nav>
  )
}
