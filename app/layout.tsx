import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChitPix - Mahesh's App",
  description: "Instagram Clone by Mahesh-07",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/174/174855.png" />
      </head>
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}
