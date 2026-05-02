import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/require-admin'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const { id: eventId } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await supabase
      .from('event_exhibitors')
      .select('id, event_id, school_id, schools(name), registered_at')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: (data || []).map((ex: any) => ({
        id: ex.id,
        event_id: ex.event_id,
        school_id: ex.school_id,
        school_name: ex.schools?.name || 'Unknown',
        registered_at: ex.registered_at,
      })),
    })
  } catch (err: unknown) {
    console.error('[GET /api/admin/events/[id]/exhibitors]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

/** POST /api/admin/events/[id]/exhibitors — manually add an exhibitor (school). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const { id: eventId } = await params
    const { school_id } = await request.json()
    if (!school_id) return NextResponse.json({ error: 'school_id required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Duplicate check
    const { data: existing } = await supabase
      .from('event_exhibitors')
      .select('id')
      .eq('event_id', eventId)
      .eq('school_id', school_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Exposant déjà inscrit' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('event_exhibitors')
      .insert({ event_id: eventId, school_id })
      .select('id, event_id, school_id, schools(name), registered_at')
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data: {
          id: data.id,
          event_id: data.event_id,
          school_id: data.school_id,
          school_name: (data as any).schools?.name || 'Unknown',
          registered_at: data.registered_at,
        },
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    console.error('[POST /api/admin/events/[id]/exhibitors]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const { searchParams } = new URL(request.url)
    const exhibitorId = searchParams.get('exhibitor_id')
    if (!exhibitorId) return NextResponse.json({ error: 'Exhibitor ID required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabase
      .from('event_exhibitors')
      .delete()
      .eq('id', exhibitorId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[DELETE /api/admin/events/[id]/exhibitors]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
