'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, File, Image, FileText, Loader2 } from 'lucide-react'
import ImageNext from 'next/image'

interface SubidaArchivosProps {
  onArchivoSubido: (contenido: string, tipo: string, nombre: string) => void
  onClose: () => void
}

export default function SubidaArchivos({ onArchivoSubido, onClose }: SubidaArchivosProps) {
  const [archivos, setArchivos] = useState<File[]>([])
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setArchivos(prev => [...prev, ...acceptedFiles])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const eliminarArchivo = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index))
  }

  const procesarArchivos = async () => {
    if (archivos.length === 0) return
    
    setProcesando(true)
    setError(null)
    
    for (const archivo of archivos) {
      try {
        let contenido = ''
        let tipo = archivo.type
        
        if (tipo.startsWith('image/')) {
          const reader = new FileReader()
          contenido = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.readAsDataURL(archivo)
          })
          onArchivoSubido(contenido, 'imagen', archivo.name)
          
        } else if (tipo === 'application/pdf') {
          contenido = `[PDF: ${archivo.name}]`
          onArchivoSubido(contenido, 'pdf', archivo.name)
          
        } else if (tipo === 'text/plain') {
          contenido = await archivo.text()
          onArchivoSubido(contenido, 'texto', archivo.name)
          
        } else {
          contenido = `[Documento: ${archivo.name}]`
          onArchivoSubido(contenido, 'documento', archivo.name)
        }
      } catch (err) {
        console.error('Error procesando archivo:', err)
        setError(`Error al procesar ${archivo.name}`)
      }
    }
    
    setProcesando(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Subir archivos</h2>
          <button onClick={onClose} className="p-1 glass-light rounded-lg">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-pink-400 bg-pink-500/10' 
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/70">
            {isDragActive 
              ? 'Suelta los archivos aquí...' 
              : 'Arrastra archivos o haz clic para seleccionar'
            }
          </p>
          <p className="text-white/40 text-xs mt-2">
            Imágenes, PDF, TXT, DOC (máx. 10MB)
          </p>
        </div>

        {archivos.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-white/70 text-sm">Archivos seleccionados:</p>
            {archivos.map((archivo, index) => (
              <div key={index} className="glass-light rounded-lg p-3 flex items-center gap-3">
                {archivo.type.startsWith('image/') ? (
                  <Image className="w-5 h-5 text-pink-400" />
                ) : archivo.type === 'application/pdf' ? (
                  <FileText className="w-5 h-5 text-red-400" />
                ) : (
                  <File className="w-5 h-5 text-blue-400" />
                )}
                <span className="flex-1 text-white text-sm truncate">{archivo.name}</span>
                <span className="text-white/40 text-xs">
                  {(archivo.size / 1024).toFixed(1)} KB
                </span>
                <button 
                  onClick={() => eliminarArchivo(index)}
                  className="p-1 hover:bg-red-500/20 rounded"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 glass-light rounded-xl text-white/70 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={procesarArchivos}
            disabled={archivos.length === 0 || procesando}
            className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Enviar a NAKAMA'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}