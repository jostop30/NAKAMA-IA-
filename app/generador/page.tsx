'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Download, Loader2, Sparkles, ArrowLeft, ImageIcon, Flame, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const ESTILOS = [
  { id: 'anime', nombre: 'Anime', emoji: '📺' },
  { id: 'moderno', nombre: 'Moderno', emoji: '✨' },
  { id: 'cyberpunk', nombre: 'Cyberpunk', emoji: '🌃' },
  { id: 'ghibli', nombre: 'Ghibli', emoji: '🌿' },
  { id: 'chibi', nombre: 'Chibi', emoji: '🧸' },
  { id: 'hentai', nombre: 'Hentai', emoji: '🔞' },
]

// Imágenes de placeholder por estilo (para demo)
const PLACEHOLDERS: Record<string, string[]> = {
  anime: ['https://picsum.photos/768/768?random=1', 'https://picsum.photos/768/768?random=2'],
  moderno: ['https://picsum.photos/768/768?random=3', 'https://picsum.photos/768/768?random=4'],
  cyberpunk: ['https://picsum.photos/768/768?random=5', 'https://picsum.photos/768/768?random=6'],
  ghibli: ['https://picsum.photos/768/768?random=7', 'https://picsum.photos/768/768?random=8'],
  chibi: ['https://picsum.photos/768/768?random=9', 'https://picsum.photos/768/768?random=10'],
  hentai: ['https://picsum.photos/768/768?random=11', 'https://picsum.photos/768/768?random=12'],
}

export default function GeneradorPage() {
  const [prompt, setPrompt] = useState('')
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(ESTILOS[0])
  const [cargando, setCargando] = useState(false)
  const [imagenGenerada, setImagenGenerada] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerar = async () => {
    if (!prompt.trim()) {
      setError('Escribe un prompt')
      return
    }
    if (cargando) return

    setCargando(true)
    setError(null)
    
    try {
      // Intentar con Pollinations.ai
      const promptCompleto = `${prompt}, ${estiloSeleccionado.id} style, anime, high quality`
      const encodedPrompt = encodeURIComponent(promptCompleto)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true`
      
      console.log('🎨 Intentando Pollinations.ai...')
      
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Pollinations falló')
      
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      setImagenGenerada(objectUrl)
      
    } catch (pollinationsError) {
      console.log('❌ Pollinations.ai falló, usando placeholder...')
      
      // Simular generación con placeholder
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const placeholders = PLACEHOLDERS[estiloSeleccionado.id] || PLACEHOLDERS.anime
      const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)]
      setImagenGenerada(randomPlaceholder)
      setError('⚠️ Usando imagen de demostración. La API gratuita no está disponible.')
    } finally {
      setCargando(false)
    }
  }

  const handleDescargar = () => {
    if (!imagenGenerada) return
    const link = document.createElement('a')
    link.href = imagenGenerada
    link.download = `nakama-arte-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="glass-light p-3 rounded-xl hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-pink-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Generador de Arte
            </span>
          </h1>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10">
          {/* Prompt */}
          <div className="mb-4">
            <label className="text-white/70 text-sm mb-2 block">Describe tu imagen</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: una chica tsundere con cabello rosa..."
              className="w-full h-24 px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
              disabled={cargando}
            />
          </div>

          {/* Estilos */}
          <div className="mb-4">
            <label className="text-white/70 text-sm mb-2 block">Estilo</label>
            <div className="flex flex-wrap gap-2">
              {ESTILOS.map(estilo => (
                <button
                  key={estilo.id}
                  onClick={() => setEstiloSeleccionado(estilo)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    estiloSeleccionado.id === estilo.id
                      ? estilo.id === 'hentai'
                        ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                        : 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                      : 'glass-light text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{estilo.emoji}</span>
                  <span>{estilo.nombre}</span>
                  {estilo.id === 'hentai' && <Flame className="w-3 h-3 text-red-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Advertencia */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Botón Generar */}
          <button
            onClick={handleGenerar}
            disabled={cargando || !prompt.trim()}
            className={`w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              estiloSeleccionado.id === 'hentai'
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-red-500/20'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-pink-500/20'
            } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cargando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generar Imagen
              </>
            )}
          </button>
          
          <p className="text-white/30 text-xs text-center mt-3">
            * La API gratuita puede fallar. Si no carga, se muestra una imagen de demostración.
          </p>
        </div>

        {/* Vista previa */}
        {imagenGenerada && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-white/10 mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                Imagen Generada
              </h2>
              <button
                onClick={handleDescargar}
                className="glass-light px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2 hover:bg-white/10"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-black/30">
              <Image src={imagenGenerada} alt="Generada" fill className="object-contain" unoptimized />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}