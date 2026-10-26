'use client';

import { useEffect, useState } from 'react';

type SharePost = {
  id?: string | number;
  image_url?: string;
  video_url?: string;
  url?: string;
  share_url?: string;
  caption?: string;
  [key: string]: unknown;
};

type ShareAZProps = {
  post?: SharePost | null;
  onClose?: () => void;
  onDownload?: (post: SharePost | null | undefined) => void | Promise<void>;
  onShare?: (post: SharePost | null | undefined) => void;
  onToast?: (message: string) => void;

  // Optional callbacks: connect these to existing app features.
  onDirectMessage?: (
    post: SharePost | null | undefined,
    person: string
  ) => void;
  onStory?: (post: SharePost | null | undefined) => void;
  onRemix?: (post: SharePost | null | undefined) => void;
  onGenerateQR?: (url: string) => void;
};

const recentPeople = [
  { name: 'Alex', color: 'bg-orange-200' },
  { name: 'Mia', color: 'bg-blue-200' },
  { name: 'Jordan', color: 'bg-pink-200' },
  { name: 'Priya', color: 'bg-green-200' },
  { name: 'Sam', color: 'bg-purple-200' },
  { name: 'Rohan', color: 'bg-yellow-200' },
  { name: 'Tara', color: 'bg-red-200' },
];

const quickActions = [
  { id: 'copy', label: 'Copy Link', icon: '🔗' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '☘️' },
  { id: 'download', label: 'Download', icon: '⬇️' },
  { id: 'qr', label: 'QR Code', icon: '▦' },
  { id: 'story', label: 'Add to Story', icon: '＋' },
  { id: 'remix', label: 'Remix', icon: '♻️' },
  { id: 'feed', label: 'Add to Feed', icon: '▣' },
  { id: 'repost', label: 'Repost', icon: '🔁' },
] as const;

