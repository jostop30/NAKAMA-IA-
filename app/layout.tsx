import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NAKAMA AI • ツンデレ Companion',
  description: 'Tu compañera tsundere de anime con IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <div className="fixed inset-0 -z-50 bg-[#0a0a1a]">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20" />
        </div>
        {children}
        <Toaster 
          position="bottom-right" 
          toastOptions={{ 
            style: { 
              background: 'rgba(20,20,40,0.9)', 
              backdropFilter: 'blur(10px)', 
              color: '#fff', 
              border: '1px solid rgba(255,107,157,0.3)', 
              borderRadius: '16px' 
            } 
          }} 
        />
      </body>
    </html>
  )
}