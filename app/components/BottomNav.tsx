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
        if (avatar && !avatar.startsWith("blob:")) {
          setProfilePhoto(avatar)
          return
        }

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

    void loadPhoto()

    window.addEventListener("storage", loadPhoto)
    window.addEventListener("chitpix-profile-photo-updated", loadPhoto)

    return () => {
      cancelled = true
      window.removeEventListener("storage", loadPhoto)
      window.removeEventListener("chitpix-profile-photo-updated", loadPhoto)
    }
  }, [avatar])

  const isHome = pathname === "/"
  const isSearch = pathname.startsWith("/search")
  const isDM = pathname.startsWith("/messages")
  const isReels = pathname.startsWith("/reels")
  const isProfile =
    pathname === "/profile" || pathname.startsWith("/profile/")

  const goTo = (path: string, tab: string) => {
    if (setActiveTab) setActiveTab(tab)

    if (pathname !== path) {
      router.push(path)
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const buttonClass = (selected: boolean) =>
    `flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
      selected
        ? "bg-neutral-100 scale-105"
        : "bg-transparent active:scale-90"
    }`

  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  // PART 2 CONTINUES BELOW
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999] border-t border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-black/95">
      <div className="mx-auto flex h-[62px] max-w-[600px] items-center justify-around px-2">

        {/* 1. HOME */}
        <button
          type="button"
          onClick={() => goTo("/", "home")}
          className={buttonClass(isHome)}
          aria-label="Home"
        >
          <svg width="25" height="25" viewBox="0 0 24 24" {...stroke}>
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v11h14V9" />
            <path d="M9 20v-7h6v7" />
          </svg>
        </button>

        {/* 2. SEARCH */}
        <button
          type="button"
          onClick={() => goTo("/search", "search")}
          className={buttonClass(isSearch)}
          aria-label="Search"
        >
          <svg width="25" height="25" viewBox="0 0 24 24" {...stroke}>
            <circle cx="11" cy="11" r="7.5" />
            <path d="m16.5 16.5 4 4" />
          </svg>
        </button>

        {/* 3. DM */}
        <button
          type="button"
          onClick={() => goTo("/messages", "dm")}
          className={buttonClass(isDM)}
          aria-label="Messages"
        >
          <svg width="25" height="25" viewBox="0 0 24 24" {...stroke}>
            <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8.5Z" />
            <path d="M8 12h.01M12 12h.01M16 12h.01" />
          </svg>
        </button>

        {/* 4. REELS */}
        <button
          type="button"
          onClick={() => goTo("/reels", "reels")}
          className={buttonClass(isReels)}
          aria-label="Reels"
        >
          <svg width="25" height="25" viewBox="0 0 24 24" {...stroke}>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="m10 8 6 4-6 4Z" />
            <path d="m3 8 18 0" />
            <path d="m8 3 4 5" />
            <path d="m15 3 4 5" />
          </svg>
        </button>

        {/* 5. PROFILE */}
        <button
          type="button"
          onClick={() => goTo("/profile", "profile")}
          className={buttonClass(isProfile)}
          aria-label="Profile"
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className={`h-[27px] w-[27px] rounded-full object-cover ${
                isProfile
                  ? "ring-2 ring-black ring-offset-2 dark:ring-white dark:ring-offset-black"
                  : "border border-gray-300 dark:border-gray-600"
              }`}
            />
          ) : (
            <svg width="25" height="25" viewBox="0 0 24 24" {...stroke}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          )}
        </button>

      </div>
    </nav>
  )
}
