'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowLeft, Heart, Chrome } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError(null)

    try {
      if (modo === 'registro') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('¡Registro exitoso! Revisa tu correo para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-4">
      <Link href="/" className="absolute top-6 left-6 glass-light p-2 rounded-xl hover:bg-white/10">
        <ArrowLeft className="w-5 h-5 text-white/70" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 w-full max-w-md border border-white/10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            NAKAMA AI
          </h1>
          <p className="text-white/50 text-sm mt-2">
            {modo === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-light text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-light text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={cargando}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
          >
            {cargando ? 'Cargando...' : modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </motion.button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 glass-light rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10"
          >
            <Chrome className="w-5 h-5" />
            Continuar con Google
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button
            onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
            className="ml-2 text-pink-400 hover:text-pink-300"
          >
            {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}