import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { computeReconciliationConfidence, type EventMakerRegistration } from '@/lib/identity/reconcile'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EventMakerRegistration
    const supabase = await createServiceClient()

    // 1. Exact email match
    const { data: emailMatch } = await supabase
      .from('users')
      .select('id, eventmaker_ids')
      .eq('email', body.email.toLowerCase())
      .maybeSingle()

    if (emailMatch) {
      const currentIds: string[] = emailMatch.eventmaker_ids ?? []
      if (!currentIds.includes(body.fairId)) {
        await supabase
          .from('users')
          .update({ eventmaker_ids: [...currentIds, body.fairId] })
          .eq('id', emailMatch.id)
      }
      return NextResponse.json({ matched: true, uid: emailMatch.id, confidence: 1.0 })
    }

    // 2. Fuzzy match — scan all users (acceptable for MVP pilot scale)
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email, name, dob, eventmaker_ids')

    let bestMatch = { confidence: 0, uid: '' }

    for (const user of allUsers ?? []) {
      const result = computeReconciliationConfidence(body, {
        email: user.email,
        name: user.name,
        dob: user.dob ?? undefined,
      })
      if (result.confidence > bestMatch.confidence) {
        bestMatch = { confidence: result.confidence, uid: user.id }
      }
    }

    if (bestMatch.confidence >= 0.85) {
      await supabase
        .from('users')
        .update({ eventmaker_ids: [body.fairId] })
        .eq('id', bestMatch.uid)
      return NextResponse.json({ matched: true, uid: bestMatch.uid, confidence: bestMatch.confidence })
    }

    // 3. No match — create a provisional Supabase Auth user + profile
    const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
      email: body.email.toLowerCase(),
      email_confirm: true,
      user_metadata: { name: `${body.firstName} ${body.lastName}`, provisional: true },
    })

    if (authError || !newAuthUser.user) {
      return NextResponse.json({ error: 'Could not create user' }, { status: 500 })
    }

    await supabase.from('users').insert({
      id: newAuthUser.user.id,
      email: body.email.toLowerCase(),
      name: `${body.firstName} ${body.lastName}`,
      role: 'student',
      eventmaker_ids: [body.fairId],
      orientation_stage: 'exploring',
      orientation_score: 0,
    })

    return NextResponse.json({ matched: false, uid: newAuthUser.user.id, provisional: true })
  } catch (error) {
    console.error('EventMaker webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
