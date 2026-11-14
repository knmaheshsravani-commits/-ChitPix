"use client";

import React, { useEffect, useRef, useState } from "react";

type FilterItem = {
  name: string;
  icon: string;
  css: string;
  category: string;
};

const PHOTO_FILTERS: FilterItem[] = [
  { name: "Normal", icon: "✨", css: "none", category: "Basic" },
  { name: "Beauty", icon: "💖", css: "brightness(1.08) contrast(1.04) saturate(1.15)", category: "Beauty" },
  { name: "Portrait", icon: "👤", css: "brightness(1.08) saturate(1.12) contrast(1.08)", category: "Beauty" },
  { name: "Vintage", icon: "📷", css: "sepia(.4) contrast(.95) saturate(.8)", category: "Retro" },
  { name: "Cinematic", icon: "🎬", css: "contrast(1.25) saturate(.85) brightness(.95)", category: "Art" },
  { name: "Warm", icon: "🌅", css: "sepia(.18) saturate(1.3)", category: "Basic" },
  { name: "Cool", icon: "❄️", css: "saturate(.9) hue-rotate(12deg)", category: "Basic" },
  { name: "B&W", icon: "⚫", css: "grayscale(1)", category: "Art" },
  { name: "Dream", icon: "🌸", css: "brightness(1.12) saturate(1.2) contrast(.92)", category: "Beauty" },
  { name: "Drama", icon: "🔥", css: "contrast(1.4) saturate(1.15)", category: "Art" },
  { name: "Soft", icon: "☁️", css: "brightness(1.08) contrast(.88) saturate(.9)", category: "Beauty" },
  { name: "Glow", icon: "✨", css: "brightness(1.2) contrast(1.05) saturate(1.2)", category: "Beauty" },
  { name: "Golden", icon: "🌞", css: "sepia(.25) saturate(1.5) brightness(1.05)", category: "Retro" },
  { name: "Rose", icon: "🌹", css: "sepia(.12) hue-rotate(325deg) saturate(1.3)", category: "Beauty" },
  { name: "Ocean", icon: "🌊", css: "hue-rotate(15deg) saturate(1.25) contrast(1.05)", category: "Art" },
  { name: "Forest", icon: "🌿", css: "hue-rotate(25deg) saturate(1.3)", category: "Art" },
  { name: "Noir", icon: "🎞️", css: "grayscale(1) contrast(1.5)", category: "Retro" },
  { name: "Pop", icon: "🎨", css: "saturate(1.7) contrast(1.12)", category: "Art" },
  { name: "Retro", icon: "📼", css: "sepia(.3) contrast(1.15) saturate(.9)", category: "Retro" },
  { name: "Fade", icon: "🌫️", css: "contrast(.85) brightness(1.08) saturate(.75)", category: "Retro" },
];

const FILTER_CATEGORIES = [
  "All",
  "Basic",
  "Beauty",
  "Retro",
  "Art",
];

const DEFAULT_EDIT = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  vignette: 0,
  zoom: 100,
  rotation: 0,
  flipH: false,
  flipV: false,
};

type EditSettings = typeof DEFAULT_EDIT;

type EditorSnapshot = {
  edit: EditSettings;
  activeFilter: string;
  overlayText: string;
  textColor: string;
  textSize: number;
  textBold: boolean;
  sticker: string;
};

