import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { LeadRow } from '@/lib/supabase/types'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: Partial<LeadRow> = {
    exported_by: user.email ?? null,
    exported_at: new Date().toISOString(),
  }

  const { error } = await (supabase
    .from('leads')
    .update(payload as never)
    .eq('id', leadId))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
