"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Type,
  Sticker,
  Volume2,
  VolumeX,
  Undo2,
  Redo2,
  Download,
  SlidersHorizontal,
  Sparkles,
  Gauge,
  Split,
  Trash2,
  Plus,
  Film,
  Maximize,
  Settings,
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
  { name: "Drama", value: "contrast(1.3) saturate(1.3)" },
  { name: "Fade", value: "contrast(0.85) brightness(1.1)" },
  { name: "Dream", value: "brightness(1.1) saturate(0.8)" },
  { name: "Vivid", value: "saturate(1.7) contrast(1.1)" },
]

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3]

const EDIT_TABS = [
  "Trim",
  "Audio",
  "Text",
  "Filters",
  "Adjust",
  "Crop",
  "Speed",
  "Stickers",
]

type EditorHistory = {
  filter: string
  brightness: number
  contrast: number
  saturation: number
  speed: number
  volume: number
  rotation: number
  flipH: boolean
  flipV: boolean
  caption: string
}

export default function UploadPage() {
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [mode, setMode] = useState("reel")
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("")

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("")

  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState("")

  // Editor state
  const [activeTab, setActiveTab] = useState("Trim")
  const [filter, setFilter] = useState("none")
  const [activeFilter, setActiveFilter] = useState("Normal")

  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)

  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)

  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)

  const [audioName, setAudioName] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [textOverlay, setTextOverlay] = useState("")
  const [sticker, setSticker] = useState("")

  const [scheduledAt, setScheduledAt] = useState("")
  const [collaborator, setCollaborator] = useState("")

  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOption1, setPollOption1] = useState("")
  const [pollOption2, setPollOption2] = useState("")

  // Undo / redo history
  const [history, setHistory] = useState<EditorHistory[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const isVideo =
    selectedFile?.type.startsWith("video/") || false

  const isImage =
    selectedFile?.type.startsWith("image/") || false

  
  // READ URL MODE AND LOAD USER
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

    try {
      const draft = localStorage.getItem("chitpix_reel_draft")

      if (draft) {
        const parsed = JSON.parse(draft)

        setCaption(parsed.caption || "")
        setAudioName(parsed.audioName || "")
        setTextOverlay(parsed.textOverlay || "")
      }
    } catch {
      console.log("Draft restore skipped")
    }
  }, [])

  // CREATE AND CLEAN MEDIA PREVIEW
  useEffect(() => {
    if (!selectedFile) {
      setPreview("")
      setDuration(0)
      setTrimStart(0)
      setTrimEnd(0)
      setCurrentTime(0)
      setPlaying(false)
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  // VIDEO PLAYBACK SETTINGS
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = speed
    video.volume = Math.max(0, Math.min(1, volume / 100))
    video.muted = muted
  }, [speed, volume, muted, preview])

  // VIDEO FILTER STYLE
  const videoFilter =
    `${filter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

  const videoTransform =
    `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`

  // PAGE TITLE
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

  // FORMAT VIDEO TIME
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00"

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  // CAPTURE CURRENT EDIT SETTINGS
  const getEditorSnapshot = (): EditorHistory => ({
    filter,
    brightness,
    contrast,
    saturation,
    speed,
    volume,
    rotation,
    flipH,
    flipV,
    caption,
  })

  // SAVE EDIT HISTORY
  const saveHistory = useCallback(() => {
    const snapshot = getEditorSnapshot()

    setHistory((previous) => {
      const updated = previous.slice(0, historyIndex + 1)
      updated.push(snapshot)
      return updated.slice(-30)
    })

    setHistoryIndex((previous) =>
      Math.min(previous + 1, 29)
    )
  }, [
    historyIndex,
    filter,
    brightness,
    contrast,
    saturation,
    speed,
    volume,
    rotation,
    flipH,
    flipV,
    caption,
  ])

  // RESTORE EDIT SETTINGS
  const restoreHistory = (snapshot: EditorHistory) => {
    setFilter(snapshot.filter)
    setBrightness(snapshot.brightness)
    setContrast(snapshot.contrast)
    setSaturation(snapshot.saturation)
    setSpeed(snapshot.speed)
    setVolume(snapshot.volume)
    setRotation(snapshot.rotation)
    setFlipH(snapshot.flipH)
    setFlipV(snapshot.flipV)
    setCaption(snapshot.caption)
  }

  // UNDO
  const undoEdit = () => {
    if (historyIndex <= 0) return

    const nextIndex = historyIndex - 1
    setHistoryIndex(nextIndex)
    restoreHistory(history[nextIndex])
  }

  // REDO
  const redoEdit = () => {
    if (historyIndex >= history.length - 1) return

    const nextIndex = historyIndex + 1
    setHistoryIndex(nextIndex)
    restoreHistory(history[nextIndex])
  }

  // SELECT PHOTO OR VIDEO
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
    setHistory([])
    setHistoryIndex(-1)
    setNotice("Media selected successfully!")
    event.target.value = ""
  }

  // REMOVE SELECTED MEDIA
  const removeSelectedFile = () => {
    setSelectedFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setNotice("Media removed")
  }

  // VIDEO METADATA
  const handleVideoLoaded = () => {
    const video = videoRef.current
    if (!video) return

    const total = video.duration

    if (!Number.isFinite(total)) return

    setDuration(total)
    setTrimStart(0)
    setTrimEnd(total)
    setCurrentTime(0)
  }

  // UPDATE VIDEO TIME
  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    setCurrentTime(video.currentTime)

    if (
      trimEnd > 0 &&
      video.currentTime >= trimEnd
    ) {
      video.pause()
      video.currentTime = trimStart
      setPlaying(false)
    }
  }

  // PLAY / PAUSE
  const toggleVideoPlayback = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      if (
        video.currentTime < trimStart ||
        video.currentTime >= trimEnd
      ) {
        video.currentTime = trimStart
      }

      try {
        await video.play()
        setPlaying(true)
      } catch {
        setNotice("Video playback start avvaledu")
      }
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  // SEEK VIDEO
  const seekVideo = (value: number) => {
    const video = videoRef.current
    if (!video) return

    const safeTime = Math.max(
      trimStart,
      Math.min(value, trimEnd || duration)
    )

    video.currentTime = safeTime
    setCurrentTime(safeTime)
  }

  // CHANGE TRIM START
  const changeTrimStart = (value: number) => {
    const safeValue = Math.max(
      0,
      Math.min(value, trimEnd - 0.5)
    )

    setTrimStart(safeValue)
    seekVideo(safeValue)
    saveHistory()
  }

  // CHANGE TRIM END
  const changeTrimEnd = (value: number) => {
    const safeValue = Math.min(
      duration,
      Math.max(value, trimStart + 0.5)
    )

    setTrimEnd(safeValue)
    saveHistory()
  }

  // RESET VIDEO EDIT SETTINGS
  const resetEditor = () => {
    setFilter("none")
    setActiveFilter("Normal")
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setSpeed(1)
    setVolume(100)
    setMuted(false)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)

    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.playbackRate = 1
    }

    setNotice("Editor settings reset")
  }

  // SAVE DRAFT
  const saveDraft = () => {
    try {
      localStorage.setItem(
        "chitpix_reel_draft",
        JSON.stringify({
          caption,
          audioName,
          textOverlay,
          savedAt: new Date().toISOString(),
        })
      )

      setNotice("Draft saved on this device!")
    } catch {
      setNotice("Draft save failed")
    }
  }

  
  // APPLY VIDEO FILTER
  const applyFilter = (item: (typeof FILTERS)[number]) => {
    saveHistory()
    setFilter(item.value)
    setActiveFilter(item.name)
    setNotice(`${item.name} filter selected`)
  }

  // BRIGHTNESS CONTROL
  const changeBrightness = (value: number) => {
    saveHistory()
    setBrightness(value)
  }

  // CONTRAST CONTROL
  const changeContrast = (value: number) => {
    saveHistory()
    setContrast(value)
  }

  // SATURATION CONTROL
  const changeSaturation = (value: number) => {
    saveHistory()
    setSaturation(value)
  }

  // VIDEO SPEED
  const changeSpeed = (value: number) => {
    saveHistory()
    setSpeed(value)

    if (videoRef.current) {
      videoRef.current.playbackRate = value
    }

    setNotice(`Playback speed ${value}x`)
  }

  // VIDEO VOLUME
  const changeVolume = (value: number) => {
    setVolume(value)

    if (videoRef.current) {
      videoRef.current.volume = value / 100
      videoRef.current.muted = value === 0
    }

    setMuted(value === 0)
  }

  // MUTE / UNMUTE
  const toggleMute = () => {
    const nextMuted = !muted
    setMuted(nextMuted)

    if (videoRef.current) {
      videoRef.current.muted = nextMuted
    }
  }

  // ROTATE VIDEO
  const rotateVideo = (direction: number) => {
    saveHistory()
    setRotation((previous) => (previous + direction + 360) % 360)
  }

  // FLIP HORIZONTAL
  const flipHorizontal = () => {
    saveHistory()
    setFlipH((previous) => !previous)
  }

  // FLIP VERTICAL
  const flipVertical = () => {
    saveHistory()
    setFlipV((previous) => !previous)
  }

  // SELECT EDITING TAB
  const selectEditTab = (tab: string) => {
    setActiveTab(tab)
  }

  // SELECT AUDIO FILE
  const handleAudioSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("audio/")) {
      setNotice("Audio file select cheyyi")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setNotice("Audio file 20MB lopala undali")
      return
    }

    setAudioFile(file)
    setAudioName(file.name.replace(/\.[^/.]+$/, ""))
    setNotice("Audio selected successfully!")
    event.target.value = ""
  }

  // REMOVE AUDIO
  const removeAudio = () => {
    setAudioFile(null)
    setAudioName("")
    setNotice("Audio removed")
  }

  // ADD TEXT OVERLAY
  const updateTextOverlay = (value: string) => {
    setTextOverlay(value.slice(0, 150))
  }

  // ADD STICKER
  const addSticker = (value: string) => {
    setSticker(value)
    setNotice("Sticker added to preview")
  }

  // REMOVE STICKER
  const removeSticker = () => {
    setSticker("")
  }

  // CHANGE TRIM RANGE
  const resetTrim = () => {
    setTrimStart(0)
    setTrimEnd(duration)

    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }

    setCurrentTime(0)
    setNotice("Trim range reset")
  }

  // SPLIT MARKER
  const splitAtCurrentTime = () => {
    if (!isVideo || duration <= 0) {
      setNotice("Munduga video select cheyyi")
      return
    }

    if (
      currentTime <= trimStart ||
      currentTime >= trimEnd
    ) {
      setNotice("Video madhyalo split position select cheyyi")
      return
    }

    setNotice(
      `Split marker added at ${formatTime(currentTime)}. Actual video splitting will be done during export.`
    )
  }

  // CROP PRESET
  const [cropRatio, setCropRatio] = useState("9:16")

  const cropPresets = [
    { label: "Reels", value: "9:16" },
    { label: "Square", value: "1:1" },
    { label: "Portrait", value: "4:5" },
    { label: "Landscape", value: "16:9" },
    { label: "Original", value: "original" },
  ]

  // SET CROP PRESET
  const selectCropRatio = (value: string) => {
    setCropRatio(value)
    setNotice(`${value} crop preview selected`)
  }

  // RESET ALL EDITS
  const resetAllEdits = () => {
    resetEditor()
    resetTrim()
    setTextOverlay("")
    setSticker("")
    setCropRatio("9:16")
    setNotice("All editor settings reset")
  }

  // CHECK MEDIA BEFORE EDITING
  const requireVideo = () => {
    if (!selectedFile || !isVideo) {
      setNotice("Video select chesina tarvatha use cheyyi")
      return false
    }

    return true
  }

  
  // EDITOR PANEL STATES
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [showAudioPanel, setShowAudioPanel] = useState(false)
  const [showTextPanel, setShowTextPanel] = useState(false)
  const [showStickerPanel, setShowStickerPanel] = useState(false)

  // EXPORT SETTINGS
  const [exportQuality, setExportQuality] = useState("1080p")
  const [exportFPS, setExportFPS] = useState("30")
  const [exporting, setExporting] = useState(false)

  // TIMELINE SETTINGS
  const [timelineZoom, setTimelineZoom] = useState(1)
  const [showTimeline, setShowTimeline] = useState(true)
  const [splitPoints, setSplitPoints] = useState<number[]>([])

  // AUDIO PREVIEW URL
  const [audioPreview, setAudioPreview] = useState("")

  useEffect(() => {
    if (!audioFile) {
      setAudioPreview("")
      return
    }

    const url = URL.createObjectURL(audioFile)
    setAudioPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [audioFile])

  // ADD SPLIT POINT
  const addSplitPoint = () => {
    if (!requireVideo()) return

    if (
      currentTime <= trimStart ||
      currentTime >= trimEnd
    ) {
      setNotice("Video madhyalo position select cheyyi")
      return
    }

    if (splitPoints.some(
      (point) => Math.abs(point - currentTime) < 0.2
    )) {
      setNotice("Split point already exists")
      return
    }

    setSplitPoints((previous) =>
      [...previous, currentTime].sort((a, b) => a - b)
    )

    setNotice(`Split marker added at ${formatTime(currentTime)}`)
  }

  // REMOVE SPLIT POINT
  const removeSplitPoint = (point: number) => {
    setSplitPoints((previous) =>
      previous.filter((item) => item !== point)
    )
  }

  // TIMELINE ZOOM
  const zoomTimeline = (value: number) => {
    setTimelineZoom(Math.max(0.5, Math.min(3, value)))
  }

  // SEEK TO TIMELINE POSITION
  const seekTimeline = (value: number) => {
    if (!duration) return

    const time = Math.max(
      trimStart,
      Math.min(trimEnd, value)
    )

    seekVideo(time)
  }

  // RESET TIMELINE
  const resetTimeline = () => {
    setSplitPoints([])
    setTimelineZoom(1)
    resetTrim()
    setNotice("Timeline reset")
  }

  // EXPORT SETTINGS
  const updateExportQuality = (value: string) => {
    setExportQuality(value)
  }

  const updateExportFPS = (value: string) => {
    setExportFPS(value)
  }

  // OPEN EXPORT PANEL
  const openExportPanel = () => {
    if (!selectedFile) {
      setNotice("Munduga media select cheyyi")
      return
    }

    setShowExportPanel(true)
  }

  // CLOSE ALL EDITOR PANELS
  const closeEditorPanels = () => {
    setShowExportPanel(false)
    setShowAudioPanel(false)
    setShowTextPanel(false)
    setShowStickerPanel(false)
  }

  // EDITOR FILTER PREVIEW
  const getPreviewStyle = () => ({
    filter: videoFilter,
    transform: videoTransform,
    aspectRatio:
      cropRatio === "original"
        ? undefined
        : cropRatio.replace(":", "/"),
    objectFit: "contain" as const,
  })

  // RESET FILTERS
  const resetFilters = () => {
    saveHistory()
    setFilter("none")
    setActiveFilter("Normal")
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setNotice("Filters reset")
  }

  // CHANGE TEXT
  const clearTextOverlay = () => {
    setTextOverlay("")
    setNotice("Text removed")
  }

  // CHANGE STICKER
  const stickerOptions = [
    "❤️", "🔥", "😍", "😂", "✨",
    "🌟", "🎉", "👏", "😎", "💯",
    "🌈", "🚀", "🥰", "💖", "👍",
  ]

  // MEDIA VALIDATION
  const canPublish =
    Boolean(selectedFile) &&
    Boolean(userId) &&
    !uploading

      // PART 5: UPLOAD AND PUBLISH LOGIC
  
  const uploadFileToR2 = async (file: File): Promise<string> => {
    const response = await fetch("/api/r2-presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    })

    if (!response.ok) {
      throw new Error("R2 presign request failed")
    }

    const data = await response.json()

    const uploadUrl =
      data.uploadUrl ||
      data.signedUrl ||
      data.url

    const publicUrl =
      data.publicUrl ||
      data.public_url ||
      ""

    if (!uploadUrl) {
      throw new Error("Upload URL not received from server")
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error("Media upload to R2 failed")
    }

    if (publicUrl) {
      return publicUrl
    }

    const key =
      data.key ||
      data.fileName ||
      data.filename

    if (key) {
      return `${R2_PUBLIC.replace(/\/$/, "")}/${key}`
    }

    throw new Error("Public media URL not received")
  }

  const handlePublish = async () => {
    if (!selectedFile) {
      setNotice("Please select a photo or video first")
      return
    }

    if (!userId) {
      setNotice("Please login before publishing")
      return
    }

    if (uploading) return

    try {
      setUploading(true)
      setNotice("Uploading media...")

      const mediaUrl = await uploadFileToR2(selectedFile)

      setNotice("Saving your post...")

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          image_url: mediaUrl,
          r2_url: mediaUrl,
          caption: caption.trim(),
          username: username || "ChitPix User",
          price: price ? Number(price) : null,
        })

      if (error) {
        throw error
      }

      setNotice("Published successfully!")

      setSelectedFile(null)
      setPreview("")
      setCaption("")
      setPrice("")
      setTextOverlay("")
      setSticker("")
      setAudioFile(null)
      setAudioName("")

      setTimeout(() => {
        router.push("/")
      }, 1200)
    } catch (error: any) {
      console.error("Publish error:", error)
      setNotice(
        error?.message || "Upload failed. Please try again."
      )
    } finally {
      setUploading(false)
    }
  }

  const handleSaveDraft = () => {
    if (!selectedFile) {
      setNotice("Select a media file before saving draft")
      return
    }

    try {
      const draftData = {
        caption,
        price,
        mode,
        filter,
        activeFilter,
        brightness,
        contrast,
        saturation,
        speed,
        volume,
        rotation,
        flipH,
        flipV,
        textOverlay,
        sticker,
        trimStart,
        trimEnd,
        savedAt: new Date().toISOString(),
      }

      localStorage.setItem(
        "chitpix-upload-draft",
        JSON.stringify(draftData)
      )

      setNotice("Draft details saved successfully!")
    } catch (error) {
      console.error("Draft save error:", error)
      setNotice("Unable to save draft details")
    }
  }

  const handleCancelUpload = () => {
    if (uploading) return

    setSelectedFile(null)
    setPreview("")
    setNotice("")
    setCaption("")
    setPrice("")
    setTextOverlay("")
    setSticker("")
    setAudioFile(null)
    setAudioName("")
  }

  const handleExportPreview = () => {
    if (!selectedFile) {
      setNotice("Please select a video first")
      return
    }

    if (!isVideo) {
      setNotice("Video export is available for video files")
      return
    }

    setNotice(
      "Preview settings are ready. Permanent video export needs a video rendering engine."
    )
  }

  const goBack = () => {
    if (uploading) return
    router.back()
  }

    // PART 6: MAIN EDITOR UI

  return (
    <main className="min-h-screen bg-[#09090b] text-white pb-28">

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#09090b]/95 px-4 py-3 backdrop-blur">
        <button
          onClick={goBack}
          className="rounded-full bg-white/10 p-2"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold">
            {pageTitle}
          </h1>
          <p className="text-[11px] text-gray-400">
            ChitPix Creator Studio
          </p>
        </div>

        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm"
        >
          <Save size={16} />
          Draft
        </button>
      </header>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleSelectFile}
      />

      {/* MEDIA SELECT AREA */}
      {!selectedFile && (
        <section className="mx-4 mt-6 rounded-3xl border border-dashed border-white/25 bg-white/[0.04] p-8 text-center">

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-500/15">
            <Upload size={34} className="text-fuchsia-400" />
          </div>

          <h2 className="text-xl font-bold">
            Create something amazing
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Select a photo or video from your phone
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-4 font-semibold"
          >
            <ImagePlus size={20} />
            Choose Media
          </button>

          <div className="mt-5 flex justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ImagePlus size={15} />
              Photos
            </span>
            <span className="flex items-center gap-1">
              <Video size={15} />
              Videos
            </span>
          </div>
        </section>
      )}

      {/* SELECTED MEDIA EDITOR */}
      {selectedFile && (
        <section className="px-3 pt-4">

          {/* PREVIEW HEADER */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                Editing Preview
              </h2>
              <p className="text-xs text-gray-400">
                {selectedFile.name}
              </p>
            </div>

            <button
              onClick={removeSelectedFile}
              className="rounded-full bg-red-500/15 p-2 text-red-400"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* MEDIA PREVIEW */}
          <div className="relative mx-auto flex max-h-[520px] min-h-[300px] w-full max-w-md items-center justify-center overflow-hidden rounded-3xl bg-black">

            {isVideo && preview && (
              <video
                ref={videoRef}
                src={preview}
                className="max-h-[520px] w-full object-contain"
                style={{
                  filter: videoFilter,
                  transform: videoTransform,
                }}
                playsInline
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            )}

            {isImage && preview && (
              <img
                src={preview}
                alt="ChitPix preview"
                className="max-h-[520px] w-full object-contain"
                style={{
                  filter: videoFilter,
                  transform: videoTransform,
                }}
              />
            )}

            {/* TEXT OVERLAY */}
            {textOverlay && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[85%] -translate-x-1/2 -translate-y-1/2 text-center text-2xl font-extrabold text-white [text-shadow:0_2px_8px_black]">
                {textOverlay}
              </div>
            )}

            {/* STICKER OVERLAY */}
            {sticker && (
              <div className="pointer-events-none absolute bottom-8 right-6 z-10 text-5xl">
                {sticker}
              </div>
            )}

            {/* IMAGE/VIDEO TYPE LABEL */}
            <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs">
              {isVideo ? "VIDEO" : "PHOTO"}
            </div>

            {/* PLAY / PAUSE */}
            {isVideo && (
              <button
                onClick={toggleVideoPlayback}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 p-3"
              >
                {playing ? (
                  <Pause size={22} />
                ) : (
                  <Play size={22} />
                )}
              </button>
            )}
          </div>

          {/* MEDIA ACTIONS */}
          <div className="mt-4 grid grid-cols-3 gap-2">

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm"
            >
              <Plus size={17} />
              Replace
            </button>

            <button
              onClick={resetEditor}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm"
            >
              <RotateCcw size={17} />
              Reset
            </button>

            <button
              onClick={openExportPanel}
              className="flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 py-3 text-sm font-semibold"
            >
              <Download size={17} />
              Export
            </button>

          </div>

          {/* EDITOR TABS */}
          <div className="mt-6">
            <div className="flex gap-2 overflow-x-auto pb-3">
              {EDIT_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => selectEditTab(tab)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm ${
                    activeTab === tab
                      ? "bg-fuchsia-600 text-white"
                      : "bg-white/10 text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

                    {/* PART 7: EDITING TOOLS */}

          <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

            {/* TRIM PANEL */}
            {activeTab === "Trim" && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Scissors size={18} />
                  Trim Video
                </h3>

                {isVideo ? (
                  <>
                    <div className="mb-4 flex justify-between text-sm">
                      <span className="text-gray-400">
                        Start: {formatTime(trimStart)}
                      </span>
                      <span className="text-gray-400">
                        End: {formatTime(trimEnd || duration)}
                      </span>
                    </div>

                    <label className="text-xs text-gray-400">
                      Start Time
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={duration || 1}
                      step={0.1}
                      value={trimStart}
                      onChange={(e) =>
                        changeTrimStart(Number(e.target.value))
                      }
                      className="my-3 w-full accent-fuchsia-500"
                    />

                    <label className="text-xs text-gray-400">
                      End Time
                    </label>
                    <input
                      type="range"
                      min={trimStart}
                      max={duration || 1}
                      step={0.1}
                      value={trimEnd || duration}
                      onChange={(e) =>
                        changeTrimEnd(Number(e.target.value))
                      }
                      className="my-3 w-full accent-fuchsia-500"
                    />

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={resetTrim}
                        className="flex-1 rounded-xl bg-white/10 py-3 text-sm"
                      >
                        <RotateCcw size={15} className="mr-1 inline" />
                        Reset Trim
                      </button>

                      <button
                        onClick={addSplitPoint}
                        className="flex-1 rounded-xl bg-fuchsia-600 py-3 text-sm"
                      >
                        <Split size={15} className="mr-1 inline" />
                        Add Split
                      </button>
                    </div>

                    {splitPoints.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs text-gray-400">
                          Split markers
                        </p>
                        {splitPoints.map((point, index) => (
                          <div
                            key={`${point}-${index}`}
                            className="mb-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                          >
                            <span>{formatTime(point)}</span>
                            <button
                              onClick={() => removeSplitPoint(index)}
                              className="text-red-400"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    Trim tools are available for videos.
                  </p>
                )}
              </div>
            )}

            {/* AUDIO PANEL */}
            {activeTab === "Audio" && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Music2 size={18} />
                  Audio Studio
                </h3>

                <label className="block rounded-xl bg-fuchsia-600 py-3 text-center text-sm font-semibold">
                  <Music2 size={17} className="mr-2 inline" />
                  Choose Audio
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleAudioSelect(e)}
                  />
                </label>

                {audioName && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <div className="flex items-center gap-2">
                      <Music2 size={18} className="text-fuchsia-400" />
                      <span className="max-w-[190px] truncate text-sm">
                        {audioName}
                      </span>
                    </div>

                    <button
                      onClick={removeAudio}
                      className="text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                {audioPreview && (
                  <audio
                    src={audioPreview}
                    controls
                    className="mt-3 w-full"
                  />
                )}

                <label className="mt-5 block text-sm">
                  Original Video Volume: {volume}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) =>
  setVolume(Number(e.target.value))
                  }
                  className="mt-3 w-full accent-fuchsia-500"
                />

                <button
                  onClick={toggleMute}
                  className="mt-3 w-full rounded-xl bg-white/10 py-3 text-sm"
                >
                  {muted ? (
                    <>
                      <VolumeX size={17} className="mr-2 inline" />
                      Unmute Video
                    </>
                  ) : (
                    <>
                      <Volume2 size={17} className="mr-2 inline" />
                      Mute Video
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TEXT PANEL */}
            {activeTab === "Text" && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Type size={18} />
                  Add Text
                </h3>

                <textarea
                  value={textOverlay}
                  onChange={(e) =>
                    updateTextOverlay(e.target.value)
                  }
                  placeholder="Type your text here..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-fuchsia-500"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {["Hello!", "ChitPix ❤️", "Good Vibes ✨", "My Story"].map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => updateTextOverlay(item)}
                        className="rounded-full bg-white/10 px-3 py-2 text-xs"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={clearTextOverlay}
                  className="mt-4 w-full rounded-xl bg-white/10 py-3 text-sm"
                >
                  <Trash2 size={16} className="mr-2 inline" />
                  Remove Text
                </button>
              </div>
            )}

            {/* FILTERS PANEL */}
            {activeTab === "Filters" && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <WandSparkles size={18} />
                  Photo & Video Filters
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {FILTERS.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => applyFilter(item)}
                      className={`rounded-xl border p-3 text-sm ${
                        activeFilter === item.name
                          ? "border-fuchsia-500 bg-fuchsia-500/20"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <Sparkles
                        size={18}
                        className="mx-auto mb-2 text-fuchsia-400"
                      />
                      {item.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={resetFilters}
                  className="mt-4 w-full rounded-xl bg-white/10 py-3 text-sm"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* ADJUST PANEL */}
            {activeTab === "Adjust" && (
              <div>
                <h3 className="mb-5 flex items-center gap-2 font-bold">
                  <SlidersHorizontal size={18} />
                  Adjust Image
                </h3>

                {[
                  {
                    label: "Brightness",
                    value: brightness,
                    setter: setBrightness,
                  },
                  {
                    label: "Contrast",
                    value: contrast,
                    setter: setContrast,
                  },
                  {
                    label: "Saturation",
                    value: saturation,
                    setter: setSaturation,
                  },
                ].map((item) => (
                  <div key={item.label} className="mb-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-gray-400">
                        {item.value}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={200}
                      value={item.value}
                      onChange={(e) =>
                        item.setter(Number(e.target.value))
                      }
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                ))}

                <button
                  onClick={resetFilters}
                  className="w-full rounded-xl bg-white/10 py-3 text-sm"
                >
                  Reset Adjustments
                </button>
              </div>
            )}

            {/* CROP PANEL */}
            {activeTab === "Crop" && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Crop size={18} />
                  Crop & Transform
                </h3>

                <p className="mb-3 text-xs text-gray-400">
                  Select preview aspect ratio
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {cropPresets.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => selectCropRatio(item.value)}
                      className={`rounded-xl border p-3 text-sm ${
                        cropRatio === item.value
                          ? "border-fuchsia-500 bg-fuchsia-500/20"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={rotateMedia}
                    className="rounded-xl bg-white/10 py-3 text-sm"
                  >
                    <RotateCw size={17} className="mr-2 inline" />
                    Rotate
                  </button>

                  <button
                    onClick={flipHorizontal}
                    className="rounded-xl bg-white/10 py-3 text-sm"
                  >
                    <FlipHorizontal size={17} className="mr-2 inline" />
                    Flip
                  </button>
                </div>

                <button
                  onClick={flipVertical}
                  className="mt-2 w-full rounded-xl bg-white/10 py-3 text-sm"
                >
                  <FlipVertical size={17} className="mr-2 inline" />
                  Flip Vertical
                </button>
              </div>
            )}

            {/* SPEED PANEL */}
            {activeTab === "Speed" && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Gauge size={18} />
                  Video Speed
                </h3>

                {isVideo ? (
                  <div className="grid grid-cols-4 gap-2">
                    {SPEEDS.map((item) => (
                      <button
                        key={item}
                        onClick={() => changeSpeed(item)}
                        className={`rounded-xl border py-3 text-sm ${
                          speed === item
                            ? "border-fuchsia-500 bg-fuchsia-500/20"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        {item}x
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Speed controls are available for videos.
                  </p>
                )}
              </div>
            )}

            {/* STICKERS PANEL */}
            {activeTab === "Stickers" && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Sticker size={18} />
                  Stickers
                </h3>

                <div className="grid grid-cols-5 gap-3">
                  {stickerOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => addSticker(item)}
                      className={`rounded-xl p-3 text-2xl ${
                        sticker === item
                          ? "bg-fuchsia-500/30"
                          : "bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button
                  onClick={removeSticker}
                  className="mt-4 w-full rounded-xl bg-white/10 py-3 text-sm"
                >
                  <Trash2 size={16} className="mr-2 inline" />
                  Remove Sticker
                </button>
              </div>
            )}

          </div>

                    {/* PART 8: TIMELINE AND EXPORT */}

          {/* VIDEO TIMELINE */}
          {isVideo && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold">
                  <Film size={18} />
                  Video Timeline
                </h3>

                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs"
                >
                  {showTimeline ? "Hide" : "Show"}
                </button>
              </div>

              {showTimeline && (
                <>
                  <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) =>
                      seekTimeline(Number(e.target.value))
                    }
                    className="w-full accent-fuchsia-500"
                  />

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      Timeline Zoom
                    </span>
                    <span className="text-xs text-gray-400">
                      {timelineZoom}x
                    </span>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => zoomTimeline(-1)}
                      className="flex-1 rounded-xl bg-white/10 py-2"
                    >
                      −
                    </button>

                    <button
                      onClick={resetTimeline}
                      className="flex-1 rounded-xl bg-white/10 py-2 text-sm"
                    >
                      Reset
                    </button>

                    <button
                      onClick={() => zoomTimeline(1)}
                      className="flex-1 rounded-xl bg-white/10 py-2"
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-4 rounded-xl bg-black/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Video Track
                      </span>
                      <Video size={15} className="text-fuchsia-400" />
                    </div>

                    <div className="h-8 overflow-hidden rounded-lg bg-gradient-to-r from-fuchsia-900/70 via-purple-800/70 to-fuchsia-900/70">
                      <div className="flex h-full items-center justify-center text-xs">
                        {selectedFile.name}
                      </div>
                    </div>

                    {splitPoints.length > 0 && (
                      <p className="mt-2 text-xs text-gray-400">
                        {splitPoints.length} split marker(s) added
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* EXPORT SETTINGS PANEL */}
          {showExportPanel && (
            <div className="mt-5 rounded-2xl border border-fuchsia-500/30 bg-[#17101f] p-4">

              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold">
                  <Download size={19} />
                  Export Settings
                </h3>

                <button
                  onClick={closeEditorPanels}
                  className="rounded-full bg-white/10 p-2"
                >
                  <X size={17} />
                </button>
              </div>

              <label className="mb-2 block text-sm text-gray-300">
                Export Quality
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["720p", "1080p", "4K"].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => updateExportQuality(quality)}
                    className={`rounded-xl border py-3 text-sm ${
                      exportQuality === quality
                        ? "border-fuchsia-500 bg-fuchsia-500/20"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>

              <label className="mb-2 mt-5 block text-sm text-gray-300">
                Frame Rate
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[24, 30, 60].map((fps) => (
                  <button
                    key={fps}
                    onClick={() => updateExportFPS(fps)}
                    className={`rounded-xl border py-3 text-sm ${
                      exportFPS === fps
                        ? "border-fuchsia-500 bg-fuchsia-500/20"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-amber-300">
                Export quality and FPS are preferences only at this stage.
                Permanent edited-video rendering requires a video encoder.
              </p>

              <button
                onClick={handleExportPreview}
                disabled={exporting}
                className="mt-4 w-full rounded-xl bg-fuchsia-600 py-3 font-semibold disabled:opacity-50"
              >
                <Download size={17} className="mr-2 inline" />
                Prepare Export
              </button>
            </div>
          )}

          {/* CAPTION AND POST DETAILS */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

            <h3 className="mb-4 text-lg font-bold">
              Post Details
            </h3>

            <label className="mb-2 block text-sm text-gray-300">
              Caption
            </label>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your post..."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-fuchsia-500"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Add hashtags and describe your post</span>
              <span>{caption.length} characters</span>
            </div>

            <label className="mb-2 mt-5 block text-sm text-gray-300">
              Price (Optional)
            </label>

            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-fuchsia-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Leave empty if your post has no price.
            </p>
          </div>

          {/* PUBLISH ACTIONS */}
          <div className="mt-5 grid grid-cols-2 gap-3">

            <button
              onClick={handleCancelUpload}
              disabled={uploading}
              className="rounded-xl border border-white/15 bg-white/5 py-4 font-semibold disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handlePublish}
              disabled={!canPublish || uploading}
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-4 font-bold disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="mr-2 inline animate-spin"
                  />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2 inline" />
                  Publish
                </>
              )}
            </button>

          </div>

                    {/* PART 9: EXTRA CREATOR TOOLS */}

          {/* UNDO AND REDO */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

            <h3 className="mb-3 font-bold">
              Edit History
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={undoEdit}
                disabled={historyIndex <= 0}
                className="rounded-xl bg-white/10 py-3 text-sm disabled:opacity-30"
              >
                <Undo2 size={17} className="mr-2 inline" />
                Undo
              </button>

              <button
                onClick={redoEdit}
                disabled={historyIndex >= history.length - 1}
                className="rounded-xl bg-white/10 py-3 text-sm disabled:opacity-30"
              >
                <Redo2 size={17} className="mr-2 inline" />
                Redo
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              History stores supported editor settings.
            </p>
          </div>

          {/* QUICK CREATOR ACTIONS */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

            <h3 className="mb-4 font-bold">
              Quick Creator Actions
            </h3>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={handleSaveDraft}
                className="rounded-xl bg-white/10 p-4 text-left"
              >
                <Save size={21} className="mb-2 text-fuchsia-400" />
                <p className="text-sm font-semibold">
                  Save Draft
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Save your editing settings
                </p>
              </button>

              <button
                onClick={resetAllEdits}
                className="rounded-xl bg-white/10 p-4 text-left"
              >
                <RotateCcw size={21} className="mb-2 text-fuchsia-400" />
                <p className="text-sm font-semibold">
                  Reset All
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Reset editor adjustments
                </p>
              </button>

              <button
                onClick={() => selectEditTab("Filters")}
                className="rounded-xl bg-white/10 p-4 text-left"
              >
                <WandSparkles size={21} className="mb-2 text-fuchsia-400" />
                <p className="text-sm font-semibold">
                  Quick Filters
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Explore creative filters
                </p>
              </button>

              <button
                onClick={() => selectEditTab("Text")}
                className="rounded-xl bg-white/10 p-4 text-left"
              >
                <Type size={21} className="mb-2 text-fuchsia-400" />
                <p className="text-sm font-semibold">
                  Add Text
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Add words to your preview
                </p>
              </button>

            </div>
          </div>

          {/* SELECTED MEDIA INFORMATION */}
          {selectedFile && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

              <h3 className="mb-3 font-bold">
                Media Information
              </h3>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">
                    File name
                  </span>
                  <span className="max-w-[65%] truncate text-right">
                    {selectedFile.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">
                    File type
                  </span>
                  <span>
                    {selectedFile.type || "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">
                    File size
                  </span>
                  <span>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                {isVideo && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Duration
                    </span>
                    <span>
                      {formatTime(duration)}
                    </span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* STATUS MESSAGE */}
          {notice && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/10 p-4 text-center">

              <p className="text-sm">
                {notice}
              </p>

              <button
                onClick={() => setNotice("")}
                className="mt-2 text-xs text-fuchsia-300"
              >
                Dismiss
              </button>

            </div>
          )}

          {/* CREATOR FOOTER */}
          <div className="mb-8 mt-8 text-center">

            <div className="mb-2 flex items-center justify-center gap-2">
              <Sparkles size={17} className="text-fuchsia-400" />
              <span className="font-bold">
                ChitPix Creator Studio
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Create • Edit • Share
            </p>

          </div>

                    {/* END OF EDITOR CONTENT */}

        </section>
      )}

      {/* GLOBAL UPLOAD STATUS */}
      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">

          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#18121f] p-6 text-center">

            <LoaderCircle
              size={42}
              className="mx-auto mb-4 animate-spin text-fuchsia-400"
            />

            <h3 className="text-lg font-bold">
              Publishing your creation
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Please wait. Do not close the app.
            </p>

            <p className="mt-4 text-xs text-fuchsia-300">
              {notice}
            </p>

          </div>
        </div>
      )}

    </main>
  )
}
