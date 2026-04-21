'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Moon, Sun, User, Bell, Shield, LogOut, Palette, Volume2, Globe, Info, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export default function AjustesPage() {
  const { theme, setTheme } = useTheme()
  const [notificaciones, setNotificaciones] = useState(true)
  const [sonidos, setSonidos] = useState(true)
  const [idioma, setIdioma] = useState('es')

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="glass-light p-3 rounded-xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <h1 className="text-3xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              ⚙️ Ajustes
            </span>
          </h1>
        </div>

        {/* Secciones de ajustes */}
        <div className="space-y-4">
          {/* Apariencia */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-400" />
              Apariencia
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Tema</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                      theme === 'light' ? 'bg-pink-500 text-white' : 'glass-light text-white/70'
                    }`}
                  >
                    <Sun className="w-4 h-4" /> Claro
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                      theme === 'dark' ? 'bg-pink-500 text-white' : 'glass-light text-white/70'
                    }`}
                  >
                    <Moon className="w-4 h-4" /> Oscuro
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lenguaje - Personalización */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Lenguaje
            </h2>
            <Link 
              href="/ajustes/lenguaje"
              className="w-full text-left px-4 py-3 glass-light rounded-xl text-white/70 hover:bg-white/10 transition-all flex items-center justify-between"
            >
              <span>Personalizar forma de hablar</span>
              <span className="text-pink-400">→</span>
            </Link>
          </motion.div>

          {/* Notificaciones */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-pink-400" />
              Notificaciones
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Activar notificaciones</span>
                <button
                  onClick={() => setNotificaciones(!notificaciones)}
                  className={`w-12 h-6 rounded-full transition-all ${notificaciones ? 'bg-pink-500' : 'bg-white/20'}`}
                >
                  <motion.div 
                    className="w-5 h-5 bg-white rounded-full m-0.5"
                    animate={{ x: notificaciones ? 24 : 0 }}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Sonidos</span>
                <button
                  onClick={() => setSonidos(!sonidos)}
                  className={`w-12 h-6 rounded-full transition-all ${sonidos ? 'bg-pink-500' : 'bg-white/20'}`}
                >
                  <motion.div 
                    className="w-5 h-5 bg-white rounded-full m-0.5"
                    animate={{ x: sonidos ? 24 : 0 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Idioma */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-pink-400" />
              Idioma
            </h2>
            <select 
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="w-full p-3 rounded-xl glass-light text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            >
              <option value="es" className="bg-gray-900">🇪🇸 Español</option>
              <option value="en" className="bg-gray-900">🇺🇸 English</option>
              <option value="jp" className="bg-gray-900">🇯🇵 日本語</option>
            </select>
          </motion.div>

          {/* Privacidad */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-400" />
              Privacidad
            </h2>
            <button className="w-full text-left px-4 py-3 glass-light rounded-xl text-white/70 hover:bg-white/10 transition-all">
              Política de privacidad
            </button>
            <button className="w-full text-left px-4 py-3 glass-light rounded-xl text-white/70 hover:bg-white/10 transition-all mt-2">
              Términos de servicio
            </button>
          </motion.div>

          {/* Cuenta */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-400" />
              Cuenta
            </h2>
            <button className="w-full text-left px-4 py-3 glass-light rounded-xl text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </motion.div>

          {/* Información */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-pink-400" />
              Acerca de
            </h2>
            <p className="text-white/50 text-sm">NAKAMA AI v1.0.0</p>
            <p className="text-white/30 text-xs mt-2">© 2026 - Tu compañera de anime con IA</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}