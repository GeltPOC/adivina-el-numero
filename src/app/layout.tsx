import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adivina el Número',
  description: 'Juego interactivo de adivinar el número',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        {children}
      </body>
    </html>
  )
}