export default function AIStudioPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef("");

  // PHOTO STATES

  const [image, setImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  // FILTER STATES

  const [activeFilter, setActiveFilter] = useState("Normal");
  const [category, setCategory] = useState("All");

  // PHOTO ADJUSTMENT STATES

  const [edit, setEdit] = useState<EditSettings>({
    ...DEFAULT_EDIT,
  });

  // TEXT AND STICKER STATES

  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(28);
  const [textBold, setTextBold] = useState(true);
  const [sticker, setSticker] = useState("");

  // HISTORY STATES

  const historyRef = useRef<EditorSnapshot[]>([]);
  const futureRef = useRef<EditorSnapshot[]>([]);
  const currentSnapshotRef = useRef<EditorSnapshot | null>(null);

  const [historyCount, setHistoryCount] = useState(0);
  const [futureCount, setFutureCount] = useState(0);

  // EXPORT STATES

  const [exportMessage, setExportMessage] = useState("");
  const [exporting, setExporting] = useState(false);

  // SELECTED FILTER

  const selectedFilter =
    PHOTO_FILTERS.find((f) => f.name === activeFilter)?.css || "none";

  // LIVE PHOTO PREVIEW STYLE

  const imageStyle: React.CSSProperties = {
    filter: `${selectedFilter} brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) sepia(${edit.warmth}%) blur(${edit.blur}px)`,
    transform: `rotate(${edit.rotation}deg) scale(${edit.zoom / 100}) scaleX(${edit.flipH ? -1 : 1}) scaleY(${edit.flipV ? -1 : 1})`,
    transition: "all .2s ease",
  };

  // PART 2 CONTINUES BELOW
  // =========================
  // PART 2: EDITOR FUNCTIONS
  // =========================

  const createSnapshot = (): EditorSnapshot => ({
    edit: { ...edit },
    activeFilter,
    textOverlay,
    stickers: [...stickers],
  });

  const applySnapshot = (snapshot: EditorSnapshot) => {
    setEdit({ ...snapshot.edit });
    setActiveFilter(snapshot.activeFilter);
    setTextOverlay(snapshot.textOverlay);
    setStickers([...snapshot.stickers]);
  };

  const saveHistory = () => {
    const snapshot = createSnapshot();

    historyRef.current = [
      ...historyRef.current.slice(0, historyIndexRef.current + 1),
      snapshot,
    ];

    if (historyRef.current.length > 30) {
      historyRef.current.shift();
    }

    historyIndexRef.current = historyRef.current.length - 1;
    setHistoryCount(historyRef.current.length);
    setHistoryIndex(historyIndexRef.current);
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;

    historyIndexRef.current -= 1;

    const snapshot = historyRef.current[historyIndexRef.current];

    if (snapshot) {
      applySnapshot(snapshot);
      setHistoryIndex(historyIndexRef.current);
    }
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;

    historyIndexRef.current += 1;

    const snapshot = historyRef.current[historyIndexRef.current];

    if (snapshot) {
      applySnapshot(snapshot);
      setHistoryIndex(historyIndexRef.current);
    }
  };

  const uploadPhoto = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Image size must be less than 20MB.");
      return;
    }

    if (image) {
      URL.revokeObjectURL(image);
    }

    const newUrl = URL.createObjectURL(file);

    setImage(newUrl);
    setFileName(file.name);
    setError("");
    setExportMessage("");
    setActiveFilter("none");
    setActiveCategory("All");
    setEdit({ ...DEFAULT_EDIT });
    setTextOverlay("");
    setStickers([]);

    const initialSnapshot: EditorSnapshot = {
      edit: { ...DEFAULT_EDIT },
      activeFilter: "none",
      textOverlay: "",
      stickers: [],
    };

    historyRef.current = [initialSnapshot];
    historyIndexRef.current = 0;
    setHistoryCount(1);
    setHistoryIndex(0);
  };

  const removePhoto = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);
    setFileName("");
    setError("");
    setExportMessage("");
    setActiveFilter("none");
    setActiveCategory("All");
    setEdit({ ...DEFAULT_EDIT });
    setTextOverlay("");
    setStickers([]);

    historyRef.current = [];
    historyIndexRef.current = -1;
    setHistoryCount(0);
    setHistoryIndex(-1);
  };

  const resetAllEdits = () => {
    setActiveFilter("none");
    setEdit({ ...DEFAULT_EDIT });
    setTextOverlay("");
    setStickers([]);
    setExportMessage("");
    saveHistory();
  };

  const updateEdit = <K extends keyof EditSettings>(
    key: K,
    value: EditSettings[K]
  ) => {
    setEdit((previous) => ({
      ...previous,
      [key]: value,
    }));
    setExportMessage("");
  };

  const selectFilter = (filterId: string) => {
    setActiveFilter(filterId);
    setExportMessage("");
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      uploadPhoto(file);
    }

    event.target.value = "";
  };

  const addSticker = (sticker: string) => {
    setStickers((previous) => [...previous, sticker]);
    setExportMessage("");
  };

  const removeSticker = (index: number) => {
    setStickers((previous) =>
      previous.filter((_, stickerIndex) => stickerIndex !== index)
    );
  };

  const clearTextOverlay = () => {
    setTextOverlay("");
    setExportMessage("");
  };

  // Clean up the temporary image URL when the page is removed.
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  // =========================
  // PART 3 CONTINUES BELOW
  // =========================
        return (
    <main className="min-h-screen bg-[#f7f5fc] pb-10 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-fuchsia-600">
              ChitPix
            </h1>
            <p className="text-xs font-semibold tracking-widest text-slate-500">
              AI PHOTO STUDIO
            </p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 py-2 text-sm font-bold text-white">
            ✨ AI Studio
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-5 p-4">
        {/* WELCOME */}
        <section className="rounded-3xl bg-gradient-to-r from-fuchsia-600 to-pink-500 p-6 text-white shadow-lg">
          <p className="text-sm font-semibold text-white/80">WELCOME TO</p>
          <h2 className="mt-2 text-2xl font-black">
            AI Photo Studio ✨
          </h2>
          <p className="mt-2 text-sm text-white/90">
            Create beautiful photos with ChitPix editing tools.
          </p>
        </section>

        {/* PHOTO UPLOAD */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">📸 Your Photo</h2>

            {image && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-sm font-bold text-red-500"
              >
                Remove
              </button>
            )}
          </div>

          {image ? (
            <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img
                src={image}
                alt="Photo preview"
                className="max-h-[500px] w-full object-contain"
                style={imageStyle}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 p-6 text-center"
            >
              <span className="text-6xl">🖼️</span>
              <span className="mt-4 text-lg font-bold">
                Upload Your Photo
              </span>
              <span className="mt-2 text-sm text-slate-500">
                Select a photo from your phone
              </span>
              <span className="mt-5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-7 py-3 font-bold text-white">
                + Select Photo
              </span>
              <span className="mt-3 text-xs text-slate-400">
                JPG · PNG · WEBP · Maximum 20MB
              </span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />

          {image && (
            <div className="mt-3">
              <p className="truncate text-xs text-slate-500">
                Selected: {fileName}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 w-full rounded-xl border border-fuchsia-200 bg-fuchsia-50 py-3 font-bold text-fuchsia-700"
              >
                Change Photo
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
        </section>

        {/* FILTER CATEGORIES AND FILTERS */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold">
              ✨ ChitPix Photo Filters
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Choose your favourite photo style.
            </p>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {["All", ...Array.from(
                new Set(PHOTO_FILTERS.map((filter) => filter.category))
              )].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                    activeCategory === category
                      ? "bg-fuchsia-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PHOTO_FILTERS
                .filter(
                  (filter) =>
                    activeCategory === "All" ||
                    filter.category === activeCategory
                )
                .map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => selectFilter(filter.id)}
                    className={`flex min-h-[75px] flex-col items-center justify-center gap-1 rounded-2xl border p-2 ${
                      activeFilter === filter.id
                        ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 ring-2 ring-fuchsia-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <span className="text-xl">{filter.icon}</span>
                    <span className="text-xs font-bold">
                      {filter.name}
                    </span>
                  </button>
                ))}
            </div>

            <button
              type="button"
              onClick={() => selectFilter("none")}
              className="mt-5 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700"
            >
              Reset Filter
            </button>
          </section>
        )}

        {/* BASIC ADJUSTMENTS */}
        {image && (
          <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold">🎚️ Photo Adjustments</h2>
              <p className="mt-1 text-sm text-slate-500">
                Adjust your photo brightness, colour and clarity.
              </p>
            </div>

            {([
              {
                key: "brightness",
                label: "☀️ Brightness",
                min: 0,
                max: 200,
                value: edit.brightness,
              },
              {
                key: "contrast",
                label: "◐ Contrast",
                min: 0,
                max: 200,
                value: edit.contrast,
              },
              {
                key: "saturation",
                label: "🌈 Saturation",
                min: 0,
                max: 200,
                value: edit.saturation,
              },
              {
                key: "warmth",
                label: "🌅 Warmth",
                min: -100,
                max: 100,
                value: edit.warmth,
              },
              {
                key: "blur",
                label: "💧 Blur",
                min: 0,
                max: 10,
                value: edit.blur,
              },
            ] as const).map((control) => (
              <div key={control.key}>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    {control.label}
                  </label>
                  <span className="text-sm font-bold text-fuchsia-600">
                    {control.value}
                  </span>
                </div>

                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  value={control.value}
                  onChange={(event) =>
                    updateEdit(
                      control.key,
                      Number(event.target.value)
                    )
                  }
                  className="w-full accent-fuchsia-600"
                />
              </div>
            ))}
          </section>
        )}

        {/* ROTATE, FLIP AND ZOOM */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">
              🔄 Transform Photo
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  updateEdit("rotation", (edit.rotation + 90) % 360)
                }
                className="rounded-xl bg-fuchsia-50 p-3 font-bold text-fuchsia-700"
              >
                ↻ Rotate Right
              </button>

              <button
                type="button"
                onClick={() =>
                  updateEdit("rotation", (edit.rotation + 270) % 360)
                }
                className="rounded-xl bg-fuchsia-50 p-3 font-bold text-fuchsia-700"
              >
                ↺ Rotate Left
              </button>

              <button
                type="button"
                onClick={() => updateEdit("flipH", !edit.flipH)}
                className={`rounded-xl p-3 font-bold ${
                  edit.flipH
                    ? "bg-fuchsia-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                ↔ Flip Horizontal
              </button>

              <button
                type="button"
                onClick={() => updateEdit("flipV", !edit.flipV)}
                className={`rounded-xl p-3 font-bold ${
                  edit.flipV
                    ? "bg-fuchsia-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                ↕ Flip Vertical
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-semibold">🔍 Zoom</label>
                <span className="text-sm font-bold text-fuchsia-600">
                  {edit.zoom}%
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="200"
                value={edit.zoom}
                onChange={(event) =>
                  updateEdit("zoom", Number(event.target.value))
                }
                className="w-full accent-fuchsia-600"
              />
            </div>
          </section>
        )}

        {/* PART 4 CONTINUES BELOW */}
                {/* VIGNETTE EFFECT */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold">
              🌑 Vignette Effect
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Add a soft dark border around your photo.
            </p>

            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Vignette Strength
              </label>
              <span className="font-bold text-fuchsia-600">
                {edit.vignette}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={edit.vignette}
              onChange={(event) =>
                updateEdit("vignette", Number(event.target.value))
              }
              className="w-full accent-fuchsia-600"
            />

            <button
              type="button"
              onClick={() => updateEdit("vignette", 0)}
              className="mt-3 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700"
            >
              Reset Vignette
            </button>
          </section>
        )}

        {/* TEXT EDITOR */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold">
              📝 Add Text to Photo
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Write a caption or your favourite quote.
            </p>

            <textarea
              value={textOverlay}
              onChange={(event) => {
                setTextOverlay(event.target.value);
                setExportMessage("");
              }}
              placeholder="Type your photo text here..."
              rows={3}
              maxLength={120}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-fuchsia-500"
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Maximum 120 characters
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {textOverlay.length}/120
              </span>
            </div>

            <button
              type="button"
              onClick={clearTextOverlay}
              disabled={!textOverlay}
              className="mt-3 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700 disabled:opacity-40"
            >
              Clear Text
            </button>

            {textOverlay && (
              <div className="mt-4 rounded-xl bg-slate-900 p-4 text-center">
                <p className="break-words text-lg font-black text-white">
                  {textOverlay}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Text preview
                </p>
              </div>
            )}
          </section>
        )}

        {/* STICKER COLLECTION */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold">
              🎨 Photo Stickers
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Select stickers to add to your photo.
            </p>

            <div className="grid grid-cols-5 gap-3">
              {[
                "❤️",
                "😍",
                "🔥",
                "✨",
                "🌸",
                "🌈",
                "⭐",
                "🎉",
                "🥰",
                "🦋",
                "🌹",
                "💖",
                "☀️",
                "🌙",
                "🎀",
              ].map((sticker, index) => (
                <button
                  key={`${sticker}-${index}`}
                  type="button"
                  onClick={() => addSticker(sticker)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-2xl transition hover:border-fuchsia-400 hover:bg-fuchsia-50"
                >
                  {sticker}
                </button>
              ))}
            </div>

            {stickers.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-3 text-sm font-bold">
                  Selected Stickers
                </h3>

                <div className="flex flex-wrap gap-2">
                  {stickers.map((sticker, index) => (
                    <button
                      key={`${sticker}-${index}`}
                      type="button"
                      onClick={() => removeSticker(index)}
                      className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-2 text-xl"
                      title="Remove sticker"
                    >
                      {sticker} <span className="text-xs">✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* UNDO AND REDO */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold">
              ↩️ Editing History
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Undo or redo your recent editing changes.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="rounded-xl bg-fuchsia-50 py-3 font-bold text-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↶ Undo
              </button>

              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= historyCount - 1}
                className="rounded-xl bg-fuchsia-50 py-3 font-bold text-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↷ Redo
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              History: {Math.max(0, historyIndex + 1)} / {historyCount}
            </p>
          </section>
        )}

        {/* RESET ALL EDITS */}
        {image && (
          <button
            type="button"
            onClick={resetAllEdits}
            className="w-full rounded-2xl border border-red-200 bg-red-50 py-4 font-bold text-red-600"
          >
            ↻ Reset All Editing
          </button>
        )}

        {/* PART 5 CONTINUES BELOW */}
                {/* EXPORT PHOTO */}
        {image && (
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-bold">
              📥 Save Your Edited Photo
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Export your edited photo and save it to your phone.
            </p>

            <button
              type="button"
              disabled={exporting}
              onClick={async () => {
                if (!image) return;

                try {
                  setExporting(true);
                  setExportMessage("");
                  setError("");

                  const sourceImage = new Image();

                  sourceImage.src = image;

                  await new Promise<void>((resolve, reject) => {
                    sourceImage.onload = () => resolve();
                    sourceImage.onerror = () =>
                      reject(new Error("Could not load your photo."));
                  });

                  const canvas = document.createElement("canvas");
                  const context = canvas.getContext("2d");

                  if (!context) {
                    throw new Error("Photo export is not supported.");
                  }

                  const rotation =
                    ((edit.rotation % 360) + 360) % 360;

                  const sideways = rotation === 90 || rotation === 270;

                  canvas.width = sideways
                    ? sourceImage.naturalHeight
                    : sourceImage.naturalWidth;

                  canvas.height = sideways
                    ? sourceImage.naturalWidth
                    : sourceImage.naturalHeight;

                  context.save();

                  context.translate(
                    canvas.width / 2,
                    canvas.height / 2
                  );

                  context.rotate((rotation * Math.PI) / 180);

                  context.scale(
                    (edit.flipH ? -1 : 1) * (edit.zoom / 100),
                    (edit.flipV ? -1 : 1) * (edit.zoom / 100)
                  );

                  context.filter = [
                    selectedFilter,
                    `brightness(${edit.brightness}%)`,
                    `contrast(${edit.contrast}%)`,
                    `saturate(${edit.saturation}%)`,
                    `blur(${edit.blur}px)`,
                  ]
                    .filter((value) => value && value !== "none")
                    .join(" ");

                  context.drawImage(
                    sourceImage,
                    -sourceImage.naturalWidth / 2,
                    -sourceImage.naturalHeight / 2,
                    sourceImage.naturalWidth,
                    sourceImage.naturalHeight
                  );

                  context.restore();

                  // Warmth overlay
                  if (edit.warmth !== 0) {
                    context.save();

                    context.globalAlpha =
                      Math.abs(edit.warmth) / 500;

                    context.fillStyle =
                      edit.warmth > 0 ? "#ff9b42" : "#65aaff";

                    context.fillRect(
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );

                    context.restore();
                  }

                  // Vignette effect
                  if (edit.vignette > 0) {
                    context.save();

                    const radius = Math.max(
                      canvas.width,
                      canvas.height
                    );

                    const gradient = context.createRadialGradient(
                      canvas.width / 2,
                      canvas.height / 2,
                      radius * 0.15,
                      canvas.width / 2,
                      canvas.height / 2,
                      radius * 0.7
                    );

                    gradient.addColorStop(0, "rgba(0,0,0,0)");
                    gradient.addColorStop(
                      1,
                      `rgba(0,0,0,${edit.vignette / 100})`
                    );

                    context.fillStyle = gradient;
                    context.fillRect(
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );

                    context.restore();
                  }

                  // Add text overlay
                  if (textOverlay.trim()) {
                    context.save();

                    const fontSize = Math.max(
                      24,
                      Math.round(canvas.width * 0.055)
                    );

                    context.font = `bold ${fontSize}px Arial`;
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillStyle = "#ffffff";
                    context.shadowColor = "rgba(0,0,0,0.8)";
                    context.shadowBlur = 8;

                    const words = textOverlay.split("\n");
                    const lineHeight = fontSize * 1.4;

                    words.forEach((line, index) => {
                      context.fillText(
                        line,
                        canvas.width / 2,
                        canvas.height * 0.85 +
                          (index - (words.length - 1) / 2) *
                            lineHeight,
                        canvas.width * 0.9
                      );
                    });

                    context.restore();
                  }

                  // Add selected stickers
                  if (stickers.length > 0) {
                    context.save();

                    const stickerSize = Math.max(
                      30,
                      Math.round(canvas.width * 0.09)
                    );

                    context.font = `${stickerSize}px Arial`;
                    context.textAlign = "center";
                    context.textBaseline = "middle";

                    stickers.forEach((sticker, index) => {
                      const columns = 5;
                      const column = index % columns;
                      const row = Math.floor(index / columns);

                      context.fillText(
                        sticker,
                        canvas.width * (0.12 + column * 0.17),
                        canvas.height * (0.12 + row * 0.12)
                      );
                    });

                    context.restore();
                  }

                  const blob = await new Promise<Blob>(
                    (resolve, reject) => {
                      canvas.toBlob((result) => {
                        if (result) {
                          resolve(result);
                        } else {
                          reject(
                            new Error("Could not create photo file.")
                          );
                        }
                      }, "image/png");
                    }
                  );

                  const downloadUrl = URL.createObjectURL(blob);
                  const link = document.createElement("a");

                  link.href = downloadUrl;
                  link.download = `chitpix-${Date.now()}.png`;

                  document.body.appendChild(link);
                  link.click();
                  link.remove();

                  URL.revokeObjectURL(downloadUrl);

                  setExportMessage(
                    "Your edited photo is ready! ❤️"
                  );
                } catch (exportError) {
                  console.error("Photo export error:", exportError);

                  setError(
                    exportError instanceof Error
                      ? exportError.message
                      : "Photo export failed. Please try again."
                  );
                } finally {
                  setExporting(false);
                }
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 py-4 text-lg font-black text-white shadow-lg disabled:opacity-50"
            >
              {exporting ? "Preparing Photo..." : "⬇️ Download Photo"}
            </button>

            <button
              type="button"
              disabled={exporting}
              onClick={async () => {
                if (!image) return;

                try {
                  setExporting(true);
                  setExportMessage("");
                  setError("");

                  const sourceImage = new Image();
                  sourceImage.src = image;

                  await new Promise<void>((resolve, reject) => {
                    sourceImage.onload = () => resolve();
                    sourceImage.onerror = () =>
                      reject(new Error("Could not load your photo."));
                  });

                  const canvas = document.createElement("canvas");

                  const sideways =
                    edit.rotation % 180 !== 0;

                  canvas.width = sideways
                    ? sourceImage.naturalHeight
                    : sourceImage.naturalWidth;

                  canvas.height = sideways
                    ? sourceImage.naturalWidth
                    : sourceImage.naturalHeight;

                  const context = canvas.getContext("2d");

                  if (!context) {
                    throw new Error("Photo export is not supported.");
                  }

                  context.translate(
                    canvas.width / 2,
                    canvas.height / 2
                  );

                  context.rotate(
                    (edit.rotation * Math.PI) / 180
                  );

                  context.scale(
                    (edit.flipH ? -1 : 1) * edit.zoom / 100,
                    (edit.flipV ? -1 : 1) * edit.zoom / 100
                  );

                  context.filter = [
                    selectedFilter,
                    `brightness(${edit.brightness}%)`,
                    `contrast(${edit.contrast}%)`,
                    `saturate(${edit.saturation}%)`,
                    `blur(${edit.blur}px)`,
                  ]
                    .filter((value) => value && value !== "none")
                    .join(" ");

                  context.drawImage(
                    sourceImage,
                    -sourceImage.naturalWidth / 2,
                    -sourceImage.naturalHeight / 2
                  );

                  context.restore();

                  const blob = await new Promise<Blob>(
                    (resolve, reject) => {
                      canvas.toBlob((result) => {
                        if (result) resolve(result);
                        else reject(new Error("Could not prepare photo."));
                      }, "image/png");
                    }
                  );

                  const shareFile = new File(
                    [blob],
                    "chitpix-photo.png",
                    { type: "image/png" }
                  );

                  if (
                    navigator.share &&
                    navigator.canShare?.({ files: [shareFile] })
                  ) {
                    await navigator.share({
                      title: "My ChitPix Photo",
                      text: "Edited with ChitPix AI Studio ❤️",
                      files: [shareFile],
                    });

                    setExportMessage("Photo shared successfully!");
                  } else {
                    const shareUrl = URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.href = shareUrl;
                    link.download = "chitpix-photo.png";
                    link.click();

                    URL.revokeObjectURL(shareUrl);

                    setExportMessage(
                      "Sharing is not supported here. Photo downloaded instead."
                    );
                  }
                } catch (shareError) {
                  if (
                    shareError instanceof Error &&
                    shareError.name === "AbortError"
                  ) {
                    setExportMessage("Sharing cancelled.");
                  } else {
                    console.error("Share error:", shareError);
                    setError("Unable to share photo. Please download it.");
                  }
                } finally {
                  setExporting(false);
                }
              }}
              className="mt-3 w-full rounded-2xl border border-fuchsia-200 bg-fuchsia-50 py-4 font-bold text-fuchsia-700 disabled:opacity-50"
            >
              {exporting ? "Preparing..." : "📤 Share Photo"}
            </button>

            {exportMessage && (
              <p className="mt-4 rounded-xl bg-green-50 p-3 text-center text-sm font-semibold text-green-700">
                {exportMessage}
              </p>
            )}
          </section>
        )}

        {/* FOOTER */}
        <p className="py-4 text-center text-xs text-slate-400">
          ChitPix AI Studio · Create Your Own Style ❤️
        </p>
      </div>
    </main>
  );
                        }
