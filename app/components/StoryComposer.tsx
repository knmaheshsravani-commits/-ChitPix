
"use client"

import { useEffect, useRef, useState } from "react"
import {
  X,
  Settings2,
  ImagePlus,
  Camera,
  Sparkles,
  Music2,
  LayoutGrid,
  ChevronDown,
  Check,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  WandSparkles,
  Type,
  Smile,
  Brush,
  Crop,
  RotateCw,
  Layers,
  Palette,
  Download,
  Play,
  Pause,
  Heart,
  MapPin,
  AtSign,
  Clock,
  Sticker,
  Scissors,
  Image,
  Video,
  Save,
  Trash2,
  Undo2,
  Redo2,
  Send,
  Volume2,
} from "lucide-react"

type Props = {
  onClose: () => void
  onPublish: (file: File) => void
}

type StickerItem = {
  id: number
  emoji: string
  x: number
  y: number
  size: number
}

type TextItem = {
  id: number
  text: string
  color: string
  size: number
  x: number
  y: number
}

export default function StoryComposer({
  onClose,
  onPublish,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const musicRef = useRef<HTMLInputElement>(null)
  const collageRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [activeTab, setActiveTab] = useState("Recents")

  const [selectedTool, setSelectedTool] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showEffects, setShowEffects] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [selectedTemplate, setSelectedTemplate] = useState("none")
  const [selectedEffect, setSelectedEffect] = useState("normal")
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain")

  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [musicPreview, setMusicPreview] = useState("")

  const [collageFiles, setCollageFiles] = useState<File[]>([])
  const [collagePreviews, setCollagePreviews] = useState<string[]>([])
  const [creatingCollage, setCreatingCollage] = useState(false)

  // TEXT EDITOR
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [textInput, setTextInput] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [textSize, setTextSize] = useState(32)
  const [selectedFont, setSelectedFont] = useState("sans-serif")

  // STICKERS
  const [stickers, setStickers] = useState<StickerItem[]>([])

  // DRAWING
  const [brushColor, setBrushColor] = useState("#ffffff")
  const [brushSize, setBrushSize] = useState(5)
  const [isDrawing, setIsDrawing] = useState(false)

  // CROP AND ROTATE
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)

  // BACKGROUND
  const [backgroundColor, setBackgroundColor] = useState("#000000")

  // PRIVACY
  const [storyPrivacy, setStoryPrivacy] = useState("Everyone")
  const [allowReplies, setAllowReplies] = useState(true)

  // DRAFT AND PUBLISH
  const [isPublishing, setIsPublishing] = useState(false)
  const [showDraftSaved, setShowDraftSaved] = useState(false)

  // TOOL PANELS
  const [showTextTools, setShowTextTools] = useState(false)
  const [showStickerTools, setShowStickerTools] = useState(false)
  const [showDrawTools, setShowDrawTools] = useState(false)
  const [showMusicTools, setShowMusicTools] = useState(false)

  // 20 STUDIO FILTERS
  const effects = [
    { id: "normal", name: "Original", filter: "none" },
    { id: "bright", name: "Bright", filter: "brightness(1.25) saturate(1.2)" },
    { id: "warm", name: "Warm", filter: "sepia(0.25) saturate(1.4)" },
    { id: "bw", name: "Black & White", filter: "grayscale(1)" },
    { id: "vintage", name: "Vintage", filter: "sepia(0.5) contrast(0.9)" },
    { id: "cool", name: "Cool", filter: "hue-rotate(20deg) saturate(1.15)" },
    { id: "cinema", name: "Cinema", filter: "contrast(1.25) saturate(0.85)" },
    { id: "dream", name: "Dream", filter: "brightness(1.12) saturate(1.2)" },
    { id: "glow", name: "Glow", filter: "brightness(1.15) contrast(1.08) saturate(1.3)" },
    { id: "soft", name: "Soft", filter: "brightness(1.08) contrast(0.88) saturate(0.9)" },
    { id: "dramatic", name: "Dramatic", filter: "contrast(1.5) saturate(1.2)" },
    { id: "fade", name: "Fade", filter: "contrast(0.85) brightness(1.12) saturate(0.75)" },
    { id: "sunset", name: "Sunset", filter: "sepia(0.3) saturate(1.6)" },
    { id: "forest", name: "Forest", filter: "hue-rotate(35deg) saturate(1.3)" },
    { id: "rose", name: "Rose", filter: "sepia(0.15) hue-rotate(-25deg) saturate(1.5)" },
    { id: "ice", name: "Ice", filter: "hue-rotate(165deg) saturate(0.8) brightness(1.08)" },
    { id: "matte", name: "Matte", filter: "contrast(0.82) saturate(0.85) brightness(1.08)" },
    { id: "vivid", name: "Vivid", filter: "saturate(1.8) contrast(1.12)" },
    { id: "noir", name: "Noir", filter: "grayscale(1) contrast(1.5)" },
    { id: "portrait", name: "Portrait", filter: "brightness(1.08) saturate(1.15) contrast(0.95)" },
  ]

  // STORY TEMPLATES
  const templates = [
    { id: "none", name: "Original", style: "bg-zinc-800" },
    { id: "love", name: "Love", style: "bg-gradient-to-br from-pink-500 to-red-500" },
    { id: "gold", name: "Golden", style: "bg-gradient-to-br from-yellow-500 to-amber-800" },
    { id: "night", name: "Night", style: "bg-gradient-to-br from-indigo-700 to-black" },
    { id: "nature", name: "Nature", style: "bg-gradient-to-br from-green-500 to-emerald-900" },
    { id: "birthday", name: "Birthday", style: "bg-gradient-to-br from-purple-500 to-pink-500" },
    { id: "travel", name: "Travel", style: "bg-gradient-to-br from-sky-500 to-blue-900" },
    { id: "festival", name: "Festival", style: "bg-gradient-to-br from-orange-500 to-red-700" },
  ]

  // STORY TOOL MENU
  const tools = [
    { name: "Templates", icon: LayoutGrid },
    { name: "Effects", icon: Sparkles },
    { name: "Music", icon: Music2 },
    { name: "Collage", icon: ImagePlus },
    { name: "Text", icon: Type },
    { name: "Stickers", icon: Sticker },
    { name: "Draw", icon: Brush },
    { name: "Crop", icon: Crop },
    { name: "Background", icon: Palette },
    { name: "Privacy", icon: Settings2 },
  ]

  // STICKER COLLECTION
  const stickerOptions = [
    "❤️", "😍", "🔥", "✨", "🌸", "😂",
    "🥰", "🎉", "🌈", "⭐", "💯", "👏",
    "😎", "☀️", "🌙", "🎂", "📍", "💖",
  ]

  // TEXT COLORS
  const textColors = [
    "#ffffff", "#000000", "#ff3366", "#ffcc00",
    "#00ccff", "#00ff99", "#cc66ff", "#ff8800",
  ]

  // FONT OPTIONS
  const fontOptions = [
    "sans-serif",
    "serif",
    "monospace",
    "cursive",
    "fantasy",
  ]

  // BACKGROUND COLORS
  const backgroundColors = [
    "#000000", "#ffffff", "#ff3366", "#6633ff",
    "#0066cc", "#009966", "#ff9900", "#222222",
  ]
  
  // ==========================================
  // PART 2 - MEDIA AND EDITING FUNCTIONS
  // ==========================================

  // PHOTO PREVIEW URL
  useEffect(() => {
    if (!file) {
      setPreview("")
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  // MUSIC PREVIEW URL
  useEffect(() => {
    if (!musicFile) {
      setMusicPreview("")
      return
    }

    const url = URL.createObjectURL(musicFile)
    setMusicPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [musicFile])

  // COLLAGE PREVIEW URLS
  useEffect(() => {
    const urls = collageFiles.map((photo) =>
      URL.createObjectURL(photo)
    )

    setCollagePreviews(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [collageFiles])

  // SELECT PHOTO OR VIDEO
  const selectFile = (selected?: File) => {
    if (!selected) return

    if (
      !selected.type.startsWith("image/") &&
      !selected.type.startsWith("video/")
    ) {
      alert("Image or video select cheyyi")
      return
    }

    setFile(selected)
    setSelectedEffect("normal")
    setSelectedTemplate("none")
    setRotation(0)
    setZoom(1)
    setTextItems([])
    setStickers([])
    setSelectedTool("")
  }

  // SELECT MUSIC
  const handleMusicSelect = (selected?: File) => {
    if (!selected) return

    if (!selected.type.startsWith("audio/")) {
      alert("Audio file select cheyyi")
      return
    }

    setMusicFile(selected)
    setSelectedTool("Music")
    setShowMusicTools(true)
  }

  // REMOVE MUSIC
  const removeMusic = () => {
    setMusicFile(null)
    setMusicPreview("")
    setShowMusicTools(false)
  }

  // SELECT COLLAGE PHOTOS
  const handleCollageSelect = (
    files?: FileList | null
  ) => {
    if (!files) return

    const selected = Array.from(files).filter((item) =>
      item.type.startsWith("image/")
    )

    if (selected.length < 2) {
      alert("Collage ki minimum 2 photos select cheyyi")
      return
    }

    if (selected.length > 6) {
      alert("Maximum 6 photos select cheyyachu")
      return
    }

    setCollageFiles(selected)
    setSelectedTool("Collage")
  }

  // CREATE COLLAGE IMAGE
  const createCollage = async () => {
    if (collageFiles.length < 2) {
      alert("First 2 or more photos select cheyyi")
      return
    }

    setCreatingCollage(true)

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Canvas not supported")
      }

      canvas.width = 1080
      canvas.height = 1920

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const columns = collageFiles.length === 2 ? 1 : 2
      const rows = Math.ceil(collageFiles.length / columns)

      const gap = 12
      const cellWidth =
        (canvas.width - gap * (columns + 1)) / columns

      const cellHeight =
        (canvas.height - gap * (rows + 1)) / rows

      for (
        let index = 0;
        index < collageFiles.length;
        index++
      ) {
        const photo = collageFiles[index]
        const imageUrl = URL.createObjectURL(photo)

        try {
          const image = document.createElement("img")

          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve()
            image.onerror = () =>
              reject(new Error("Photo load failed"))

            image.src = imageUrl
          })

          const column = index % columns
          const row = Math.floor(index / columns)

          const x = gap + column * (cellWidth + gap)
          const y = gap + row * (cellHeight + gap)

          const scale = Math.max(
            cellWidth / image.naturalWidth,
            cellHeight / image.naturalHeight
          )

          const width = image.naturalWidth * scale
          const height = image.naturalHeight * scale

          ctx.save()
          ctx.beginPath()
          ctx.rect(x, y, cellWidth, cellHeight)
          ctx.clip()

          ctx.drawImage(
            image,
            x + (cellWidth - width) / 2,
            y + (cellHeight - height) / 2,
            width,
            height
          )

          ctx.restore()
        } finally {
          URL.revokeObjectURL(imageUrl)
        }
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error("Collage create failed"))
        }, "image/jpeg", 0.95)
      })

      const collageFile = new File(
        [blob],
        `chitpix-collage-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      )

      setFile(collageFile)
      setSelectedEffect("normal")
      setSelectedTool("")
      setCollageFiles([])
      setActiveTab("Collage")
    } catch (error) {
      console.error("Collage error:", error)
      alert("Collage create avvaledu. Malli try cheyyi.")
    } finally {
      setCreatingCollage(false)
    }
  }

  // GET SELECTED FILTER
  const getSelectedFilter = () => {
    return (
      effects.find(
        (effect) => effect.id === selectedEffect
      )?.filter || "none"
    )
  }

  // EXPORT EDITED PHOTO
  const createEditedFile = async (): Promise<File> => {
    if (!file) {
      throw new Error("Photo select cheyyi.")
    }

    // Videos are currently published without image filters.
    if (file.type.startsWith("video/")) {
      return file
    }

    const imageUrl = URL.createObjectURL(file)

    try {
      const image = document.createElement("img")

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () =>
          reject(new Error("Photo load avvaledu."))

        image.src = imageUrl
      })

      const canvas = document.createElement("canvas")

      const isSideways = Math.abs(rotation % 180) === 90

      canvas.width = isSideways
        ? image.naturalHeight
        : image.naturalWidth

      canvas.height = isSideways
        ? image.naturalWidth
        : image.naturalHeight

      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Photo editing support ledu.")
      }

      ctx.save()

      ctx.translate(
        canvas.width / 2,
        canvas.height / 2
      )

      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(zoom, zoom)
      ctx.filter = getSelectedFilter()

      ctx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2
      )

      ctx.restore()

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error("Edited photo create avvaledu."))
        }, "image/jpeg", 0.95)
      })

      return new File(
        [blob],
        `chitpix-story-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      )
    } finally {
      URL.revokeObjectURL(imageUrl)
    }
  }

  // PUBLISH EDITED PHOTO
  const publishEditedMedia = async () => {
    if (!file || isPublishing) return

    setIsPublishing(true)

    try {
      const editedFile = await createEditedFile()
      onPublish(editedFile)
    } catch (error) {
      console.error("Story export error:", error)

      alert(
        error instanceof Error
          ? error.message
          : "Story publish avvaledu. Malli try cheyyi."
      )

      setIsPublishing(false)
    }
  }

  // SELECT A STUDIO TOOL
  const openTool = (toolName: string) => {
    setSelectedTool(toolName)

    setShowTemplates(toolName === "Templates")
    setShowEffects(toolName === "Effects")
    setShowTextTools(toolName === "Text")
    setShowStickerTools(toolName === "Stickers")
    setShowDrawTools(toolName === "Draw")
    setShowMusicTools(toolName === "Music")

    if (toolName === "Music") {
      musicRef.current?.click()
    }

    if (toolName === "Collage") {
      collageRef.current?.click()
    }
  }

  // ADD STORY TEXT
  const addText = () => {
    if (!textInput.trim()) {
      alert("Text enter cheyyi")
      return
    }

    setTextItems((previous) => [
      ...previous,
      {
        id: Date.now(),
        text: textInput.trim(),
        color: textColor,
        size: textSize,
        x: 50,
        y: 50,
      },
    ])

    setTextInput("")
  }

  // ADD STICKER
  const addSticker = (emoji: string) => {
    setStickers((previous) => [
      ...previous,
      {
        id: Date.now() + previous.length,
        emoji,
        x: 50,
        y: 50,
        size: 42,
      },
    ])
  }

  // REMOVE SELECTED MEDIA
  const removeMedia = () => {
    setFile(null)
    setSelectedEffect("normal")
    setSelectedTemplate("none")
    setRotation(0)
    setZoom(1)
    setTextItems([])
    setStickers([])
        }
        
  // ==========================================
  // PART 3 - TEXT AND STICKER STUDIO
  // ==========================================

  // UPDATE TEXT
  const updateText = (id: number, value: string) => {
    setTextItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, text: value }
          : item
      )
    )
  }

  // DELETE TEXT
  const deleteText = (id: number) => {
    setTextItems((previous) =>
      previous.filter((item) => item.id !== id)
    )
  }

  // CHANGE TEXT COLOR
  const changeTextColor = (color: string) => {
    setTextColor(color)
  }

  // CHANGE TEXT SIZE
  const changeTextSize = (size: number) => {
    setTextSize(size)
  }

  // CHANGE FONT
  const changeFont = (font: string) => {
    setSelectedFont(font)
  }

  // ADD TEXT WITH CURRENT STYLE
  const addStyledText = () => {
    if (!textInput.trim()) {
      alert("Story text enter cheyyi bro")
      return
    }

    setTextItems((previous) => [
      ...previous,
      {
        id: Date.now(),
        text: textInput.trim(),
        color: textColor,
        size: textSize,
        x: 50,
        y: 50,
      },
    ])

    setTextInput("")
  }

  // UPDATE TEXT POSITION
  const moveText = (
    id: number,
    x: number,
    y: number
  ) => {
    setTextItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y)),
            }
          : item
      )
    )
  }

  // CHANGE EXISTING TEXT COLOR
  const updateExistingTextColor = (
    id: number,
    color: string
  ) => {
    setTextItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, color }
          : item
      )
    )
  }

  // CHANGE EXISTING TEXT SIZE
  const updateExistingTextSize = (
    id: number,
    size: number
  ) => {
    setTextItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, size }
          : item
      )
    )
  }

  // DUPLICATE TEXT
  const duplicateText = (id: number) => {
    const original = textItems.find(
      (item) => item.id === id
    )

    if (!original) return

    setTextItems((previous) => [
      ...previous,
      {
        ...original,
        id: Date.now(),
        x: Math.min(95, original.x + 5),
        y: Math.min(95, original.y + 5),
      },
    ])
  }

  // ADD EMOJI STICKER
  const addEmojiSticker = (emoji: string) => {
    setStickers((previous) => [
      ...previous,
      {
        id: Date.now() + previous.length,
        emoji,
        x: 50,
        y: 50,
        size: 42,
      },
    ])
  }

  // DELETE STICKER
  const deleteSticker = (id: number) => {
    setStickers((previous) =>
      previous.filter((item) => item.id !== id)
    )
  }

  // CHANGE STICKER SIZE
  const resizeSticker = (
    id: number,
    size: number
  ) => {
    setStickers((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, size }
          : item
      )
    )
  }

  // MOVE STICKER
  const moveSticker = (
    id: number,
    x: number,
    y: number
  ) => {
    setStickers((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y)),
            }
          : item
      )
    )
  }

  // CLEAR ALL TEXT
  const clearAllText = () => {
    setTextItems([])
  }

  // CLEAR ALL STICKERS
  const clearAllStickers = () => {
    setStickers([])
  }

  // RESET TEXT STYLE
  const resetTextStyle = () => {
    setTextColor("#ffffff")
    setTextSize(32)
    setSelectedFont("sans-serif")
  }

  // CLOSE CREATIVE PANELS
  const closeCreativePanels = () => {
    setShowTextTools(false)
    setShowStickerTools(false)
    setShowDrawTools(false)
    setShowMusicTools(false)
    setSelectedTool("")
  }
  
  // ==========================================
  // PART 4 - DRAWING AND BACKGROUND STUDIO
  // ==========================================

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  const [brushMode, setBrushMode] = useState<
    "normal" | "neon" | "eraser"
  >("normal")

  const [backgroundGradient, setBackgroundGradient] =
    useState("")

  const [drawingHistory, setDrawingHistory] =
    useState<string[]>([])

  const [redoHistory, setRedoHistory] =
    useState<string[]>([])

  // SAVE CURRENT DRAWING STATE
  const saveDrawingState = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")

    setDrawingHistory((previous) => [
      ...previous.slice(-19),
      image,
    ])

    setRedoHistory([])
  }

  // SET BRUSH MODE
  const changeBrushMode = (
    mode: "normal" | "neon" | "eraser"
  ) => {
    setBrushMode(mode)
  }

  // UPDATE BRUSH COLOR
  const changeBrushColor = (color: string) => {
    setBrushColor(color)
    setBrushMode("normal")
  }

  // UPDATE BRUSH SIZE
  const changeBrushWidth = (size: number) => {
    setBrushSize(Math.max(1, Math.min(40, size)))
  }

  // START DRAWING
  const startDrawing = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    drawingRef.current = true
    setIsDrawing(true)

    canvas.setPointerCapture(event.pointerId)

    const rect = canvas.getBoundingClientRect()

    const x =
      (event.clientX - rect.left) *
      (canvas.width / rect.width)

    const y =
      (event.clientY - rect.top) *
      (canvas.height / rect.height)

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  // DRAW MOVEMENT
  const drawMovement = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (!drawingRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()

    const x =
      (event.clientX - rect.left) *
      (canvas.width / rect.width)

    const y =
      (event.clientY - rect.top) *
      (canvas.height / rect.height)

    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = brushSize

    if (brushMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.shadowBlur = 0
      ctx.strokeStyle = "rgba(0,0,0,1)"
    } else if (brushMode === "neon") {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = brushColor
      ctx.shadowColor = brushColor
      ctx.shadowBlur = 18
    } else {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = brushColor
      ctx.shadowBlur = 0
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // STOP DRAWING
  const stopDrawing = () => {
    if (!drawingRef.current) return

    drawingRef.current = false
    setIsDrawing(false)

    const ctx = canvasRef.current?.getContext("2d")

    if (ctx) {
      ctx.globalCompositeOperation = "source-over"
      ctx.shadowBlur = 0
      ctx.closePath()
    }

    saveDrawingState()
  }

  // UNDO DRAWING
  const undoDrawing = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx || drawingHistory.length === 0) {
      return
    }

    const current = canvas.toDataURL("image/png")
    const previous = drawingHistory[drawingHistory.length - 1]

    setRedoHistory((items) => [...items, current])
    setDrawingHistory((items) => items.slice(0, -1))

    const image = document.createElement("img")

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0)
    }

    image.src = previous
  }

  // REDO DRAWING
  const redoDrawing = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx || redoHistory.length === 0) {
      return
    }

    const current = canvas.toDataURL("image/png")
    const next = redoHistory[redoHistory.length - 1]

    setDrawingHistory((items) => [...items, current])
    setRedoHistory((items) => items.slice(0, -1))

    const image = document.createElement("img")

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0)
    }

    image.src = next
  }

  // CLEAR DRAWING
  const clearDrawing = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    saveDrawingState()

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // CHANGE BACKGROUND COLOR
  const changeBackground = (color: string) => {
    setBackgroundColor(color)
    setBackgroundGradient("")
  }

  // CHANGE GRADIENT BACKGROUND
  const changeBackgroundGradient = (gradient: string) => {
    setBackgroundGradient(gradient)
  }

  // AVAILABLE GRADIENTS
  const gradientOptions = [
    {
      name: "Sunset",
      value: "linear-gradient(135deg,#ff512f,#dd2476)",
    },
    {
      name: "Ocean",
      value: "linear-gradient(135deg,#2193b0,#6dd5ed)",
    },
    {
      name: "Purple",
      value: "linear-gradient(135deg,#7f00ff,#e100ff)",
    },
    {
      name: "Forest",
      value: "linear-gradient(135deg,#134e5e,#71b280)",
    },
    {
      name: "Gold",
      value: "linear-gradient(135deg,#f7971e,#ffd200)",
    },
    {
      name: "Night",
      value: "linear-gradient(135deg,#141e30,#243b55)",
    },
  ]

  // RESET DRAWING SETTINGS
  const resetDrawingSettings = () => {
    setBrushColor("#ffffff")
    setBrushSize(5)
    setBrushMode("normal")
  }

  // RESET BACKGROUND
  const resetBackground = () => {
    setBackgroundColor("#000000")
    setBackgroundGradient("")
        }
  
  // ==========================================
  // PART 5 - PHOTO EDITOR AND LAYERS
  // ==========================================

  // CROP SETTINGS
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropScale, setCropScale] = useState(1)

  // FLIP SETTINGS
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)

  // LAYER VISIBILITY
  const [showTextLayers, setShowTextLayers] = useState(true)
  const [showStickerLayers, setShowStickerLayers] = useState(true)
  const [showDrawingLayer, setShowDrawingLayer] = useState(true)

  // PHOTO ROTATION
  const rotatePhoto = () => {
    setRotation((previous) => (previous + 90) % 360)
  }

  // ROTATE BACK
  const rotatePhotoBack = () => {
    setRotation((previous) => (previous - 90 + 360) % 360)
  }

  // FLIP PHOTO
  const flipPhotoHorizontal = () => {
    setFlipHorizontal((previous) => !previous)
  }

  const flipPhotoVertical = () => {
    setFlipVertical((previous) => !previous)
  }

  // ZOOM PHOTO
  const zoomPhoto = (value: number) => {
    setZoom(Math.max(0.5, Math.min(3, value)))
  }

  // CROP POSITION
  const updateCropPosition = (x: number, y: number) => {
    setCropX(Math.max(-100, Math.min(100, x)))
    setCropY(Math.max(-100, Math.min(100, y)))
  }

  // CROP SCALE
  const updateCropScale = (value: number) => {
    setCropScale(Math.max(1, Math.min(3, value)))
  }

  // RESET PHOTO TRANSFORM
  const resetPhotoTransform = () => {
    setRotation(0)
    setZoom(1)
    setCropX(0)
    setCropY(0)
    setCropScale(1)
    setFlipHorizontal(false)
    setFlipVertical(false)
  }

  // LAYER VISIBILITY CONTROLS
  const toggleTextLayers = () => {
    setShowTextLayers((previous) => !previous)
  }

  const toggleStickerLayers = () => {
    setShowStickerLayers((previous) => !previous)
  }

  const toggleDrawingLayer = () => {
    setShowDrawingLayer((previous) => !previous)
  }

  // MOVE LAYER UP
  const moveLayerUp = (id: number) => {
    setTextItems((previous) => {
      const index = previous.findIndex((item) => item.id === id)
      if (index < 0 || index === previous.length - 1) return previous

      const next = [...previous]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  // MOVE LAYER DOWN
  const moveLayerDown = (id: number) => {
    setTextItems((previous) => {
      const index = previous.findIndex((item) => item.id === id)
      if (index <= 0) return previous

      const next = [...previous]
      ;[next[index], next[index - 1]] = [next[index - 1], next[index]]
      return next
    })
  }

  // CREATE COMPLETE STORY IMAGE
  const createStudioExportFile = async (): Promise<File> => {
    if (!file) {
      throw new Error("First photo select cheyyi.")
    }

    // Video export is handled separately for now.
    if (file.type.startsWith("video/")) {
      return file
    }

    const imageUrl = URL.createObjectURL(file)

    try {
      const image = document.createElement("img")

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error("Photo load failed"))
        image.src = imageUrl
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Canvas not supported")
      }

      const width = 1080
      const height = 1920

      canvas.width = width
      canvas.height = height

      // BACKGROUND
      if (backgroundGradient) {
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, "#7f00ff")
        gradient.addColorStop(1, "#e100ff")
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = backgroundColor
      }

      ctx.fillRect(0, 0, width, height)

      // PHOTO TRANSFORM
      ctx.save()

      ctx.translate(
        width / 2 + cropX * 5,
        height / 2 + cropY * 5
      )

      ctx.rotate((rotation * Math.PI) / 180)

      ctx.scale(
        zoom * cropScale * (flipHorizontal ? -1 : 1),
        zoom * cropScale * (flipVertical ? -1 : 1)
      )

      ctx.filter = getSelectedFilter()

      const scale = Math.min(
        width / image.naturalWidth,
        height / image.naturalHeight
      )

      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale

      ctx.drawImage(
        image,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      )

      ctx.restore()
      ctx.filter = "none"

      // DRAWING LAYER
      if (showDrawingLayer && canvasRef.current) {
        ctx.drawImage(
          canvasRef.current,
          0,
          0,
          width,
          height
        )
      }

      // TEXT LAYERS
      if (showTextLayers) {
        textItems.forEach((item) => {
          ctx.save()

          ctx.font = `${item.size * 2}px ${selectedFont}`
          ctx.fillStyle = item.color
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          ctx.shadowColor = "rgba(0,0,0,0.5)"
          ctx.shadowBlur = 6

          ctx.fillText(
            item.text,
            (item.x / 100) * width,
            (item.y / 100) * height,
            width * 0.9
          )

          ctx.restore()
        })
      }

      // STICKER LAYERS
      if (showStickerLayers) {
        stickers.forEach((item) => {
          ctx.save()

          ctx.font = `${item.size * 2}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          ctx.fillText(
            item.emoji,
            (item.x / 100) * width,
            (item.y / 100) * height
          )

          ctx.restore()
        })
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error("Story image export failed"))
        }, "image/jpeg", 0.95)
      })

      return new File(
        [blob],
        `chitpix-story-studio-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      )
    } finally {
      URL.revokeObjectURL(imageUrl)
    }
  }

  // RESET ALL LAYERS
  const resetAllLayers = () => {
    setTextItems([])
    setStickers([])
    setShowTextLayers(true)
    setShowStickerLayers(true)
    setShowDrawingLayer(true)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    setDrawingHistory([])
    setRedoHistory([])
        }
  
  // ==========================================
  // PART 6 - MUSIC AND COLLAGE STUDIO
  // ==========================================

  // MUSIC CONTROLS
  const [musicVolume, setMusicVolume] = useState(80)
  const [musicStart, setMusicStart] = useState(0)
  const [musicDuration, setMusicDuration] = useState(15)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)

  const [collageLayout, setCollageLayout] = useState("grid")
  const [collageSpacing, setCollageSpacing] = useState(12)
  const [collageRadius, setCollageRadius] = useState(12)

  const [storyDuration, setStoryDuration] = useState(15)

  const audioRef = useRef<HTMLAudioElement>(null)

  // PLAY MUSIC PREVIEW
  const playMusicPreview = async () => {
    if (!audioRef.current || !musicPreview) return

    try {
      await audioRef.current.play()
      setMusicPlaying(true)
    } catch (error) {
      console.error("Music playback error:", error)
      alert("Music play avvaledu. Malli try cheyyi.")
    }
  }

  // PAUSE MUSIC PREVIEW
  const pauseMusicPreview = () => {
    audioRef.current?.pause()
    setMusicPlaying(false)
  }

  // CHANGE MUSIC VOLUME
  const changeMusicVolume = (value: number) => {
    const volume = Math.max(0, Math.min(100, value))
    setMusicVolume(volume)

    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }

  // MUTE MUSIC
  const toggleMusicMute = () => {
    setMusicMuted((previous) => {
      const next = !previous

      if (audioRef.current) {
        audioRef.current.muted = next
      }

      return next
    })
  }

  // MUSIC START POSITION
  const changeMusicStart = (value: number) => {
    setMusicStart(Math.max(0, value))

    if (audioRef.current) {
      audioRef.current.currentTime = value
    }
  }

  // MUSIC DURATION
  const changeMusicDuration = (value: number) => {
    setMusicDuration(Math.max(1, Math.min(30, value)))
  }

  // STOP MUSIC
  const stopMusic = () => {
    audioRef.current?.pause()

    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }

    setMusicPlaying(false)
  }

  // SELECT COLLAGE LAYOUT
  const changeCollageLayout = (
    layout: "grid" | "vertical" | "horizontal" | "focus"
  ) => {
    setCollageLayout(layout)
  }

  // COLLAGE SPACING
  const changeCollageSpacing = (value: number) => {
    setCollageSpacing(Math.max(0, Math.min(40, value)))
  }

  // COLLAGE CORNERS
  const changeCollageRadius = (value: number) => {
    setCollageRadius(Math.max(0, Math.min(40, value)))
  }

  // STORY DURATION
  const changeStoryDuration = (value: number) => {
    setStoryDuration(Math.max(5, Math.min(60, value)))
  }

  // CREATE ADVANCED COLLAGE
  const createAdvancedCollage = async () => {
    if (collageFiles.length < 2) {
      alert("Minimum 2 photos select cheyyi bro")
      return
    }

    setCreatingCollage(true)

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) throw new Error("Canvas not supported")

      canvas.width = 1080
      canvas.height = 1920

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, 1080, 1920)

      const gap = collageSpacing
      const count = collageFiles.length

      let positions: {
        x: number
        y: number
        width: number
        height: number
      }[] = []

      if (collageLayout === "vertical") {
        const cellHeight = (1920 - gap * (count + 1)) / count

        positions = collageFiles.map((_, index) => ({
          x: gap,
          y: gap + index * (cellHeight + gap),
          width: 1080 - gap * 2,
          height: cellHeight,
        }))
      } else if (collageLayout === "horizontal") {
        const columns = Math.min(count, 2)
        const rows = Math.ceil(count / columns)
        const cellWidth = (1080 - gap * (columns + 1)) / columns
        const cellHeight = (1920 - gap * (rows + 1)) / rows

        positions = collageFiles.map((_, index) => ({
          x: gap + (index % columns) * (cellWidth + gap),
          y: gap + Math.floor(index / columns) * (cellHeight + gap),
          width: cellWidth,
          height: cellHeight,
        }))
      } else if (collageLayout === "focus") {
        positions = collageFiles.map((_, index) => {
          if (index === 0) {
            return {
              x: gap,
              y: gap,
              width: 1080 - gap * 2,
              height: 1050,
            }
          }

          const remaining = count - 1
          const cellWidth = (1080 - gap * (remaining + 1)) / remaining

          return {
            x: gap + (index - 1) * (cellWidth + gap),
            y: 1050 + gap * 2,
            width: cellWidth,
            height: 1920 - 1050 - gap * 3,
          }
        })
      } else {
        const columns = count === 2 ? 1 : 2
        const rows = Math.ceil(count / columns)
        const cellWidth = (1080 - gap * (columns + 1)) / columns
        const cellHeight = (1920 - gap * (rows + 1)) / rows

        positions = collageFiles.map((_, index) => ({
          x: gap + (index % columns) * (cellWidth + gap),
          y: gap + Math.floor(index / columns) * (cellHeight + gap),
          width: cellWidth,
          height: cellHeight,
        }))
      }

      for (let index = 0; index < collageFiles.length; index++) {
        const photo = collageFiles[index]
        const url = URL.createObjectURL(photo)

        try {
          const image = document.createElement("img")

          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve()
            image.onerror = () => reject(new Error("Photo load failed"))
            image.src = url
          })

          const position = positions[index]

          const scale = Math.max(
            position.width / image.naturalWidth,
            position.height / image.naturalHeight
          )

          const drawWidth = image.naturalWidth * scale
          const drawHeight = image.naturalHeight * scale

          ctx.save()
          ctx.beginPath()
          ctx.roundRect(
            position.x,
            position.y,
            position.width,
            position.height,
            collageRadius
          )
          ctx.clip()

          ctx.drawImage(
            image,
            position.x + (position.width - drawWidth) / 2,
            position.y + (position.height - drawHeight) / 2,
            drawWidth,
            drawHeight
          )

          ctx.restore()
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error("Collage export failed"))
        }, "image/jpeg", 0.95)
      })

      const result = new File(
        [blob],
        `chitpix-advanced-collage-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      )

      setFile(result)
      setSelectedEffect("normal")
      setCollageFiles([])
      setSelectedTool("")
    } catch (error) {
      console.error("Advanced collage error:", error)
      alert("Collage create avvaledu. Malli try cheyyi.")
    } finally {
      setCreatingCollage(false)
    }
  }

  // REMOVE COLLAGE PHOTOS
  const clearCollage = () => {
    setCollageFiles([])
    setSelectedTool("")
  }

  // RESET MUSIC SETTINGS
  const resetMusicSettings = () => {
    stopMusic()
    setMusicVolume(80)
    setMusicStart(0)
    setMusicDuration(15)
    setMusicMuted(false)
  }

  // RESET COLLAGE SETTINGS
  const resetCollageSettings = () => {
    setCollageLayout("grid")
    setCollageSpacing(12)
    setCollageRadius(12)
  }
    
  // ==========================================
  // PART 7 - AI, TRENDING, DRAFTS AND PRIVACY
  // ==========================================

  // AI STUDIO
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiStyle, setAiStyle] = useState("Portrait")
  const [aiLoading, setAiLoading] = useState(false)
  const [showAIStudio, setShowAIStudio] = useState(false)

  // TRENDING PROMPTS
  const trendingPrompts = [
    "My Travel Memories",
    "Birthday Celebration",
    "My Best Friends",
    "Love Memories",
    "Festival Moments",
    "Nature Photography",
    "My Daily Life",
    "Dream Vacation",
  ]

  // AI STYLES
  const aiStyles = [
    "Portrait",
    "Cinematic",
    "Anime",
    "Vintage",
    "Fantasy",
    "Professional",
    "3D Art",
    "Watercolor",
  ]

  // SELECT AI STYLE
  const selectAIStyle = (style: string) => {
    setAiStyle(style)
  }

  // SELECT TRENDING PROMPT
  const selectTrendingPrompt = (prompt: string) => {
    setAiPrompt(prompt)
    setShowAIStudio(true)
    setSelectedTool("AI Studio")
  }

  // PREPARE AI REQUEST
  // Actual AI generation requires a connected AI service.
  const prepareAIRequest = () => {
    if (!file) {
      alert("First photo select cheyyi bro")
      return
    }

    if (!aiPrompt.trim()) {
      alert("AI prompt enter cheyyi")
      return
    }

    alert(
      "AI request ready! AI service API integration connect cheyyali."
    )
  }

  // PRIVACY SETTINGS
  const [hideStoryFrom, setHideStoryFrom] = useState<string[]>([])
  const [closeFriendsOnly, setCloseFriendsOnly] = useState(false)
  const [allowSharing, setAllowSharing] = useState(true)
  const [allowRepliesFrom, setAllowRepliesFrom] = useState("Everyone")

  // CHANGE PRIVACY
  const changeStoryPrivacy = (privacy: string) => {
    setStoryPrivacy(privacy)
    setCloseFriendsOnly(privacy === "Close Friends")
  }

  // ADD USER TO HIDE LIST
  const addHiddenUser = (username: string) => {
    const value = username.trim().replace(/^@/, "")

    if (!value) return

    setHideStoryFrom((previous) =>
      previous.includes(value)
        ? previous
        : [...previous, value]
    )
  }

  // REMOVE USER FROM HIDE LIST
  const removeHiddenUser = (username: string) => {
    setHideStoryFrom((previous) =>
      previous.filter((item) => item !== username)
    )
  }

  // REPLY PERMISSION
  const changeReplyPermission = (value: string) => {
    setAllowRepliesFrom(value)
    setAllowReplies(value !== "Nobody")
  }

  // STORY SHARING PERMISSION
  const toggleStorySharing = () => {
    setAllowSharing((previous) => !previous)
  }

  // DRAFT STORAGE DATABASE
  const openDraftDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ChitPixStoryStudio", 1)

      request.onupgradeneeded = () => {
        const db = request.result

        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", {
            keyPath: "id",
          })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () =>
        reject(request.error || new Error("Draft database error"))
    })
  }

  // SAVE STORY DRAFT
  const saveStoryDraft = async () => {
    if (!file) {
      alert("Save cheyyadaniki first photo select cheyyi")
      return
    }

    try {
      const db = await openDraftDatabase()

      const draft = {
        id: Date.now(),
        name: file.name,
        media: file,
        selectedEffect,
        selectedTemplate,
        textItems,
        stickers,
        rotation,
        zoom,
        backgroundColor,
        backgroundGradient,
        savedAt: new Date().toISOString(),
      }

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("drafts", "readwrite")

        transaction.objectStore("drafts").put(draft)

        transaction.oncomplete = () => resolve()
        transaction.onerror = () =>
          reject(transaction.error || new Error("Draft save failed"))
        transaction.onabort = () =>
          reject(new Error("Draft save cancelled"))
      })

      db.close()

      setShowDraftSaved(true)
      alert("ChitPix Story Draft saved successfully!")
    } catch (error) {
      console.error("Draft save error:", error)
      alert("Draft save avvaledu. Browser storage check cheyyi.")
    }
  }

  // GET SAVED DRAFTS
  const getSavedDrafts = async (): Promise<any[]> => {
    const db = await openDraftDatabase()

    try {
      return await new Promise<any[]>((resolve, reject) => {
        const transaction = db.transaction("drafts", "readonly")
        const request = transaction.objectStore("drafts").getAll()

        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () =>
          reject(request.error || new Error("Draft loading failed"))
      })
    } finally {
      db.close()
    }
  }

  // DELETE A DRAFT
  const deleteStoryDraft = async (id: number) => {
    const db = await openDraftDatabase()

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("drafts", "readwrite")

        transaction.objectStore("drafts").delete(id)

        transaction.oncomplete = () => resolve()
        transaction.onerror = () =>
          reject(transaction.error || new Error("Draft delete failed"))
      })
    } finally {
      db.close()
    }
  }

  // RESTORE A DRAFT
  const restoreStoryDraft = async (id: number) => {
    try {
      const drafts = await getSavedDrafts()
      const draft = drafts.find((item) => item.id === id)

      if (!draft) {
        alert("Draft dorakaledu")
        return
      }

      setFile(draft.media)
      setSelectedEffect(draft.selectedEffect || "normal")
      setSelectedTemplate(draft.selectedTemplate || "none")
      setTextItems(draft.textItems || [])
      setStickers(draft.stickers || [])
      setRotation(draft.rotation || 0)
      setZoom(draft.zoom || 1)
      setBackgroundColor(draft.backgroundColor || "#000000")
      setBackgroundGradient(draft.backgroundGradient || "")

      setShowDraftSaved(false)
      alert("Draft restored successfully!")
    } catch (error) {
      console.error("Draft restore error:", error)
      alert("Draft restore avvaledu")
    }
  }

  // RESET AI STUDIO
  const resetAIStudio = () => {
    setAiPrompt("")
    setAiStyle("Portrait")
    setAiLoading(false)
  }

  // RESET PRIVACY SETTINGS
  const resetPrivacySettings = () => {
    setStoryPrivacy("Everyone")
    setCloseFriendsOnly(false)
    setAllowReplies(true)
    setAllowRepliesFrom("Everyone")
    setAllowSharing(true)
    setHideStoryFrom([])
  }

  // GET STORY SETTINGS
  const getStorySettings = () => ({
    privacy: storyPrivacy,
    closeFriendsOnly,
    allowReplies,
    allowRepliesFrom,
    allowSharing,
    hideStoryFrom,
  })
      
  // ==========================================
  // PART 8A - DRAFT AND PUBLISH FUNCTIONS
  // ==========================================

  const [savedDrafts, setSavedDrafts] = useState<any[]>([])
  const [showDrafts, setShowDrafts] = useState(false)
  const [hiddenUserInput, setHiddenUserInput] = useState("")

  // LOAD DRAFT LIST
  const loadDraftList = async () => {
    try {
      const drafts = await getSavedDrafts()
      setSavedDrafts(drafts)
      setShowDrafts(true)
    } catch (error) {
      console.error("Draft list error:", error)
      alert("Drafts load avvaledu")
    }
  }

  // DELETE DRAFT
  const removeDraftFromList = async (id: number) => {
    try {
      await deleteStoryDraft(id)
      setSavedDrafts((previous) =>
        previous.filter((item) => item.id !== id)
      )
    } catch (error) {
      console.error(error)
      alert("Draft delete avvaledu")
    }
  }

  // OPEN DRAFT
  const openSavedDraft = async (id: number) => {
    await restoreStoryDraft(id)
    setShowDrafts(false)
  }

  // FINAL PUBLISH
  const publishStudioStory = async () => {
    if (!file || isPublishing) return

    setIsPublishing(true)

    try {
      const editedFile = await createStudioExportFile()
      onPublish(editedFile)
    } catch (error) {
      console.error("Story publish error:", error)

      alert(
        error instanceof Error
          ? error.message
          : "Story publish avvaledu"
      )

      setIsPublishing(false)
    }
  }

  // CANVAS INITIALIZATION
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 1080
    canvas.height = 1920
  }, [file])
    // ==========================================
  // PART 8B - STORY STUDIO UI
  // ==========================================

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white overflow-y-auto">
      {/* HEADER */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-black/90 p-4 backdrop-blur">
        <button onClick={onClose} className="text-xl">
          ✕
        </button>

        <h2 className="text-lg font-bold">Story Studio</h2>

        <button
          onClick={saveStoryDraft}
          className="rounded-full bg-white/15 px-4 py-2 text-sm"
        >
          Save Draft
        </button>
      </div>

      {/* MEDIA PREVIEW */}
      <div className="mx-auto w-full max-w-md px-3 py-4">
        <div
          className="relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 to-pink-500"
          style={{ background: backgroundGradient || backgroundColor }}
        >
          {file && (
            file.type.startsWith("video/") ? (
              <video
                src={preview}
                controls
                playsInline
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt="Story preview"
                className="h-full w-full object-contain"
                style={{
                  filter: getSelectedFilter(),
                  transform: `rotate(${rotation}deg) scale(${zoom}) scaleX(${flipHorizontal ? -1 : 1})`,
                }}
              />
            )
          )}

          {/* DRAWING CANVAS */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={startDrawing}
            onPointerMove={drawMovement}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />

          {/* TEXT LAYERS */}
          {textItems.map((item) => (
            <div
              key={item.id}
              className="absolute left-1/2 -translate-x-1/2 rounded px-2 py-1 text-center font-bold"
              style={{
                top: `${item.y}%`,
                color: item.color,
                fontSize: `${item.size}px`,
                fontFamily: selectedFont,
                zIndex: 20,
              }}
            >
              {item.text}
            </div>
          ))}

          {/* STICKERS */}
          {stickers.map((item) => (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: `${item.size}px`,
                zIndex: 30,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {!file && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-xl bg-white/15 p-5"
            >
              📷 Gallery
            </button>

            <button
              onClick={() => cameraRef.current?.click()}
              className="rounded-xl bg-white/15 p-5"
            >
              🎥 Camera
            </button>
          </div>
        )}

        {/* HIDDEN INPUTS */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
  const selected = e.target.files?.[0]
  if (selected) selectFile(selected)
}}
        />

        <input
          ref={cameraRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
  const selected = e.target.files?.[0]
  if (selected) selectFile(selected)
}}
        />
      </div>

      {/* TOOL BUTTONS */}
<div className="mx-auto grid max-w-md grid-cols-5 gap-2 px-3">
  {tools.map((tool) => {
    const toolId = tool.name.toLowerCase()

    return (
      <button
        key={tool.name}
        onClick={() => openTool(toolId)}
        className={`rounded-xl p-3 text-center text-xs ${
          selectedTool === toolId
            ? "bg-pink-600"
            : "bg-white/10"
        }`}
      >
        <div className="mb-1 text-xl">
          <tool.icon size={22} />
        </div>
        {tool.name}
      </button>
    )
  })}
</div>

      {/* TOOL PANEL */}
      <div className="mx-auto mt-4 max-w-md px-3 pb-6">
        {selectedTool === "effects" && (
          <div className="grid grid-cols-3 gap-2">
            {effects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setSelectedEffect(effect.id)}
                className={`rounded-xl p-3 text-sm ${
                  selectedEffect === effect.id
                    ? "bg-pink-600"
                    : "bg-white/10"
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        )}

        {selectedTool === "templates" && (
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`rounded-xl p-4 text-sm ${
                  selectedTemplate === template.id
                    ? "bg-pink-600"
                    : "bg-white/10"
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        )}

        {selectedTool === "text" && (
          <div className="space-y-3">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your story text..."
              className="w-full rounded-xl bg-white/10 p-3 outline-none"
            />

            <button
              onClick={addText}
              className="w-full rounded-xl bg-pink-600 p-3"
            >
              Add Text
            </button>

            <div className="flex flex-wrap gap-2">
              {textColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedTextColor(color)}
                  className="h-8 w-8 rounded-full border-2 border-white"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {textLayers.map((item) => (
                <button
                  key={item.id}
                  onClick={() => deleteText(item.id)}
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs"
                >
                  Delete: {item.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTool === "stickers" && (
          <div className="grid grid-cols-6 gap-2">
            {stickerOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="rounded-lg bg-white/10 p-2 text-2xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {selectedTool === "draw" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["normal", "neon", "eraser"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBrushMode(mode)}
                  className={`rounded-lg px-4 py-2 ${
                    brushMode === mode ? "bg-pink-600" : "bg-white/10"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={undoDrawing} className="flex-1 rounded-lg bg-white/10 p-3">
                Undo
              </button>
              <button onClick={redoDrawing} className="flex-1 rounded-lg bg-white/10 p-3">
                Redo
              </button>
              <button onClick={clearDrawing} className="flex-1 rounded-lg bg-white/10 p-3">
                Clear
              </button>
            </div>
          </div>
        )}

        {selectedTool === "crop" && (
          <div className="space-y-3">
            <label className="block text-sm">Zoom: {zoom.toFixed(1)}x</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />

            <div className="flex gap-2">
              <button onClick={rotateLeft} className="flex-1 rounded-lg bg-white/10 p-3">
                ↶ Rotate
              </button>
              <button onClick={rotateRight} className="flex-1 rounded-lg bg-white/10 p-3">
                ↷ Rotate
              </button>
              <button onClick={toggleFlip} className="flex-1 rounded-lg bg-white/10 p-3">
                Flip
              </button>
            </div>
          </div>
        )}

        {selectedTool === "background" && (
          <div className="grid grid-cols-4 gap-2">
            {backgroundColors.map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className="h-12 rounded-xl border border-white/30"
                style={{ background: color }}
              />
            ))}
          </div>
        )}

        {selectedTool === "music" && (
          <div className="space-y-3">
            <p className="text-sm text-white/70">
              Select an audio file from your device.
            </p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleMusicSelect}
              className="w-full text-sm"
            />
            {musicFile && (
              <audio
                src={musicPreview}
                controls
                className="w-full"
              />
            )}
          </div>
        )}

        {selectedTool === "collage" && (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCollageSelect}
              className="w-full text-sm"
            />
            <button
              onClick={createAdvancedCollage}
              className="w-full rounded-xl bg-pink-600 p-3"
            >
              Create Collage
            </button>
          </div>
        )}

        {selectedTool === "privacy" && (
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl bg-white/10 p-3">
              Hide from selected users
              <input
                type="checkbox"
                checked={hideFromUsers}
                onChange={(e) => setHideFromUsers(e.target.checked)}
              />
            </label>

            <input
              value={hiddenUserInput}
              onChange={(e) => setHiddenUserInput(e.target.value)}
              placeholder="User name"
              className="w-full rounded-xl bg-white/10 p-3"
            />
          </div>
        )}

        {/* DRAFTS */}
        <button
          onClick={loadDraftList}
          className="mt-4 w-full rounded-xl bg-white/10 p-3"
        >
          My Saved Drafts
        </button>

        {showDrafts && (
          <div className="mt-3 space-y-2">
            {savedDrafts.length === 0 && (
              <p className="text-sm text-white/60">No saved drafts.</p>
            )}

            {savedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between rounded-xl bg-white/10 p-3"
              >
                <button onClick={() => openSavedDraft(draft.id)}>
                  Open Draft
                </button>
                <button
                  onClick={() => removeDraftFromList(draft.id)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PUBLISH */}
        <button
          onClick={publishStudioStory}
          disabled={!file || isPublishing}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-pink-600 to-purple-600 p-4 font-bold disabled:opacity-40"
        >
          {isPublishing ? "Publishing..." : "Next → Publish Story"}
        </button>
      </div>
    </div>
  )
              }
