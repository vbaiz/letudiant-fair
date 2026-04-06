import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { eventId, standId, sessionId, channel, dwellEstimate } = body

  const { data, error } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      event_id: eventId,
      stand_id: standId ?? null,
      session_id: sessionId ?? null,
      channel,
      dwell_estimate: dwellEstimate ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ scanId: data.id })
}
