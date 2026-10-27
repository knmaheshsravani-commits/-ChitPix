"use client"

import { useEffect, useState } from "react"

type SharePost = {
  id?: string | number
  image_url?: string
  video_url?: string
  url?: string
  share_url?: string
  caption?: string
  [key: string]: unknown
}

type ShareAZProps = {
  post?: SharePost | null
  onClose?: () => void
  onDownload?: (post: SharePost | null | undefined) => void | Promise<void>
  onShare?: (post: SharePost | null | undefined) => void
  onToast?: (message: string) => void
  onDirectMessage?: (
    post: SharePost | null | undefined,
    person: string
  ) => void
  onStory?: (post: SharePost | null | undefined) => void
  onRemix?: (post: SharePost | null | undefined) => void
  onGenerateQR?: (url: string) => void
}

const recentPeople = [
  { name: "Alex", color: "bg-orange-100" },
  { name: "Mia", color: "bg-blue-100" },
  { name: "Jordan", color: "bg-pink-100" },
  { name: "Priya", color: "bg-green-100" },
  { name: "Sam", color: "bg-purple-100" },
  { name: "Rohan", color: "bg-yellow-100" },
  { name: "Tara", color: "bg-red-100" },
]

const quickActions = [
  { id: "copy", label: "Copy Link", icon: "link" },
  { id: "whatsapp", label: "WhatsApp", icon: "wa" },
  { id: "download", label: "Download", icon: "download" },
  { id: "qr", label: "QR Code", icon: "qr" },
  { id: "story", label: "Add to Story", icon: "plus" },
  { id: "remix", label: "Remix", icon: "remix" },
  { id: "feed", label: "Add to Feed", icon: "image" },
  { id: "repost", label: "Repost", icon: "repost" },
] as const

const moreActions = [
  { id: "telegram", label: "Telegram", icon: "send" },
  { id: "facebook", label: "Facebook", icon: "facebook" },
  { id: "email", label: "Email", icon: "mail" },
  { id: "message", label: "SMS", icon: "message" },
  { id: "native", label: "More Apps", icon: "share" },
  { id: "caption", label: "Copy Caption", icon: "text" },
  { id: "media", label: "Media Link", icon: "image" },
  { id: "save", label: "Save Files", icon: "download" },
  { id: "embed", label: "Embed", icon: "code" },
  { id: "bio", label: "Link Bio", icon: "link" },
  { id: "tiktok", label: "TikTok", icon: "video" },
  { id: "ai", label: "AI Caption", icon: "sparkles" },
  { id: "hashtags", label: "Hashtags", icon: "hash" },
  { id: "schedule", label: "Schedule", icon: "clock" },
  { id: "collab", label: "Collab", icon: "users" },
  { id: "copytext", label: "Copy Text", icon: "copy" },
  { id: "more", label: "More Options", icon: "more" },
] as const

function ShareIcon({
  name,
  size = 24,
}: {
  name: string
  size?: number
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (name) {
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" />
          <path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" />
        </svg>
      )
    case "wa":
      return (
        <svg {...common}>
          <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 20.5 11.5Z" />
          <path d="M8.5 8.5c.5 2.5 2.5 4.5 5 5l1.2-1.2 2 1c-.2 1.4-1.1 2-2.4 2-3.5-.6-6.5-3.6-7-7 .1-1.2.7-2.1 2-2.3l1 2z" />
        </svg>
      )
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12m-5-5 5 5 5-5" />
          <path d="M5 17v4h14v-4" />
        </svg>
      )
    case "qr":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zm5 0h2v2h-2zm-5 5h2v2h-2zm5 0h2v2h-2" />
        </svg>
      )
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
          <rect x="3" y="3" width="18" height="18" rx="5" />
        </svg>
      )
    case "remix":
      return (
        <svg {...common}>
          <path d="m17 3 4 4-4 4" />
          <path d="M3 7h13a5 5 0 0 1 5 5" />
          <path d="m7 21-4-4 4-4" />
          <path d="M21 17H8a5 5 0 0 1-5-5" />
        </svg>
      )
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      )
    case "repost":
      return (
        <svg {...common}>
          <path d="m17 3 4 4-4 4" />
          <path d="M3 11V9a2 2 0 0 1 2-2h16" />
          <path d="m7 21-4-4 4-4" />
          <path d="M21 13v2a2 2 0 0 1-2 2H3" />
        </svg>
      )
    case "send":
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4z" />
          <path d="M22 2 11 13" />
        </svg>
      )
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5c-.8-.1-1.8-.2-2.8-.2C12.4 1.3 10 3.4 10 7v2H7v4h3v8z" />
        </svg>
      )
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      )
    case "message":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 21 11.5Z" />
        </svg>
      )
    case "share":
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.7 10.5 6.6-4m-6.6 7 6.6 4" />
        </svg>
      )
    case "text":
    case "copy":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="12" height="13" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" />
          <path d="M11 12h6m-6 4h6" />
        </svg>
      )
    case "code":
      return (
        <svg {...common}>
          <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2-11-4 14" />
        </svg>
      )
    case "video":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m10 9 5 3-5 3z" />
        </svg>
      )
    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          <path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1z" />
        </svg>
      )
    case "hash":
      return (
        <svg {...common}>
          <path d="M5 9h16M3 15h16M10 3 7 21m10-18-3 18" />
        </svg>
      )
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21v-2a7 7 0 0 1 14 0v2M16 4a4 4 0 0 1 0 8m2 3a5 5 0 0 1 4 5v1" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      )
  }
}

