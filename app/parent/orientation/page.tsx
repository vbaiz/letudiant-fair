'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  tomate:      '#EC1F27',
  tomateLight: '#FFF0F1',
  piscine:     '#0066CC',
  piscineLight:'#E6EEF9',
  citron:      '#FCD716',
  spirit:      '#FF6B35',
  spiritLight: '#FFF3ED',
  menthe:      '#4DB8A8',
  mentheLight: '#E6F4F1',
  pourpre:     '#932D99',
  nuit:        '#191829',
  blanc:       '#F8F7F2',
  gray700:     '#3D3D3D',
  gray500:     '#6B6B6B',
  gray200:     '#E8E8E8',
  gray100:     '#F4F4F4',
}

const STRIPE_COLORS = [C.tomate, C.piscine, C.citron, C.spirit, C.menthe, C.pourpre]

// ── Types ──────────────────────────────────────────────────────────────────────
interface ChildData {
  name: string
  intent_level: 'low' | 'medium' | 'high'
  intent_score: number
  orientation_stage: 'exploring' | 'comparing' | 'deciding'
  orientation_score: number
  education_level: string | null
  education_branches: string[]
}

interface RecommendedSchool {
  id: string
  name: string
  type: string
  city: string
  target_fields: string[]
  matchCount: number
}

// ── Constants ──────────────────────────────────────────────────────────────────
const STAGE_INFO: Record<string, { label: string; color: string; bg: string; description: string; action: string }> = {
  exploring: {
    label: 'Explorateur',
    color: C.piscine,
    bg: C.piscineLight,
    description: "Votre enfant est en phase de découverte. Il explore les grandes familles de formations sans avoir encore arrêté de choix.",
    action: "Encouragez-le à visiter un maximum de stands variés pour affiner ses centres d'intérêt.",
  },
  comparing: {
    label: 'Comparateur',
    color: C.spirit,
    bg: C.spiritLight,
    description: "Votre enfant a identifié des domaines qui l'intéressent et commence à comparer les établissements entre eux.",
    action: "Aidez-le à poser des questions précises aux conseillers sur les débouchés et les modalités d'admission.",
  },
  deciding: {
    label: 'Décideur',
    color: C.tomate,
    bg: C.tomateLight,
    description: "Votre enfant a une vision claire de ses vœux. Il est en phase de finalisation et de confirmation.",
    action: "Encouragez-le à prendre rendez-vous avec les établissements de sa short-list.",
  },
}

const TIPS = [
  {
    phase: 'Avant le salon',
    color: C.piscine,
    bg: C.piscineLight,
    number: '01',
    subtitle: 'Préparation',
    items: [
      "Encouragez votre enfant à créer son profil sur l'app avant le salon",
      "Discutez ensemble des domaines qui l'intéressent sans imposer vos préférences",
      "Consultez ensemble les établissements présents via l'app",
      "Laissez votre enfant préparer ses questions pour les exposants",
    ],
  },
  {
    phase: 'Pendant le salon',
    color: C.tomate,
    bg: C.tomateLight,
    number: '02',
    subtitle: 'Immersion',
    items: [
      "Laissez votre enfant scanner lui-même son QR à l'entrée",
      "Privilégiez les stands qui correspondent aux intérêts déclarés",
      "Encouragez votre enfant à poser ses propres questions aux conseillers",
      "Le RDV avec un exposant est possible uniquement après le scan d'entrée",
    ],
  },
  {
    phase: 'Après le salon',
    color: C.menthe,
    bg: C.mentheLight,
    number: '03',
    subtitle: 'Décision',
    items: [
      "Consultez ensemble les établissements sauvegardés dans son profil",
      "Discutez du score d'orientation obtenu : qu'est-ce que cela révèle ?",
      "Privilégiez les vœux qui combinent intérêt, niveau et projet professionnel",
      "Contactez un conseiller d'orientation si le projet reste flou",
    ],
  },
]

