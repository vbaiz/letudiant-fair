/**
 * /booth/score — Score Booth (central, L'Étudiant-managed)
 *
 * One booth per fair, run by L'Étudiant team.
 * Students walk up → operator captures profile → top-3 schools shown.
 *
 * Access control:
 *   Server-side guard. Only role 'admin' or 'booth_operator' may load this
 *   page. Anyone else is redirected to /login?next=/booth/score.
 *
 * Required query param:
 *   ?event_id=<uuid>   — the active fair event
 *
 * If event_id is missing, the operator sees an event-picker that shows the
 * upcoming fairs and links to the booth URL with the chosen event_id.
 */

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ScoreBoothClient from './ScoreBoothClient'

export const dynamic = 'force-dynamic'

interface ScoreBoothPageProps {
  searchParams: Promise<{ event_id?: string }>
}

export default async function ScoreBoothPage({ searchParams }: ScoreBoothPageProps) {
  const { event_id: eventId } = await searchParams

  // ─── Auth guard ─────────────────────────────────────────────────────────
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/booth/score' + (eventId ? `&event_id=${eventId}` : ''))
  }

  // Resolve role from public.users (authoritative)
  const { data: profile } = await supabase
    .from('users')
    .select('role, name, email')
    .eq('id', user.id)
    .maybeSingle()

  const role =
    (profile?.role as string | undefined) ??
    ((user.user_metadata?.role as string | undefined) ?? null)

  const ALLOWED = ['admin', 'booth_operator']
  if (!role || !ALLOWED.includes(role)) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          background: '#FEF2F2',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            background: '#FFFFFF',
            border: '1.5px solid #EF4444',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: '0 0 8px', color: '#991B1B', fontSize: '1.5rem' }}>
            Accès refusé
          </h1>
          <p style={{ margin: 0, color: '#7F1D1D', fontSize: '0.9375rem' }}>
            La Score Booth est réservée aux opérateurs L'Étudiant. Connecte-toi
            avec un compte autorisé.
          </p>
        </div>
      </main>
    )
  }

  // ─── Load events (operator may pick one if event_id is missing) ─────────
  const { data: events } = await supabase
    .from('events')
    .select('id, name, city, event_date')
    .order('event_date', { ascending: true })

  // If event_id provided, validate it exists
  let activeEvent: {
    id: string
    name: string
    city: string | null
    event_date: string | null
  } | null = null

  if (eventId) {
    activeEvent =
      events?.find((e: any) => e.id === eventId) ?? null
    if (!activeEvent) {
      return (
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              border: '1.5px solid #FECD89',
              background: '#FFF7ED',
              borderRadius: 12,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <h1 style={{ margin: '0 0 8px', color: '#92400E' }}>
              Événement introuvable
            </h1>
            <p style={{ color: '#B45309', margin: 0 }}>
              Le paramètre event_id fourni ne correspond à aucun salon.
            </p>
          </div>
        </main>
      )
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <ScoreBoothClient
      operatorName={profile?.name ?? user.email ?? 'Opérateur'}
      operatorEmail={profile?.email ?? user.email ?? ''}
      activeEvent={activeEvent}
      events={events ?? []}
    />
  )
}
