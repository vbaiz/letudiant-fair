'use client'

/**
 * Booth Capture Page  ⚠️ LEGACY
 *
 * This page is the per-school booth (school_booth source). It is NOT the
 * central Score Booth. The Score Booth — run by L'Étudiant team — lives at
 * /booth/score and requires admin / booth_operator authentication.
 *
 * This route is kept only for the legacy school-staffed flow. It still uses
 * URL params (?event_id, ?stand_id) and submits with source='school_booth'.
 *
 * For the new central booth, see: app/booth/score/page.tsx
 */

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BoothCaptureForm from '@/components/features/BoothCaptureForm'

function BoothCaptureContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('event_id')
  const standId = searchParams.get('stand_id')

  // ─── Validation ────────────────────────────────────────────────────────

  if (!eventId || !standId) {
    return (
      <main style={{ padding: '32px 24px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: 12,
          padding: '20px',
          textAlign: 'center',
        }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#991B1B' }}>
            ⚠️ Configuration manquante
          </h1>
          <p style={{ margin: '0 0 12px', color: '#7F1D1D', fontSize: '0.9rem' }}>
            L'URL doit contenir les paramètres event_id et stand_id.
          </p>
          <div style={{
            background: '#FFF7ED',
            padding: '12px',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: '0.8125rem',
            color: '#78350F',
            textAlign: 'left',
            overflow: 'auto',
          }}>
            /booth/capture?event_id=[uuid]&stand_id=[uuid]
          </div>
          <p style={{ margin: '12px 0 0', color: '#7F1D1D', fontSize: '0.8125rem' }}>
            Remplacez [uuid] par les identifiants réels de Supabase.
          </p>
        </div>

        <div style={{ marginTop: 32, padding: '20px', background: '#F3F4F6', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700 }}>
            Comment trouver les IDs?
          </h2>
          <ol style={{ margin: 0, paddingLeft: 20, color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.8 }}>
            <li>Allez dans Supabase: <strong>Table Editor</strong></li>
            <li>
              <strong>events</strong> table → cherchez l'événement
              <br />
              Copiez l'ID (colonne <code>id</code>)
            </li>
            <li>
              <strong>stands</strong> table → cherchez le stand de votre établissement
              <br />
              Copiez l'ID (colonne <code>id</code>)
            </li>
            <li>
              Construisez l'URL:
              <br />
              <code>/booth/capture?event_id=[event-id]&stand_id=[stand-id]</code>
            </li>
            <li>Marquez-la comme favori sur la tablette</li>
          </ol>
        </div>
      </main>
    )
  }

  // ─── Form Ready ────────────────────────────────────────────────────────

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #F4F4F4 0%, #FFFFFF 100%)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 800 }}>
          📱 Capture d'Orientation
        </h1>
        <p style={{ margin: 0, color: '#6B6B6B', fontSize: '0.9rem' }}>
          Enregistrez rapidement l'orientation de chaque visiteur (~30 secondes)
        </p>
      </div>

      {/* Form Container */}
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <BoothCaptureForm
          eventId={eventId}
          standId={standId}
          onSuccess={(captureId) => {
            console.log('✅ Capture saved:', captureId)
            // Optional: send notification to exhibitor dashboard
            fetch('/api/notifications/capture-saved', {
              method: 'POST',
              body: JSON.stringify({ captureId, standId }),
            }).catch(console.error)
          }}
          onError={(message) => {
            console.error('❌ Error:', message)
            // Optional: send error notification for debugging
          }}
        />
      </div>

      {/* Footer Tips */}
      <div style={{ marginTop: 32, maxWidth: 480, color: '#6B6B6B', fontSize: '0.75rem', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px' }}>
          💡 Conseil: Montrez ce formulaire à chaque visiteur qui n'a pas l'app sur son téléphone.
        </p>
        <p style={{ margin: 0 }}>
          Les données sont sauvegardées de façon anonyme et conforme RGPD.
        </p>
      </div>
    </main>
  )
}

export default function BoothCapturePage() {
  return (
    <Suspense fallback={
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Chargement...</p>
      </main>
    }>
      <BoothCaptureContent />
    </Suspense>
  )
}
