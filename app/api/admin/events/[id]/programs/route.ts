import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/require-admin'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/** GET /api/admin/events/[id]/programs — list all program entries for an event. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const { id: eventId } = await params
    const { data, error } = await svc()
      .from('event_programs')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

/** POST /api/admin/events/[id]/programs — create a program entry. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const { id: eventId } = await params
    const body = await request.json()
    if (!body.title || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'title, start_time and end_time are required' },
        { status: 400 }
      )
    }

    const { data, error } = await svc()
      .from('event_programs')
      .insert({
        event_id: eventId,
        title: body.title,
        description: body.description ?? null,
        speaker: body.speaker ?? null,
        location: body.location ?? null,
        start_time: body.start_time,
        end_time: body.end_time,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

/** PATCH /api/admin/events/[id]/programs — update a program entry. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    await params // ensure params resolved (id not used here)
    const { programId, ...patch } = await request.json()
    if (!programId) {
      return NextResponse.json({ error: 'programId required' }, { status: 400 })
    }

    const { data, error } = await svc()
      .from('event_programs')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', programId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

/** DELETE /api/admin/events/[id]/programs?program_id=X — delete a program entry. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    await params
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('program_id')
    if (!programId) {
      return NextResponse.json({ error: 'program_id required' }, { status: 400 })
    }

    const { error } = await svc().from('event_programs').delete().eq('id', programId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
