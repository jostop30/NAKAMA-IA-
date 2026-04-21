'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

interface VoiceAssistantProps {
  onTranscript: (text: string) => void
  onSpeak?: (speakFn: (text: string) => void) => void
}

export default function VoiceAssistant({ onTranscript, onSpeak }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleListening = () => {
    if (!mounted) return
    
    if (listening) {
      SpeechRecognition.stopListening()
      setIsListening(false)
      if (transcript) {
        onTranscript(transcript)
        resetTranscript()
      }
    } else {
      resetTranscript()
      SpeechRecognition.startListening({ 
        continuous: false, 
        language: 'es-ES' 
      })
      setIsListening(true)
    }
  }

  // Función para hablar (se expone a través de onSpeak)
  const speak = (text: string) => {
    if (!mounted || !text || !voiceEnabled) return
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = 1.1
    utterance.pitch = 1.3
    window.speechSynthesis.speak(utterance)
  }

  // Exponer speak a través del prop
  useEffect(() => {
    if (onSpeak && mounted) {
      // Pasar la función speak al padre
      onSpeak(speak)
    }
  }, [onSpeak, mounted, voiceEnabled])

  useEffect(() => {
    if (!mounted) return
    if (transcript && !listening) {
      onTranscript(transcript)
      resetTranscript()
    }
  }, [transcript, listening, mounted, onTranscript, resetTranscript])

  if (!mounted || !browserSupportsSpeechRecognition) return null

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className="p-2 rounded-xl glass-light text-white/70 hover:bg-white/10 transition-all"
        title={voiceEnabled ? 'Voz activada' : 'Voz desactivada'}
      >
        {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
      
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-xl transition-all ${
          listening 
            ? 'bg-red-500/30 text-red-400 animate-pulse' 
            : 'glass-light text-white/70 hover:bg-white/10'
        }`}
        title={listening ? 'Escuchando...' : 'Hablar por voz'}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    </div>
  )
}
