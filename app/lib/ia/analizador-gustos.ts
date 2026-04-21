import { createClient } from '../supabase/client'

interface GustoDetectado {
  categoria: 'genero' | 'estudio' | 'personaje' | 'anime' | 'tema'
  valor: string
  confianza: number
}

// Base de conocimiento de géneros de anime
const GENEROS_ANIME = [
  'accion', 'aventura', 'comedia', 'drama', 'fantasia', 'horror',
  'misterio', 'romance', 'ciencia ficcion', 'slice of life', 'deportes',
  'sobrenatural', 'historico', 'militar', 'mecha', 'shonen', 'seinen',
  'shojo', 'josei', 'isekai', 'psicologico', 'thriller'
]

// Base de conocimiento de estudios
const ESTUDIOS_ANIME = [
  'mappa', 'ufotable', 'kyoto animation', 'wit studio', 'bones',
  'madhouse', 'toei animation', 'a-1 pictures', 'trigger', 'shaft',
  'studio ghibli', 'pierrot', 'jc staff', 'david production'
]

// Base de personajes populares
const PERSONAJES_POPULARES = [
  'goku', 'luffy', 'naruto', 'levi', 'eren', 'mikasa', 'saitama',
  'light', 'lelouch', 'edward', 'alphonse', 'senku', 'anya', 'gojo',
  'tanjiro', 'nezuko', 'zenitsu', 'inosuke', 'rengoku', 'makima',
  'denji', 'power', 'thorfinn', 'askeladd', 'guts', 'griffith'
]

export class AnalizadorGustos {
  private supabase = createClient()
  
  analizarMensaje(mensaje: string): GustoDetectado[] {
    const gustos: GustoDetectado[] = []
    const texto = mensaje.toLowerCase()
    
    GENEROS_ANIME.forEach(genero => {
      if (texto.includes(genero)) {
        gustos.push({ categoria: 'genero', valor: genero, confianza: 0.8 })
      }
    })
    
    ESTUDIOS_ANIME.forEach(estudio => {
      if (texto.includes(estudio)) {
        gustos.push({ categoria: 'estudio', valor: estudio, confianza: 0.9 })
      }
    })
    
    PERSONAJES_POPULARES.forEach(personaje => {
      if (texto.includes(personaje)) {
        gustos.push({ categoria: 'personaje', valor: personaje, confianza: 0.85 })
      }
    })
    
    const mencionAnime = texto.match(/(?:me gusta|amo|recomiendo|vi|estoy viendo)\s+([a-z0-9\s]+?)(?:\.|,|$)/)
    if (mencionAnime) {
      gustos.push({ categoria: 'anime', valor: mencionAnime[1].trim(), confianza: 0.7 })
    }
    
    return gustos
  }
  
  async guardarGustos(usuarioId: string, gustos: GustoDetectado[]) {
    for (const gusto of gustos) {
      if (gusto.confianza > 0.6) {
        await this.supabase
          .from('gustos_usuario')
          .upsert({
            usuario_id: usuarioId,
            categoria: gusto.categoria,
            valor: gusto.valor,
            peso: Math.round(gusto.confianza * 10)
          }, { onConflict: 'usuario_id, categoria, valor' })
      }
    }
  }
  
  async obtenerGustosUsuario(usuarioId: string) {
    const { data } = await this.supabase
      .from('gustos_usuario')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('peso', { ascending: false })
    
    return data || []
  }
  
  async obtenerTendenciasGlobales(categoria?: string) {
    let query = this.supabase
      .from('inteligencia_colectiva')
      .select('*')
      .order('peso_global', { ascending: false })
      .limit(20)
    
    if (categoria) {
      query = query.eq('categoria', categoria)
    }
    
    const { data } = await query
    return data || []
  }
  
  async generarPromptEnriquecido(usuarioId: string, basePrompt: string): Promise<string> {
    const gustos = await this.obtenerGustosUsuario(usuarioId)
    const tendencias = await this.obtenerTendenciasGlobales()
    
    if (gustos.length === 0 && tendencias.length === 0) {
      return basePrompt
    }
    
    let contextoAdicional = '\n\n--- CONTEXTO DEL USUARIO ---\n'
    
    if (gustos.length > 0) {
      const gustosStr = gustos.slice(0, 5).map(g => `${g.categoria}: ${g.valor}`).join(', ')
      contextoAdicional += `Gustos detectados: ${gustosStr}\n`
    }
    
    if (tendencias.length > 0) {
      const tendenciasStr = tendencias.slice(0, 5).map(t => `${t.valor} (popular)`).join(', ')
      contextoAdicional += `Tendencias globales: ${tendenciasStr}\n`
    }
    
    contextoAdicional += 'Usa esta información para personalizar tus respuestas.\n'
    
    return basePrompt + contextoAdicional
  }
}