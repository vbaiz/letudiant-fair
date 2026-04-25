'use client'

/**
 * BoothCaptureForm — Staff form for capturing non-app-user orientation
 *
 * Usage:
 *   - Display on tablet at booth stand
 *   - Staff quickly answers 3 questions (~30 seconds)
 *   - Form submits to POST /api/booth/capture-orientation
 *   - No authentication required (service role inserts)
 */

import { useState } from 'react'

interface BoothCaptureFormProps {
  eventId: string
  standId: string
  onSuccess?: (captureId: string) => void
  onError?: (message: string) => void
}

export default function BoothCaptureForm({
  eventId,
  standId,
  onSuccess,
  onError,
}: BoothCaptureFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [orientationStage, setOrientationStage] = useState<'exploring' | 'comparing' | 'deciding'>('exploring')
  const [educationLevel, setEducationLevel] = useState<string>('')
  const [branches, setBranches] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [optinContact, setOptinContact] = useState(false)

  const handleBranchToggle = (branch: string) => {
    setBranches(prev =>
      prev.includes(branch)
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate contact info if opted in
      if (optinContact && !email && !phone) {
        throw new Error('Veuillez entrer un email ou un téléphone pour recevoir des communications')
      }

      const response = await fetch('/api/booth/capture-orientation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          stand_id: standId,
          orientation_stage: orientationStage,
          education_level: educationLevel ? [educationLevel] : [],
          education_branches: branches,
          email: email || null,
          phone: phone || null,
          optin_contact: optinContact,
          captured_by_staff: 'booth_tablet', // Can be enhanced with staff name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde')
      }

      setSubmitted(true)
      onSuccess?.(data.capture_id)

      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitted(false)
        setOrientationStage('exploring')
        setEducationLevel('')
        setBranches([])
        setEmail('')
        setPhone('')
        setOptinContact(false)
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur réseau'
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 800, color: '#16A34A' }}>
          Données sauvegardées
        </h2>
        <p style={{ margin: 0, color: '#6B6B6B', fontSize: '0.9rem' }}>
          Les données d'orientation ont été enregistrées.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800 }}>
          Capturer l'orientation de l'étudiant
        </h2>
        <p style={{ margin: 0, color: '#6B6B6B', fontSize: '0.875rem' }}>
          Complétez cette fiche lors de la visite de l'étudiant (~30 secondes)
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Question 1: Orientation Stage */}
        <div>
          <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>
            1️⃣ Quel stade d'orientation ? <span style={{ color: '#E3001B' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { value: 'exploring' as const, label: '🔵 Explorateur — encore en découverte', desc: 'Cherche encore ses idées' },
              { value: 'comparing' as const, label: '🟡 Comparateur — sélectionne activement', desc: 'Restreint ses choix' },
              { value: 'deciding' as const, label: '🟢 Décideur — prêt(e) à postuler', desc: 'Presque décidé(e)' },
            ].map(option => (
              <label key={option.value} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', padding: '8px 0' }}>
                <input
                  type="radio"
                  name="stage"
                  value={option.value}
                  checked={orientationStage === option.value}
                  onChange={(e) => setOrientationStage(e.target.value as any)}
                  style={{ cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>{option.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Question 2: Education Level */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>
            2️⃣ Niveau scolaire <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1.5px solid #E8E8E8',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Sélectionner --</option>
            {['Terminale', 'Bac+1', 'Bac+2', 'Bac+3', 'Master'].map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Question 3: Education Branches */}
        <div>
          <label style={{ display: 'block', marginBottom: 10, fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>
            3️⃣ Domaines d'intérêt <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: 400 }}>(plusieurs possibles)</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              'Ingénierie',
              'Informatique & Numérique',
              'Commerce & Marketing',
              'Droit & Sciences Politiques',
              'Santé',
              'Sciences & Technologies',
            ].map(branch => (
              <label key={branch} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={branches.includes(branch)}
                  onChange={() => handleBranchToggle(branch)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8125rem', color: '#3D3D3D' }}>{branch}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: 20 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={optinContact}
              onChange={(e) => setOptinContact(e.target.checked)}
              style={{ marginTop: 4, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1A1A' }}>
              L'étudiant accepte de recevoir des communications
            </span>
          </label>

          {optinContact && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="email"
                placeholder="Email (optionnel)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1.5px solid #E8E8E8',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1.5px solid #E8E8E8',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: 8,
            padding: '10px 12px',
            color: '#991B1B',
            fontSize: '0.8125rem',
          }}>
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            borderRadius: 8,
            background: '#E3001B',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? '⏳ Sauvegarde...' : '✅ Enregistrer'}
        </button>

        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B6B6B', textAlign: 'center' }}>
          Les données sont sauvegardées de façon anonyme et conforme RGPD
        </p>
      </form>
    </div>
  )
}