// ── UI helpers ─────────────────────────────────────────────────────────────────
function MultiStripe() {
  return (
    <div style={{ display: 'flex', height: 5, width: '100%' }}>
      {STRIPE_COLORS.map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  )
}

function Eyebrow({ children, color = C.tomate }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'inline-block', position: 'relative', paddingBottom: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color }}>
        {children}
      </span>
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 28, height: 3, background: color }} />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ParentOrientationPage() {
  const router = useRouter()

  const [child,       setChild]       = useState<ChildData | null>(null)
  const [schools,     setSchools]     = useState<RecommendedSchool[]>([])
  const [loading,     setLoading]     = useState(true)
  const [noChild,     setNoChild]     = useState(false)

  useEffect(() => {
    async function load() {
      const { getSupabase } = await import('@/lib/supabase/client')
      const supabase = getSupabase()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Get parent's own profile to find their email
      const { data: parentRaw } = await supabase
        .from('users').select('email, role').eq('id', user.id).maybeSingle()
      const parent = parentRaw as { email: string; role: string } | null
      if (!parent || parent.role !== 'parent') { router.push('/home'); return }

      // Find linked student
      const { data: studentRaw } = await supabase
        .from('users')
        .select('name, intent_level, intent_score, orientation_stage, orientation_score, education_level, education_branches')
        .eq('parent_email', parent.email)
        .maybeSingle()

      const student = studentRaw as ChildData | null

      if (!student) { setNoChild(true); setLoading(false); return }
      setChild(student)

      // School recommendations: fetch schools and score by branch overlap
      if (student.education_branches.length > 0) {
        const { data: allSchoolsRaw } = await supabase
          .from('schools')
          .select('id, name, type, city, target_fields')
          .limit(80)

        const allSchools = (allSchoolsRaw ?? []) as { id: string; name: string; type: string; city: string; target_fields: string[] }[]

        const scored = allSchools
          .map(s => ({
            ...s,
            matchCount: (s.target_fields ?? []).filter(f =>
              student.education_branches.some(b => f.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(f.toLowerCase()))
            ).length,
          }))
          .filter(s => s.matchCount > 0)
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 5)

        setSchools(scored)
      }

      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.blanc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.piscine}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const stageInfo = child ? (STAGE_INFO[child.orientation_stage] ?? STAGE_INFO.exploring) : null

  return (
    <div style={{ minHeight: '100vh', background: C.blanc, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <MultiStripe />

      {/* Header */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1.5px solid ${C.gray200}`, background: '#fff' }}>
        <Logo variant="default" size="sm" />
        <button onClick={() => router.push('/parent/home')} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gray500, background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Retour au profil
        </button>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px' }}>

        {/* Hero */}
        <section style={{ background: C.piscine, color: '#fff', padding: '48px', position: 'relative', overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: C.citron }} />
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: C.tomate }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.citron, marginBottom: 16 }}>
            Guide parent — 2026
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
            Accompagner
            <br />
            <span style={{ fontStyle: 'italic', color: C.citron }}>sans diriger</span>.
          </h1>
          <p style={{ margin: '24px 0 0', fontSize: 16, lineHeight: 1.6, maxWidth: 520, opacity: 0.9 }}>
            Les bons réflexes à chaque étape, pour laisser votre enfant piloter son orientation.
          </p>
          <div aria-hidden="true" style={{ position: 'absolute', bottom: -60, right: -20, fontSize: 280, fontWeight: 900, fontStyle: 'italic', color: 'rgba(255,255,255,0.08)', letterSpacing: '-0.05em', lineHeight: 0.9, pointerEvents: 'none' }}>
            guide.
          </div>
        </section>

        {/* ── Child orientation stage card (dynamic) ── */}
        {noChild ? (
          <div style={{ background: '#fff', border: `1.5px solid ${C.gray200}`, borderLeft: `6px solid ${C.gray200}`, padding: '24px 28px', marginBottom: 32, fontSize: 14, color: C.gray500 }}>
            Aucun profil étudiant n&apos;est lié à votre adresse. Demandez à votre enfant d&apos;ajouter votre email à son profil.
          </div>
        ) : child && stageInfo ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>

            {/* Orientation stage */}
            <div style={{ background: '#fff', border: `1.5px solid ${C.gray200}`, borderTop: `6px solid ${stageInfo.color}`, padding: 32 }}>
              <Eyebrow color={stageInfo.color}>Stade d&apos;orientation de {child.name.split(' ')[0]}</Eyebrow>
              <div style={{ fontSize: 36, fontWeight: 900, fontStyle: 'italic', color: stageInfo.color, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 12 }}>
                {stageInfo.label}
              </div>
              <p style={{ fontSize: 14, color: C.gray700, lineHeight: 1.6, margin: '0 0 20px' }}>
                {stageInfo.description}
              </p>

              {/* Orientation score bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  <span>Score orientation</span>
                  <span style={{ color: C.nuit }}>{child.orientation_score} / 100</span>
                </div>
                <div style={{ height: 8, background: C.gray100, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${child.orientation_score}%`, background: stageInfo.color, transition: 'width 0.5s ease', borderRadius: 4 }} />
                </div>
              </div>

              {/* Journey milestones */}
              <div style={{ display: 'flex', gap: 0 }}>
                {(['exploring', 'comparing', 'deciding'] as const).map((stage, i) => {
                  const reached = ['exploring', 'comparing', 'deciding'].indexOf(child.orientation_stage) >= i
                  const info = STAGE_INFO[stage]
                  return (
                    <div key={stage} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      {i > 0 && (
                        <div style={{ position: 'absolute', top: 9, left: 0, right: '50%', height: 2, background: reached ? info.color : C.gray200 }} />
                      )}
                      {i < 2 && (
                        <div style={{ position: 'absolute', top: 9, left: '50%', right: 0, height: 2, background: ['exploring', 'comparing', 'deciding'].indexOf(child.orientation_stage) > i ? STAGE_INFO['comparing' as const].color : C.gray200 }} />
                      )}
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: reached ? info.color : C.gray200, margin: '0 auto 6px', position: 'relative', zIndex: 1 }} />
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: reached ? info.color : C.gray500 }}>
                        {info.label}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Suggested action */}
              <div style={{ marginTop: 20, padding: '12px 16px', background: stageInfo.bg, borderLeft: `3px solid ${stageInfo.color}`, fontSize: 13, color: C.gray700, lineHeight: 1.6 }}>
                <strong>À faire maintenant :</strong> {stageInfo.action}
              </div>
            </div>

            {/* School recommendations */}
            <div style={{ background: '#fff', border: `1.5px solid ${C.gray200}`, borderTop: `6px solid ${C.citron}`, padding: 32 }}>
              <Eyebrow color={C.tomate}>Établissements recommandés</Eyebrow>
              <p style={{ fontSize: 13, color: C.gray500, margin: '0 0 20px', lineHeight: 1.5 }}>
                Sélectionnés d&apos;après les domaines déclarés par {child.name.split(' ')[0]} :{' '}
                <span style={{ fontWeight: 700, color: C.nuit }}>
                  {child.education_branches.slice(0, 3).join(', ')}{child.education_branches.length > 3 ? '…' : ''}
                </span>
              </p>

              {schools.length === 0 ? (
                <div style={{ padding: '24px 0', color: C.gray500, fontSize: 13 }}>
                  {child.education_branches.length === 0
                    ? "Votre enfant n'a pas encore renseigné ses domaines d'intérêt."
                    : "Aucun établissement correspondant trouvé pour le moment."}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {schools.map((school, i) => (
                    <div key={school.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < schools.length - 1 ? `1px solid ${C.gray200}` : 'none' }}>
                      <div style={{ width: 36, height: 36, background: C.gray100, color: C.nuit, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, fontStyle: 'italic', flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.nuit, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{school.name}</div>
                        <div style={{ fontSize: 12, color: C.gray500 }}>{school.type} · {school.city}</div>
                      </div>
                      <div style={{ flexShrink: 0, background: C.tomateLight, color: C.tomate, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 2 }}>
                        {school.matchCount} domaine{school.matchCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <a
                href="/parent/home"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.piscine, textDecoration: 'none', borderBottom: `2px solid ${C.piscine}`, paddingBottom: 2 }}
              >
                Voir tous les établissements sauvegardés →
              </a>
            </div>
          </div>
        ) : null}

        {/* ── 3 phases tips ── */}
        <div style={{ marginBottom: 32 }}>
          <Eyebrow color={C.tomate}>Les 3 phases</Eyebrow>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: C.nuit, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Un accompagnement <span style={{ fontStyle: 'italic', color: C.tomate }}>en trois temps</span>.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
          {TIPS.map(section => (
            <div key={section.phase} style={{ background: '#fff', border: `1.5px solid ${C.gray200}`, borderTop: `6px solid ${section.color}`, padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: section.color, marginBottom: 6 }}>{section.subtitle}</div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, fontStyle: 'italic', color: C.nuit, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1 }}>{section.phase}</h3>
                </div>
                <div style={{ fontSize: 56, fontWeight: 900, fontStyle: 'italic', color: section.color, opacity: 0.18, letterSpacing: '-0.05em', lineHeight: 0.8 }}>{section.number}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {section.items.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, width: 22, height: 22, background: section.bg, color: section.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, fontStyle: 'italic', marginTop: 1 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 14, color: C.gray700, lineHeight: 1.5, fontWeight: 500 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Privacy strip */}
        <div style={{ background: C.nuit, color: '#fff', padding: 40, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'center', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.citron, marginBottom: 12 }}>Bon à savoir</div>
            <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 0.95 }}>
              Ses données
              <br />
              lui appartiennent.
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, opacity: 0.85 }}>
            Les données comportementales de votre enfant (stands visités, temps passé par zone, conversations avec les exposants) sont strictement confidentielles.
            Seuls les éléments qu&apos;il a choisi de partager avec vous apparaissent dans votre espace parent.
          </p>
        </div>

        <a href="/parent/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 22px', background: C.tomate, color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Retour au profil de mon enfant
        </a>
      </main>
    </div>
  )
}
