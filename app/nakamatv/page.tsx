'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Play, Star, Tv, ArrowLeft, Loader2, TrendingUp, Heart, 
  Grid, List, Clock, ExternalLink, Maximize2, SkipBack, SkipForward, AlertCircle, Server
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// ============================================
// TIPOS
// ============================================
interface Anime {
  mal_id: number
  title: string
  image: string
  synopsis: string
  episodes: number
  score: number
  status: string
  year: number
}

interface Episode {
  id: string
  number: number
  title: string
}

// ============================================
// FILTROS
// ============================================
const FILTROS = [
  { id: 'tendencias', nombre: '🔥 Tendencias', icono: TrendingUp },
  { id: 'airing', nombre: '📺 En Emisión', icono: Play },
  { id: 'upcoming', nombre: '⏳ Próximamente', icono: Clock },
  { id: 'favoritos', nombre: '❤️ Favoritos', icono: Heart },
]

// ============================================
// SERVIDORES CONFIABLES (CON ANUNCIOS MÍNIMOS)
// ============================================
const SERVIDORES = [
  { name: 'Streamtape', getUrl: (slug: string, ep: number) => `https://streamtape.com/e/${slug}-episodio-${ep}`, anuncios: '1' },
  { name: 'Doodstream', getUrl: (slug: string, ep: number) => `https://dood.ws/e/${slug}-episodio-${ep}`, anuncios: '1-2' },
]

