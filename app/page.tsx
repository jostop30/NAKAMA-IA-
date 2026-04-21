'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Heart, ChevronDown, Plus, MessageSquare, Tv, User, Settings, Wand2, Paperclip } from 'lucide-react'
import Link from 'next/link'
import { createClient } from './lib/supabase/client'
import SubidaArchivos from './componentes/SubidaArchivos'
import VoiceAssistant from './componentes/VoiceAssistant'

// ============================================
// TIPOS
// ============================================
interface Chat {
  id: string
  titulo: string
  fecha: Date
}

interface Mensaje {
  rol: 'user' | 'assistant'
  contenido: string
}

// ============================================
// PERSONALIDADES
// ============================================
const PERSONALIDADES = [
  { id: 'tsundere', nombre: 'Tsundere', emoji: '😤', color: 'from-pink-500 to-rose-500' },
  { id: 'kuudere', nombre: 'Kuudere', emoji: '😶', color: 'from-blue-500 to-purple-500' },
  { id: 'shonen', nombre: 'Shonen', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { id: 'sensei', nombre: 'Sensei', emoji: '🧙', color: 'from-green-500 to-emerald-500' },
  { id: 'sumisa', nombre: 'Sumisa', emoji: '🥺', color: 'from-pink-300 to-rose-300' },
  { id: 'echii', nombre: 'Echii', emoji: '💕', color: 'from-red-400 to-pink-500' },
  { id: 'yandere', nombre: 'Yandere', emoji: '🔪', color: 'from-purple-600 to-pink-700' },
  { id: 'esclava', nombre: 'Esclava', emoji: '⛓️', color: 'from-gray-500 to-gray-700' },
]

// ============================================
// PERSONAJES DE ANIME (PREDEFINIDOS)
// ============================================
const PERSONAJES = [
  { id: 'ninguno', nombre: 'Ninguno', emoji: '🤖', anime: 'NAKAMA', frase: '' },
  { id: 'goku', nombre: 'Goku', emoji: '🐉', anime: 'Dragon Ball', frase: '¡Kakarotooooto!' },
  { id: 'luffy', nombre: 'Luffy', emoji: '🏴‍☠️', anime: 'One Piece', frase: '¡Voy a ser el Rey de los Piratas!' },
  { id: 'naruto', nombre: 'Naruto', emoji: '🍥', anime: 'Naruto', frase: '¡Dattebayo!' },
  { id: 'levi', nombre: 'Levi', emoji: '⚔️', anime: 'Attack on Titan', frase: 'Sin arrepentimientos.' },
  { id: 'saitama', nombre: 'Saitama', emoji: '👊', anime: 'One Punch Man', frase: 'Ok.' },
  { id: 'anya', nombre: 'Anya', emoji: '🥜', anime: 'Spy x Family', frase: 'Waku waku!' },
  { id: 'gojo', nombre: 'Gojo', emoji: '👁️', anime: 'Jujutsu Kaisen', frase: 'Yo soy el más fuerte.' },
  { id: 'zero_two', nombre: 'Zero Two', emoji: '🦖', anime: 'Darling in the Franxx', frase: 'Darling...' },
  { id: 'mikasa', nombre: 'Mikasa', emoji: '🪽', anime: 'Attack on Titan', frase: 'Eren...' },
  { id: 'senku', nombre: 'Senku', emoji: '🔬', anime: 'Dr. Stone', frase: '¡Diez mil millones por ciento!' },
]

export default function Home() {
  const supabase = createClient()
  
  const [isClient, setIsClient] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [chatActual, setChatActual] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [personalidad, setPersonalidad] = useState('tsundere')
  const [personaje, setPersonaje] = useState('ninguno')
  const [personajePersonalizado, setPersonajePersonalizado] = useState<any>(null)
  const [mostrarPersonalidad, setMostrarPersonalidad] = useState(false)
  const [mostrarPersonaje, setMostrarPersonaje] = useState(false)
  const [sesion, setSesion] = useState<any>(null)
  const [mostrarSubida, setMostrarSubida] = useState(false)
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<any[]>([])
  const [speakFunction, setSpeakFunction] = useState<((text: string) => void) | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const personalidadActual = PERSONALIDADES.find(p => p.id === personalidad) || PERSONALIDADES[0]
  const personajeActual = personaje === 'custom' && personajePersonalizado 
    ? personajePersonalizado 
    : PERSONAJES.find(p => p.id === personaje) || PERSONAJES[0]

  const usandoPersonaje = personaje !== 'ninguno'

  const speak = (text: string) => {
    if (speakFunction) {
      speakFunction(text)
    } else {
      // Fallback: usar speechSynthesis directamente
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 1.1
      utterance.pitch = 1.3
      window.speechSynthesis.speak(utterance)
    }
  }

  // Activar cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cargar sesión y chats (solo en cliente)
  useEffect(() => {
    if (!isClient) return
    
    const cargarDatos = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSesion(session)
      
      if (session) {
        const { data: chatsDB } = await supabase
          .from('chats')
          .select('*')
          .eq('usuario_id', session.user.id)
          .order('updated_at', { ascending: false })
        
        if (chatsDB && chatsDB.length > 0) {
          setChats(chatsDB.map(c => ({
            id: c.id,
            titulo: c.titulo,
            fecha: new Date(c.updated_at)
          })))
        }
      } else {
        const saved = localStorage.getItem('nakama_chats')
        if (saved) {
          try {
            setChats(JSON.parse(saved))
          } catch { }
        }
      }
    }
    
    cargarDatos()
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
      if (!session) {
        const saved = localStorage.getItem('nakama_chats')
        if (saved) {
          try {
            setChats(JSON.parse(saved))
          } catch { }
        }
      }
    })
    
    return () => authListener.subscription.unsubscribe()
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, isClient])

  const nuevoChat = async () => {
    if (!isClient) return
    
    const nuevo: Chat = {
      id: crypto.randomUUID(),
      titulo: 'Nuevo Chat',
      fecha: new Date()
    }
    
    if (sesion) {
      await supabase.from('chats').insert({
        id: nuevo.id,
        usuario_id: sesion.user.id,
        titulo: nuevo.titulo,
        created_at: nuevo.fecha.toISOString(),
        updated_at: nuevo.fecha.toISOString()
      })
    }
    
    const nuevosChats = [nuevo, ...chats]
    setChats(nuevosChats)
    localStorage.setItem('nakama_chats', JSON.stringify(nuevosChats))
    setChatActual(nuevo.id)
    setMensajes([{
      rol: 'assistant',
      contenido: `¡Hmph! ¿Otra vez tú? *se cruza de brazos* No es que estuviera esperándote... pero ya que estás aquí, ¿qué quieres?`
    }])
  }

  const cargarChat = async (chatId: string) => {
    if (!isClient) return
    setChatActual(chatId)
    
    if (sesion) {
      const { data: mensajesDB } = await supabase
        .from('mensajes')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (mensajesDB && mensajesDB.length > 0) {
        setMensajes(mensajesDB.map(m => ({
          rol: m.rol,
          contenido: m.contenido
        })))
        return
      }
    }
    
    setMensajes([{
      rol: 'assistant',
      contenido: `¡Hmph! Continuamos donde lo dejamos... ¿qué más querías?`
    }])
  }

  const eliminarChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isClient) return
    
    if (sesion) {
      await supabase.from('chats').delete().eq('id', chatId)
    }
    
    const nuevosChats = chats.filter(c => c.id !== chatId)
    setChats(nuevosChats)
    localStorage.setItem('nakama_chats', JSON.stringify(nuevosChats))
    
    if (chatActual === chatId) {
      setChatActual(null)
      setMensajes([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || cargando || !chatActual || !isClient) return

    const mensajeUsuario = input
    setMensajes(prev => [...prev, { rol: 'user', contenido: mensajeUsuario }])
    setInput('')
    setCargando(true)

    try {
      const personajeData = usandoPersonaje ? personajeActual : null
      const personalidadData = usandoPersonaje ? null : personalidad

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: mensajeUsuario, 
          personalidad: personalidadData,
          personaje: personajeData,
          archivos: archivosAdjuntos
        })
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let respuestaCompleta = ''

      setMensajes(prev => [...prev, { rol: 'assistant', contenido: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        respuestaCompleta += decoder.decode(value)
        
        setMensajes(prev => {
          const nuevos = [...prev]
          nuevos[nuevos.length - 1].contenido = respuestaCompleta
          return nuevos
        })
      }

      // Hacer que NAKAMA hable la respuesta
      if (respuestaCompleta) {
        speak(respuestaCompleta)
      }

      if (sesion) {
        await supabase.from('mensajes').insert([
          {
            chat_id: chatActual,
            rol: 'user',
            contenido: mensajeUsuario,
            personalidad: personalidadData || null,
            personaje: personajeData?.nombre || null
          },
          {
            chat_id: chatActual,
            rol: 'assistant',
            contenido: respuestaCompleta,
            personalidad: personalidadData || null,
            personaje: personajeData?.nombre || null
          }
        ])
        
        await supabase.from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatActual)
      }
      
      setArchivosAdjuntos([])
    } catch (error) {
      setMensajes(prev => [...prev, { rol: 'assistant', contenido: '¡Hmph! Algo falló... intenta de nuevo, b-baka.' }])
    } finally {
      setCargando(false)
    }
  }

  // Loading screen mientras hidrata
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white/50">Cargando NAKAMA AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-[#0a0a1a] text-white">
      {/* ===== PANEL IZQUIERDO - CHATS ===== */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col">
        <div className="p-4">
          <button
            onClick={nuevoChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-medium hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nuevo Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chats.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">
              No hay chats aún. ¡Crea uno!
            </p>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => cargarChat(chat.id)}
                className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  chatActual === chat.id 
                    ? 'bg-white/10 border-l-2 border-l-pink-400' 
                    : 'hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{chat.titulo}</span>
                <button
                  onClick={(e) => eliminarChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                >
                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        {sesion && (
          <div className="p-4 border-t border-white/10">
            <p className="text-white/50 text-xs text-center">
              ✅ Chats sincronizados
            </p>
          </div>
        )}
      </aside>

      {/* ===== PANEL PRINCIPAL - CHAT ===== */}
      <main className="flex-1 flex flex-col">
        {/* Header Superior */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${usandoPersonaje ? 'from-purple-500 to-pink-500' : personalidadActual.color} flex items-center justify-center transition-all duration-300`}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${usandoPersonaje ? 'from-purple-400 to-pink-400' : personalidadActual.color}`}>
                NAKAMA AI
              </span>
            </h1>
          </div>

          <Link href="/nakamatv">
            <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:scale-105 transition-all shadow-lg">
              <Tv className="w-5 h-5" />
              NAKAMA TV
            </button>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="p-2 glass-light rounded-full hover:bg-white/10 transition-all">
                <User className="w-5 h-5 text-white/70" />
              </button>
            </Link>
            
            <Link href="/ajustes">
              <button className="p-2 glass-light rounded-full hover:bg-white/10 transition-all">
                <Settings className="w-5 h-5 text-white/70" />
              </button>
            </Link>
          </div>
        </header>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensajes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a NAKAMA AI!</h2>
                <p className="text-white/50">Crea un nuevo chat para comenzar</p>
              </div>
            </div>
          ) : (
            mensajes.map((msg, i) => (
              <div key={i} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.rol === 'user' 
                    ? `bg-gradient-to-r ${usandoPersonaje ? 'from-purple-500 to-pink-500' : personalidadActual.color} text-white` 
                    : 'glass-light text-white/90'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.contenido}</p>
                </div>
              </div>
            ))
          )}
          {cargando && (
            <div className="flex justify-start">
              <div className="glass-light rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input con Selectores */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
          <div className="flex gap-2 mb-3">
            {/* Selector Personalidad */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMostrarPersonalidad(!mostrarPersonalidad)
                  setMostrarPersonaje(false)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${personalidadActual.color} text-white text-sm shadow-lg ${usandoPersonaje ? 'opacity-50' : ''}`}
                disabled={usandoPersonaje}
              >
                <span>{personalidadActual.emoji}</span>
                <span>{personalidadActual.nombre}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {mostrarPersonalidad && !usandoPersonaje && (
                <div className="absolute bottom-full left-0 mb-2 w-48 glass rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                  {PERSONALIDADES.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { 
                        setPersonalidad(p.id)
                        setPersonaje('ninguno')
                        setPersonajePersonalizado(null)
                        setMostrarPersonalidad(false) 
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-all"
                    >
                      <span>{p.emoji}</span>
                      <span>{p.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selector Personaje */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMostrarPersonaje(!mostrarPersonaje)
                  setMostrarPersonalidad(false)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-all ${
                  usandoPersonaje 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg' 
                    : 'glass-light hover:bg-white/10'
                }`}
              >
                <span>{personajeActual.emoji}</span>
                <span>{personajeActual.nombre}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {mostrarPersonaje && (
                <div className="absolute bottom-full left-0 mb-2 w-80 glass rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-white/10">
                    <input
                      type="text"
                      placeholder="Buscar o escribir personaje (ej: Zero Two, Senku...)"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-pink-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const valor = (e.target as HTMLInputElement).value
                          if (valor.trim()) {
                            setPersonaje('custom')
                            setPersonajePersonalizado({
                              id: 'custom',
                              nombre: valor,
                              emoji: '🎭',
                              anime: 'Personalizado',
                              frase: ''
                            })
                            setMostrarPersonaje(false)
                          }
                        }
                      }}
                    />
                    <p className="text-white/40 text-xs mt-2">Presiona Enter para usar personaje personalizado</p>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs text-white/40 px-2 py-1">POPULARES</p>
                      {PERSONAJES.filter(p => p.id !== 'ninguno').map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { 
                            setPersonaje(p.id)
                            setPersonajePersonalizado(null)
                            setMostrarPersonaje(false) 
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all ${
                            personaje === p.id ? 'bg-white/10 border-l-2 border-l-pink-400' : ''
                          }`}
                        >
                          <span className="text-lg">{p.emoji}</span>
                          <div className="text-left flex-1">
                            <p className="font-medium">{p.nombre}</p>
                            <p className="text-xs text-white/50">{p.anime}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-white/10 p-2">
                      <button
                        type="button"
                        onClick={() => { 
                          setPersonaje('ninguno')
                          setPersonajePersonalizado(null)
                          setMostrarPersonaje(false) 
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <span className="text-lg">🤖</span>
                        <div className="text-left">
                          <p className="font-medium">Ninguno</p>
                          <p className="text-xs text-white/50">Usar personalidad seleccionada</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <Link href="/generador">
              <button type="button" className="p-2 glass-light rounded-xl hover:bg-white/10 transition-all">
                <Wand2 className="w-5 h-5 text-pink-400" />
              </button>
            </Link>
            
            <button 
              type="button" 
              onClick={() => setMostrarSubida(true)}
              className="p-2 glass-light rounded-xl hover:bg-white/10 transition-all relative"
            >
              <Paperclip className="w-5 h-5 text-cyan-400" />
              {archivosAdjuntos.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-white text-[10px] flex items-center justify-center">
                  {archivosAdjuntos.length}
                </span>
              )}
            </button>
            
            {/* Asistente de Voz */}
            <VoiceAssistant 
              onTranscript={(text) => setInput(text)} 
              onSpeak={setSpeakFunction}
            />
          </div>

          {/* Input de texto */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={usandoPersonaje 
                ? `Escribe un mensaje... (hablando como ${personajeActual.nombre})` 
                : `Escribe un mensaje... (modo ${personalidadActual.nombre})`
              }
              className="flex-1 px-4 py-3 rounded-xl glass-light text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              disabled={cargando}
            />
            <button
              type="submit"
              disabled={cargando || !input.trim() || !chatActual}
              className={`px-6 py-3 bg-gradient-to-r ${usandoPersonaje ? 'from-purple-500 to-pink-500' : personalidadActual.color} text-white rounded-xl font-medium disabled:opacity-50 hover:scale-105 transition-all`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </main>

      {/* Modal de Subida de Archivos */}
      {mostrarSubida && (
        <SubidaArchivos 
          onArchivoSubido={(contenido, tipo, nombre) => {
            setArchivosAdjuntos(prev => [...prev, { contenido, tipo, nombre }])
          }}
          onClose={() => setMostrarSubida(false)}
        />
      )}
    </div>
  )
}
