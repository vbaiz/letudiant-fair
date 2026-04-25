'use client'

/**
 * Client side of /booth/score — full-screen booth UI for L'Étudiant operators.
 *
 * Two modes:
 *   1. No active event → render an event picker grid.
 *   2. Active event    → render the BoothCaptureFormV2 in score_booth mode.
 *
 * The auth check + event loading happens in the server component (page.tsx).
 * This file is purely presentational + the form.
 */

import { useRouter } from 'next/navigation'
import BoothCaptureFormV2 from '@/components/features/BoothCaptureFormV2'

interface EventLite {
  id: string
  name: string
  city: string | null
  event_date: string | null
}

interface ScoreBoothClientProps {
  operatorName: string
  operatorEmail: string
  activeEvent: EventLite | null
  events: EventLite[]
}

export default function ScoreBoothClient({
  operatorName,
  activeEvent,
  events,
}: ScoreBoothClientProps) {
  const router = useRouter()

  const handlePickEvent = (eventId: string) => {
    router.push(`/booth/score?event_id=${eventId}`)
  }

  // ─── Mode 1: event picker ────────────────────────────────────────────────
  if (!activeEvent) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#F4F4F4',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '32px 24px',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {/* Stripe header */}
          <div
            style={{
              height: 6,
              background:
                'linear-gradient(90deg, #E3001B 0 50%, #003C8F 50% 75%, #FFD100 75% 100%)',
              borderRadius: 3,
              marginBottom: 24,
            }}
          />
          <header style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#E3001B',
                marginBottom: 8,
              }}
            >
              Score Booth — Mode Salon
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 900,
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
              }}
            >
              Choisis le salon en cours
            </h1>
            <p style={{ margin: '8px 0 0', color: '#6B6B6B' }}>
              Connecté·e en tant que <strong>{operatorName}</strong>.
            </p>
          </header>

          {events.length === 0 ? (
            <div
              style={{
                background: '#FFF7ED',
                border: '1.5px solid #FECD89',
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
                color: '#92400E',
              }}
            >
              Aucun événement n'est encore configuré dans la base.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => handlePickEvent(ev.id)}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E8E8E8',
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E3001B'
                    e.currentTarget.style.boxShadow =
                      '0 6px 18px rgba(227, 0, 27, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E8E8E8'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#003C8F',
                      marginBottom: 8,
                    }}
                  >
                    Événement
                  </div>
                  <div
                    style={{
                      fontSize: '1.0625rem',
                      fontWeight: 800,
                      color: '#1A1A1A',
                      marginBottom: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    {ev.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6B6B6B' }}>
                    {ev.city ?? '—'}
                    {ev.event_date
                      ? ` · ${new Date(ev.event_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}`
                      : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    )
  }

  // ─── Mode 2: active event → booth form ───────────────────────────────────

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F4F4F4',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px 16px 64px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Booth header */}
        <div
          style={{
            background: '#1A1A1A',
            color: '#FFFFFF',
            padding: '20px 24px',
            borderRadius: 12,
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#FFD100',
                marginBottom: 4,
              }}
            >
              Score Booth · L'Étudiant
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>
              {activeEvent.name}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#A0A0A0' }}>
              Opérateur·rice : {operatorName}
            </div>
          </div>
          <button
            onClick={() => router.push('/booth/score')}
            style={{
              background: 'transparent',
              color: '#FFFFFF',
              border: '1.5px solid #FFFFFF',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Changer d'événement
          </button>
        </div>

        {/* The actual capture form (no standId, score_booth source) */}
        <BoothCaptureFormV2
          eventId={activeEvent.id}
          source="score_booth"
          onSuccess={(captureId) => {
            // Optional: in the future, render a QR for the student to scan
            // so the capture syncs to their app account.
            console.log('[score-booth] capture saved:', captureId)
          }}
          onError={(message) => {
            console.error('[score-booth] capture error:', message)
          }}
        />
      </div>
    </main>
  )
}