export default function NakamaTVPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroActivo, setFiltroActivo] = useState('tendencias')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [tieneMas, setTieneMas] = useState(true)
  
  const [animeSeleccionado, setAnimeSeleccionado] = useState<Anime | null>(null)
  const [episodios, setEpisodios] = useState<Episode[]>([])
  const [cargandoEpisodios, setCargandoEpisodios] = useState(false)
  
  // Reproductor
  const [episodioActual, setEpisodioActual] = useState<Episode | null>(null)
  const [servidorActivo, setServidorActivo] = useState(0)
  const [iframeUrl, setIframeUrl] = useState<string>('')
  const [cargandoVideo, setCargandoVideo] = useState(false)
  const [errorVideo, setErrorVideo] = useState<string | null>(null)
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  
  const [favoritos, setFavoritos] = useState<Anime[]>([])
  const [notificacion, setNotificacion] = useState<string | null>(null)
  
  const [vistaGrid, setVistaGrid] = useState(true)
  const contenedorVideoRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Cargar animes
  useEffect(() => {
    setAnimeSeleccionado(null)
    cargarAnimes()
    cargarFavoritos()
  }, [filtroActivo])

  useEffect(() => {
    if (cargando || cargandoMas || !tieneMas) return
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) cargarMas() },
      { threshold: 0.5 }
    )
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current)
    return () => observerRef.current?.disconnect()
  }, [cargando, cargandoMas, tieneMas, pagina])

  const cargarAnimes = async (reset = true) => {
    if (reset) { setCargando(true); setPagina(1) } else setCargandoMas(true)
    try {
      let url = ''
      const page = reset ? 1 : pagina + 1
      if (filtroActivo === 'tendencias') url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=24`
      else if (filtroActivo === 'airing') url = `https://api.jikan.moe/v4/seasons/now?page=${page}&limit=24`
      else if (filtroActivo === 'upcoming') url = `https://api.jikan.moe/v4/seasons/upcoming?page=${page}&limit=24`
      else if (filtroActivo === 'favoritos') {
        setAnimes(favoritos)
        setCargando(false); setCargandoMas(false); setTieneMas(false)
        return
      }
      if (url) {
        const res = await fetch(url)
        const data = await res.json()
        const nuevos = data.data.map((a: any) => ({
          mal_id: a.mal_id,
          title: a.title,
          image: a.images.jpg.large_image_url || a.images.jpg.image_url,
          synopsis: a.synopsis,
          episodes: a.episodes,
          score: a.score,
          status: a.status,
          year: a.year
        }))
        if (reset) setAnimes(nuevos)
        else setAnimes(prev => [...prev, ...nuevos])
        setPagina(page)
        setTieneMas(data.pagination?.has_next_page || false)
      }
    } catch (error) { console.error(error) }
    finally { setCargando(false); setCargandoMas(false) }
  }

  const cargarMas = () => { if (!cargandoMas && tieneMas && filtroActivo !== 'favoritos') cargarAnimes(false) }

  const buscarAnimes = async () => {
    if (!busqueda.trim()) { cargarAnimes(); return }
    setCargando(true)
    setAnimeSeleccionado(null)
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(busqueda)}&limit=24&sfw=true`)
      const data = await res.json()
      const resultados = data.data.map((a: any) => ({
        mal_id: a.mal_id, title: a.title,
        image: a.images.jpg.large_image_url || a.images.jpg.image_url,
        synopsis: a.synopsis, episodes: a.episodes, score: a.score,
        status: a.status, year: a.year
      }))
      setAnimes(resultados)
      setTieneMas(false)
    } catch (error) { console.error(error) }
    finally { setCargando(false) }
  }

  // Favoritos
  const cargarFavoritos = () => {
    const saved = localStorage.getItem('nakama_favoritos_anime')
    if (saved) try { setFavoritos(JSON.parse(saved)) } catch { setFavoritos([]) }
  }
  const guardarFavoritos = (nuevos: Anime[]) => {
    setFavoritos(nuevos)
    localStorage.setItem('nakama_favoritos_anime', JSON.stringify(nuevos))
    if (filtroActivo === 'favoritos') setAnimes(nuevos)
  }
  const toggleFavorito = (anime: Anime, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const esFav = favoritos.some(f => f.mal_id === anime.mal_id)
    const nuevos = esFav ? favoritos.filter(f => f.mal_id !== anime.mal_id) : [...favoritos, anime]
    guardarFavoritos(nuevos)
    mostrarNotificacion(esFav ? `❌ Eliminado: ${anime.title}` : `❤️ Agregado: ${anime.title}`)
  }
  const esFavorito = (id: number) => favoritos.some(f => f.mal_id === id)

  // Episodios
  const seleccionarAnime = async (anime: Anime) => {
    setAnimeSeleccionado(anime)
    setEpisodioActual(null)
    setIframeUrl('')
    setErrorVideo(null)
    setCargandoEpisodios(true)
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${anime.mal_id}/episodes`)
      if (res.ok) {
        const data = await res.json()
        setEpisodios(data.data.slice(0, 24).map((e: any) => ({ id: e.mal_id.toString(), number: e.mal_id, title: e.title || `Episodio ${e.mal_id}` })))
      } else {
        const max = Math.min(anime.episodes || 12, 24)
        setEpisodios(Array.from({ length: max }, (_, i) => ({ id: `${anime.mal_id}-${i+1}`, number: i+1, title: `Episodio ${i+1}` })))
      }
    } catch { 
      const max = Math.min(anime.episodes || 12, 24)
      setEpisodios(Array.from({ length: max }, (_, i) => ({ id: `${anime.mal_id}-${i+1}`, number: i+1, title: `Episodio ${i+1}` })))
    } finally { setCargandoEpisodios(false) }
  }

  const reproducirEpisodio = (episodio: Episode) => {
    if (!animeSeleccionado) return
    setEpisodioActual(episodio)
    setServidorActivo(0)
    setCargandoVideo(true)
    setErrorVideo(null)
    
    const slug = animeSeleccionado.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const url = SERVIDORES[0].getUrl(slug, episodio.number)
    setIframeUrl(url)
    
    setTimeout(() => setCargandoVideo(false), 1500)
  }

  const cambiarServidor = (index: number) => {
    if (!animeSeleccionado || !episodioActual) return
    setServidorActivo(index)
    setCargandoVideo(true)
    setErrorVideo(null)
    
    const slug = animeSeleccionado.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const url = SERVIDORES[index].getUrl(slug, episodioActual.number)
    setIframeUrl(url)
    
    setTimeout(() => setCargandoVideo(false), 1000)
  }

  const cambiarEpisodio = (direccion: 'prev' | 'next') => {
    if (!episodioActual || episodios.length === 0) return
    const index = episodios.findIndex(e => e.id === episodioActual.id)
    if (direccion === 'prev' && index > 0) reproducirEpisodio(episodios[index - 1])
    else if (direccion === 'next' && index < episodios.length - 1) reproducirEpisodio(episodios[index + 1])
  }

  const handleIframeError = () => {
    if (servidorActivo < SERVIDORES.length - 1) {
      setErrorVideo(`${SERVIDORES[servidorActivo].name} falló. Probando ${SERVIDORES[servidorActivo + 1].name}...`)
      cambiarServidor(servidorActivo + 1)
    } else {
      setErrorVideo('Todos los servidores fallaron. Usa los enlaces externos.')
    }
  }

  const togglePantallaCompleta = () => {
    if (!contenedorVideoRef.current) return
    if (!document.fullscreenElement) {
      contenedorVideoRef.current.requestFullscreen()
      setPantallaCompleta(true)
    } else {
      document.exitFullscreen()
      setPantallaCompleta(false)
    }
  }

  const verEnSitio = (sitio: 'animeflv' | 'jkanime' | 'google') => {
    if (!animeSeleccionado) return
    const query = encodeURIComponent(animeSeleccionado.title)
    if (sitio === 'animeflv') window.open(`https://www3.animeflv.net/browse?q=${query}`, '_blank')
    else if (sitio === 'jkanime') window.open(`https://jkanime.net/buscar/${query}/`, '_blank')
    else window.open(`https://www.google.com/search?q=ver+${query}+online`, '_blank')
  }

  const mostrarNotificacion = (mensaje: string) => {
    setNotificacion(mensaje)
    setTimeout(() => setNotificacion(null), 2500)
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <AnimatePresence>
        {notificacion && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass border border-pink-400/30 px-6 py-3 rounded-full shadow-xl">
            <p className="text-white">{notificacion}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="glass-light p-2 rounded-xl hover:bg-white/10"><ArrowLeft className="w-5 h-5 text-white/70" /></Link>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Tv className="w-6 h-6 text-pink-400" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">NAKAMA TV</span></h1>
            </div>
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarAnimes()} placeholder="Buscar anime..." className="w-full pl-10 pr-4 py-2 rounded-xl glass-light text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50" />
              </div>
              <button onClick={buscarAnimes} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium">Buscar</button>
            </div>
            <button onClick={() => setVistaGrid(!vistaGrid)} className="p-2 glass-light rounded-xl text-white/70 hover:bg-white/10">{vistaGrid ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}</button>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {FILTROS.map(filtro => { const Icono = filtro.icono; return (
              <button key={filtro.id} onClick={() => { setFiltroActivo(filtro.id); setBusqueda('') }} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${filtroActivo === filtro.id ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'glass-light text-white/70 hover:bg-white/10'}`}><Icono className="w-4 h-4" />{filtro.nombre}</button>
            )})}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {animeSeleccionado ? (
          <div className="space-y-6">
            <button onClick={() => setAnimeSeleccionado(null)} className="text-white/60 hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Volver</button>
            
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-48 h-64 rounded-xl overflow-hidden mx-auto md:mx-0">
                  <Image src={animeSeleccionado.image} alt={animeSeleccionado.title} fill className="object-cover" />
                  <button onClick={(e) => toggleFavorito(animeSeleccionado, e)} className="absolute top-2 right-2 p-2 glass-light rounded-full hover:bg-pink-500/20"><Heart className={`w-4 h-4 ${esFavorito(animeSeleccionado.mal_id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`} /></button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{animeSeleccionado.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-3"><span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{animeSeleccionado.score?.toFixed(1) || 'N/A'}</span><span>{animeSeleccionado.year || '—'}</span><span>{animeSeleccionado.episodes || '?'} episodios</span></div>
                  <p className="text-white/70 text-sm line-clamp-3">{animeSeleccionado.synopsis || 'Sin descripción.'}</p>
                </div>
              </div>
            </div>

            {episodioActual && (
              <div className="glass rounded-2xl overflow-hidden border border-white/10">
                <div ref={contenedorVideoRef} className="relative bg-black">
                  {cargandoVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <Loader2 className="w-12 h-12 animate-spin text-pink-400" />
                    </div>
                  )}
                  
                  {errorVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 p-4">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                        <p className="text-white mb-3">{errorVideo}</p>
                      </div>
                    </div>
                  )}
                  
                  {iframeUrl && !errorVideo && (
                    <iframe
                      src={iframeUrl}
                      className="w-full aspect-video"
                      allowFullScreen
                      allow="autoplay; encrypted-media; picture-in-picture"
                      referrerPolicy="no-referrer"
                      onError={handleIframeError}
                    />
                  )}

                  <div className="bg-black/80 backdrop-blur-sm p-3">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <button onClick={() => cambiarEpisodio('prev')} className="p-2 hover:bg-white/10 rounded-full">
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button onClick={() => cambiarEpisodio('next')} className="p-2 hover:bg-white/10 rounded-full">
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <button onClick={togglePantallaCompleta} className="p-2 hover:bg-white/10 rounded-full ml-auto">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <Server className="w-4 h-4 text-white/50 flex-shrink-0" />
                      {SERVIDORES.map((servidor, i) => (
                        <button
                          key={i}
                          onClick={() => cambiarServidor(i)}
                          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                            i === servidorActivo
                              ? 'bg-pink-500 text-white'
                              : 'glass-light text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {servidor.name} ({servidor.anuncios} anuncio{servidor.anuncios !== '1' ? 's' : ''})
                        </button>
                      ))}
                    </div>
                    <p className="text-white/40 text-[10px] mt-2 text-center">
                      Cierra los anuncios para ver el video. Si no carga, prueba el otro servidor.
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-white/10">
                  <p className="font-medium">
                    {animeSeleccionado.title} - Episodio {episodioActual.number}
                  </p>
                  <p className="text-sm text-white/50">{episodioActual.title}</p>
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-medium mb-4 flex items-center gap-2"><ExternalLink className="w-4 h-4 text-pink-400" />Ver en sitios externos</h3>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => verEnSitio('animeflv')} className="flex-1 min-w-[120px] py-3 glass-light rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10">AnimeFLV</button>
                <button onClick={() => verEnSitio('jkanime')} className="flex-1 min-w-[120px] py-3 glass-light rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10">JKAnime</button>
                <button onClick={() => verEnSitio('google')} className="flex-1 min-w-[120px] py-3 glass-light rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10">Google</button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2"><Play className="w-4 h-4 text-pink-400" />Episodios</h3>
              {cargandoEpisodios ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div> : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1">
                  {episodios.map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => reproducirEpisodio(ep)}
                      className={`glass-light p-3 rounded-xl text-left transition-all border ${
                        episodioActual?.id === ep.id ? 'border-pink-400 bg-pink-500/20' : 'border-transparent hover:bg-white/10'
                      }`}
                    >
                      <p className="font-medium text-sm">Ep {ep.number}</p>
                      <p className="text-xs text-white/50 truncate">{ep.title}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Grid de animes */
          <>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold flex items-center gap-2">{FILTROS.find(f => f.id === filtroActivo)?.nombre || 'Animes'}</h2><p className="text-xs text-white/40">{animes.length} resultados</p></div>
            {cargando ? <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-pink-400" /></div> : animes.length === 0 ? <div className="text-center py-16 text-white/50"><Search className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No se encontraron animes</p></div> : vistaGrid ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {animes.map(anime => (
                    <motion.div key={anime.mal_id} whileHover={{ scale: 1.02 }} className="glass rounded-xl overflow-hidden border border-white/10 hover:border-pink-400/30 transition-all group cursor-pointer" onClick={() => seleccionarAnime(anime)}>
                      <div className="relative aspect-[2/3]">
                        <Image src={anime.image} alt={anime.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4"><span className="glass-light px-4 py-2 rounded-full text-sm flex items-center gap-1"><Play className="w-3 h-3" /> Ver</span></div>
                        <button onClick={(e) => toggleFavorito(anime, e)} className="absolute top-2 right-2 p-2 glass-light rounded-full hover:bg-pink-500/20 z-10"><Heart className={`w-4 h-4 ${esFavorito(anime.mal_id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`} /></button>
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{anime.score?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div className="p-3"><p className="font-medium text-sm line-clamp-1">{anime.title}</p><p className="text-xs text-white/50 mt-1">{anime.episodes || '?'} eps • {anime.year || ''}</p></div>
                    </motion.div>
                  ))}
                </div>
                {cargandoMas && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-pink-400" /></div>}
                <div ref={loadMoreRef} className="h-10" />
              </>
            ) : (
              <div className="space-y-2">
                {animes.map(anime => (
                  <motion.div key={anime.mal_id} whileHover={{ scale: 1.01 }} className="glass rounded-xl p-3 border border-white/10 hover:border-pink-400/30 transition-all cursor-pointer flex items-center gap-4" onClick={() => seleccionarAnime(anime)}>
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0"><Image src={anime.image} alt={anime.title} fill className="object-cover" /></div>
                    <div className="flex-1"><p className="font-medium">{anime.title}</p><div className="flex items-center gap-3 text-xs text-white/50"><span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{anime.score?.toFixed(1) || 'N/A'}</span><span>{anime.episodes || '?'} eps</span><span>{anime.year || ''}</span></div></div>
                    <button onClick={(e) => toggleFavorito(anime, e)} className="p-2 glass-light rounded-full hover:bg-pink-500/20"><Heart className={`w-4 h-4 ${esFavorito(anime.mal_id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`} /></button>
                  </motion.div>
                ))}
                {cargandoMas && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-pink-400" /></div>}
                <div ref={loadMoreRef} className="h-10" />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}