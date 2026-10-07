import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChitPix.",
  description: "Instagram of India",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

function ZoomBlocker() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
          let lastTouch = 0;
          document.addEventListener('touchend', e => {
            const now = Date.now();
            if (now - lastTouch <= 300) { e.preventDefault(); }
            lastTouch = now;
          }, { passive: false });
          document.addEventListener('touchstart', e => {
            if (e.touches.length > 1) { e.preventDefault(); }
          }, { passive: false });
        `,
      }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased max-w-[480px] mx-auto overflow-x-hidden">
        {children}
        <ZoomBlocker />
      </body>
    </html>
  );
}
