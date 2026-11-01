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
} from "lucide-react"

type Props = {
  onClose: () => void
  onPublish: (file: File) => void
}

export default function StoryComposer({ onClose, onPublish }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [activeTab, setActiveTab] = useState("Recents")
  const [selectedTool, setSelectedTool] = useState("")

  useEffect(() => {
    if (!file) {
      setPreview("")
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

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
  }

  const tools = [
    { name: "Templates", icon: LayoutGrid },
    { name: "Effects", icon: Sparkles },
    { name: "Music", icon: Music2 },
    { name: "Collage", icon: ImagePlus },
  ]

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-5">
        <button onClick={onClose}>
          <X size={30} strokeWidth={1.8} />
        </button>

        <h2 className="text-xl font-semibold">
          Add to story
        </h2>

        <button>
          <Settings2 size={27} strokeWidth={1.8} />
        </button>
      </div>

      {/* TOOL CARDS */}
      <div className="flex gap-3 overflow-x-auto px-3 py-3 scrollbar-hide">
        {tools.map((tool) => {
          const Icon = tool.icon

          return (
            <button
              key={tool.name}
              onClick={() => setSelectedTool(tool.name)}
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

      {/* GALLERY TITLE */}
      <div className="flex items-center justify-between px-5 py-6">
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

      {/* INPUTS */}
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

      {/* EMPTY GALLERY */}
      {!file && (
        <div className="grid grid-cols-2 gap-3 px-4">
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

      {/* PREVIEW */}
      {file && preview && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
          {file.type.startsWith("video/") ? (
            <video
              src={preview}
              controls
              className="max-h-full max-w-full rounded-xl"
            />
          ) : (
            <img
              src={preview}
              alt="Story preview"
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          )}

          <button
            onClick={() => setFile(null)}
            className="mt-4 rounded-full bg-zinc-800 px-5 py-3"
          >
            Change media
          </button>
        </div>
      )}

      {/* BOTTOM ACTIONS */}
      <div className="mt-auto flex items-center justify-between gap-3 px-4 pb-7 pt-5">

        <button
          onClick={onClose}
          className="rounded-full bg-zinc-800 px-6 py-4"
        >
          Cancel
        </button>

        <button
          disabled={!file}
          onClick={() => file && onPublish(file)}
          className="flex items-center gap-3 rounded-full bg-indigo-600 px-8 py-4 font-semibold disabled:opacity-40"
        >
          Next
          <ArrowRight size={21} />
        </button>

      </div>
    </div>
  )
}
