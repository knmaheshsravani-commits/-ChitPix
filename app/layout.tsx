import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "ChitPix - Made in India App",
  description: "ChitPix is a photo sharing app created by K N Mahesh",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
              "author": { "@type": "Person", "name": "K N Mahesh" },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
