import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '../../lib/supabase/server'
import { AnalizadorGustos } from '../../lib/ia/analizador-gustos'
import { MemoriaRAG } from '../../lib/ia/memoria-rag'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { mensaje, personalidad, personaje, archivos } = await req.json()
    const supabase = await createClient()
    const analizador = new AnalizadorGustos()
    const memoriaRAG = new MemoriaRAG()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const gustosDetectados = analizador.analizarMensaje(mensaje)
      if (gustosDetectados.length > 0) {
        await analizador.guardarGustos(user.id, gustosDetectados)
      }
    }

    let prefsLenguaje = null
    if (user) {
      const { data } = await supabase
        .from('preferencias_lenguaje')
        .select('*')
        .eq('usuario_id', user.id)
        .single()
      prefsLenguaje = data
    }

    if (user) {
      await memoriaRAG.guardarMemoria(user.id, `Usuario: ${mensaje}`)
    }

    let memoriaContext = ''
    if (user) {
      memoriaContext = await memoriaRAG.obtenerContextoMemoria(user.id)
    }

    const basePrompt = `Eres NAKAMA AI, una asistente de anime con conocimientos amplios.
    CAPACIDADES: Matemáticas, ciencia, historia, programación, traducciones, clima, hora, conversiones.
    Responde de manera precisa y útil. SIEMPRE en español. 2-4 frases máximo.`

    const personalityPrompts: Record<string, string> = {
      tsundere: `${basePrompt} PERSONALIDAD TSUNDERE: Actúas molesta pero eres dulce. Usas "¡B-Baka!", "¡Hmph!", "*se sonroja*".`,
      kuudere: `${basePrompt} PERSONALIDAD KUUDERE: Fría y lógica. Usas "He analizado...". Sin emociones.`,
      shonen: `${basePrompt} PERSONALIDAD SHONEN: Energía INFINITA. Usas MAYÚSCULAS, "¡VAMOS!", "¡PLUS ULTRA!".`,
      sensei: `${basePrompt} PERSONALIDAD SENSEI: Maestro sabio. Usas "Joven saltamontes...", "Ho ho ho...".`,
      sumisa: `${basePrompt} PERSONALIDAD SUMISA: Tímida. Tartamudeas: "C-Como tú digas...", "*se sonroja*".`,
      echii: `${basePrompt} PERSONALIDAD ECHII: Coqueta. Usas "Ara ara~", "*guiña un ojo*".`,
      yandere: `${basePrompt} PERSONALIDAD YANDERE: Posesiva. Usas "Eres mío... solo mío...".`,
      esclava: `${basePrompt} PERSONALIDAD ESCLAVA: Devota. Usas "Como ordenes, mi amo...".`,
    }

    let systemPrompt = personalityPrompts[personalidad] || personalityPrompts.tsundere

    if (personaje) {
      systemPrompt = `${systemPrompt}\n\nESTÁS INTERPRETANDO A ${personaje.nombre} de ${personaje.anime || 'anime'}. 
      Habla exactamente como él/ella. ${personaje.frase ? `Usa su frase: "${personaje.frase}"` : ''}`
    }

    if (prefsLenguaje) {
      if (prefsLenguaje.palabras_clave?.length > 0) {
        systemPrompt += `\n\nPALABRAS CLAVE: Usa frecuentemente: ${prefsLenguaje.palabras_clave.join(', ')}.`
      }
      if (prefsLenguaje.frases_favoritas?.length > 0) {
        systemPrompt += `\n\nFRASES: Incorpora: ${prefsLenguaje.frases_favoritas.join(', ')}.`
      }
      if (prefsLenguaje.muletillas?.length > 0) {
        systemPrompt += `\n\nMULETILLAS: Usa "${prefsLenguaje.muletillas.join('", "')}".`
      }
      const formalidad = prefsLenguaje.nivel_formalidad
      systemPrompt += `\n\nFORMALIDAD: ${formalidad}/10. ${formalidad <= 3 ? 'Muy informal.' : formalidad <= 6 ? 'Neutral.' : 'Muy formal.'}`
    }

    if (user) {
      systemPrompt = await analizador.generarPromptEnriquecido(user.id, systemPrompt)
    }

    systemPrompt += memoriaContext

    let mensajeCompleto = mensaje
    if (archivos && archivos.length > 0) {
      mensajeCompleto += '\n\n[ARCHIVOS ADJUNTOS]\n'
      archivos.forEach((archivo: any) => {
        if (archivo.tipo === 'imagen') {
          mensajeCompleto += `- Imagen: ${archivo.nombre}\n`
        } else {
          mensajeCompleto += `- ${archivo.contenido}\n`
        }
      })
      mensajeCompleto += '\n[FIN ARCHIVOS]'
    }

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: mensajeCompleto }
      ],
      stream: true,
      temperature: 0.9,
      max_tokens: 500,
    })

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let respuestaCompleta = ''
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              respuestaCompleta += content
              controller.enqueue(encoder.encode(content))
            }
          }
          
          if (user) {
            await memoriaRAG.guardarMemoria(user.id, `NAKAMA: ${respuestaCompleta}`)
          }
          
          controller.close()
        } catch (error) {
          controller.enqueue(encoder.encode('¡Hmph! Algo falló. Intenta de nuevo, b-baka.'))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response('Error en el servidor', { status: 500 })
  }
}