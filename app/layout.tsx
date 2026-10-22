import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChitPix.com - India's Own Instagram by K N Mahesh",
  description: "ChitPix is owned by K N Mahesh (Kn Mahesh) - Founder & Owner of ChitPix.com - Instagram of India - Photos • Reels • Share • Chat • R2 Storage 2026",
  keywords: ["chitpix owner", "who is chitpix owner", "kn mahesh", "k n mahesh", "chitpix.com", "chitpix owner name", "chitpix founder", "instagram of india"],
  authors: [{ name: "K N Mahesh", url: "https://chitpix.com" }],
  creator: "K N Mahesh",
  publisher: "ChitPix",
  themeColor: "#080b14",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "ChitPix.com - Owned by K N Mahesh",
    description: "Search ChitPix.com - India's Own Instagram - Owner K N Mahesh",
    url: "https://chitpix.com",
    siteName: "ChitPix",
    images: [{ url: "/owner-badge.png", width: 800, height: 800, alt: "ChitPix Owner K N Mahesh" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChitPix Owner - K N Mahesh",
    description: "Who is ChitPix owner? K N Mahesh is the owner of ChitPix.com",
    images: ["/owner-badge.png"],
  },
  verification: { google: "chitpix-owner-kn-mahesh" },
};

// FIX 1: Scroll ki lifetime working viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#080b14",
  viewportFit: "cover",
};

// FIX 2: ZoomBlocker ni remove chesa - idi scroll ni champestundi
// Pinch zoom mathrame block, scroll allow
function ScrollFix() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Allow scroll, block only pinch zoom
          document.addEventListener('touchstart', function(e){
            if(e.touches.length > 1){ e.preventDefault(); }
          }, { passive: false });
          // Remove double tap blocker - it was killing scroll
        `,
      }}
    />
  );
}

function SwRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
      if('serviceWorker' in navigator){
        window.addEventListener('load', function(){
          navigator.serviceWorker.register('/sw.js');
        });
      }
      `,
      }}
    />
  );
}

function SeoSchemas() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ChitPix",
    "alternateName": "ChitPix.com",
    "url": "https://chitpix.com",
    "logo": "https://chitpix.com/owner-badge.png",
    "description": "India's Own Instagram - Photos, Reels, Share, Chat",
    "founder": { "@type": "Person", "name": "K N Mahesh", "alternateName": "Kn Mahesh", "jobTitle": "Founder & Owner", "sameAs": ["https://github.com/knmaheshsravani-commits"] },
    "owner": { "@type": "Person", "name": "K N Mahesh" }
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Who is the owner of ChitPix?", "acceptedAnswer": { "@type": "Answer", "text": "ChitPix is owned by K N Mahesh (Kn Mahesh) - Founder and Owner of ChitPix.com, India's Own Instagram 2026." } },
      { "@type": "Question", "name": "Who is ChitPix owner?", "acceptedAnswer": { "@type": "Answer", "text": "K N Mahesh is the owner and founder of ChitPix.com" } },
      { "@type": "Question", "name": "What is ChitPix.com?", "acceptedAnswer": { "@type": "Answer", "text": "ChitPix.com is India's Own Instagram built by K N Mahesh with Photos, Reels, Share, Chat features and R2 Storage." } }
    ]
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" style={{ backgroundColor: "#080b14" }}>
      <body className="bg-[#080b14] text-white antialiased min-h-screen w-full overflow-y-auto overflow-x-hidden overscroll-y-auto" style={{ WebkitOverflowScrolling: 'touch' } as any}>
        <div className="max-w-[480px] mx-auto min-h-screen bg-[#080b14] relative">
          <SeoSchemas />
          {children}
          <ScrollFix />
          <SwRegister />
        </div>
      </body>
    </html>
  );
}
