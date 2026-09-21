import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChitPix - Made in India App",
  description: "ChitPix is a photo sharing app created by K N Mahesh",
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
              "author": { "@type": "Person", "name": "K N Mahesh", "sameAs": ["https://www.instagram.com/knmahesh30"] }
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
