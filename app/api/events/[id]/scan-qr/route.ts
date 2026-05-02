import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * POST /api/events/[id]/scan-qr
 *
 * Accepts QR payloads in two formats:
 *   - "event:<eventId>|type:<entry|exit>"                 (event-level QR)
 *   - "event:<eventId>|student:<userId>|type:<entry|exit>" (per-student QR)
 *
 * Behaviour:
 *   - Event-level: requires a logged-in student. Looks up that student's
 *     event_students row (or creates one) and marks the scan.
 *   - Per-student: marks the row matching event_id + user_id from the payload.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    void (await params) // satisfy Next.js 16 route validator
    const { qrData } = await request.json()
    if (!qrData) return NextResponse.json({ error: 'QR data required' }, { status: 400 })

    // Try per-student format first.
    const studentMatch = qrData.match(/^event:([^|]+)\|student:([^|]+)\|type:(entry|exit)$/)
    const eventMatch   = qrData.match(/^event:([^|]+)\|type:(entry|exit)$/)
    if (!studentMatch && !eventMatch) {
      return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 })
    }

    const eventId  = (studentMatch?.[1] ?? eventMatch?.[1]) as string
    const scanType = (studentMatch?.[3] ?? eventMatch?.[2]) as 'entry' | 'exit'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let userId: string
    if (studentMatch) {
      userId = studentMatch[2]
    } else {
      // Event-level QR: rely on the caller's auth session to identify the student.
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      userId = user.id
    }

    // Find or create the event_students row.
    let { data: eventStudent } = await supabase
      .from('event_students')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!eventStudent) {
      const { data: created, error: createErr } = await supabase
        .from('event_students')
        .insert({ event_id: eventId, user_id: userId })
        .select('id')
        .single()
      if (createErr || !created) {
        return NextResponse.json({ error: 'Could not create registration' }, { status: 500 })
      }
      eventStudent = created
    }

    const scanColumn = scanType === 'entry' ? 'scanned_entry' : 'scanned_exit'
    const { error: updateError } = await supabase
      .from('event_students')
      .update({ [scanColumn]: true, updated_at: new Date().toISOString() })
      .eq('id', eventStudent.id)
    if (updateError) throw updateError

    // Audit trail (best-effort).
    await supabase.from('event_scans').insert({
      event_id: eventId,
      user_id: userId,
      scan_type: scanType,
    })

    return NextResponse.json({
      success: true,
      message: scanType === 'entry' ? 'Entrée enregistrée' : 'Sortie enregistrée',
      type: scanType,
      eventId,
      userId,
    })
  } catch (err: unknown) {
    console.error('[POST /api/events/[id]/scan-qr]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
