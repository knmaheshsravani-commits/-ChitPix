"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import BottomNav from "../components/BottomNav"

const R2_PUBLIC =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

// =====================================
// MEDIA URL HELPER
// =====================================

function fixR2Url(p: any) {
  if (!p) return ""

  let url =
    p.imageUrl ||
    p.image_url ||
    p.r2Url ||
    p.r2_url ||
    p.videoUrl ||
    p.video_url ||
    p.url ||
    p.image ||
    p.publicUrl ||
    p.key ||
    ""

  if (!url) return ""

  if (url.startsWith("http")) return url

  return `${R2_PUBLIC.replace(/\/$/, "")}/${url.replace(/^\/+/, "")}`
}

// =====================================
// VIDEO DETECTION
// =====================================

function isVideoPost(p: any) {
  if (!p) return false

  const type = String(p.type || p.p_type || "").toLowerCase()
  const url = fixR2Url(p).toLowerCase()

  return (
    type === "reel" ||
    type === "video" ||
    type === "mp4" ||
    /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url)
  )
}

// =====================================
// ICON HELPERS
// =====================================

const I = ({ c, s }: { c: string; s?: number }) => (
  <span style={{ fontSize: s || 16, lineHeight: 1 }}>{c}</span>
)

const Search = (p: any) => <I c="🔍" s={p.size} />
const X = (p: any) => <I c="✕" s={p.size} />
const Clock = (p: any) => <I c="🕒" s={p.size} />
const Heart = (p: any) => (
  <span style={{ fontSize: p.size || 16 }}>
    {p.fill && p.fill !== "none" ? "❤️" : "🤍"}
  </span>
)
const Flame = (p: any) => <I c="🔥" s={p.size} />
const Compass = (p: any) => <I c="🧭" s={p.size} />
const Hash = (p: any) => <I c="#" s={p.size} />
const Music = (p: any) => <I c="🎵" s={p.size} />
const User = (p: any) => <I c="👤" s={p.size} />
const Mic = (p: any) => <I c="🎙️" s={p.size} />

// =====================================
// USER HELPERS
// =====================================

function getUserPhoto(user: any) {
  return (
    user?.photo ||
    user?.avatar_url ||
    user?.avatar ||
    "https://i.pravatar.cc/150?u=" +
      encodeURIComponent(user?.username || "chitpix")
  )
}

function getUserName(user: any) {
  return (
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    "ChitPix User"
  )
}

// =====================================
// SEARCH PAGE
// =====================================

