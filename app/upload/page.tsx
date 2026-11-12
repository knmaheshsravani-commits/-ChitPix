"use client"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react"

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
  Search,
  Image,
  Clock,
  Heart,
  Send,
  Palette,
  Layers,
  Check,
  Eye,
  Bookmark,
  Mic,
  Hash,
  Calendar,
  UserPlus,
  MessageCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  RotateCw as RotateIcon,
} from "lucide-react"

import { supabase } from "../../lib/supabase"

// CLOUD STORAGE
const R2_PUBLIC =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev"

// ALL CREATOR MODES
const CREATOR_MODES = [
  {
    id: "reel",
    title: "New Reel",
    description: "Create and publish a video",
    icon: Video,
  },
  {
    id: "draft",
    title: "Draft Reel",
    description: "Continue saved creations",
    icon: Save,
  },
  {
    id: "effects",
    title: "Video Effects",
    description: "Apply creative effects",
    icon: WandSparkles,
  },
  {
    id: "edit",
    title: "Video Editor",
    description: "Edit video and audio",
    icon: Film,
  },
  {
    id: "audio",
    title: "Audio Library",
    description: "Choose and preview audio",
    icon: Music2,
  },
  {
    id: "schedule",
    title: "Schedule Reel",
    description: "Prepare a scheduled post",
    icon: CalendarClock,
  },
  {
    id: "poll",
    title: "Poll / Quiz",
    description: "Create interactive polls",
    icon: MessageCircle,
  },
  {
    id: "collab",
    title: "Collab Reel",
    description: "Invite another creator",
    icon: Users,
  },
  {
    id: "photo",
    title: "Photo Editor",
    description: "Edit photos and filters",
    icon: Image,
  },
  {
    id: "templates",
    title: "Templates",
    description: "Start with a creative layout",
    icon: Layers,
  },
] as const

type CreatorMode =
  | "reel"
  | "draft"
  | "effects"
  | "edit"
  | "audio"
  | "schedule"
  | "poll"
  | "collab"
  | "photo"
  | "templates"

type MediaKind = "image" | "video"

type DraftItem = {
  id: string
  caption: string
  mediaUrl: string
  mediaType: MediaKind
  createdAt: string
}

type AudioItem = {
  id: string
  title: string
  artist: string
  url: string
  duration?: number
}

type TemplateItem = {
  id: string
  name: string
  description: string
  filter: string
  emoji: string
}

