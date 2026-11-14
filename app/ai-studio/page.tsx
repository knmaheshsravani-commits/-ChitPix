"use client";

import React, { useEffect, useRef, useState } from "react";

// =====================================
// CHITPIX PHOTO FILTERS
// =====================================

type FilterItem = {
  id: string;
  name: string;
  icon: string;
  css: string;
  category: string;
};

const PHOTO_FILTERS: FilterItem[] = [
  { id: "none", name: "Normal", icon: "✨", css: "none", category: "Basic" },
  { id: "beauty", name: "Beauty", icon: "💖", css: "brightness(1.08) contrast(1.04) saturate(1.15)", category: "Beauty" },
  { id: "portrait", name: "Portrait", icon: "👤", css: "brightness(1.08) saturate(1.12) contrast(1.08)", category: "Beauty" },
  { id: "vintage", name: "Vintage", icon: "📷", css: "sepia(.4) contrast(.95) saturate(.8)", category: "Retro" },
  { id: "cinematic", name: "Cinematic", icon: "🎬", css: "contrast(1.25) saturate(.85) brightness(.95)", category: "Art" },
  { id: "warm", name: "Warm", icon: "🌅", css: "sepia(.18) saturate(1.3)", category: "Basic" },
  { id: "cool", name: "Cool", icon: "❄️", css: "saturate(.9) hue-rotate(12deg)", category: "Basic" },
  { id: "bw", name: "B&W", icon: "⚫", css: "grayscale(1)", category: "Art" },
  { id: "dream", name: "Dream", icon: "🌸", css: "brightness(1.12) saturate(1.2) contrast(.92)", category: "Beauty" },
  { id: "drama", name: "Drama", icon: "🔥", css: "contrast(1.4) saturate(1.15)", category: "Art" },
  { id: "soft", name: "Soft", icon: "☁️", css: "brightness(1.08) contrast(.88) saturate(.9)", category: "Beauty" },
  { id: "glow", name: "Glow", icon: "✨", css: "brightness(1.2) contrast(1.05) saturate(1.2)", category: "Beauty" },
  { id: "golden", name: "Golden", icon: "🌞", css: "sepia(.25) saturate(1.5) brightness(1.05)", category: "Retro" },
  { id: "rose", name: "Rose", icon: "🌹", css: "sepia(.12) hue-rotate(325deg) saturate(1.3)", category: "Beauty" },
  { id: "ocean", name: "Ocean", icon: "🌊", css: "hue-rotate(15deg) saturate(1.25) contrast(1.05)", category: "Art" },
  { id: "forest", name: "Forest", icon: "🌿", css: "hue-rotate(25deg) saturate(1.3)", category: "Art" },
  { id: "noir", name: "Noir", icon: "🎞️", css: "grayscale(1) contrast(1.5)", category: "Retro" },
  { id: "pop", name: "Pop", icon: "🎨", css: "saturate(1.7) contrast(1.12)", category: "Art" },
  { id: "retro", name: "Retro", icon: "📼", css: "sepia(.3) contrast(1.15) saturate(.9)", category: "Retro" },
  { id: "fade", name: "Fade", icon: "🌫️", css: "contrast(.85) brightness(1.08) saturate(.75)", category: "Retro" },
];

const FILTER_CATEGORIES = [
  "All",
  "Basic",
  "Beauty",
  "Retro",
  "Art",
];

// =====================================
// DEFAULT EDIT SETTINGS
// =====================================

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
  textOverlay: string;
  stickers: string[];
};

// =====================================
// MAIN COMPONENT
// =====================================

