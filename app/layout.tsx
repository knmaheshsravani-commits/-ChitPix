import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ChitPix.com",
  description: "ChitPix - Share your moments",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  )
}
