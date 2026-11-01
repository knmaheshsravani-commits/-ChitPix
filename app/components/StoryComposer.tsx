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
} from "lucide-react"

type Props = {
  onClose: () => void
  onPublish: (file: File) => void
}

export default function StoryComposer({ onClose, onPublish }: Props) {
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

  const templates = [
    { id: "none", name: "Original", style: "bg-zinc-800" },
    { id: "love", name: "Love", style: "bg-gradient-to-br from-pink-500 to-red-500" },
    { id: "gold", name: "Golden", style: "bg-gradient-to-br from-yellow-500 to-amber-800" },
    { id: "night", name: "Night", style: "bg-gradient-to-br from-indigo-700 to-black" },
    { id: "nature", name: "Nature", style: "bg-gradient-to-br from-green-500 to-emerald-900" },
  ]

  const effects = [
    { id: "normal", name: "Normal", filter: "none" },
    { id: "bright", name: "Bright", filter: "brightness(1.2) saturate(1.15)" },
    { id: "warm", name: "Warm", filter: "sepia(0.25) saturate(1.3)" },
    { id: "bw", name: "B&W", filter: "grayscale(1)" },
    { id: "vintage", name: "Vintage", filter: "sepia(0.45) contrast(0.9)" },
    { id: "cool", name: "Cool", filter: "hue-rotate(20deg) saturate(1.15)" },
  ]

  const tools = [
    { name: "Templates", icon: LayoutGrid },
    { name: "Effects", icon: Sparkles },
    { name: "Music", icon: Music2 },
    { name: "Collage", icon: ImagePlus },
  ]

  useEffect(() => {
    if (!file) {
      setPreview("")
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!musicFile) {
      setMusicPreview("")
      return
    }

    const url = URL.createObjectURL(musicFile)
    setMusicPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [musicFile])

  useEffect(() => {
    const urls = collageFiles.map((photo) => URL.createObjectURL(photo))
    setCollagePreviews(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [collageFiles])

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
    setSelectedTool("")
  }

  const handleMusicSelect = (selected?: File) => {
    if (!selected) return

    if (!selected.type.startsWith("audio/")) {
      alert("Audio file select cheyyi")
      return
    }

    setMusicFile(selected)
    setSelectedTool("Music")
  }

  const handleCollageSelect = (files?: FileList | null) => {
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

  const createCollage = async () => {
    if (collageFiles.length < 2) {
      alert("First 2 or more photos select cheyyi")
      return
    }

    setCreatingCollage(true)

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) throw new Error("Canvas not supported")

      canvas.width = 1080
      canvas.height = 1920

      ctx.fillStyle = "#111111"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const columns = collageFiles.length === 2 ? 1 : 2
      const rows = Math.ceil(collageFiles.length / columns)
      const gap = 12
      const cellWidth = (canvas.width - gap * (columns + 1)) / columns
      const cellHeight = (canvas.height - gap * (rows + 1)) / rows

      for (let index = 0; index < collageFiles.length; index++) {
        const photo = collageFiles[index]
        const imageUrl = URL.createObjectURL(photo)

        try {
          const image = new Image()

          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve()
            image.onerror = () => reject(new Error("Photo load failed"))
            image.src = imageUrl
          })

          const column = index % columns
          const row = Math.floor(index / columns)

          const x = gap + column * (cellWidth + gap)
          const y = gap + row * (cellHeight + gap)

          const scale = Math.max(
            cellWidth / image.width,
            cellHeight / image.height
          )

          const width = image.width * scale
          const height = image.height * scale

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
        }, "image/jpeg", 0.92)
      })

      const collageFile = new File(
        [blob],
        `chitpix-collage-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      )

      setFile(collageFile)
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
              
  return (
    <div className="fixed inset-0 z-[2147483647] flex flex-col overflow-hidden bg-black text-white">

      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between px-5 py-5">
        <button onClick={onClose} className="p-1">
          <X size={30} />
        </button>

        <h2 className="text-xl font-semibold">Add to story</h2>

        <button
          onClick={() => setShowSettings((value) => !value)}
          className="rounded-full p-2"
        >
          <Settings2 size={27} />
        </button>
      </div>

      {/* FOUR WORKING OPTIONS */}
      <div className="flex shrink-0 gap-3 overflow-x-auto px-3 py-3">
        {tools.map((tool) => {
          const Icon = tool.icon

          return (
            <button
              key={tool.name}
              onClick={() => {
                setSelectedTool(tool.name)
                setShowTemplates(tool.name === "Templates")
                setShowEffects(tool.name === "Effects")

                if (tool.name === "Music") {
                  musicRef.current?.click()
                }

                if (tool.name === "Collage") {
                  collageRef.current?.click()
                }
              }}
              className={`flex min-w-[125px] flex-col items-center justify-center gap-3 rounded-2xl border py-5 ${
                selectedTool === tool.name
                  ? "border-white bg-zinc-800"
                  : "border-zinc-800 bg-[#171717]"
              }`}
            >
              <Icon size={32} strokeWidth={1.6} />
              <span className="text-base">{tool.name}</span>
            </button>
          )
        })}
      </div>

      {/* TEMPLATES PANEL */}
      {showTemplates && (
        <div className="flex shrink-0 gap-3 overflow-x-auto border-b border-zinc-800 px-4 py-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`min-w-[90px] rounded-xl border-2 p-3 ${
                selectedTemplate === template.id
                  ? "border-white"
                  : "border-zinc-700"
              }`}
            >
              <div className={`h-16 w-full rounded-lg ${template.style}`} />
              <span className="mt-2 block text-sm">{template.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* EFFECTS PANEL */}
      {showEffects && (
        <div className="flex shrink-0 gap-3 overflow-x-auto border-b border-zinc-800 px-4 py-4">
          {effects.map((effect) => (
            <button
              key={effect.id}
              onClick={() => setSelectedEffect(effect.id)}
              className={`min-w-[90px] rounded-xl border-2 p-3 ${
                selectedEffect === effect.id
                  ? "border-white bg-zinc-800"
                  : "border-zinc-700 bg-zinc-900"
              }`}
            >
              <div className="flex h-14 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <WandSparkles size={25} />
              </div>
              <span className="mt-2 block text-sm">{effect.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div className="mx-4 mb-2 shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold">Story settings</span>
            <button onClick={() => setShowSettings(false)}>
              <X size={20} />
            </button>
          </div>

          <p className="mb-2 text-sm text-zinc-300">Photo display</p>

          <div className="flex gap-2">
            <button
              onClick={() => setFitMode("contain")}
              className={`rounded-full px-4 py-2 text-sm ${
                fitMode === "contain" ? "bg-indigo-600" : "bg-zinc-700"
              }`}
            >
              Fit
            </button>

            <button
              onClick={() => setFitMode("cover")}
              className={`rounded-full px-4 py-2 text-sm ${
                fitMode === "cover" ? "bg-indigo-600" : "bg-zinc-700"
              }`}
            >
              Fill
            </button>
          </div>
        </div>
      )}

      {/* GALLERY TITLE */}
      <div className="flex shrink-0 items-center justify-between px-5 py-5">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          {activeTab}
          <ChevronDown size={22} />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-full bg-zinc-800 px-5 py-3"
        >
          <Check size={20} />
          Select
        </button>
      </div>

      {/* HIDDEN FILE INPUTS */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={(e) => selectFile(e.target.files?.[0])}
      />

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => selectFile(e.target.files?.[0])}
      />

      <input
        ref={musicRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => handleMusicSelect(e.target.files?.[0])}
      />

      <input
        ref={collageRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleCollageSelect(e.target.files)}
      />

      {/* MUSIC PREVIEW */}
      {musicFile && (
        <div className="mx-4 mb-2 shrink-0 rounded-xl bg-zinc-900 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-semibold">
              🎵 {musicFile.name}
            </span>

            <button
              onClick={() => {
                setMusicFile(null)
                setSelectedTool("")
              }}
              className="rounded-full bg-zinc-700 px-3 py-1 text-xs"
            >
              Remove
            </button>
          </div>

          {musicPreview && (
            <audio src={musicPreview} controls className="w-full" />
          )}
        </div>
      )}

      {/* COLLAGE PREVIEW */}
      {collagePreviews.length > 0 && (
        <div className="mx-4 mb-2 shrink-0 rounded-xl bg-zinc-900 p-3">
          <h3 className="mb-3 font-semibold">
            Collage Preview ({collagePreviews.length} photos)
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {collagePreviews.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Collage photo ${index + 1}`}
                className="h-24 w-full rounded-lg object-cover"
              />
            ))}
          </div>

          <button
            onClick={createCollage}
            disabled={creatingCollage}
            className="mt-3 w-full rounded-full bg-indigo-600 px-4 py-3 font-semibold disabled:opacity-50"
          >
            {creatingCollage ? "Creating..." : "Create Collage"}
          </button>

          <button
            onClick={() => {
              setCollageFiles([])
              setSelectedTool("")
            }}
            className="mt-2 w-full rounded-full bg-zinc-700 px-4 py-2"
          >
            Clear Collage
          </button>
        </div>
      )}

      {/* MAIN SCROLL AREA */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">

        {/* EMPTY GALLERY */}
        {!file && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 rounded-2xl bg-[#171717] py-9"
            >
              <ImagePlus size={42} strokeWidth={1.5} />
              <span className="font-medium">Gallery</span>
            </button>

            <button
              onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center gap-3 rounded-2xl bg-[#171717] py-9"
            >
              <Camera size={42} strokeWidth={1.5} />
              <span className="font-medium">Camera</span>
            </button>
          </div>
        )}

        {/* MEDIA PREVIEW */}
        {file && preview && (
          <div
            className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl px-3 py-4 ${
              templates.find((t) => t.id === selectedTemplate)?.style === "none"
                ? "bg-black"
                : templates.find((t) => t.id === selectedTemplate)?.style
            }`}
          >
            {file.type.startsWith("video/") ? (
              <video
                src={preview}
                controls
                playsInline
                className="max-h-[55vh] max-w-full rounded-xl"
              />
            ) : (
              <img
                src={preview}
                alt="Story preview"
                style={{
                  filter:
                    effects.find((effect) => effect.id === selectedEffect)
                      ?.filter || "none",
                  objectFit: fitMode,
                }}
                className="max-h-[55vh] max-w-full rounded-xl"
              />
            )}

            <button
              onClick={() => {
                setFile(null)
                setSelectedEffect("normal")
                setSelectedTemplate("none")
              }}
              className="mt-4 rounded-full bg-zinc-800 px-5 py-3"
            >
              Change media
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="relative z-20 flex shrink-0 w-full items-center justify-between gap-3 border-t border-zinc-800 bg-black px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          onClick={onClose}
          className="rounded-full bg-zinc-800 px-7 py-4 text-base"
        >
          Cancel
        </button>

        <button
          disabled={!file}
          onClick={() => file && onPublish(file)}
          className="flex items-center gap-3 rounded-full bg-indigo-600 px-9 py-4 font-semibold disabled:opacity-40"
        >
          Next
          <ArrowRight size={21} />
        </button>
      </div>
    </div>
  )
      }
            
