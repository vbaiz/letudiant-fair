/**
 * POST /api/booth/capture-orientation
 *
 * Captures orientation data from one of two booth sources:
 *
 *   1. Score Booth (NEW, central, L'Étudiant-managed):
 *      Body: { event_id, orientation_stage, ..., source: 'score_booth' }
 *      Auth: requires admin / booth_operator role
 *      stand_id MUST be omitted — Score Booth is not tied to a school.
 *
 *   2. School Booth (legacy, per-school):
 *      Body: { event_id, stand_id, orientation_stage, ..., source: 'school_booth' }
 *      Auth: open (service-role insert)
 *
 * Body fields (common):
 *   event_id            : uuid (required)
 *   orientation_stage   : 'exploring' | 'comparing' | 'deciding' (required)
 *   education_level     : string[]
 *   education_branches  : string[]
 *   email, phone        : optional contact
 *   optin_contact       : boolean
 *   captured_by_staff   : optional free-text label (legacy)
 *
 * Returns:
 *   { success, capture_id, message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireBoothOperator } from '@/lib/supabase/require-booth-operator'

type CaptureSource = 'score_booth' | 'school_booth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      event_id,
      stand_id,
      orientation_stage,
      education_level = [],
      education_branches = [],
      email,
      phone,
      optin_contact = false,
      captured_by_staff,
      source = 'school_booth',
    } = body as {
      event_id?: string
      stand_id?: string | null
      orientation_stage?: string
      education_level?: string[]
      education_branches?: string[]
      email?: string
      phone?: string
      optin_contact?: boolean
      captured_by_staff?: string
      source?: CaptureSource
    }

    // ─── Common validation ────────────────────────────────────────────────

    if (!event_id || !orientation_stage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: event_id, orientation_stage',
        },
        { status: 400 }
      )
    }

    if (!['exploring', 'comparing', 'deciding'].includes(orientation_stage)) {
      return NextResponse.json(
        {
          success: false,
          message: 'orientation_stage must be one of: exploring, comparing, deciding',
        },
        { status: 400 }
      )
    }

    if (!['score_booth', 'school_booth'].includes(source)) {
      return NextResponse.json(
        {
          success: false,
          message: "source must be one of: 'score_booth', 'school_booth'",
        },
        { status: 400 }
      )
    }

    if (optin_contact && !email && !phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'optin_contact requires at least email or phone',
        },
        { status: 400 }
      )
    }

    // ─── Source-specific guards ───────────────────────────────────────────

    let capturedByUserId: string | null = null

    if (source === 'score_booth') {
      // Must NOT pass stand_id; Score Booth is not bound to a school stand.
      if (stand_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'Score Booth captures must not include stand_id',
          },
          { status: 400 }
        )
      }
      // Auth gate: only L'Étudiant staff may submit Score Booth captures.
      const guard = await requireBoothOperator()
      if (guard.error) return guard.error
      capturedByUserId = guard.userId
    } else {
      // school_booth (legacy): stand_id is mandatory
      if (!stand_id) {
        return NextResponse.json(
          {
            success: false,
            message: "school_booth source requires stand_id",
          },
          { status: 400 }
        )
      }
    }

    const supabase = await createServiceClient()

    // ─── For school_booth: verify stand belongs to event ─────────────────

    if (source === 'school_booth') {
      const { data: stand } = await supabase
        .from('stands')
        .select('id, event_id')
        .eq('id', stand_id!)
        .single()

      if (!stand || stand.event_id !== event_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid stand_id or stand does not belong to event_id',
          },
          { status: 400 }
        )
      }
    } else {
      // For score_booth: verify event exists
      const { data: ev } = await supabase
        .from('events')
        .select('id')
        .eq('id', event_id)
        .single()

      if (!ev) {
        return NextResponse.json(
          { success: false, message: 'Invalid event_id' },
          { status: 400 }
        )
      }
    }

    // ─── Insert booth capture ─────────────────────────────────────────────

    const { data, error } = await supabase
      .from('booth_captures')
      .insert({
        event_id,
        stand_id: source === 'school_booth' ? stand_id : null,
        orientation_stage,
        education_level: Array.isArray(education_level) ? education_level : [],
        education_branches: Array.isArray(education_branches) ? education_branches : [],
        email: email || null,
        phone: phone || null,
        optin_contact,
        captured_by_staff: captured_by_staff || null,
        captured_by_user_id: capturedByUserId,
        source,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[booth/capture-orientation] Insert error:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to save booth capture',
        },
        { status: 500 }
      )
    }

    // ─── Success ───────────────────────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        capture_id: data.id,
        source,
        message: `Booth capture saved (${source}, ${orientation_stage})`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[booth/capture-orientation] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
