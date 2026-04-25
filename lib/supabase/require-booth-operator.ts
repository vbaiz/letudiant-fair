import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from './server'

/**
 * Verify that the caller is an authenticated L'Étudiant team member who is
 * authorized to operate the Score Booth at a fair.
 *
 * Currently this is gated to role = 'admin' (L'Étudiant staff). If we later
 * introduce a dedicated 'booth_operator' role, only this file needs to change.
 *
 * Usage in a Route Handler:
 *   const guard = await requireBoothOperator()
 *   if (guard.error) return guard.error
 *   // guard.userId is the operator uid — safe to stamp on captures
 */
export async function requireBoothOperator(): Promise<
  | { error: NextResponse; userId?: never; role?: never }
  | { error?: never; userId: string; role: string }
> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      }
    }

    let role = (user.user_metadata?.role ?? null) as string | null

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.role) role = profile.role

    // Score Booth operators must be L'Étudiant staff (admin). When a dedicated
    // 'booth_operator' role is introduced, accept it here.
    const ALLOWED = ['admin', 'booth_operator']
    if (!role || !ALLOWED.includes(role)) {
      return {
        error: NextResponse.json(
          { error: 'Forbidden — Score Booth operators only' },
          { status: 403 }
        ),
      }
    }

    return { userId: user.id, role }
  } catch (err) {
    console.error('[requireBoothOperator]', err)
    return {
      error: NextResponse.json({ error: 'Server error' }, { status: 500 }),
    }
  }
}
