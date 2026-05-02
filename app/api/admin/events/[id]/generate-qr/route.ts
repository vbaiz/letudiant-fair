import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/require-admin'
import QRCode from 'qrcode'

/**
 * POST /api/admin/events/[id]/generate-qr
 *
 * Generates QR codes for an event in two modes:
 *   - mode=event   (default): one entry + one exit QR for the salon itself.
 *                              Stored on the events table.
 *   - mode=students: one entry + one exit QR per registered student.
 *                    Stored on the event_students table.
 *
 * The event-level QRs work even when no student is registered.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const { id: eventId } = await params
    const { searchParams } = new URL(request.url)
    const mode = (searchParams.get('mode') ?? 'event') as 'event' | 'students'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // ── Mode 1: event-level QR ─────────────────────────────────────────────
    if (mode === 'event') {
      const entryPayload = `event:${eventId}|type:entry`
      const exitPayload  = `event:${eventId}|type:exit`

      const [entry_qr, exit_qr] = await Promise.all([
        QRCode.toDataURL(entryPayload),
        QRCode.toDataURL(exitPayload),
      ])

      const { data, error } = await supabase
        .from('events')
        .update({ entry_qr, exit_qr, updated_at: new Date().toISOString() })
        .eq('id', eventId)
        .select('id, entry_qr, exit_qr')
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, mode, data })
    }

    // ── Mode 2: per-student QRs (kept for compatibility) ───────────────────
    const { data: students, error: studentsError } = await supabase
      .from('event_students')
      .select('id, user_id')
      .eq('event_id', eventId)

    if (studentsError) throw studentsError
    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        mode,
        message: 'No students registered yet',
        count: 0,
      })
    }

    const updates = await Promise.all(
      students.map(async (student) => {
        const entryPayload = `event:${eventId}|student:${student.user_id}|type:entry`
        const exitPayload  = `event:${eventId}|student:${student.user_id}|type:exit`
        const [entry_qr, exit_qr] = await Promise.all([
          QRCode.toDataURL(entryPayload),
          QRCode.toDataURL(exitPayload),
        ])
        return { id: student.id, entry_qr, exit_qr }
      })
    )

    for (const u of updates) {
      const { error } = await supabase
        .from('event_students')
        .update({ entry_qr: u.entry_qr, exit_qr: u.exit_qr })
        .eq('id', u.id)
      if (error) throw error
    }

    return NextResponse.json({ success: true, mode, count: students.length })
  } catch (err: unknown) {
    console.error('[POST /api/admin/events/[id]/generate-qr]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
