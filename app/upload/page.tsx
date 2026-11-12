"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Upload,
  ImagePlus,
  Video,
  X,
  LoaderCircle,
  Save,
  WandSparkles,
  Scissors,
  Music2,
  CalendarClock,
  Users,
  CheckCircle2,
} from "lucide-react"
import { supabase } from "../../lib/supabase"

const R2_PUBLIC =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

const FILTERS = [
  { name: "Normal", value: "none" },
  { name: "Bright", value: "brightness(1.2) saturate(1.2)" },
  { name: "Vintage", value: "sepia(0.35) contrast(1.1)" },
  { name: "Cool", value: "saturate(1.2) hue-rotate(15deg)" },
  { name: "B&W", value: "grayscale(1)" },
  { name: "Warm", value: "sepia(0.2) saturate(1.4)" },
]

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState("reel")
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("")
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState("")
  const [filter, setFilter] = useState("none")
  const [activeFilter, setActiveFilter] = useState("Normal")
  const [audioName, setAudioName] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [collaborator, setCollaborator] = useState("")
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOption1, setPollOption1] = useState("")
  const [pollOption2, setPollOption2] = useState("")

  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    let selectedMode = params.get("type") || "reel"

    if (params.get("draft") === "1") selectedMode = "draft"
    else if (params.get("effects") === "1") selectedMode = "effects"
    else if (params.get("edit") === "1") selectedMode = "edit"
    else if (params.get("schedule") === "1") selectedMode = "schedule"
    else if (params.get("poll") === "1") selectedMode = "poll"
    else if (params.get("collab") === "1") selectedMode = "collab"

    setMode(selectedMode)
    

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        setNotice("Munduga ChitPix lo login avvu")
        return
      }

      setUserId(data.user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .maybeSingle()

      setUsername(
        profile?.username ||
        data.user.user_metadata?.username ||
        data.user.email?.split("@")[0] ||
        "ChitPix User"
      )
    }

    loadUser()

    // Restore a locally saved draft
    try {
      const draft = localStorage.getItem("chitpix_reel_draft")
      if (draft) {
        const parsed = JSON.parse(draft)
        setCaption(parsed.caption || "")
        setAudioName(parsed.audioName || "")
      }
    } catch {
      console.log("Draft restore skipped")
    }
  }, [])

  useEffect(() => {
    if (!selectedFile) {
      setPreview("")
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  const isVideo = selectedFile?.type.startsWith("video/") || false

  const pageTitle = {
    reel: "Create New Reel",
    post: "Create Post",
    draft: "Edit Draft Reel",
    effects: "Video Effects",
    edit: "Video Editor",
    schedule: "Schedule Reel",
    poll: "Poll / Quiz Reel",
    collab: "Collab Reel",
  }[mode] || "Create on ChitPix"

  const handleSelectFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/")
    ) {
      setNotice("Photo leda video select cheyyi")
      return
    }

    const maxSize = file.type.startsWith("video/")
      ? 100 * 1024 * 1024
      : 15 * 1024 * 1024

    if (file.size > maxSize) {
      setNotice(
        file.type.startsWith("video/")
          ? "Video size 100MB lopala undali"
          : "Photo size 15MB lopala undali"
      )
      return
    }

    setSelectedFile(file)
    setNotice("")
  }

  const saveDraft = () => {
    localStorage.setItem(
      "chitpix_reel_draft",
      JSON.stringify({
        caption,
        audioName,
        savedAt: new Date().toISOString(),
      })
    )

    setNotice("Draft saved on this device!")
  }

  const handleUpload = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!userId) {
      setNotice("Munduga login avvu")
      return
    }

    if (!selectedFile) {
      setNotice("Munduga photo leda video select cheyyi")
      return
    }

    if (mode === "reel" && !isVideo) {
      setNotice("Reel kosam video select cheyyi")
      return
    }

    if (mode === "schedule" && !scheduledAt) {
      setNotice("Schedule date and time select cheyyi")
      return
    }

    setUploading(true)
    setNotice("Uploading to ChitPix...")

    try {
      // Get Cloudflare R2 upload URL
      const presignResponse = await fetch("/api/r2-presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: `posts/${Date.now()}_${selectedFile.name}`,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      })

      const presignData = await presignResponse.json()

      if (!presignResponse.ok) {
        throw new Error(
          presignData.error || "R2 presign failed"
        )
      }

      const uploadUrl = presignData.uploadUrl || presignData.url

      const publicUrl =
        presignData.publicUrl ||
        (presignData.key
          ? `${R2_PUBLIC.replace(/\/$/, "")}/${presignData.key}`
          : "")

      if (!uploadUrl || !publicUrl) {
        throw new Error("R2 upload URL dorakaledu")
      }

      // Upload actual media to R2
      const r2Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      })

      if (!r2Response.ok) {
        throw new Error("R2 upload failed")
      }

      // Save using the existing posts table fields
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          image_url: publicUrl,
          r2_url: publicUrl,
          caption: caption.trim(),
          username,
          price: price.trim() || null,
        })

      if (error) throw error

      localStorage.removeItem("chitpix_reel_draft")

      setNotice("Upload successful!")
      setSelectedFile(null)
      setCaption("")
      setPrice("")

      setTimeout(() => {
        router.push("/reels")
      }, 1200)
    } catch (error: any) {
      console.error("ChitPix upload error:", error)
      setNotice(error?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-black pb-10 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/10 bg-black px-4 py-4">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-white/10"
        >
          <ArrowLeft size={23} />
        </button>

        <h1 className="flex-1 text-lg font-bold">
          {pageTitle}
        </h1>

        <button
          onClick={saveDraft}
          className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-xs"
        >
          <Save size={16} />
          Draft
        </button>
      </header>

      <form
        onSubmit={handleUpload}
        className="mx-auto max-w-xl space-y-5 p-4"
      >

        {/* FILE PICKER */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex min-h-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/30 bg-white/[0.06]"
        >
          {preview ? (
            <>
              {isVideo ? (
                <video
                  src={preview}
                  controls
                  playsInline
                  className="max-h-[500px] w-full object-contain"
                  style={{ filter }}
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-[500px] w-full object-contain"
                  style={{ filter }}
                />
              )}

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
                className="absolute right-3 top-3 rounded-full bg-black/70 p-2"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div className="text-center">
              <ImagePlus
                size={48}
                className="mx-auto mb-3 text-white/70"
              />
              <p className="font-semibold">
                Select Photo or Video
              </p>
              <p className="mt-2 text-xs text-white/50">
                Video up to 100MB · Photo up to 15MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleSelectFile}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 font-semibold"
        >
          {isVideo ? <Video size={20} /> : <ImagePlus size={20} />}
          Choose Media
        </button>

        {/* EFFECTS */}
        {mode === "effects" && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-bold">
              <WandSparkles size={20} />
              Video Effects
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setFilter(item.value)
                    setActiveFilter(item.name)
                  }}
                  className={`rounded-xl border p-3 text-sm ${
                    activeFilter === item.name
                      ? "border-pink-500 bg-pink-500/20"
                      : "border-white/10 bg-white/[0.05]"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* VIDEO EDITOR OPTIONS */}
        {mode === "edit" && (
          <section className="rounded-xl bg-white/[0.06] p-4">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <Scissors size={20} />
              Video Editor
            </h2>
            <p className="text-xs text-white/60">
              Select a video and preview it here. Advanced trimming
              and timeline editing will be added separately.
            </p>
          </section>
        )}

        {/* CAPTION */}
        <section>
          <label className="mb-2 block text-sm font-semibold">
            Caption
          </label>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something about your Reel..."
            rows={4}
            maxLength={2200}
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] p-4 text-sm outline-none focus:border-white/40"
          />

          <p className="mt-1 text-right text-xs text-white/40">
            {caption.length}/2200
          </p>
        </section>

        {/* AUDIO NAME */}
        <section>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Music2 size={18} />
            Audio Name
          </label>

          <input
            value={audioName}
            onChange={(e) => setAudioName(e.target.value)}
            placeholder="Enter audio name"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] p-3 text-sm outline-none"
          />
        </section>

        {/* PRICE */}
        <section>
          <label className="mb-2 block text-sm font-semibold">
            Price (Optional)
          </label>

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] p-3 text-sm outline-none"
          />
        </section>

        {/* SCHEDULE */}
        {mode === "schedule" && (
          <section>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <CalendarClock size={18} />
              Schedule Date & Time
            </label>

            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-xl bg-white p-3 text-black"
            />

            <p className="mt-2 text-xs text-yellow-300">
              Scheduling requires a server-side publishing scheduler.
              This version only accepts the selected date.
            </p>
          </section>
        )}

        {/* POLL / QUIZ */}
        {mode === "poll" && (
          <section className="space-y-3 rounded-xl bg-white/[0.06] p-4">
            <h2 className="flex items-center gap-2 font-bold">
              <Users size={19} />
              Poll / Quiz
            </h2>

            <input
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Poll question"
              className="w-full rounded-lg bg-black/40 p-3 text-sm"
            />

            <input
              value={pollOption1}
              onChange={(e) => setPollOption1(e.target.value)}
              placeholder="Option 1"
              className="w-full rounded-lg bg-black/40 p-3 text-sm"
            />

            <input
              value={pollOption2}
              onChange={(e) => setPollOption2(e.target.value)}
              placeholder="Option 2"
              className="w-full rounded-lg bg-black/40 p-3 text-sm"
            />

            <p className="text-xs text-yellow-300">
              Poll answers need a dedicated database table and voting API
              before they can be published.
            </p>
          </section>
        )}

        {/* COLLAB */}
        {mode === "collab" && (
          <section>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Users size={18} />
              Collaborator Username
            </label>

            <input
              value={collaborator}
              onChange={(e) => setCollaborator(e.target.value)}
              placeholder="@username"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] p-3 text-sm outline-none"
            />

            <p className="mt-2 text-xs text-yellow-300">
              Collaboration invitations need a backend invitation feature.
            </p>
          </section>
        )}

        {/* NOTICE */}
        {notice && (
          <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-sm">
            {notice.includes("successful") ? (
              <CheckCircle2 className="text-green-400" size={19} />
            ) : null}
            {notice}
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 py-4 font-bold disabled:opacity-40"
        >
          {uploading ? (
            <>
              <LoaderCircle className="animate-spin" size={20} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Publish to ChitPix
            </>
          )}
        </button>

      </form>
    </main>
  )
        }
      
