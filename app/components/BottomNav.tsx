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
        // 1. Use the avatar supplied by the Profile page.
        if (avatar && !avatar.startsWith("blob:")) {
          setProfilePhoto(avatar)
          return
        }

        // 2. Load the signed-in user's saved profile photo.
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

        // 3. Fallback to the previous localStorage value.
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

    if (pathname !== path) {
      router.push(path)
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const iconClass = (selected: boolean) =>
    `flex items-center justify-center w-[52px] h-[44px] rounded-full transition-colors ${
      selected ? "bg-neutral-100" : "bg-transparent"
    }`

  const iconStroke = (selected: boolean) => ({
    color: "#111111",
    strokeWidth: selected ? 2.3 : 1.8,
  })

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-neutral-200 flex justify-around items-center h-[62px] z-[99999]"
      style={{
        backgroundColor: "#ffffff",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* HOME */}
      <button
        type="button"
        aria-label="Home"
        aria-current={isHome ? "page" : undefined}
        onClick={() => goTo("/", "home")}
        className={iconClass(isHome)}
        style={iconStroke(isHome)}
      >
        <svg
          width="27"
          height="27"
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 12.5 14 3.5l10.5 9" />
          <path d="M6.5 11v12h6v-7h3v7h6V11" />
        </svg>
      </button>

      {/* SEARCH */}
      <button
        type="button"
        aria-label="Search"
        aria-current={isSearch ? "page" : undefined}
        onClick={() => goTo("/search", "search")}
        className={iconClass(isSearch)}
        style={iconStroke(isSearch)}
      >
        <svg
          width="27"
          height="27"
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="7.5" />
          <path d="m17.5 17.5 6 6" />
        </svg>
      </button>

      {/* DIRECT MESSAGES */}
      <button
        type="button"
        aria-label="Direct messages"
        aria-current={isDM ? "page" : undefined}
        onClick={() => goTo("/messages", "messages")}
        className={iconClass(isDM)}
        style={iconStroke(isDM)}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M24.5 3.5 12.8 15.2" />
          <path d="m24.5 3.5-7.4 21-4.3-9.3-9.3-4.3z" />
        </svg>
      </button>

      {/* REELS */}
      <button
        type="button"
        aria-label="Reels"
        aria-current={isReels ? "page" : undefined}
        onClick={() => goTo("/reels", "reels")}
        className={iconClass(isReels)}
        style={iconStroke(isReels)}
      >
        <svg
          width="27"
          height="27"
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="22" height="22" rx="6" />
          <path d="M3.5 10h21" />
          <path d="m10 3 5 7" />
          <path d="m17 3 5 7" />
          <path
            d="m12 13 6 3.5-6 3.5z"
            fill="currentColor"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* PROFILE */}
      <button
        type="button"
        aria-label="Profile"
        aria-current={isProfile ? "page" : undefined}
        onClick={() => goTo("/profile", "profile")}
        className="flex items-center justify-center w-[52px] h-[44px] rounded-full"
        style={iconStroke(isProfile)}
      >
        <div
          className={`w-[32px] h-[32px] rounded-full overflow-hidden ${
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
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.5 3.2-7 8-7s8 2.5 8 7" />
              </svg>
            </div>
          )}
        </div>
      </button>
    </nav>
  )
                }
