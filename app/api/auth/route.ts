import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { action, email, password } = await req.json()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return NextResponse.json({ success: true, data })
    }
    
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return NextResponse.json({ success: true, data })
    }
    
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}