type EditorSnapshot = {
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

// FILTER PRESETS
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
  { name: "Golden", value: "sepia(0.3) saturate(1.5)" },
  { name: "Mono", value: "grayscale(1) contrast(1.2)" },
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

const STICKERS = [
  "❤️",
  "🔥",
  "😍",
  "😂",
  "✨",
  "🌟",
  "🎉",
  "👏",
  "😎",
  "💯",
  "🌈",
  "🚀",
  "🥰",
  "💖",
  "👍",
  "🎬",
  "🎵",
  "⭐",
  "🌸",
  "☀️",
]

// MAIN CREATOR PAGE
export default function UploadPage() {
  const router = useRouter()

  // FILE AND VIDEO REFERENCES
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // USER
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("")

  // CURRENT MODE
  const [mode, setMode] = useState<CreatorMode>("reel")

  // MEDIA
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mediaKind, setMediaKind] = useState<MediaKind>(null)
  const [preview, setPreview] = useState("")
  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("")

  // STATUS
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(true)

  // EDITOR SETTINGS
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

  // VIDEO TIMELINE
  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [splitPoints, setSplitPoints] = useState<number[]>([])
  const [timelineZoom, setTimelineZoom] = useState(1)

  // AUDIO
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioName, setAudioName] = useState("")
  const [audioPreview, setAudioPreview] = useState("")
  const [audioSearch, setAudioSearch] = useState("")
  const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null)

  // TEXT AND STICKERS
  const [textOverlay, setTextOverlay] = useState("")
  const [sticker, setSticker] = useState("")
  const [cropRatio, setCropRatio] = useState("9:16")

  // DRAFTS
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [selectedDraftId, setSelectedDraftId] = useState("")

  // SCHEDULE
  const [scheduledAt, setScheduledAt] = useState("")

  // POLL / QUIZ
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOption1, setPollOption1] = useState("")
  const [pollOption2, setPollOption2] = useState("")
  const [pollType, setPollType] = useState<"poll" | "quiz">("poll")

  // COLLAB
  const [collaborator, setCollaborator] = useState("")

  // PHOTO EDITOR
  const [photoFormat, setPhotoFormat] = useState("original")

  // TEMPLATES
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // EXPORT
  const [exportQuality, setExportQuality] = useState("1080p")
  const [exportFPS, setExportFPS] = useState("30")
  const [exporting, setExporting] = useState(false)
  const [showExportPanel, setShowExportPanel] = useState(false)

  // UI PANELS
  const [showTimeline, setShowTimeline] = useState(true)
  const [showAudioPanel, setShowAudioPanel] = useState(false)
  const [showTextPanel, setShowTextPanel] = useState(false)
  const [showStickerPanel, setShowStickerPanel] = useState(false)

  // HISTORY
  const [history, setHistory] = useState<EditorSnapshot[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // MEDIA TYPE
  const isVideo =
    selectedFile?.type.startsWith("video/") || false

  const isImage =
    selectedFile?.type.startsWith("image/") || false

  // READ MODE FROM URL AND LOAD USER
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    let nextMode: CreatorMode = "reel"

    if (params.get("type") === "post") nextMode = "photo"
    if (params.get("type") === "reel") nextMode = "reel"

    if (params.get("draft") === "1") nextMode = "draft"
    else if (params.get("effects") === "1") nextMode = "effects"
    else if (params.get("edit") === "1") nextMode = "edit"
    else if (params.get("audio") === "1") nextMode = "audio"
    else if (params.get("schedule") === "1") nextMode = "schedule"
    else if (params.get("poll") === "1") nextMode = "poll"
    else if (params.get("collab") === "1") nextMode = "collab"
    else if (params.get("photo") === "1") nextMode = "photo"
    else if (params.get("templates") === "1") nextMode = "templates"

    setMode(nextMode)

    const loadUser = async () => {
      try {
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
      } catch (error) {
        console.error("User loading error:", error)
        setNotice("User details load avvaledu")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
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

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedFile])

  // AUDIO PREVIEW URL
  useEffect(() => {
    if (!audioFile) {
      setAudioPreview("")
      return
    }

    const objectUrl = URL.createObjectURL(audioFile)
    setAudioPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [audioFile])

  // VIDEO PLAYBACK SETTINGS
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = speed
    video.volume = Math.max(0, Math.min(1, volume / 100))
    video.muted = muted
  }, [speed, volume, muted, preview])

  // FILTER AND TRANSFORM STYLES
  const videoFilter =
    `${filter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

  const videoTransform =
    `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`

  // PART 2 CONTINUES
  // ================================
  // PART 2: MEDIA & EDITOR FUNCTIONS
  // ================================

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => {
      setNotice("")
    }, 3500)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validImage = file.type.startsWith("image/")
    const validVideo = file.type.startsWith("video/")

    if (!validImage && !validVideo) {
      showNotice("Please select an image or video file.")
      event.target.value = ""
      return
    }

    const maxSize = 500 * 1024 * 1024

    if (file.size > maxSize) {
      showNotice("File size must be below 500 MB.")
      event.target.value = ""
      return
    }

    setSelectedFile(file)
    setMediaKind(validVideo ? "video" : "image")
    setCurrentTime(0)
    setTrimStart(0)
    setTrimEnd(0)
    setDuration(0)
    setPlaying(false)
    setSplitPoints([])
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setCaption("")
    setNotice("Media selected successfully!")
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const clearMedia = () => {
    setSelectedFile(null)
    setPreview("")
    setMediaKind(null)
    setCurrentTime(0)
    setDuration(0)
    setTrimStart(0)
    setTrimEnd(0)
    setPlaying(false)
    setSplitPoints([])
    setCaption("")
    setNotice("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleVideoMetadata = () => {
    const video = videoRef.current
    if (!video) return

    const videoDuration = Number.isFinite(video.duration)
      ? video.duration
      : 0

    setDuration(videoDuration)
    setTrimEnd(videoDuration)
  }

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    setCurrentTime(video.currentTime)

    if (trimEnd > trimStart && video.currentTime >= trimEnd) {
      video.pause()
      video.currentTime = trimStart
      setPlaying(false)
    }
  }

  const toggleVideoPlayback = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (video.paused) {
        if (
          trimEnd > trimStart &&
          video.currentTime >= trimEnd
        ) {
          video.currentTime = trimStart
        }

        await video.play()
        setPlaying(true)
      } else {
        video.pause()
        setPlaying(false)
      }
    } catch {
      setPlaying(false)
      showNotice("Unable to play this video.")
    }
  }

  const seekVideo = (value: number) => {
    const video = videoRef.current
    if (!video) return

    const safeValue = Math.max(
      0,
      Math.min(value, duration || 0)
    )

    video.currentTime = safeValue
    setCurrentTime(safeValue)
  }

  const updateTrimStart = (value: number) => {
    const safeValue = Math.max(
      0,
      Math.min(value, duration)
    )

    setTrimStart(
      Math.min(safeValue, Math.max(0, trimEnd - 0.5))
    )

    if (videoRef.current) {
      videoRef.current.currentTime = safeValue
    }
  }

  const updateTrimEnd = (value: number) => {
    const safeValue = Math.max(
      0,
      Math.min(value, duration)
    )

    setTrimEnd(
      Math.max(safeValue, Math.min(duration, trimStart + 0.5))
    )
  }

  const addSplitPoint = () => {
    if (!isVideo || duration <= 0) {
      showNotice("Select a video first.")
      return
    }

    if (
      currentTime <= trimStart ||
      currentTime >= trimEnd
    ) {
      showNotice("Move the playhead inside the video.")
      return
    }

    setSplitPoints((previous) => {
      if (previous.some((point) => Math.abs(point - currentTime) < 0.5)) {
        return previous
      }

      return [...previous, currentTime].sort((a, b) => a - b)
    })

    showNotice("Split marker added.")
  }

  const removeSplitPoint = (point: number) => {
    setSplitPoints((previous) =>
      previous.filter((item) => item !== point)
    )
  }

  const rotateMedia = () => {
    setRotation((previous) => (previous + 90) % 360)
  }

  const toggleHorizontalFlip = () => {
    setFlipH((previous) => !previous)
  }

  const toggleVerticalFlip = () => {
    setFlipV((previous) => !previous)
  }

  const resetEditor = () => {
    setFilter("normal")
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setSpeed(1)
    setVolume(1)
    setMuted(false)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setTextOverlay("")
    setSticker("")
    setCropRatio("original")

    if (isVideo) {
      setTrimStart(0)
      setTrimEnd(duration)
      setSplitPoints([])
      seekVideo(0)
    }

    showNotice("Editor settings reset.")
  }

  const selectFilter = (filterName: string) => {
    setFilter(filterName)
  }

  const updateBrightness = (value: number) => {
    setBrightness(Math.max(0, Math.min(200, value)))
  }

  const updateContrast = (value: number) => {
    setContrast(Math.max(0, Math.min(200, value)))
  }

  const updateSaturation = (value: number) => {
    setSaturation(Math.max(0, Math.min(200, value)))
  }

  const updateSpeed = (value: number) => {
    setSpeed(value)

    if (videoRef.current) {
      videoRef.current.playbackRate = value
    }
  }

  const updateVolume = (value: number) => {
    const safeValue = Math.max(0, Math.min(1, value))
    setVolume(safeValue)

    if (videoRef.current) {
      videoRef.current.volume = safeValue
    }
  }

  const toggleMute = () => {
    setMuted((previous) => {
      const nextValue = !previous

      if (videoRef.current) {
        videoRef.current.muted = nextValue
      }

      return nextValue
    })
  }

  const uploadToR2 = async (file: File): Promise<string> => {
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
      throw new Error("Could not create upload link.")
    }

    const data = await response.json()

    if (!data.uploadUrl) {
      throw new Error("Upload URL is missing.")
    }

    const uploadResponse = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error("Media upload to storage failed.")
    }

    const publicUrl =
      data.publicUrl ||
      (data.key
        ? `${R2_PUBLIC.replace(/\/$/, "")}/${data.key}`
        : "")

    if (!publicUrl) {
      throw new Error("Public media URL is missing.")
    }

    return publicUrl
  }

  // PART 3 CONTINUES
      
  // ================================
  // PART 3: AUDIO, TEXT & STICKERS
  // ================================

  const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("audio/")) {
      showNotice("Please select a valid audio file.")
      event.target.value = ""
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      showNotice("Audio file must be below 50 MB.")
      event.target.value = ""
      return
    }

    setAudioFile(file)
    setAudioName(file.name)
    setSelectedAudio(null)
    showNotice("Audio selected successfully!")
  }

  const clearAudio = () => {
    setAudioFile(null)
    setAudioName("")
    setAudioPreview("")
    setSelectedAudio(null)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const playAudioPreview = async () => {
    const audio = audioRef.current

    if (!audio) {
      showNotice("Select an audio file first.")
      return
    }

    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch {
      showNotice("Unable to play audio preview.")
    }
  }

  const handleAudioSearch = (value: string) => {
    setAudioSearch(value)
  }

  const addTextOverlay = (value: string) => {
    setTextOverlay(value)
    setShowTextPanel(true)
  }

  const clearTextOverlay = () => {
    setTextOverlay("")
  }

  const addSticker = (value: string) => {
    setSticker(value)
    setShowStickerPanel(false)
  }

  const removeSticker = () => {
    setSticker("")
  }

  const updateCropRatio = (value: string) => {
    setCropRatio(value)
  }

  const applyPhotoFormat = (value: string) => {
    setPhotoFormat(value)
    setCropRatio(value)
  }

  const toggleAudioPanel = () => {
    setShowAudioPanel((previous) => !previous)
  }

  const toggleTextPanel = () => {
    setShowTextPanel((previous) => !previous)
  }

  const toggleStickerPanel = () => {
    setShowStickerPanel((previous) => !previous)
  }

  const toggleTimeline = () => {
    setShowTimeline((previous) => !previous)
  }

  const updateTimelineZoom = (value: number) => {
    setTimelineZoom(Math.max(1, Math.min(5, value)))
  }

  const updateCaption = (value: string) => {
    setCaption(value)
  }

  const updatePrice = (value: string) => {
    setPrice(value)
  }

  const updateCollaborator = (value: string) => {
    setCollaborator(value)
  }

  const updatePollQuestion = (value: string) => {
    setPollQuestion(value)
  }

  const updatePollOption = (index: number, value: string) => {
    setPollOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? value : option
      )
    )
  }

  const addPollOption = () => {
    setPollOptions((previous) => {
      if (previous.length >= 4) return previous
      return [...previous, ""]
    })
  }

  const removePollOption = (index: number) => {
    setPollOptions((previous) => {
      if (previous.length <= 2) return previous
      return previous.filter((_, optionIndex) => optionIndex !== index)
    })
  }

  const updatePollType = (value: string) => {
    setPollType(value)
  }

  const updateScheduledAt = (value: string) => {
    setScheduledAt(value)
  }

  const updateExportQuality = (value: string) => {
    setExportQuality(value)
  }

  const updateExportFPS = (value: number) => {
    setExportFPS(value)
  }

  // PART 4 CONTINUES
  // ================================
  // PART 4: DRAFTS & EDITOR HISTORY
  // ================================

  const saveDraft = () => {
    if (!selectedFile && !caption.trim()) {
      showNotice("Select media or enter a caption first.")
      return
    }

    const draftId = selectedDraftId || `draft-${Date.now()}`

    const draft = {
      id: draftId,
      caption,
      price,
      mode,
      mediaName: selectedFile?.name || "",
      mediaType: selectedFile?.type || "",
      updatedAt: new Date().toISOString(),
    } as DraftItem

    setDrafts((previous) => {
      const exists = previous.some((item) => item.id === draftId)

      const updated = exists
        ? previous.map((item) =>
            item.id === draftId ? draft : item
          )
        : [draft, ...previous]

      try {
        localStorage.setItem("chitpix_upload_drafts", JSON.stringify(updated))
      } catch {
        showNotice("Draft saved for this session only.")
      }

      return updated
    })

    setSelectedDraftId(draftId)
    showNotice("Draft details saved successfully!")
  }

  const loadDraft = (draft: DraftItem) => {
    setSelectedDraftId(draft.id)
    setCaption(draft.caption || "")
    setPrice(draft.price || "")

    showNotice(
      draft.mediaName
        ? "Draft details loaded. Please select its media file again."
        : "Draft loaded successfully."
    )
  }

  const deleteDraft = (draftId: string) => {
    setDrafts((previous) => {
      const updated = previous.filter((item) => item.id !== draftId)

      try {
        localStorage.setItem("chitpix_upload_drafts", JSON.stringify(updated))
      } catch {
        // Keep the in-memory draft list updated.
      }

      return updated
    })

    if (selectedDraftId === draftId) {
      setSelectedDraftId(null)
    }

    showNotice("Draft deleted.")
  }

  const startNewDraft = () => {
    clearMedia()
    setCaption("")
    setPrice("")
    setSelectedDraftId(null)
    resetEditor()
    showNotice("New draft started.")
  }

  const saveEditorHistory = () => {
    const snapshot = {
      filter,
      brightness,
      contrast,
      saturation,
      speed,
      volume,
      muted,
      rotation,
      flipH,
      flipV,
      textOverlay,
      sticker,
      cropRatio,
      trimStart,
      trimEnd,
    } as EditorSnapshot

    setHistory((previous) => {
      const updated = [
        ...previous.slice(0, historyIndex + 1),
        snapshot,
      ].slice(-30)

      setHistoryIndex(updated.length - 1)
      return updated
    })
  }

  const restoreEditorSnapshot = (snapshot: EditorSnapshot) => {
    setFilter(snapshot.filter)
    setBrightness(snapshot.brightness)
    setContrast(snapshot.contrast)
    setSaturation(snapshot.saturation)
    setSpeed(snapshot.speed)
    setVolume(snapshot.volume)
    setMuted(snapshot.muted)
    setRotation(snapshot.rotation)
    setFlipH(snapshot.flipH)
    setFlipV(snapshot.flipV)
    setTextOverlay(snapshot.textOverlay)
    setSticker(snapshot.sticker)
    setCropRatio(snapshot.cropRatio)
    setTrimStart(snapshot.trimStart)
    setTrimEnd(snapshot.trimEnd)

    if (videoRef.current) {
      videoRef.current.playbackRate = snapshot.speed
      videoRef.current.volume = snapshot.volume
      videoRef.current.muted = snapshot.muted
    }
  }

  const undoEditor = () => {
    if (historyIndex <= 0) {
      showNotice("No more changes to undo.")
      return
    }

    const nextIndex = historyIndex - 1
    const snapshot = history[nextIndex]

    if (!snapshot) return

    setHistoryIndex(nextIndex)
    restoreEditorSnapshot(snapshot)
    showNotice("Undo successful.")
  }

  const redoEditor = () => {
    if (historyIndex >= history.length - 1) {
      showNotice("No more changes to redo.")
      return
    }

    const nextIndex = historyIndex + 1
    const snapshot = history[nextIndex]

    if (!snapshot) return

    setHistoryIndex(nextIndex)
    restoreEditorSnapshot(snapshot)
    showNotice("Redo successful.")
  }

  // PART 5 CONTINUES
      
  // ================================
  // PART 5: UPLOAD & PUBLISH
  // ================================

  const validatePost = () => {
    if (!selectedFile) {
      showNotice("Please select a photo or video first.")
      return false
    }

    if (!userId) {
      showNotice("Please login before publishing.")
      return false
    }

    if (mode === "poll") {
      if (!pollQuestion.trim()) {
        showNotice("Please enter a poll question.")
        return false
      }

      const validOptions = pollOptions.filter((item) => item.trim())

      if (validOptions.length < 2) {
        showNotice("Please enter at least two poll options.")
        return false
      }
    }

    if (mode === "schedule" && !scheduledAt) {
      showNotice("Please select a publishing date and time.")
      return false
    }

    return true
  }

  const publishPost = async () => {
    if (!validatePost()) return

    if (!selectedFile) return

    setLoading(true)

    try {
      showNotice("Uploading your media...")

      const mediaUrl = await uploadToR2(selectedFile)

      const postData = {
        user_id: userId,
        image_url: mediaUrl,
        r2_url: mediaUrl,
        caption: caption.trim(),
        username: username || "user",
        price: price.trim() || null,
      }

      const { error } = await supabase
        .from("posts")
        .insert([postData])

      if (error) {
        console.error("Post insert error:", error)
        throw new Error(error.message)
      }

      setNotice("Published successfully!")

      clearMedia()
      setCaption("")
      setPrice("")
      setSelectedDraftId(null)

      window.setTimeout(() => {
        router.push("/")
      }, 1200)
    } catch (error) {
      console.error("Publish error:", error)

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong."

      showNotice(`Publish failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "00:00"
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "0 MB"
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getMediaTypeLabel = () => {
    if (isVideo) return "Video"
    if (isImage) return "Photo"
    return "No media selected"
  }

  const canPublish = Boolean(selectedFile && userId && !loading)

  // PART 6 CONTINUES
  // ================================
  // PART 6: CREATE PAGE UI
  // ================================

  return (
    <main className="min-h-screen bg-black text-white px-3 py-5 pb-28">
      <div className="max-w-3xl mx-auto">

        <header className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-white text-2xl"
          >
            ←
          </button>

          <h1 className="text-xl font-bold">
            Create on ChitPix
          </h1>

          <button
            type="button"
            onClick={saveDraft}
            className="text-sm font-semibold text-pink-400"
          >
            Save Draft
          </button>
        </header>

        {notice && (
          <div className="mb-4 rounded-xl bg-zinc-800 border border-zinc-700 p-3 text-sm text-center">
            {notice}
          </div>
        )}

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3">
            Choose Create Option
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

            {CREATOR_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  mode === item.id
                    ? "border-pink-500 bg-pink-500/15"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                <div className="text-2xl mb-2">
                  {item.icon}
                </div>

                <div className="font-bold text-sm">
                  {item.label}
                </div>

                <div className="text-xs text-zinc-400 mt-1">
                  {item.description}
                </div>
              </button>
            ))}

          </div>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">

          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">
              Add Photo or Video
            </h2>

            {selectedFile && (
              <button
                type="button"
                onClick={clearMedia}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!preview ? (
            <button
              type="button"
              onClick={openFilePicker}
              className="w-full min-h-52 border-2 border-dashed border-zinc-600 rounded-xl flex flex-col items-center justify-center gap-3 bg-black/30"
            >
              <span className="text-5xl">＋</span>

              <span className="font-bold">
                Select Photo or Video
              </span>

              <span className="text-xs text-zinc-400">
                JPG, PNG, WEBP, MP4 and supported formats
              </span>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black">

              {isVideo ? (
                <video
                  ref={videoRef}
                  src={preview}
                  className="w-full max-h-[520px] object-contain"
                  controls
                  playsInline
                  onLoadedMetadata={handleVideoMetadata}
                  onTimeUpdate={handleVideoTimeUpdate}
                  style={{
                    filter: videoFilter,
                    transform: videoTransform,
                  }}
                />
              ) : (
                <img
                  src={preview}
                  alt="Selected media preview"
                  className="w-full max-h-[520px] object-contain"
                  style={{
                    filter: videoFilter,
                    transform: videoTransform,
                  }}
                />
              )}

              {sticker && (
                <div className="absolute top-4 right-4 text-4xl pointer-events-none">
                  {sticker}
                </div>
              )}

              {textOverlay && (
                <div className="absolute left-3 right-3 bottom-5 text-center font-bold text-2xl text-white drop-shadow-lg pointer-events-none">
                  {textOverlay}
                </div>
              )}

            </div>
          )}

          {selectedFile && (
            <div className="mt-3 flex justify-between text-xs text-zinc-400">
              <span>{getMediaTypeLabel()}</span>
              <span>{formatFileSize(selectedFile.size)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={openFilePicker}
            className="w-full mt-3 rounded-xl bg-zinc-800 py-3 font-semibold"
          >
            {selectedFile ? "Change Media" : "Choose from Gallery"}
          </button>

        </section>

        {/* PART 7 CONTINUES */}
        
        {/* ================================
            PART 7: CAPTION, PRICE & FILTERS
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-3">
            Write Caption
          </h2>

          <textarea
            value={caption}
            onChange={(event) => updateCaption(event.target.value)}
            placeholder="What's happening? Write your caption..."
            rows={4}
            maxLength={2200}
            className="w-full resize-y rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
          />

          <div className="flex justify-between text-xs text-zinc-500 mt-2">
            <span>Add hashtags and emojis to your caption.</span>
            <span>{caption.length}/2200</span>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-semibold mb-2">
              Price Tag (Optional)
            </label>

            <input
              type="text"
              value={price}
              onChange={(event) => updatePrice(event.target.value)}
              placeholder="Example: ₹499"
              className="w-full rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">
              Photo Filters
            </h2>

            <button
              type="button"
              onClick={resetEditor}
              className="text-xs text-pink-400 font-semibold"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "Normal", value: "normal" },
              { name: "Vintage", value: "sepia(0.7)" },
              { name: "Black & White", value: "grayscale(1)" },
              { name: "Warm", value: "sepia(0.3) saturate(1.4)" },
              { name: "Cool", value: "hue-rotate(15deg) saturate(1.2)" },
              { name: "Bright", value: "brightness(1.2)" },
              { name: "Dream", value: "contrast(0.9) saturate(1.5)" },
              { name: "Fade", value: "contrast(0.8) brightness(1.1)" },
              { name: "Dramatic", value: "contrast(1.4) saturate(1.2)" },
            ].map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => selectFilter(item.value)}
                className={`rounded-xl border p-3 text-xs font-semibold ${
                  filter === item.value
                    ? "border-pink-500 bg-pink-500/15 text-pink-300"
                    : "border-zinc-700 bg-black"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label>Brightness</label>
                <span>{brightness}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(event) =>
                  updateBrightness(Number(event.target.value))
                }
                className="w-full accent-pink-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label>Contrast</label>
                <span>{contrast}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(event) =>
                  updateContrast(Number(event.target.value))
                }
                className="w-full accent-pink-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label>Saturation</label>
                <span>{saturation}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(event) =>
                  updateSaturation(Number(event.target.value))
                }
                className="w-full accent-pink-500"
              />
            </div>
          </div>
        </section>

        {/* PART 8 CONTINUES */}
        
        {/* ================================
            PART 8: VIDEO EDITING TOOLS
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">
              Video Editor
            </h2>

            <button
              type="button"
              onClick={toggleTimeline}
              className="text-sm text-pink-400 font-semibold"
            >
              {showTimeline ? "Hide Timeline" : "Show Timeline"}
            </button>
          </div>

          {!isVideo ? (
            <p className="text-sm text-zinc-400">
              Select a video to use video editing tools.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={toggleVideoPlayback}
                  className="rounded-xl bg-black border border-zinc-700 p-3 font-semibold"
                >
                  {playing ? "⏸ Pause" : "▶ Play"}
                </button>

                <button
                  type="button"
                  onClick={addSplitPoint}
                  className="rounded-xl bg-black border border-zinc-700 p-3 font-semibold"
                >
                  ✂ Add Split
                </button>

                <button
                  type="button"
                  onClick={rotateMedia}
                  className="rounded-xl bg-black border border-zinc-700 p-3 font-semibold"
                >
                  ↻ Rotate
                </button>

                <button
                  type="button"
                  onClick={toggleHorizontalFlip}
                  className="rounded-xl bg-black border border-zinc-700 p-3 font-semibold"
                >
                  ⇋ Flip Horizontal
                </button>

                <button
                  type="button"
                  onClick={toggleVerticalFlip}
                  className="rounded-xl bg-black border border-zinc-700 p-3 font-semibold"
                >
                  ⇅ Flip Vertical
                </button>

                <button
                  type="button"
                  onClick={() => seekVideo(0)}
                  className="rounded-xl bg-black border border-zinc-700 p-3 font-semibold"
                >
                  ⏮ Start
                </button>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span>Playback Position</span>
                  <span>
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  step="0.1"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) =>
                    seekVideo(Number(event.target.value))
                  }
                  className="w-full accent-pink-500"
                />
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label>Trim Start</label>
                    <span>{formatDuration(trimStart)}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    step="0.1"
                    value={Math.min(trimStart, duration || 0)}
                    onChange={(event) =>
                      updateTrimStart(Number(event.target.value))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label>Trim End</label>
                    <span>{formatDuration(trimEnd)}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    step="0.1"
                    value={Math.min(trimEnd, duration || 0)}
                    onChange={(event) =>
                      updateTrimEnd(Number(event.target.value))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              {showTimeline && (
                <div className="mt-5 rounded-xl bg-black border border-zinc-700 p-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-sm">
                      Video Timeline
                    </span>

                    <span className="text-xs text-zinc-400">
                      {formatDuration(Math.max(0, trimEnd - trimStart))}
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{
                        width: duration
                          ? `${Math.max(0, Math.min(100, ((trimEnd - trimStart) / duration) * 100))}%`
                          : "0%",
                      }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-zinc-400">
                    <span>Start: {formatDuration(trimStart)}</span>
                    <span>End: {formatDuration(trimEnd)}</span>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-zinc-400">
                      Timeline Zoom: {timelineZoom}x
                    </label>

                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={timelineZoom}
                      onChange={(event) =>
                        updateTimelineZoom(Number(event.target.value))
                      }
                      className="w-full accent-pink-500 mt-2"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">
                      Split Markers
                    </p>

                    {splitPoints.length === 0 ? (
                      <p className="text-xs text-zinc-500">
                        No split markers added.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {splitPoints.map((point) => (
                          <div
                            key={point}
                            className="flex justify-between items-center text-xs bg-zinc-900 rounded-lg p-2"
                          >
                            <span>{formatDuration(point)}</span>

                            <button
                              type="button"
                              onClick={() => removeSplitPoint(point)}
                              className="text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <label>Video Speed</label>
                  <span>{speed}x</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {SPEEDS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => updateSpeed(item)}
                      className={`rounded-lg border p-2 text-xs font-semibold ${
                        speed === item
                          ? "border-pink-500 bg-pink-500/15 text-pink-300"
                          : "border-zinc-700 bg-black"
                      }`}
                    >
                      {item}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <label>Video Volume</label>
                  <span>{Math.round(volume * 100)}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) =>
                    updateVolume(Number(event.target.value))
                  }
                  className="w-full accent-pink-500"
                />

                <button
                  type="button"
                  onClick={toggleMute}
                  className="mt-3 rounded-lg bg-black border border-zinc-700 px-4 py-2 text-sm"
                >
                  {muted ? "🔇 Unmute" : "🔊 Mute"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* PART 9 CONTINUES */}
                            
        {/* ================================
            PART 9: AUDIO, TEXT & STICKERS
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              Audio Studio
            </h2>

            <button
              type="button"
              onClick={toggleAudioPanel}
              className="text-sm text-pink-400"
            >
              {showAudioPanel ? "Close" : "Open"}
            </button>
          </div>

          {showAudioPanel && (
            <>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-white"
              />

              {audioName && (
                <div className="mt-3 rounded-xl bg-black border border-zinc-700 p-3">
                  <p className="text-sm font-semibold break-all">
                    🎵 {audioName}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={playAudioPreview}
                      className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold"
                    >
                      Play / Pause Preview
                    </button>

                    <button
                      type="button"
                      onClick={clearAudio}
                      className="rounded-lg bg-zinc-800 px-4 py-2 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <audio
                ref={audioRef}
                src={audioPreview || undefined}
                controls
                className="hidden"
              />

              <div className="mt-4">
                <label className="text-sm font-semibold block mb-2">
                  Search Audio
                </label>

                <input
                  type="text"
                  value={audioSearch}
                  onChange={(event) =>
                    handleAudioSearch(event.target.value)
                  }
                  placeholder="Search your audio..."
                  className="w-full rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
                />

                <p className="text-xs text-zinc-500 mt-2">
                  Upload your own audio file. No external music catalog is connected yet.
                </p>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              Text Studio
            </h2>

            <button
              type="button"
              onClick={toggleTextPanel}
              className="text-sm text-pink-400"
            >
              {showTextPanel ? "Close" : "Open"}
            </button>
          </div>

          {showTextPanel && (
            <>
              <textarea
                value={textOverlay}
                onChange={(event) =>
                  addTextOverlay(event.target.value)
                }
                rows={3}
                maxLength={150}
                placeholder="Write text on your photo or video..."
                className="w-full rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
              />

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-zinc-500">
                  {textOverlay.length}/150 characters
                </span>

                <button
                  type="button"
                  onClick={clearTextOverlay}
                  className="text-sm text-red-400"
                >
                  Clear Text
                </button>
              </div>
            </>
          )}

          {textOverlay && (
            <div className="mt-3 rounded-xl bg-black p-3 text-center">
              <p className="font-bold text-lg break-words">
                {textOverlay}
              </p>
              <span className="text-xs text-zinc-500">
                Preview text overlay
              </span>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              Stickers
            </h2>

            <button
              type="button"
              onClick={toggleStickerPanel}
              className="text-sm text-pink-400"
            >
              {showStickerPanel ? "Close" : "Open"}
            </button>
          </div>

          {showStickerPanel && (
            <div className="grid grid-cols-5 gap-3">
              {STICKERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => addSticker(item)}
                  className={`rounded-xl bg-black border p-3 text-2xl ${
                    sticker === item
                      ? "border-pink-500 bg-pink-500/15"
                      : "border-zinc-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {sticker && (
            <div className="flex justify-between items-center mt-3 rounded-xl bg-black p-3">
              <span className="text-3xl">{sticker}</span>

              <button
                type="button"
                onClick={removeSticker}
                className="text-sm text-red-400"
              >
                Remove Sticker
              </button>
            </div>
          )}
        </section>

        {/* PART 10 CONTINUES */}
        
        {/* ================================
            PART 10: PHOTO FORMATS, TEMPLATES & POLLS
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-4">
            Photo Formats
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Original", value: "original" },
              { label: "Square 1:1", value: "1 / 1" },
              { label: "Portrait 4:5", value: "4 / 5" },
              { label: "Story 9:16", value: "9 / 16" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => applyPhotoFormat(item.value)}
                className={`rounded-xl border p-3 text-xs font-semibold ${
                  cropRatio === item.value
                    ? "border-pink-500 bg-pink-500/15 text-pink-300"
                    : "border-zinc-700 bg-black"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-500 mt-3">
            Format selection changes the preview layout. It does not permanently crop the original file.
          </p>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-4">
            Creative Templates
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Travel", emoji: "🌍", color: "from-blue-600 to-cyan-500" },
              { name: "Food", emoji: "🍕", color: "from-orange-600 to-yellow-500" },
              { name: "Fashion", emoji: "👗", color: "from-pink-600 to-purple-500" },
              { name: "Birthday", emoji: "🎂", color: "from-purple-600 to-pink-500" },
              { name: "Business", emoji: "💼", color: "from-emerald-600 to-teal-500" },
              { name: "Lifestyle", emoji: "✨", color: "from-indigo-600 to-blue-500" },
            ].map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setSelectedTemplate(item.name)
                  setTextOverlay(item.emoji + " " + item.name)
                  showNotice(`${item.name} template selected.`)
                }}
                className={`rounded-xl border p-4 bg-gradient-to-br ${item.color} ${
                  selectedTemplate === item.name
                    ? "border-white ring-2 ring-pink-400"
                    : "border-white/10"
                }`}
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="font-bold text-sm">{item.name}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-4">
            Poll Creator
          </h2>

          <input
            type="text"
            value={pollQuestion}
            onChange={(event) =>
              updatePollQuestion(event.target.value)
            }
            placeholder="Ask your followers a question..."
            maxLength={200}
            className="w-full rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
          />

          <div className="mt-4 space-y-3">
            {pollOptions.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(event) =>
                    updatePollOption(index, event.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                  className="min-w-0 flex-1 rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
                />

                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePollOption(index)}
                    className="rounded-lg bg-zinc-800 px-3 text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPollOption}
            disabled={pollOptions.length >= 4}
            className="mt-3 rounded-lg bg-zinc-800 px-4 py-2 text-sm disabled:opacity-40"
          >
            + Add Option
          </button>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">
              Poll Type
            </label>

            <select
              value={pollType}
              onChange={(event) =>
                updatePollType(event.target.value)
              }
              className="w-full rounded-xl bg-black border border-zinc-700 p-3 text-sm"
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>

          <div className="mt-4 rounded-xl bg-black border border-zinc-700 p-3">
            <p className="text-sm font-semibold mb-2">
              Poll Preview
            </p>

            <p className="text-sm mb-3">
              {pollQuestion || "Your poll question will appear here"}
            </p>

            {pollOptions.map((option, index) => (
              <div
                key={index}
                className="rounded-lg border border-zinc-700 p-2 mb-2 text-sm"
              >
                {option || `Option ${index + 1}`}
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-500 mt-3">
            Poll preview is ready. Publishing and voting require poll database/API support.
          </p>
        </section>

        {/* PART 11 CONTINUES */}
        
        {/* ================================
            PART 11: SCHEDULE & COLLABORATION
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-4">
            Schedule Your Post
          </h2>

          <p className="text-sm text-zinc-400 mb-3">
            Choose when you want your post to be published.
          </p>

          <label className="block text-sm font-semibold mb-2">
            Publishing Date & Time
          </label>

          <input
            type="datetime-local"
            value={scheduledAt}
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
            onChange={(event) =>
              updateScheduledAt(event.target.value)
            }
            className="w-full rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
          />

          {scheduledAt && (
            <div className="mt-3 rounded-xl bg-black border border-zinc-700 p-3">
              <p className="text-sm text-emerald-400 font-semibold">
                Scheduled time selected
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(scheduledAt).toLocaleString()}
              </p>
            </div>
          )}

          <p className="text-xs text-zinc-500 mt-3">
            Selecting a time does not schedule automatic publishing yet. A server-side scheduler and database support are required.
          </p>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-2">
            Collaboration
          </h2>

          <p className="text-sm text-zinc-400 mb-4">
            Add another ChitPix username as a collaboration partner.
          </p>

          <label className="block text-sm font-semibold mb-2">
            Collaborator Username
          </label>

          <div className="flex gap-2">
            <span className="rounded-xl bg-black border border-zinc-700 px-3 flex items-center text-zinc-400">
              @
            </span>

            <input
              type="text"
              value={collaborator}
              onChange={(event) =>
                updateCollaborator(
                  event.target.value.replace(/^@/, "")
                )
              }
              placeholder="Enter username"
              className="min-w-0 flex-1 rounded-xl bg-black border border-zinc-700 p-3 text-sm outline-none focus:border-pink-500"
            />
          </div>

          {collaborator.trim() && (
            <div className="mt-3 rounded-xl bg-black border border-zinc-700 p-3">
              <p className="text-sm font-semibold">
                Collaboration preview
              </p>

              <p className="text-sm text-pink-400 mt-1">
                @{collaborator.replace(/^@/, "")}
              </p>
            </div>
          )}

          <p className="text-xs text-zinc-500 mt-3">
            Sending invitations and accepting collaborations require a users lookup and collaboration database/API.
          </p>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-3">
            Editor History
          </h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={undoEditor}
              disabled={historyIndex <= 0}
              className="flex-1 rounded-xl bg-black border border-zinc-700 p-3 font-semibold disabled:opacity-40"
            >
              ↶ Undo
            </button>

            <button
              type="button"
              onClick={redoEditor}
              disabled={historyIndex >= history.length - 1}
              className="flex-1 rounded-xl bg-black border border-zinc-700 p-3 font-semibold disabled:opacity-40"
            >
              ↷ Redo
            </button>
          </div>

          <p className="text-xs text-zinc-500 mt-3">
            History: {Math.max(0, historyIndex + 1)} / {history.length}
          </p>

          <button
            type="button"
            onClick={saveEditorHistory}
            className="w-full mt-3 rounded-xl bg-zinc-800 p-3 text-sm font-semibold"
          >
            Save Current Editor State
          </button>
        </section>

        {/* PART 12 CONTINUES */}
        
        {/* ================================
            PART 12: EXPORT SETTINGS & PREVIEW
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              Export Settings
            </h2>

            <button
              type="button"
              onClick={() => setShowExportPanel((previous) => !previous)}
              className="text-sm text-pink-400 font-semibold"
            >
              {showExportPanel ? "Close" : "Open"}
            </button>
          </div>

          {showExportPanel && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Export Quality
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "720p", value: "720p" },
                    { label: "1080p", value: "1080p" },
                    { label: "4K", value: "4K" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateExportQuality(item.value)}
                      className={`rounded-xl border p-3 text-sm font-semibold ${
                        exportQuality === item.value
                          ? "border-pink-500 bg-pink-500/15 text-pink-300"
                          : "border-zinc-700 bg-black"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Frame Rate
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[24, 30, 60].map((fps) => (
                    <button
                      key={fps}
                      type="button"
                      onClick={() => updateExportFPS(fps)}
                      className={`rounded-xl border p-3 text-sm font-semibold ${
                        exportFPS === fps
                          ? "border-pink-500 bg-pink-500/15 text-pink-300"
                          : "border-zinc-700 bg-black"
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-black border border-zinc-700 p-3">
                <p className="text-sm font-semibold">
                  Export Summary
                </p>

                <div className="flex justify-between text-sm mt-3">
                  <span className="text-zinc-400">Quality</span>
                  <span>{exportQuality}</span>
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span className="text-zinc-400">Frame Rate</span>
                  <span>{exportFPS} FPS</span>
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span className="text-zinc-400">Media</span>
                  <span>{getMediaTypeLabel()}</span>
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span className="text-zinc-400">File Size</span>
                  <span>
                    {selectedFile
                      ? formatFileSize(selectedFile.size)
                      : "Not selected"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mt-3">
                These are export preferences only. Actual resolution conversion, trimming and rendering need a video processing engine.
              </p>
            </>
          )}
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-3">
            Final Preview
          </h2>

          {!selectedFile ? (
            <div className="rounded-xl bg-black border border-zinc-700 p-8 text-center">
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-sm text-zinc-400">
                Select a photo or video to see your final preview.
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden bg-black border border-zinc-700">
              {isVideo ? (
                <video
                  src={preview}
                  controls
                  playsInline
                  className="w-full max-h-[450px] object-contain"
                  style={{
                    filter: videoFilter,
                    transform: videoTransform,
                  }}
                />
              ) : (
                <img
                  src={preview}
                  alt="Final media preview"
                  className="w-full max-h-[450px] object-contain"
                  style={{
                    filter: videoFilter,
                    transform: videoTransform,
                  }}
                />
              )}

              {sticker && (
                <div className="p-2 text-center text-3xl">
                  {sticker}
                </div>
              )}

              {textOverlay && (
                <div className="p-3 text-center font-bold break-words">
                  {textOverlay}
                </div>
              )}
            </div>
          )}

          {selectedFile && (
            <div className="mt-3 rounded-xl bg-black p-3">
              <p className="text-sm font-semibold">
                {selectedFile.name}
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                {getMediaTypeLabel()} · {formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}
        </section>

        {/* PART 13 CONTINUES */}
        
        {/* ================================
            PART 13: DRAFT MANAGER & PUBLISH
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              My Drafts
            </h2>

            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
              {drafts.length} Saved
            </span>
          </div>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!selectedFile && !caption.trim()}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-3 font-semibold disabled:opacity-40"
          >
            + Save Current Draft
          </button>

          {drafts.length === 0 ? (
            <div className="py-7 text-center">
              <div className="text-4xl mb-2">📂</div>
              <p className="text-sm text-zinc-400">
                Your saved drafts will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="rounded-xl bg-black border border-zinc-700 p-3"
                >
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {draft.caption || "Untitled Draft"}
                      </p>

                      <p className="text-xs text-zinc-500 mt-1">
                        {draft.mediaName || "No media attached"}
                      </p>

                      <p className="text-xs text-zinc-500 mt-1">
                        {draft.updatedAt
                          ? new Date(draft.updatedAt).toLocaleString()
                          : "Saved draft"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => loadDraft(draft)}
                        className="rounded-lg bg-pink-600 px-3 py-2 text-xs font-semibold"
                      >
                        Load
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteDraft(draft.id)}
                        className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={startNewDraft}
            className="w-full mt-3 rounded-xl border border-zinc-700 p-3 text-sm font-semibold"
          >
            Start New Draft
          </button>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-3">
            Publish Preview
          </h2>

          <div className="rounded-xl bg-black border border-zinc-700 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center font-bold">
                {(username || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-bold">
                  @{username || "user"}
                </p>
                <p className="text-xs text-zinc-500">
                  ChitPix Creator
                </p>
              </div>
            </div>

            <p className="text-sm whitespace-pre-wrap break-words">
              {caption || "Your caption will appear here..."}
            </p>

            {price.trim() && (
              <p className="text-sm text-emerald-400 mt-2">
                Price: {price}
              </p>
            )}

            {selectedFile && (
              <p className="text-xs text-zinc-500 mt-3">
                Attached: {selectedFile.name}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-3">
            Ready to Publish?
          </h2>

          {!userId && (
            <p className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300 mb-3">
              Please login to your ChitPix account before publishing.
            </p>
          )}

          {!selectedFile && (
            <p className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-300 mb-3">
              Please select a photo or video first.
            </p>
          )}

          {mode === "schedule" && (
            <p className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-300 mb-3">
              Automatic scheduled publishing is not connected yet. Use normal publishing for now.
            </p>
          )}

          <button
            type="button"
            onClick={publishPost}
            disabled={!canPublish || mode === "schedule"}
            className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 p-4 font-bold text-white disabled:opacity-40"
          >
            {loading
              ? "Uploading..."
              : "🚀 Publish to ChitPix"}
          </button>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!selectedFile && !caption.trim()}
            className="w-full mt-3 rounded-xl bg-zinc-800 p-3 font-semibold disabled:opacity-40"
          >
            Save as Draft
          </button>

          <p className="text-xs text-zinc-500 text-center mt-3">
            Please check your media and caption before publishing.
          </p>
        </section>

        {/* PART 14 CONTINUES */}
        
        {/* ================================
            PART 14: FINAL CREATOR TOOLS
        ================================= */}

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-4">
            Quick Editor Tools
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={rotateMedia}
              disabled={!selectedFile}
              className="rounded-xl bg-black border border-zinc-700 p-3 text-sm font-semibold disabled:opacity-40"
            >
              ↻ Rotate
            </button>

            <button
              type="button"
              onClick={toggleHorizontalFlip}
              disabled={!selectedFile}
              className="rounded-xl bg-black border border-zinc-700 p-3 text-sm font-semibold disabled:opacity-40"
            >
              ⇋ Flip H
            </button>

            <button
              type="button"
              onClick={toggleVerticalFlip}
              disabled={!selectedFile}
              className="rounded-xl bg-black border border-zinc-700 p-3 text-sm font-semibold disabled:opacity-40"
            >
              ⇅ Flip V
            </button>

            <button
              type="button"
              onClick={toggleAudioPanel}
              className="rounded-xl bg-black border border-zinc-700 p-3 text-sm font-semibold"
            >
              🎵 Audio
            </button>

            <button
              type="button"
              onClick={toggleTextPanel}
              className="rounded-xl bg-black border border-zinc-700 p-3 text-sm font-semibold"
            >
              T Text
            </button>

            <button
              type="button"
              onClick={toggleStickerPanel}
              className="rounded-xl bg-black border border-zinc-700 p-3 text-sm font-semibold"
            >
              ✨ Stickers
            </button>
          </div>

          <button
            type="button"
            onClick={resetEditor}
            disabled={!selectedFile}
            className="w-full mt-3 rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-sm font-semibold disabled:opacity-40"
          >
            Reset All Editor Settings
          </button>
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-5">
          <h2 className="font-bold text-lg mb-4">
            Upload Checklist
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Media selected</span>
              <span className={selectedFile ? "text-emerald-400" : "text-zinc-500"}>
                {selectedFile ? "✓ Ready" : "Not selected"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Account login</span>
              <span className={userId ? "text-emerald-400" : "text-red-400"}>
                {userId ? "✓ Logged in" : "Login required"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Caption</span>
              <span className={caption.trim() ? "text-emerald-400" : "text-zinc-500"}>
                {caption.trim() ? "✓ Added" : "Optional"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Media type</span>
              <span className="text-zinc-400">
                {getMediaTypeLabel()}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Upload status</span>
              <span className={loading ? "text-yellow-400" : "text-zinc-400"}>
                {loading ? "Uploading..." : "Waiting"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-500/30 p-4 mb-5">
          <h2 className="font-bold text-lg mb-2">
            ❤️ Create with ChitPix
          </h2>

          <p className="text-sm text-zinc-300">
            Make your photos and videos creative. Add captions,
            choose filters, preview your content and share it
            with the ChitPix community.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs">
              Photo
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs">
              Video
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs">
              Filters
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs">
              Audio
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs">
              Stickers
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs">
              Templates
            </span>
          </div>
        </section>

        {/* PART 15 CONTINUES */}
        
        {/* ================================
            PART 15: FINAL PAGE FOOTER
        ================================= */}

        <footer className="mt-8 mb-6 text-center">
          <div className="border-t border-zinc-800 pt-5">
            <p className="text-sm font-bold text-white">
              ChitPix ❤️
            </p>

            <p className="text-xs text-zinc-500 mt-2">
              Create • Share • Connect
            </p>

            <p className="text-xs text-zinc-600 mt-2">
              Made for the ChitPix community.
            </p>
          </div>
        </footer>

      </div>
    </main>
  )
}
