import "./globals.css"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{background:"white", margin:0, padding:0}}>
        {children}
      </body>
    </html>
  )
}
