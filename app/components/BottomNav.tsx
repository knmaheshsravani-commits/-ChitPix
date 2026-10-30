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
    `flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full transition-colors ${
      selected ? "bg-neutral-100" : "bg-transparent"
    }`

  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 z-[99999] flex h-[82px] w-full max-w-[480px] -translate-x-1/2 items-center justify-around border-t border-neutral-100 bg-white px-2"
      style={{
        backgroundColor: "#ffffff",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >

      {/* 1. HOME */}
      <button
        type="button"
        aria-label="Home"
        aria-current={isHome ? "page" : undefined}
        onClick={() => goTo("/", "home")}
        className={buttonClass(isHome)}
        style={{ color: "#111111" }}
      >
        <svg width="39" height="39" viewBox="0 0 40 40" {...stroke}>
          <path d="M4 18.5 20 5 36 18.5" />
          <path d="M8 17v18h9V24h6v11h9V17" />
        </svg>
      </button>

      {/* 2. SEARCH */}
      <button
        type="button"
        aria-label="Search"
        aria-current={isSearch ? "page" : undefined}
        onClick={() => goTo("/search", "search")}
        className={buttonClass(isSearch)}
        style={{ color: "#111111" }}
      >
        <svg width="39" height="39" viewBox="0 0 40 40" {...stroke}>
          <circle cx="17.5" cy="17.5" r="13" />
          <path d="m27 27 9 9" />
        </svg>
      </button>

      {/* 3. DIRECT MESSAGE */}
      <button
        type="button"
        aria-label="Direct messages"
        aria-current={isDM ? "page" : undefined}
        onClick={() => goTo("/messages", "messages")}
        className={buttonClass(isDM)}
        style={{ color: "#111111" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" {...stroke}>
          <path d="M36 4 4 17.5l13 5.5L23 36 36 4Z" />
          <path d="m17 23 19-19" />
        </svg>
      </button>

      {/* 4. REELS */}
      <button
        type="button"
        aria-label="Reels"
        aria-current={isReels ? "page" : undefined}
        onClick={() => goTo("/reels", "reels")}
        className={buttonClass(isReels)}
        style={{ color: "#111111" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" {...stroke}>
          <rect x="3" y="5" width="34" height="30" rx="6" />
          <path d="M3 14h34" />
          <path d="m9 5 6 9" />
          <path d="m20 5 6 9" />
          <path d="m17 19 10 6-10 6V19Z" fill="currentColor" />
        </svg>
      </button>

      {/* 5. PROFILE DP */}
      <button
        type="button"
        aria-label="Profile"
        aria-current={isProfile ? "page" : undefined}
        onClick={() => goTo("/profile", "profile")}
        className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full"
      >
        <div
          className={`h-[43px] w-[43px] overflow-hidden rounded-full ${
            isProfile
              ? "ring-2 ring-black ring-offset-2"
              : "border border-neutral-300"
          }`}
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="My profile"
              className="h-full w-full object-cover"
              onError={() => setProfilePhoto("")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <svg
                width="29"
                height="29"
                viewBox="0 0 30 30"
                {...stroke}
              >
                <circle cx="15" cy="10" r="6" />
                <path d="M4 27c0-7 4-11 11-11s11 4 11 11" />
              </svg>
            </div>
          )}
        </div>
      </button>

    </nav>
  )
}