export default function AIStudioPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef("");

  // PHOTO STATES

  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  // FILTER STATES

  const [activeFilter, setActiveFilter] = useState("none");
  const [activeCategory, setActiveCategory] = useState("All");

  // EDIT SETTINGS

  const [edit, setEdit] = useState<EditSettings>({
    ...DEFAULT_EDIT,
  });

  // TEXT AND STICKER STATES

  const [textOverlay, setTextOverlay] = useState("");
  const [stickers, setStickers] = useState<string[]>([]);

  // HISTORY STATES

  const historyRef = useRef<EditorSnapshot[]>([]);
  const historyIndexRef = useRef(-1);

  const [historyCount, setHistoryCount] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // EXPORT STATES

  const [exportMessage, setExportMessage] = useState("");
  const [exporting, setExporting] = useState(false);

  // SELECTED FILTER

  const selectedFilter =
    PHOTO_FILTERS.find((filter) => filter.id === activeFilter)?.css || "none";

  // IMAGE PREVIEW STYLE

  const imageStyle: React.CSSProperties = {
    filter: [
      selectedFilter,
      `brightness(${edit.brightness}%)`,
      `contrast(${edit.contrast}%)`,
      `saturate(${edit.saturation}%)`,
      `blur(${edit.blur}px)`,
    ].join(" "),
    transform: `rotate(${edit.rotation}deg) scale(${edit.zoom / 100}) scaleX(${edit.flipH ? -1 : 1}) scaleY(${edit.flipV ? -1 : 1})`,
    transition: "all .2s ease",
  };

  // =====================================
  // HISTORY FUNCTIONS
  // =====================================

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

    const nextHistory = [
      ...historyRef.current.slice(0, historyIndexRef.current + 1),
      snapshot,
    ];

    if (nextHistory.length > 30) {
      nextHistory.shift();
    }

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;

    setHistoryCount(nextHistory.length);
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

  // =====================================
  // PHOTO UPLOAD
  // =====================================

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

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }

    const newUrl = URL.createObjectURL(file);

    imageUrlRef.current = newUrl;

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

  // =====================================
  // REMOVE PHOTO
  // =====================================

  const removePhoto = () => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = "";
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

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    if (cameraRef.current) {
      cameraRef.current.value = "";
    }
  };

  // =====================================
  // UPDATE EDIT SETTINGS
  // =====================================

  const updateEdit = <K extends keyof EditSettings,>(
    key: K,
    value: EditSettings[K]
  ) => {
    saveHistory();

    setEdit((previous) => ({
      ...previous,
      [key]: value,
    }));

    setExportMessage("");
  };

  const selectFilter = (filterId: string) => {
    saveHistory();
    setActiveFilter(filterId);
    setExportMessage("");
  };

  // =====================================
  // IMAGE INPUT HANDLERS
  // =====================================

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      uploadPhoto(file);
    }

    event.target.value = "";
  };

  // =====================================
  // TEXT FUNCTIONS
  // =====================================

  const updateText = (value: string) => {
    saveHistory();
    setTextOverlay(value);
    setExportMessage("");
  };

  const clearTextOverlay = () => {
    saveHistory();
    setTextOverlay("");
    setExportMessage("");
  };

  // =====================================
  // STICKER FUNCTIONS
  // =====================================

  const addSticker = (sticker: string) => {
    saveHistory();
    setStickers((previous) => [...previous, sticker]);
    setExportMessage("");
  };

  const removeSticker = (index: number) => {
    saveHistory();

    setStickers((previous) =>
      previous.filter((_, stickerIndex) => stickerIndex !== index)
    );
  };

  // =====================================
  // RESET ALL EDITS
  // =====================================

  const resetAllEdits = () => {
    saveHistory();

    setActiveFilter("none");
    setEdit({ ...DEFAULT_EDIT });
    setTextOverlay("");
    setStickers([]);
    setExportMessage("");
  };

  // =====================================
  // CLEANUP
  // =====================================

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  // PART 2 CONTINUES BELOW
        // =====================================
  // PART 2: PHOTO STUDIO UI
  // =====================================

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
          <p className="text-sm font-semibold text-white/80">
            WELCOME TO
          </p>

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
            <h2 className="text-lg font-bold">
              📸 Your Photo
            </h2>

            {image && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-sm font-bold text-red-500"
              >
                Remove Photo
              </button>
            )}
          </div>

          {image ? (
            <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-black p-2">
              <img
                src={image}
                alt="ChitPix photo preview"
                className="max-h-[500px] w-full object-contain"
                style={imageStyle}
              />
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 p-6 text-center">

              <span className="text-6xl">
                🖼️
              </span>

              <h3 className="mt-4 text-lg font-bold">
                Upload Your Photo
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Select a photo from your phone gallery.
              </p>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-5 w-full rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-7 py-3 font-bold text-white"
              >
                + Select Photo
              </button>

              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="mt-3 w-full rounded-full border border-fuchsia-300 bg-white px-7 py-3 font-bold text-fuchsia-700"
              >
                📷 Take Photo
              </button>

              <p className="mt-4 text-xs text-slate-400">
                JPG · PNG · WEBP · Maximum 20MB
              </p>
            </div>
          )}

          {/* GALLERY INPUT */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* CAMERA INPUT */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
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

        {/* PHOTO FILTERS */}
        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="mb-2 text-lg font-bold">
              ✨ ChitPix Photo Filters
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Choose your favourite photo style.
            </p>

            {/* FILTER CATEGORIES */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {FILTER_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                    activeCategory === item
                      ? "bg-fuchsia-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* FILTER GRID */}
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
                    className={`flex min-h-[85px] flex-col items-center justify-center gap-2 rounded-2xl border p-2 ${
                      activeFilter === filter.id
                        ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 ring-2 ring-fuchsia-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <span className="text-2xl">
                      {filter.icon}
                    </span>

                    <span className="text-xs font-bold">
                      {filter.name}
                    </span>
                  </button>
                ))}
            </div>

            {/* RESET FILTER */}
            <button
              type="button"
              onClick={() => selectFilter("none")}
              className="mt-5 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700"
            >
              ↻ Reset Filter
            </button>

          </section>
        )}

        {/* PART 3 CONTINUES BELOW */}
                {/* ================================= */}
        {/* PHOTO ADJUSTMENTS */}
        {/* ================================= */}

        {image && (
          <section className="space-y-5 rounded-3xl bg-white p-4 shadow-sm">

            <div>
              <h2 className="text-lg font-bold">
                🎚️ Photo Adjustments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Adjust your photo to create your own style.
              </p>
            </div>

            {/* BRIGHTNESS */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  ☀️ Brightness
                </label>

                <span className="font-bold text-fuchsia-600">
                  {edit.brightness}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={edit.brightness}
                onChange={(event) =>
                  updateEdit("brightness", Number(event.target.value))
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* CONTRAST */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  ◐ Contrast
                </label>

                <span className="font-bold text-fuchsia-600">
                  {edit.contrast}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={edit.contrast}
                onChange={(event) =>
                  updateEdit("contrast", Number(event.target.value))
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* SATURATION */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  🌈 Saturation
                </label>

                <span className="font-bold text-fuchsia-600">
                  {edit.saturation}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={edit.saturation}
                onChange={(event) =>
                  updateEdit("saturation", Number(event.target.value))
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* WARMTH */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  🌅 Warmth
                </label>

                <span className="font-bold text-fuchsia-600">
                  {edit.warmth}
                </span>
              </div>

              <input
                type="range"
                min="-100"
                max="100"
                value={edit.warmth}
                onChange={(event) =>
                  updateEdit("warmth", Number(event.target.value))
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* BLUR */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  💧 Blur
                </label>

                <span className="font-bold text-fuchsia-600">
                  {edit.blur}px
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={edit.blur}
                onChange={(event) =>
                  updateEdit("blur", Number(event.target.value))
                }
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* RESET ADJUSTMENTS */}
            <button
              type="button"
              onClick={() => {
                setEdit((previous) => ({
                  ...previous,
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  warmth: 0,
                  blur: 0,
                }));

                setExportMessage("");
              }}
              className="w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700"
            >
              ↻ Reset Adjustments
            </button>

          </section>
        )}

        {/* ================================= */}
        {/* ROTATE AND FLIP */}
        {/* ================================= */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="mb-4 text-lg font-bold">
              🔄 Transform Photo
            </h2>

            <div className="grid grid-cols-2 gap-3">

              {/* ROTATE RIGHT */}
              <button
                type="button"
                onClick={() =>
                  updateEdit(
                    "rotation",
                    (edit.rotation + 90) % 360
                  )
                }
                className="rounded-xl bg-fuchsia-50 p-3 font-bold text-fuchsia-700"
              >
                ↻ Rotate Right
              </button>

              {/* ROTATE LEFT */}
              <button
                type="button"
                onClick={() =>
                  updateEdit(
                    "rotation",
                    (edit.rotation + 270) % 360
                  )
                }
                className="rounded-xl bg-fuchsia-50 p-3 font-bold text-fuchsia-700"
              >
                ↺ Rotate Left
              </button>

              {/* FLIP HORIZONTAL */}
              <button
                type="button"
                onClick={() =>
                  updateEdit("flipH", !edit.flipH)
                }
                className={`rounded-xl p-3 font-bold ${
                  edit.flipH
                    ? "bg-fuchsia-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                ↔ Flip Horizontal
              </button>

              {/* FLIP VERTICAL */}
              <button
                type="button"
                onClick={() =>
                  updateEdit("flipV", !edit.flipV)
                }
                className={`rounded-xl p-3 font-bold ${
                  edit.flipV
                    ? "bg-fuchsia-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                ↕ Flip Vertical
              </button>

            </div>

            {/* ZOOM */}
            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  🔍 Zoom
                </label>

                <span className="font-bold text-fuchsia-600">
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

            {/* RESET TRANSFORM */}
            <button
              type="button"
              onClick={() => {
                setEdit((previous) => ({
                  ...previous,
                  rotation: 0,
                  flipH: false,
                  flipV: false,
                  zoom: 100,
                }));

                setExportMessage("");
              }}
              className="mt-4 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700"
            >
              ↻ Reset Transform
            </button>

          </section>
        )}

        {/* PART 4 CONTINUES BELOW */}
                {/* ================================= */}
        {/* VIGNETTE EFFECT */}
        {/* ================================= */}

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
              ↻ Reset Vignette
            </button>

          </section>
        )}

        {/* ================================= */}
        {/* TEXT EDITOR */}
        {/* ================================= */}

        {image && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">

            <h2 className="mb-2 text-lg font-bold">
              📝 Add Text to Photo
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Write your favourite caption or quote.
            </p>

            <textarea
              value={textOverlay}
              onChange={(event) => updateText(event.target.value)}
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

            <button
              type="button"
              onClick={clearTextOverlay}
              disabled={!textOverlay}
              className="mt-3 w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700 disabled:opacity-40"
            >
              Clear Text
            </button>

          </section>
        )}

        {/* ================================= */}
        {/* STICKER COLLECTION */}
        {/* ================================= */}

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
                      {sticker}{" "}
                      <span className="text-xs">✕</span>
                    </button>
                  ))}
                </div>

              </div>
            )}

          </section>
        )}

        {/* ================================= */}
        {/* UNDO AND REDO */}
        {/* ================================= */}

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

        {/* ================================= */}
        {/* RESET ALL EDITING */}
        {/* ================================= */}

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
              {/* PART 5: EXPORT AND SHARE */}

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Save Your Photo
        </h2>

        <p className="mb-4 text-sm text-gray-500">
          Edited photo ni download or share cheyyachu.
        </p>

        <button
          type="button"
          disabled={!image || exporting}
          onClick={async () => {
            if (!image) return;

            try {
              setExporting(true);
              setError("");
              setExportMessage("");

              const source = new window.Image();
              source.crossOrigin = "anonymous";

              await new Promise<void>((resolve, reject) => {
                source.onload = () => resolve();
                source.onerror = () =>
                  reject(new Error("Photo load avvaledu. Malli try cheyyi."));
                source.src = image;
              });

              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              if (!ctx) {
                throw new Error("Photo export support ledu.");
              }

              const rotation = ((edit.rotation % 360) + 360) % 360;
              const sideways = rotation === 90 || rotation === 270;

              canvas.width = sideways ? source.height : source.width;
              canvas.height = sideways ? source.width : source.height;

              ctx.save();
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate((rotation * Math.PI) / 180);

              ctx.scale(
                (edit.flipH ? -1 : 1) * (edit.zoom / 100),
                (edit.flipV ? -1 : 1) * (edit.zoom / 100)
              );

              const filter = [
                selectedFilter
                `brightness(${edit.brightness}%)`,
                `contrast(${edit.contrast}%)`,
                `saturate(${edit.saturation}%)`,
                `blur(${edit.blur}px)`,
              ]
                .filter(Boolean)
                .join(" ");

              ctx.filter = filter;

              ctx.drawImage(
                source,
                -source.width / 2,
                -source.height / 2,
                source.width,
                source.height
              );

              ctx.restore();
              ctx.filter = "none";

              // Warmth effect
              if (edit.warmth !== 0) {
                ctx.fillStyle =
                  edit.warmth > 0
                    ? `rgba(255, 145, 45, ${Math.abs(edit.warmth) / 500})`
                    : `rgba(65, 135, 255, ${Math.abs(edit.warmth) / 500})`;

                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              // Vignette effect
              if (edit.vignette > 0) {
                const radius = Math.max(canvas.width, canvas.height) * 0.75;
                const gradient = ctx.createRadialGradient(
                  canvas.width / 2,
                  canvas.height / 2,
                  radius * 0.2,
                  canvas.width / 2,
                  canvas.height / 2,
                  radius
                );

                gradient.addColorStop(0, "rgba(0,0,0,0)");
                gradient.addColorStop(
                  1,
                  `rgba(0,0,0,${edit.vignette / 100})`
                );

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              // Text overlay
              if (textOverlay.trim()) {
                const fontSize = Math.max(
                  20,
                  Math.round(canvas.width * 0.045)
                );

                ctx.font = `bold ${fontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.lineWidth = Math.max(2, fontSize * 0.08);
                ctx.strokeStyle = "rgba(0,0,0,0.65)";
                ctx.fillStyle = "#ffffff";

                const lines = textOverlay.split("\n");
                const lineHeight = fontSize * 1.3;
                const startY =
                  canvas.height - 30 - (lines.length - 1) * lineHeight;

                lines.forEach((line, index) => {
                  ctx.strokeText(
                    line,
                    canvas.width / 2,
                    startY + index * lineHeight
                  );
                  ctx.fillText(
                    line,
                    canvas.width / 2,
                    startY + index * lineHeight
                  );
                });
              }

              // Stickers
              if (stickers.length > 0) {
                const stickerSize = Math.max(
                  28,
                  Math.round(canvas.width * 0.09)
                );

                stickers.forEach((sticker, index) => {
                  ctx.font = `${stickerSize}px Arial`;
                  ctx.textAlign = "center";
                  ctx.fillText(
                    sticker,
                    canvas.width * (0.15 + (index % 4) * 0.22),
                    canvas.height * (0.15 + Math.floor(index / 4) * 0.13)
                  );
                });
              }

              const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((result) => {
                  if (result) resolve(result);
                  else reject(new Error("Photo save avvaledu."));
                }, "image/jpeg", 0.95);
              });

              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `chitpix-edited-${Date.now()}.jpg`;
              document.body.appendChild(link);
              link.click();
              link.remove();
              URL.revokeObjectURL(url);

              setExportMessage("Photo successfully saved! ❤️");
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Photo export failed. Malli try cheyyi."
              );
            } finally {
              setExporting(false);
            }
          }}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? "Saving..." : "⬇️ Download Edited Photo"}
        </button>

        <button
          type="button"
          disabled={!image || exporting}
          onClick={async () => {
            if (!image) return;

            try {
              setExporting(true);
              setError("");
              setExportMessage("");

              const source = new window.Image();
              source.crossOrigin = "anonymous";

              await new Promise<void>((resolve, reject) => {
                source.onload = () => resolve();
                source.onerror = () =>
                  reject(new Error("Photo load avvaledu. Malli try cheyyi."));
                source.src = image;
              });

              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              if (!ctx) {
                throw new Error("Photo export support ledu.");
              }

              const rotation = ((edit.rotation % 360) + 360) % 360;
              const sideways = rotation === 90 || rotation === 270;

              canvas.width = sideways ? source.height : source.width;
              canvas.height = sideways ? source.width : source.height;

              ctx.save();
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.scale(
                (edit.flipH ? -1 : 1) * (edit.zoom / 100),
                (edit.flipV ? -1 : 1) * (edit.zoom / 100)
              );

              ctx.filter = [
                selectedFilter
                `brightness(${edit.brightness}%)`,
                `contrast(${edit.contrast}%)`,
                `saturate(${edit.saturation}%)`,
                `blur(${edit.blur}px)`,
              ]
                .filter(Boolean)
                .join(" ");

              ctx.drawImage(
                source,
                -source.width / 2,
                -source.height / 2,
                source.width,
                source.height
              );
              ctx.restore();
              ctx.filter = "none";

              if (edit.warmth !== 0) {
                ctx.fillStyle =
                  edit.warmth > 0
                    ? `rgba(255,145,45,${Math.abs(edit.warmth) / 500})`
                    : `rgba(65,135,255,${Math.abs(edit.warmth) / 500})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              if (edit.vignette > 0) {
                const radius = Math.max(canvas.width, canvas.height) * 0.75;
                const gradient = ctx.createRadialGradient(
                  canvas.width / 2,
                  canvas.height / 2,
                  radius * 0.2,
                  canvas.width / 2,
                  canvas.height / 2,
                  radius
                );
                gradient.addColorStop(0, "rgba(0,0,0,0)");
                gradient.addColorStop(
                  1,
                  `rgba(0,0,0,${edit.vignette / 100})`
                );
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              if (textOverlay.trim()) {
                const fontSize = Math.max(20, canvas.width * 0.045);
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.lineWidth = Math.max(2, fontSize * 0.08);
                ctx.strokeStyle = "rgba(0,0,0,0.65)";
                ctx.fillStyle = "#ffffff";

                const lines = textOverlay.split("\n");
                const lineHeight = fontSize * 1.3;
                const startY =
                  canvas.height - 30 - (lines.length - 1) * lineHeight;

                lines.forEach((line, index) => {
                  ctx.strokeText(line, canvas.width / 2, startY + index * lineHeight);
                  ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
                });
              }

              stickers.forEach((sticker, index) => {
                ctx.font = `${Math.max(28, canvas.width * 0.09)}px Arial`;
                ctx.textAlign = "center";
                ctx.fillText(
                  sticker,
                  canvas.width * (0.15 + (index % 4) * 0.22),
                  canvas.height * (0.15 + Math.floor(index / 4) * 0.13)
                );
              });

              const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((result) => {
                  if (result) resolve(result);
                  else reject(new Error("Share photo prepare avvaledu."));
                }, "image/jpeg", 0.95);
              });

              const file = new File([blob], "chitpix-edited.jpg", {
                type: "image/jpeg",
              });

              if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({ files: [file] })
              ) {
                await navigator.share({
                  files: [file],
                  title: "ChitPix Photo",
                  text: "My edited photo made with ChitPix ❤️",
                });
                setExportMessage("Share completed!");
              } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "chitpix-edited.jpg";
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
                setExportMessage(
                  "Direct sharing not supported. Photo downloaded instead."
                );
              }
            } catch (err) {
              if (err instanceof Error && err.name === "AbortError") {
                setExportMessage("Sharing cancelled.");
              } else {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Share failed. Malli try cheyyi."
                );
              }
            } finally {
              setExporting(false);
            }
          }}
          className="mt-3 w-full rounded-xl border border-purple-300 bg-white px-5 py-3 font-bold text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? "Preparing..." : "📤 Share Edited Photo"}
        </button>

        {exportMessage && (
          <p className="mt-3 text-center text-sm font-medium text-green-600">
            {exportMessage}
          </p>
        )}

        {error && (
          <p className="mt-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </section>

            <footer className="mt-8 pb-6 text-center text-xs text-gray-400">
        Made with ❤️ ChitPix AI Photo Studio
      </footer>
    </div>
    </main>
  );
      }
