'use client'

/**
 * SegmentExplainer — explains the 3 behavioral segments.
 * Use in: Segments page, Clusters tab, Students page.
 *
 * Usage:
 *   import SegmentExplainer from '@/components/ui/SegmentExplainer'
 *   <SegmentExplainer />
 *   <SegmentExplainer collapsible />   // with toggle button
 */

import { useState } from 'react'

const SEGMENTS = [
  {
    emoji: '🔍',
    label: 'Explorateur',
    range: '0 – 32',
    color: '#F59E0B',
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FCD34D',
    quote: 'Je découvre, je regarde.',
    behavior: 'Visite 1-2 stands, passe peu de temps, pas de RDV.',
    action: '→ Lui proposer le quiz d\'orientation',
  },
  {
    emoji: '⚖️',
    label: 'Comparateur',
    range: '33 – 65',
    color: '#2563EB',
    bg: '#DBEAFE',
    text: '#1E40AF',
    border: '#93C5FD',
    quote: 'J\'évalue, je compare.',
    behavior: 'A identifié des filières, visite plusieurs stands, commence à swiper.',
    action: '→ L\'inviter à une conférence ciblée',
  },
  {
    emoji: '🎯',
    label: 'Décideur',
    range: '66 – 100',
    color: '#059669',
    bg: '#D1FAE5',
    text: '#065F46',
    border: '#6EE7B7',
    quote: 'Je sais ce que je veux.',
    behavior: '4+ stands, RDV pris, swipes, profil complété.',
    action: '→ Le connecter aux écoles likées',
  },
]

export default function SegmentExplainer({ collapsible = false }: { collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible)

  return (
    <div style={{ marginBottom: 20 }}>
      {collapsible && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, color: '#6B6B6B',
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            padding: '8px 0', marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 14, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
          Comprendre les profils
        </button>
      )}

      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {SEGMENTS.map(seg => (
            <div
              key={seg.label}
              style={{
                background: seg.bg,
                border: `1px solid ${seg.border}`,
                borderRadius: 12,
                padding: '20px 22px',
                position: 'relative' as const,
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, height: 3, background: seg.color }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{seg.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: seg.text }}>{seg.label}</div>
                  <div style={{ fontSize: 10, color: seg.text, opacity: 0.6 }}>Score {seg.range}</div>
                </div>
              </div>

              <div style={{
                fontSize: 15, fontWeight: 700, fontStyle: 'italic' as const,
                color: seg.text, marginBottom: 10, lineHeight: 1.3,
              }}>
                &ldquo;{seg.quote}&rdquo;
              </div>

              <div style={{ fontSize: 12, color: seg.text, opacity: 0.8, lineHeight: 1.5, marginBottom: 12 }}>
                {seg.behavior}
              </div>

              <div style={{
                fontSize: 11, fontWeight: 700, color: seg.color,
                padding: '6px 10px', background: `${seg.color}15`,
                borderRadius: 6, display: 'inline-block',
              }}>
                {seg.action}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}