export default function SearchPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<any>(null)
  const [liked, setLiked] = useState<any>({})

  const [activeTab, setActiveTab] = useState("Top")
  const [recent, setRecent] = useState<string[]>([
    "maggam",
    "350",
    "kadur",
  ])

  const [toast, setToast] = useState("")
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)

  const [sort, setSort] = useState("recent")
  const [priceRange, setPriceRange] = useState([200, 2000])
  const [workType, setWorkType] = useState("All")
  const [color, setColor] = useState("All")

  const [realUsers, setRealUsers] = useState<any[]>([])
  const [navTab, setNavTab] = useState("search")

  // NEW SEARCH FEATURES
  const [showUserSuggestions, setShowUserSuggestions] =
    useState(false)

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [muted, setMuted] = useState(true)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(
    null
  )

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // =====================================
  // TOAST
  // =====================================

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(""), 2500)
  }

  // =====================================
  // PART 2 CONTINUES
  // =====================================
  // =====================================
  // PART 2: LOAD POSTS & SEARCH USERS
  // =====================================

  // LOAD REAL R2 POSTS
  useEffect(() => {
    let active = true

    const fetchR2 = async () => {
      setLoading(true)

      try {
        const res = await fetch("/api/posts?limit=100", {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("Posts API failed")
        }

        const data = await res.json()

        // Your posts API returns an array directly.
        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data.posts)
            ? data.posts
            : []

        const r2Posts = raw
          .map((p: any) => {
            const mediaUrl = fixR2Url(p)

            return {
              ...p,
              image: mediaUrl,
              image_url: mediaUrl,
              videoUrl: mediaUrl,
              caption: p.caption || p.content || "ChitPix",
              username: p.username || "chitpix_user",
              likes: Number(p.likes || 0),
              views: Number(p.views || 0),
              price: Number(p.price || 0),
              color: p.color || "gold",
              work: p.work || p.category || "Maggam",
              category: p.category || "For You",
              id: p.id || mediaUrl,
              isVideo: isVideoPost(p),
            }
          })
          .filter((p: any) => p.image)

        if (active) {
          setPosts(r2Posts)
        }
      } catch (error) {
        console.error("ChitPix Search posts error:", error)

        if (active) {
          setPosts([])
          showToast("Unable to load posts")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchR2()

    return () => {
      active = false
    }
  }, [])

  // =====================================
  // LIVE PEOPLE SEARCH
  // =====================================

  useEffect(() => {
    const searchText = query.trim()

    if (!searchText) {
      setRealUsers([])
      setUsersLoading(false)
      return
    }

    let active = true

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setUsersLoading(true)

      try {
        const res = await fetch(
          "/api/users?search=" + encodeURIComponent(searchText),
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        if (!res.ok) {
          throw new Error("User search failed")
        }

        const data = await res.json()

        const users = Array.isArray(data.users)
          ? data.users
          : []

        if (active) {
          setRealUsers(users)
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("ChitPix user search error:", error)

          if (active) {
            setRealUsers([])
          }
        }
      } finally {
        if (active) {
          setUsersLoading(false)
        }
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // =====================================
  // SAVE RECENT SEARCH
  // =====================================

  const saveRecent = (value: string) => {
    const q = value.trim()

    if (!q) return

    setRecent((previous) =>
      [q, ...previous.filter((item) => item !== q)].slice(0, 10)
    )
  }

  // =====================================
  // SEARCH INPUT HANDLER
  // =====================================

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setShowUserSuggestions(Boolean(value.trim()))
    setActiveTab("Top")
  }

  const clearSearch = () => {
    setQuery("")
    setRealUsers([])
    setShowUserSuggestions(false)
    setSelectedUser(null)
    searchInputRef.current?.focus()
  }

  // =====================================
  // OPEN USER PROFILE
  // =====================================

  const openUserProfile = (user: any) => {
    if (!user?.username) {
      showToast("User profile is unavailable")
      return
    }

    saveRecent(user.username)
    window.location.href =
      "/profile/" + encodeURIComponent(user.username)
  }

  // =====================================
  // PART 3 CONTINUES
  // =====================================
      
  // =====================================
  // PART 3 - POSTS & USER FILTERING
  // =====================================

  const getPostId = (post: any, index: number) => {
    return String(
      post?.id ||
      post?.key ||
      post?.imageUrl ||
      post?.image_url ||
      index
    )
  }

  // FILTER POSTS
  const filteredPosts = posts
    .filter((post: any) => {
      const searchText = query.trim().toLowerCase()

      const caption = String(post.caption || "").toLowerCase()
      const username = String(post.username || "").toLowerCase()
      const category = String(post.category || "").toLowerCase()
      const postColor = String(post.color || "").toLowerCase()
      const postWork = String(
        post.workType || post.work_type || post.category || ""
      ).toLowerCase()

      // Search caption, username and category
      const matchesSearch =
        !searchText ||
        caption.includes(searchText) ||
        username.includes(searchText) ||
        category.includes(searchText)

      // Work type filter
      const matchesWork =
        workType === "All" ||
        workType === "All Work" ||
        postWork.includes(workType.toLowerCase())

      // Color filter
      const matchesColor =
        color === "All" ||
        postColor.includes(color.toLowerCase())

      // Price filter
      const postPrice = Number(post.price || 0)

      const matchesPrice =
        postPrice === 0 ||
        (postPrice >= priceRange[0] &&
          postPrice <= priceRange[1])

      return (
        matchesSearch &&
        matchesWork &&
        matchesColor &&
        matchesPrice
      )
    })
    .sort((a: any, b: any) => {
      if (sort === "popular") {
        return Number(b.likes || 0) - Number(a.likes || 0)
      }

      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      )
    })

  // FILTER USER SEARCH RESULTS
  const matchingUsers = realUsers.filter((user: any) => {
    const searchText = query.trim().toLowerCase()

    if (!searchText) return false

    const username = String(user.username || "").toLowerCase()
    const fullName = String(
      user.fullName ||
      user.full_name ||
      user.name ||
      ""
    ).toLowerCase()

    return (
      username.includes(searchText) ||
      fullName.includes(searchText)
    )
  })

  // =====================================
  // PART 4 CONTINUES
  // =====================================
  // =====================================
  // PART 4 - REELS AUTOPLAY & ACTIONS
  // =====================================

  // VISIBLE REELS AUTO PLAY
  useEffect(() => {
    if (activeTab !== "Top") return

    const videoElements =
      document.querySelectorAll<HTMLVideoElement>(
        "[data-search-video]"
      )

    if (!videoElements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.muted = muted
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      {
        threshold: [0, 0.6, 1],
      }
    )

    videoElements.forEach((video) => {
      observer.observe(video)
    })

    return () => {
      observer.disconnect()
      videoElements.forEach((video) => video.pause())
    }
  }, [posts, activeTab, muted, query, sort, workType, color])

  // LIKE / UNLIKE POST
  const handleLike = (post: any, index: number) => {
    const id = getPostId(post, index)

    setLiked((previous: any) => ({
      ...previous,
      [id]: !previous[id],
    }))
  }

  // SHARE POST
  const handleShare = async (post: any) => {
    const mediaUrl = fixR2Url(post)
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/search`
        : "https://chitpix.com"

    const shareText = post.caption
      ? `${post.caption}\n${shareUrl}`
      : `Check this out on ChitPix!\n${shareUrl}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "ChitPix",
          text: shareText,
          url: mediaUrl || shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        showToast("Link copied!")
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareText)
        showToast("Link copied!")
      } catch {
        showToast("Unable to share")
      }
    }
  }

  // SAVE POST - LOCAL UI STATE
  const [savedPosts, setSavedPosts] = useState<any>({})

  const handleSave = (post: any, index: number) => {
    const id = getPostId(post, index)

    setSavedPosts((previous: any) => ({
      ...previous,
      [id]: !previous[id],
    }))

    showToast(
      savedPosts[id] ? "Removed from saved" : "Saved!"
    )
  }

  // OPEN SELECTED POST
  const openPost = (post: any) => {
    setSelected(post)
  }

  // CLOSE SELECTED POST
  const closePost = () => {
    setSelected(null)
  }

  // TOGGLE VIDEO SOUND
  const toggleMute = () => {
    setMuted((previous) => !previous)
  }

  // =====================================
  // PART 5 CONTINUES
  // =====================================
  // =====================================
  // PART 5 - SEARCH HEADER & USER SUGGESTIONS
  // =====================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        paddingBottom: "90px",
      }}
    >
      {/* SEARCH HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#000",
          padding: "12px 14px",
          borderBottom: "1px solid #222",
        }}
      >
        <h2
          style={{
            fontSize: "23px",
            fontWeight: 800,
            margin: "2px 0 14px",
          }}
        >
          Explore
        </h2>

        {/* SEARCH INPUT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#202020",
            borderRadius: "12px",
            padding: "0 13px",
            height: "46px",
          }}
        >
          <Search size={19} />

          <input
            ref={searchInputRef}
            type="text"
            value={query}
            placeholder="Search people, posts..."
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowUserSuggestions(true)}
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#fff",
              fontSize: "15px",
            }}
          />

          {query && (
            <button
              onClick={clearSearch}
              style={{
                border: "none",
                background: "transparent",
                color: "#aaa",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* SEARCH TABS */}
        <div
          style={{
            display: "flex",
            gap: "28px",
            marginTop: "17px",
            borderBottom: "1px solid #252525",
          }}
        >
          {["Top", "Accounts", "Tags"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setShowUserSuggestions(false)
              }}
              style={{
                background: "transparent",
                border: "none",
                color: activeTab === tab ? "#fff" : "#888",
                fontSize: "14px",
                fontWeight: activeTab === tab ? 700 : 500,
                padding: "0 2px 11px",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #fff"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* USER SEARCH SUGGESTIONS */}
      {query.trim() && showUserSuggestions && (
        <section style={{ padding: "12px 14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <strong style={{ fontSize: "15px" }}>
              People
            </strong>

            {usersLoading && (
              <span style={{ color: "#999", fontSize: "12px" }}>
                Searching...
              </span>
            )}
          </div>

          {matchingUsers.length > 0 ? (
            matchingUsers.slice(0, 8).map((user: any, index: number) => (
              <button
                key={user.id || user.username || index}
                onClick={() => openUserProfile(user)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9px 0",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <img
                  src={getUserPhoto(user)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://i.pravatar.cc/150?u=chitpix"
                  }}
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#333",
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    {user.username || "user"}
                  </div>

                  <div
                    style={{
                      color: "#999",
                      fontSize: "13px",
                      marginTop: "3px",
                    }}
                  >
                    {getUserName(user)}
                  </div>
                </div>

                <span style={{ color: "#888", fontSize: "20px" }}>
                  ›
                </span>
              </button>
            ))
          ) : (
            !usersLoading && (
              <p
                style={{
                  color: "#888",
                  textAlign: "center",
                  padding: "18px 0",
                  fontSize: "13px",
                }}
              >
                No people found
              </p>
            )
          )}
        </section>
      )}

      {/* PART 6 CONTINUES */}
      
      {/* =====================================
          PART 6 - EXPLORE FILTERS & MEDIA GRID
      ===================================== */}

      {activeTab === "Top" && !showUserSuggestions && (
        <section style={{ padding: "12px 3px" }}>

          {/* FILTER OPTIONS */}
          <div
            style={{
              display: "flex",
              gap: "9px",
              overflowX: "auto",
              padding: "2px 11px 13px",
            }}
          >
            <button
              onClick={() => setSort("recent")}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border: "1px solid #444",
                background: sort === "recent" ? "#fff" : "#222",
                color: sort === "recent" ? "#000" : "#fff",
                whiteSpace: "nowrap",
              }}
            >
              Recent
            </button>

            <button
              onClick={() => setSort("popular")}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border: "1px solid #444",
                background: sort === "popular" ? "#fff" : "#222",
                color: sort === "popular" ? "#000" : "#fff",
                whiteSpace: "nowrap",
              }}
            >
              Popular
            </button>

            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "20px",
                background: "#222",
                color: "#fff",
                border: "1px solid #444",
              }}
            >
              <option value="All">All Work</option>
              <option value="Tailoring">Tailoring</option>
              <option value="Blouse">Blouse</option>
              <option value="Fashion">Fashion</option>
              <option value="Design">Design</option>
            </select>

            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "20px",
                background: "#222",
                color: "#fff",
                border: "1px solid #444",
              }}
            >
              <option value="All">All Colors</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Black">Black</option>
              <option value="Green">Green</option>
              <option value="Pink">Pink</option>
            </select>
          </div>

          {/* PRICE FILTER */}
          <div style={{ padding: "0 12px 13px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#aaa",
                marginBottom: "7px",
              }}
            >
              <span>Price filter</span>
              <span>
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </span>
            </div>

            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              style={{ width: "100%" }}
            />
          </div>

          {/* EXPLORE GRID */}
          {loading ? (
            <p
              style={{
                textAlign: "center",
                color: "#aaa",
                padding: "45px 10px",
              }}
            >
              Loading Explore...
            </p>
          ) : filteredPosts.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#888",
                padding: "45px 10px",
              }}
            >
              No posts found
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "2px",
              }}
            >
              {filteredPosts.map((post: any, index: number) => {
                const id = getPostId(post, index)
                const mediaUrl = fixR2Url(post)
                const videoPost = isVideoPost(post)

                return (
                  <div
                    key={id}
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "3 / 4",
                      background: "#191919",
                      overflow: "hidden",
                    }}
                  >
                    {videoPost ? (
                      <video
                        data-search-video
                        src={mediaUrl}
                        muted={muted}
                        loop
                        playsInline
                        preload="metadata"
                        onClick={toggleMute}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={post.caption || "ChitPix post"}
                        loading="lazy"
                        onClick={() => openPost(post)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          cursor: "pointer",
                        }}
                      />
                    )}

                    {/* VIDEO LABEL */}
                    {videoPost && (
                      <button
                        onClick={toggleMute}
                        style={{
                          position: "absolute",
                          right: "7px",
                          bottom: "7px",
                          border: "none",
                          borderRadius: "50%",
                          width: "29px",
                          height: "29px",
                          background: "#0009",
                          color: "#fff",
                          fontSize: "14px",
                        }}
                      >
                        {muted ? "🔇" : "🔊"}
                      </button>
                    )}

                    {/* LIKE BUTTON */}
                    <button
                      onClick={() => handleLike(post, index)}
                      style={{
                        position: "absolute",
                        left: "6px",
                        bottom: "6px",
                        border: "none",
                        background: "#0009",
                        color: "#fff",
                        borderRadius: "15px",
                        padding: "4px 7px",
                        fontSize: "12px",
                      }}
                    >
                      {liked[id] ? "❤️" : "🤍"}
                      {" "}
                      {Number(post.likes || 0) + (liked[id] ? 1 : 0)}
                    </button>

                    {/* SAVE BUTTON */}
                    <button
                      onClick={() => handleSave(post, index)}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        border: "none",
                        background: "#0009",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        fontSize: "14px",
                      }}
                    >
                      {savedPosts[id] ? "🔖" : "♧"}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ACCOUNTS TAB */}
      {activeTab === "Accounts" && (
        <section style={{ padding: "12px 15px" }}>
          {realUsers.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center" }}>
              Search for people to find accounts
            </p>
          ) : (
            realUsers.map((user: any, index: number) => (
              <button
                key={user.id || user.username || index}
                onClick={() => openUserProfile(user)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 0",
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                  textAlign: "left",
                }}
              >
                <img
                  src={getUserPhoto(user)}
                  alt=""
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div>
                  <strong style={{ fontSize: "14px" }}>
                    {user.username || "user"}
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    {getUserName(user)}
                  </p>
                </div>
              </button>
            ))
          )}
        </section>
      )}

      {/* TAGS TAB */}
      {activeTab === "Tags" && (
        <section style={{ padding: "20px 15px" }}>
          <p style={{ color: "#aaa", textAlign: "center" }}>
            Search posts using hashtags in the search box
          </p>
        </section>
      )}

      {/* PART 7 CONTINUES */}
           
      {/* =====================================
          PART 7 - POST PREVIEW MODAL
      ===================================== */}

      {selected && (
        <div
          onClick={closePost}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "#000e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#171717",
              borderRadius: "15px",
              position: "relative",
            }}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={closePost}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 5,
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: "#000b",
                color: "#fff",
                fontSize: "22px",
              }}
            >
              ✕
            </button>

            {/* POST MEDIA */}
            {isVideoPost(selected) ? (
              <video
                src={fixR2Url(selected)}
                controls
                autoPlay
                loop
                playsInline
                muted={muted}
                style={{
                  width: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  background: "#000",
                }}
              />
            ) : (
              <img
                src={fixR2Url(selected)}
                alt={selected.caption || "ChitPix post"}
                style={{
                  width: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  background: "#000",
                }}
              />
            )}

            {/* POST DETAILS */}
            <div style={{ padding: "15px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    background: "#333",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  👤
                </div>

                <strong style={{ fontSize: "14px" }}>
                  {selected.username || "ChitPix User"}
                </strong>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "#ddd",
                  overflowWrap: "anywhere",
                }}
              >
                {selected.caption || " "}
              </p>

              {/* POST ACTIONS */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "22px",
                  paddingTop: "12px",
                  borderTop: "1px solid #333",
                }}
              >
                <button
                  onClick={() =>
                    handleLike(
                      selected,
                      posts.findIndex(
                        (p: any) => getPostId(p, 0) === getPostId(selected, 0)
                      )
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#fff",
                    fontSize: "21px",
                  }}
                >
                  {liked[getPostId(selected, 0)] ? "❤️" : "🤍"}
                </button>

                <button
                  onClick={() => handleShare(selected)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#fff",
                    fontSize: "21px",
                  }}
                >
                  ↗
                </button>

                <button
                  onClick={() =>
                    handleSave(
                      selected,
                      posts.findIndex(
                        (p: any) => getPostId(p, 0) === getPostId(selected, 0)
                      )
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#fff",
                    fontSize: "21px",
                  }}
                >
                  {savedPosts[getPostId(selected, 0)] ? "🔖" : "♧"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 300,
            background: "#333",
            color: "#fff",
            padding: "11px 18px",
            borderRadius: "25px",
            fontSize: "13px",
            boxShadow: "0 3px 15px #0008",
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}

      {/* PART 8 CONTINUES */}
                      
      {/* =====================================
          PART 8 - RECENT & TRENDING SEARCHES
      ===================================== */}

      {!query.trim() && activeTab === "Top" && (
        <section
          style={{
            padding: "18px 15px",
            borderTop: "1px solid #222",
            marginTop: "15px",
          }}
        >
          {/* RECENT SEARCHES */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <strong style={{ fontSize: "16px" }}>
              Recent Searches
            </strong>

            {recent.length > 0 && (
              <button
                onClick={() => setRecent([])}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#0095f6",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p style={{ color: "#888", fontSize: "13px" }}>
              No recent searches
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "9px",
                flexWrap: "wrap",
              }}
            >
              {recent.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  onClick={() => {
                    setQuery(item)
                    setShowUserSuggestions(false)
                    setActiveTab("Top")
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "#222",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: "20px",
                    padding: "9px 13px",
                    fontSize: "13px",
                  }}
                >
                  <Clock size={13} />
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* TRENDING SEARCHES */}
          <div style={{ marginTop: "25px" }}>
            <strong style={{ fontSize: "16px" }}>
              Trending Searches
            </strong>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "9px",
                marginTop: "14px",
              }}
            >
              {[
                "Reels",
                "Fashion",
                "Tailoring",
                "Blouse",
                "Design",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setQuery(item)
                    saveRecent(item)
                    setShowUserSuggestions(false)
                    setActiveTab("Top")
                  }}
                  style={{
                    border: "1px solid #444",
                    background: "#191919",
                    color: "#fff",
                    padding: "9px 13px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  🔥 {item}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================
          BOTTOM NAVIGATION
      ===================================== */}

      <BottomNav
        activeTab={navTab}
        setActiveTab={setNavTab}
      />

    </main>
  )
}

// =====================================
// END OF SEARCH PAGE
// =====================================
