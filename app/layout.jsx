import "./globals.css"

export const metadata = {
  title: "University Magazine Portal",
  description: "University magazine contribution system",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