const moreActions = [
  { label: 'Telegram', url: 'https://t.me/share/url' },
  { label: 'Facebook', url: 'https://www.facebook.com/sharer/sharer.php' },
  { label: 'Email', url: 'mailto:' },
  { label: 'Message', url: 'sms:' },
];

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
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const notify = (message: string) => {
    onToast?.(message);
  };

  // Prefer a real post URL over the image URL.
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';

    const candidate = post?.share_url || post?.url;

    if (candidate) {
      try {
        return new URL(candidate, window.location.origin).href;
      } catch {
        // Fall back to the current page.
      }
    }

    // A post ID alone is not enough to assume your route structure.
    return window.location.href;
  };

  const copyText = async (value: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand('copy');
        textarea.remove();

        if (!success) throw new Error('Copy failed');
      }

      setCopied(true);
      notify('Link copied! ✅');
    } catch {
      notify('Could not copy. Please copy the link manually.');
    }
  };

  const shareNative = async () => {
    const url = getShareUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chitpix',
          text: typeof post?.caption === 'string'
            ? post.caption
            : 'Check this out on Chitpix!',
          url,
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        notify('Sharing failed. Please try another option.');
      }
    } else {
      await copyText(url);
      notify('Share menu unavailable. Link copied if permitted.');
    }
  };

  const downloadMedia = async () => {
    if (busy) return;
    setBusy(true);

    try {
      // Keep the existing app's download implementation when supplied.
      if (onDownload) {
        await onDownload(post);
        notify('Download requested. Check your app.');
        return;
      }

      const mediaUrl = post?.image_url || post?.video_url;

      if (!mediaUrl) {
        notify('No image or video is available to download.');
        return;
      }

      const response = await fetch(mediaUrl);

      if (!response.ok) {
        throw new Error('Media download failed');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = objectUrl;
      link.download = `chitpix-${post?.id ?? 'media'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      notify('Download started! ⬇️');
    } catch {
      notify(
        'Download failed. Check the media URL and storage CORS settings.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAction = async (action: string) => {
    const url = getShareUrl();

    switch (action) {
      case 'copy':
        await copyText(url);
        return;

      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(url)}`,
          '_blank',
          'noopener,noreferrer'
        );
        return;

      case 'download':
        await downloadMedia();
        return;

      case 'qr':
        if (onGenerateQR) {
          onGenerateQR(url);
        } else {
          setQrOpen(true);
        }
        return;

      case 'story':
        if (!onStory) {
          notify('Story feature needs to be connected to your app.');
          return;
        }
        onStory(post);
        notify('Story action sent.');
        onClose?.();
        return;

      case 'remix':
        if (!onRemix) {
          notify('Remix feature needs to be connected to your app.');
          return;
        }
        onRemix(post);
        onClose?.();
        return;

      case 'feed':
      case 'repost':
        if (!onShare) {
          notify('Feed sharing is not connected yet.');
          return;
        }
        onShare(post);
        notify(action === 'feed' ? 'Feed share requested.' : 'Repost requested.');
        onClose?.();
        return;

      default:
        return;
    }
  };

  const filteredPeople = recentPeople.filter((person) =>
    person.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const openExternalShare = (label: string) => {
    const url = getShareUrl();

    if (label === 'Email') {
      window.location.href =
        `mailto:?subject=${encodeURIComponent('Chitpix post')}` +
        `&body=${encodeURIComponent(url)}`;
      return;
    }

    if (label === 'Message') {
      window.location.href = `sms:?body=${encodeURIComponent(url)}`;
      return;
    }

    const config = moreActions.find((item) => item.label === label);

    if (!config) {
      notify(`${label} is not available yet.`);
      return;
    }

    const destination =
      `${config.url}?${new URLSearchParams({
        u: url,
        url,
        text: url,
      }).toString()}`;

    window.open(destination, '_blank', 'noopener,noreferrer');
  };

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
            Share on Chitpix
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share panel"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-lg hover:bg-zinc-200"
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
            onClick={shareNative}
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
                  notify('Connect onDirectMessage to enable sending in DM.');
                  return;
                }

                onDirectMessage(post, person.name);
                notify(`Message action sent to ${person.name}.`);
              }}
              className="flex min-w-[58px] flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full ${person.color} text-lg font-bold ring-2 ring-white`}
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
          <span aria-hidden="true">⌕</span>
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
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="text-zinc-500"
            >
              ✕
            </button>
          )}
        </label>

        <div className="mb-3 mt-6 flex items-center justify-between">
          <h3 className="text-sm font-bold">✨ Quick Actions</h3>
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
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl transition group-hover:bg-zinc-200 group-active:scale-95">
                {action.id === 'copy' && copied ? '✓' : action.icon}
              </span>
              <span className="text-center text-[11px] leading-tight">
                {action.id === 'copy' && copied ? 'Copied!' : action.label}
              </span>
            </button>
          ))}
        </div>

        <h3 className="mb-3 mt-7 text-sm font-bold">More Options</h3>

        <div className="grid grid-cols-4 gap-x-2 gap-y-5">
          {[
            ...moreActions,
            { label: 'TikTok', url: '' },
            { label: 'Save Files', url: '' },
            { label: 'AI Caption', url: '' },
            { label: 'Embed', url: '' },
            { label: 'Link Bio', url: '' },
            { label: 'Schedule', url: '' },
            { label: 'Collab', url: '' },
            { label: 'More...', url: '' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (['Telegram', 'Facebook', 'Email', 'Message'].includes(item.label)) {
                  openExternalShare(item.label);
                } else {
                  notify(`${item.label} needs its own feature integration.`);
                }
              }}
              className="flex min-w-0 flex-col items-center gap-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-xl ring-1 ring-zinc-100">
                {item.label === 'Email'
                  ? '✉️'
                  : item.label === 'Message'
                    ? '💬'
                    : item.label === 'Facebook'
                      ? 'f'
                      : item.label === 'Telegram'
                        ? '➤'
                        : '＋'}
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
            <p className="mt-1 break-all text-xs text-zinc-500">{getShareUrl()}</p>

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
          🔒 Share only content you have permission to share.
        </p>
      </section>
    </div>
  );
          }
