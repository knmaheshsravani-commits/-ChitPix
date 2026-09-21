import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChitPix - Made in India Photo Sharing App",
  description: "ChitPix is a photo sharing and reels app created by K N Mahesh in 2026. Made in India.",
  authors: [{ name: "K N Mahesh", url: "https://www.instagram.com/knmahesh30" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ChitPix",
              "url": "https://p6.vercel.app",
              "applicationCategory": "SocialNetworkingApplication",
              "creator": {
                "@type": "Person",
                "name": "K N Mahesh",
                "alternateName": "knmahesh30",
                "sameAs": ["https://www.instagram.com/knmahesh30"]
              },
              "author": {
                "@type": "Person",
                "name": "K N Mahesh"
              }
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