export default function ShareAZ({
  post,
  onClose,
  onDownload,
  onShare,
  onToast,
  onDirectMessage,
  onStory,
  onRemix,
  onGenerateQR,
}: ShareAZProps) {
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState("")
  const [busy, setBusy] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const notify = (message: string) => {
    onToast?.(message)
  }

  const getShareUrl = () => {
    if (typeof window === "undefined") return ""

    const candidate = post?.share_url || post?.url

    if (typeof candidate === "string" && candidate.trim()) {
      try {
        return new URL(candidate, window.location.origin).href
      } catch {
        // Fall back to the current page URL.
      }
    }

    return window.location.href
  }

  const copyText = async (value: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = value
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()

        const success = document.execCommand("copy")
        textarea.remove()

        if (!success) throw new Error("Copy failed")
      }

      setCopied(true)
      notify("Copied successfully! ✅")
    } catch {
      notify("Copy failed. Please try again.")
    }
  }

  const shareNative = async () => {
    const url = getShareUrl()

    if (navigator.share) {
      try {
        await navigator.share({
          title: "ChitPix",
          text:
            typeof post?.caption === "string" && post.caption
              ? post.caption
              : "Check this out on ChitPix!",
          url,
        })
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return
        notify("Sharing failed. Please try another option.")
      }
    } else {
      await copyText(url)
    }
  }

  const downloadMedia = async () => {
    if (busy) return
    setBusy(true)

    try {
      if (onDownload) {
        await onDownload(post)
        notify("Download action sent to the app.")
        return
      }

      const mediaUrl = post?.image_url || post?.video_url

      if (!mediaUrl || typeof mediaUrl !== "string") {
        notify("No image or video is available to download.")
        return
      }

      const response = await fetch(mediaUrl)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = objectUrl
      link.download = `chitpix-${post?.id ?? "media"}`
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500)
      notify("Download started! ⬇️")
    } catch {
      notify("Download failed. Check the media URL and storage CORS settings.")
    } finally {
      setBusy(false)
    }
  }

  const openExternalShare = (label: string) => {
    const url = getShareUrl()
    const caption =
      typeof post?.caption === "string" ? post.caption : "Check this on ChitPix!"

    if (label === "Email") {
      window.location.href =
        `mailto:?subject=${encodeURIComponent("ChitPix post")}` +
        `&body=${encodeURIComponent(`${caption}\n${url}`)}`
      return
    }

    if (label === "SMS") {
      window.location.href = `sms:?body=${encodeURIComponent(`${caption} ${url}`)}`
      return
    }

    if (label === "Telegram") {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(caption)}`,
        "_blank",
        "noopener,noreferrer"
      )
      return
    }

    if (label === "Facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer"
      )
    }
  }

  // PART 2 continues directly below this line.
const handleAction = async (action: string) => {
    const url = getShareUrl()
    const caption = typeof post?.caption === "string" ? post.caption : ""
    const mediaUrl =
      typeof post?.image_url === "string"
        ? post.image_url
        : typeof post?.video_url === "string"
          ? post.video_url
          : ""

    switch (action) {
      case "copy":
      case "bio":
        await copyText(url)
        return

      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${caption}\n${url}`)}`,
          "_blank",
          "noopener,noreferrer"
        )
        return

      case "download":
      case "save":
        await downloadMedia()
        return

      case "qr":
        if (onGenerateQR) {
          onGenerateQR(url)
        } else {
          setQrOpen(true)
        }
        return

      case "story":
        if (!onStory) {
          notify("Add to Story needs to be connected to your app.")
          return
        }
        onStory(post)
        onClose?.()
        return

      case "remix":
        if (!onRemix) {
          notify("Remix needs to be connected to your app.")
          return
        }
        onRemix(post)
        onClose?.()
        return

      case "feed":
      case "repost":
        if (!onShare) {
          notify("Feed and Repost need to be connected to your app.")
          return
        }
        onShare(post)
        onClose?.()
        return

      case "telegram":
        openExternalShare("Telegram")
        return

      case "facebook":
        openExternalShare("Facebook")
        return

      case "email":
        openExternalShare("Email")
        return

      case "message":
        openExternalShare("SMS")
        return

      case "native":
      case "more":
        await shareNative()
        return

      case "caption":
        if (!caption) {
          notify("This post has no caption.")
          return
        }
        await copyText(caption)
        return

      case "media":
        if (!mediaUrl) {
          notify("This post has no direct media URL.")
          return
        }
        await copyText(mediaUrl)
        return

      case "copytext":
        await copyText(`${caption}\n${url}`.trim())
        return

      case "embed":
        await copyText(
          `<iframe src="${url}" title="ChitPix post" loading="lazy"></iframe>`
        )
        return

      case "tiktok":
        notify("TikTok sharing needs a supported integration.")
        return

      case "ai":
        notify("AI Caption needs an AI caption service.")
        return

      case "hashtags":
        notify("Hashtag generation needs to be connected.")
        return

      case "schedule":
        notify("Scheduling needs a publishing scheduler.")
        return

      case "collab":
        notify("Collab needs the ChitPix collaboration feature.")
        return

      default:
        notify("This option is not available yet.")
    }
  }

  const filteredPeople = recentPeople.filter((person) =>
    person.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="relative max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] bg-white p-5 pb-7 text-zinc-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-zinc-300" />

        <div className="mb-2 flex items-center justify-between">
          <h2 id="share-title" className="text-xl font-bold">
            Share on ChitPix
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share panel"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200"
          >
            ✕
          </button>
        </div>

        <p className="mb-5 text-center text-xs text-zinc-500">
          Share photos, videos and moments with your people.
        </p>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Chats</h3>
          <button
            type="button"
            onClick={() => void shareNative()}
            className="text-xs font-semibold text-blue-600"
          >
            More sharing options
          </button>
        </div>

        <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
          {filteredPeople.map((person) => (
            <button
              key={person.name}
              type="button"
              onClick={() => {
                if (!onDirectMessage) {
                  notify("Connect the DM feature to send posts to real users.")
                  return
                }

                onDirectMessage(post, person.name)
                onClose?.()
              }}
              className="flex min-w-[58px] flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full ${person.color} text-lg font-bold`}
              >
                {person.name[0]}
              </span>
              <span className="max-w-[64px] truncate text-xs">
                {person.name}
              </span>
            </button>
          ))}

          {filteredPeople.length === 0 && (
            <p className="py-3 text-xs text-zinc-500">
              No matching sample contacts.
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 focus-within:ring-2 focus-within:ring-zinc-300">
          <ShareIcon name="link" size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sample contacts"
            aria-label="Search contacts"
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-zinc-500"
            >
              ✕
            </button>
          )}
        </label>

        <div className="mb-3 mt-6 flex items-center justify-between">
          <h3 className="text-sm font-bold">Quick Actions</h3>
          <span className="text-xs text-zinc-400">8 options</span>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-5">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={busy}
              onClick={() => void handleAction(action.id)}
              className="group flex min-w-0 flex-col items-center gap-2 disabled:opacity-50"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 transition group-hover:bg-zinc-200 group-active:scale-95">
                {action.id === "copy" && copied ? (
                  <span className="text-2xl">✓</span>
                ) : (
                  <ShareIcon name={action.icon} size={25} />
                )}
              </span>
              <span className="text-center text-[11px] leading-tight">
                {action.id === "copy" && copied ? "Copied!" : action.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-3 mt-7 flex items-center justify-between">
          <h3 className="text-sm font-bold">More Options</h3>
          <span className="text-xs text-zinc-400">17 options</span>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-5">
          {moreActions.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={busy}
              onClick={() => void handleAction(item.id)}
              className="flex min-w-0 flex-col items-center gap-2 disabled:opacity-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-800 ring-1 ring-zinc-100 transition active:scale-95">
                <ShareIcon name={item.icon} size={22} />
              </span>
              <span className="text-center text-[10px] leading-tight text-zinc-600">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {qrOpen && (
          <div className="mt-5 rounded-2xl border border-zinc-200 p-4 text-center">
            <h3 className="font-semibold">Share QR Code</h3>
            <p className="mt-1 break-all text-xs text-zinc-500">
              {getShareUrl()}
            </p>

            <img
              className="mx-auto my-3 h-48 w-48"
              alt="QR code for this share link"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getShareUrl())}`}
            />

            <p className="text-xs text-zinc-500">
              QR generation uses an external service. Avoid sharing private links.
            </p>

            <button
              type="button"
              onClick={() => setQrOpen(false)}
              className="mt-3 rounded-full bg-zinc-100 px-5 py-2 text-sm font-semibold"
            >
              Close QR
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-black py-3.5 font-semibold text-white transition active:scale-[0.98]"
        >
          Close
        </button>

        <p className="mt-3 text-center text-[10px] text-zinc-400">
          Share only content you have permission to share.
        </p>
      </section>
    </div>
  )
                }
