'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Sparkles, MessageSquare, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'

export default function LenguajePage() {
  const supabase = createClient()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [preferencias, setPreferencias] = useState({
    palabras_clave: [] as string[],
    frases_favoritas: [] as string[],
    muletillas: [] as string[],
    nivel_formalidad: 5
  })
  const [nuevaPalabra, setNuevaPalabra] = useState('')
  const [nuevaFrase, setNuevaFrase] = useState('')
  const [nuevaMuletilla, setNuevaMuletilla] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)

  useEffect(() => {
    cargarPreferencias()
  }, [])

  const cargarPreferencias = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setCargando(false)
      return
    }

    const { data } = await supabase
      .from('preferencias_lenguaje')
      .select('*')
      .eq('usuario_id', session.user.id)
      .single()

    if (data) {
      setPreferencias({
        palabras_clave: data.palabras_clave || [],
        frases_favoritas: data.frases_favoritas || [],
        muletillas: data.muletillas || [],
        nivel_formalidad: data.nivel_formalidad || 5
      })
    }
    setCargando(false)
  }

  const guardarPreferencias = async () => {
    setGuardando(true)
    setMensaje(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMensaje({ tipo: 'error', texto: 'Debes iniciar sesión' })
      setGuardando(false)
      return
    }

    const { error } = await supabase
      .from('preferencias_lenguaje')
      .upsert({
        usuario_id: session.user.id,
        palabras_clave: preferencias.palabras_clave,
        frases_favoritas: preferencias.frases_favoritas,
        muletillas: preferencias.muletillas,
        nivel_formalidad: preferencias.nivel_formalidad,
        updated_at: new Date().toISOString()
      })

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message })
    } else {
      setMensaje({ tipo: 'exito', texto: '✅ Preferencias guardadas' })
      setTimeout(() => setMensaje(null), 3000)
    }
    setGuardando(false)
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ajustes" className="glass-light p-3 rounded-xl hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <h1 className="text-3xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              🎭 Personalizar lenguaje
            </span>
          </h1>
        </div>

        {mensaje && (
          <div className={`mb-6 p-4 rounded-xl ${mensaje.tipo === 'exito' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="space-y-6">
          {/* Palabras clave */}
          <div className="glass rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Palabras que debe usar NAKAMA
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={nuevaPalabra}
                onChange={(e) => setNuevaPalabra(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nuevaPalabra.trim()) {
                    if (!preferencias.palabras_clave.includes(nuevaPalabra.trim())) {
                      setPreferencias(prev => ({
                        ...prev,
                        palabras_clave: [...prev.palabras_clave, nuevaPalabra.trim()]
                      }))
                    }
                    setNuevaPalabra('')
                  }
                }}
                placeholder="Ej: genial, increíble..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
              <button
                onClick={() => {
                  if (nuevaPalabra.trim() && !preferencias.palabras_clave.includes(nuevaPalabra.trim())) {
                    setPreferencias(prev => ({
                      ...prev,
                      palabras_clave: [...prev.palabras_clave, nuevaPalabra.trim()]
                    }))
                    setNuevaPalabra('')
                  }
                }}
                className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferencias.palabras_clave.map(palabra => (
                <span key={palabra} className="px-3 py-1.5 glass-light rounded-full text-white text-sm flex items-center gap-2">
                  {palabra}
                  <button onClick={() => setPreferencias(prev => ({ ...prev, palabras_clave: prev.palabras_clave.filter(p => p !== palabra) }))} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Frases favoritas */}
          <div className="glass rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Frases características
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={nuevaFrase}
                onChange={(e) => setNuevaFrase(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nuevaFrase.trim()) {
                    if (!preferencias.frases_favoritas.includes(nuevaFrase.trim())) {
                      setPreferencias(prev => ({
                        ...prev,
                        frases_favoritas: [...prev.frases_favoritas, nuevaFrase.trim()]
                      }))
                    }
                    setNuevaFrase('')
                  }
                }}
                placeholder="Ej: ¡Por supuesto!"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
              <button
                onClick={() => {
                  if (nuevaFrase.trim() && !preferencias.frases_favoritas.includes(nuevaFrase.trim())) {
                    setPreferencias(prev => ({
                      ...prev,
                      frases_favoritas: [...prev.frases_favoritas, nuevaFrase.trim()]
                    }))
                    setNuevaFrase('')
                  }
                }}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferencias.frases_favoritas.map(frase => (
                <span key={frase} className="px-3 py-1.5 glass-light rounded-full text-white text-sm flex items-center gap-2">
                  "{frase}"
                  <button onClick={() => setPreferencias(prev => ({ ...prev, frases_favoritas: prev.frases_favoritas.filter(f => f !== frase) }))} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Muletillas */}
          <div className="glass rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Muletillas
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={nuevaMuletilla}
                onChange={(e) => setNuevaMuletilla(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nuevaMuletilla.trim()) {
                    if (!preferencias.muletillas.includes(nuevaMuletilla.trim())) {
                      setPreferencias(prev => ({
                        ...prev,
                        muletillas: [...prev.muletillas, nuevaMuletilla.trim()]
                      }))
                    }
                    setNuevaMuletilla('')
                  }
                }}
                placeholder="Ej: eh, este, pues..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
              <button
                onClick={() => {
                  if (nuevaMuletilla.trim() && !preferencias.muletillas.includes(nuevaMuletilla.trim())) {
                    setPreferencias(prev => ({
                      ...prev,
                      muletillas: [...prev.muletillas, nuevaMuletilla.trim()]
                    }))
                    setNuevaMuletilla('')
                  }
                }}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferencias.muletillas.map(muletilla => (
                <span key={muletilla} className="px-3 py-1.5 glass-light rounded-full text-white text-sm flex items-center gap-2">
                  "{muletilla}"
                  <button onClick={() => setPreferencias(prev => ({ ...prev, muletillas: prev.muletillas.filter(m => m !== muletilla) }))} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Nivel de formalidad */}
          <div className="glass rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-medium mb-3">Nivel de formalidad</h3>
            <div className="flex items-center gap-4">
              <span className="text-white/50 text-sm">Informal</span>
              <input
                type="range"
                min="1"
                max="10"
                value={preferencias.nivel_formalidad}
                onChange={(e) => setPreferencias(prev => ({ ...prev, nivel_formalidad: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-white/50 text-sm">Formal</span>
            </div>
            <p className="text-white/40 text-xs mt-2">
              Actual: {preferencias.nivel_formalidad <= 3 ? 'Muy informal' : preferencias.nivel_formalidad <= 6 ? 'Neutral' : 'Muy formal'}
            </p>
          </div>

          {/* Botón guardar */}
          <button
            onClick={guardarPreferencias}
            disabled={guardando}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {guardando ? (
              'Guardando...'
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar preferencias
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}