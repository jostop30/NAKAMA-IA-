import { createClient } from '../supabase/client'

export class MemoriaRAG {
  private supabase = createClient()
  
  async guardarMemoria(usuarioId: string, contenido: string) {
    await this.supabase.from('memoria_rag').insert({
      usuario_id: usuarioId,
      contenido,
      created_at: new Date().toISOString()
    })
  }
  
  async obtenerMemorias(usuarioId: string, limite: number = 5): Promise<string[]> {
    const { data } = await this.supabase
      .from('memoria_rag')
      .select('contenido')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(limite)
    
    return data?.map(m => m.contenido) || []
  }
  
  async obtenerContextoMemoria(usuarioId: string): Promise<string> {
    const memorias = await this.obtenerMemorias(usuarioId, 5)
    if (memorias.length === 0) return ''
    return '\n\n--- MEMORIAS DEL USUARIO ---\n' + memorias.map((m, i) => `${i+1}. ${m}`).join('\n')
  }
}