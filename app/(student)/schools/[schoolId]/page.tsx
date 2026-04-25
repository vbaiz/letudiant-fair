'use client';
export const dynamic = 'force-dynamic';
import { use, useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase/client'
import { track } from '@/lib/analytics/track'
import { useToast } from '@/components/ui/Toaster'
import { Skeleton } from '@/components/ui/Skeleton'
import { bookAppointment, cancelAppointment, getStudentAppointmentForSchool } from '@/lib/supabase/database'
import type { SchoolRow, FormationRow, AppointmentRow } from '@/lib/supabase/types'

export default function SchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = use(params)
  const { toast } = useToast()
  const [school, setSchool] = useState<SchoolRow | null>(null)
  const [formations, setFormations] = useState<FormationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'formations' | 'stats' | 'rdv'>('info')
  const [appointment, setAppointment] = useState<AppointmentRow | null>(null)
  const [bookingSlot, setBookingSlot] = useState<string | null>(null)
  const [bookingNote, setBookingNote] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [activeEventDate, setActiveEventDate] = useState<string | null>(null)

  useEffect(() => {
    track('school_view', { school_id: schoolId, source: 'direct' })
    async function load() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      const schoolRes = await supabase.from('schools').select('*').eq('id', schoolId).single()
      const formationsRes = await supabase.from('formations').select('*').eq('school_id', schoolId).order('name')
      if (schoolRes.data) setSchool(schoolRes.data)
      setFormations(formationsRes.data ?? [])
      if (user) setUserId(user.id)

      // Check whether the school is already bookmarked as a saved link
      if (user) {
        const { data: existingBookmark } = await supabase
          .from('saved_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('school_id', schoolId)
          .eq('kind', 'link')
          .maybeSingle()
        if (existingBookmark) {
          setBookmarked(true)
          setBookmarkId(existingBookmark.id)
        }
      }

      // Load the closest event (future or past) and any existing appointment
      if (user) {
        const { data: events } = await supabase
          .from('events')
          .select('id, event_date')
          .order('event_date', { ascending: true })
        type EventSlim = { id: string; event_date: string }
        const closest = (events as EventSlim[] | null)?.reduce<EventSlim | null>((best, ev) => {
          if (!best) return ev
          const diff = (d: string) => Math.abs(new Date(d).getTime() - Date.now())
          return diff(ev.event_date) < diff(best.event_date) ? ev : best
        }, null)
        if (closest) {
          setActiveEventId(closest.id)
          setActiveEventDate(closest.event_date.slice(0, 10))
          const existing = await getStudentAppointmentForSchool(user.id, schoolId, closest.id)
          setAppointment(existing)
        }
      }
      setLoading(false)
    }
    load()
  }, [schoolId])

  async function handleBook() {
    if (!bookingSlot || !activeEventId) return
    setBookingLoading(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast('Connectez-vous pour réserver', 'error'); return }
      const appt = await bookAppointment({
        student_id: user.id,
        school_id: schoolId,
        event_id: activeEventId,
        slot_time: bookingSlot,
        student_notes: bookingNote || null,
      })
      setAppointment(appt)
      track('appointment_book', { school_id: schoolId, slot_time: bookingSlot })
      toast('✓ Rendez-vous confirmé ! Vous recevrez un rappel avant le salon.', 'success')
    } finally {
      setBookingLoading(false)
    }
  }

  async function handleCancel() {
    if (!appointment) return
    await cancelAppointment(appointment.id)
    setAppointment(null)
    setBookingSlot(null)
    toast('Rendez-vous annulé', 'info')
  }

  async function toggleBookmark() {
    if (!userId || !school) {
      toast('Connectez-vous pour sauvegarder', 'error')
      return
    }
    const supabase = getSupabase()
    if (bookmarked && bookmarkId) {
      const { error } = await supabase.from('saved_items').delete().eq('id', bookmarkId)
      if (error) { toast('Impossible de retirer', 'error'); return }
      setBookmarked(false)
      setBookmarkId(null)
      track('unbookmark', { school_id: schoolId, source: 'school_detail' })
      toast('Retiré de vos favoris', 'info')
    } else {
      const { data, error } = await supabase
        .from('saved_items')
        .insert({
          user_id:   userId,
          school_id: schoolId,
          kind:      'link',
          label:     school.name,
          url:       `/schools/${schoolId}`,
          meta:      { source: 'school_detail' },
        })
        .select('id')
        .single()
      if (error || !data) { toast('Impossible de sauvegarder', 'error'); return }
      setBookmarked(true)
      setBookmarkId(data.id)
      track('bookmark', { school_id: schoolId, source: 'school_detail' })
      toast('✓ Ajouté à votre dossier', 'success')
    }
  }

  if (loading) return (
    <div style={{ padding: 20 }}>
      <Skeleton variant="card" style={{ height: 200, marginBottom: 16 }} />
      <Skeleton className="h-6 w-3/4" style={{ marginBottom: 8 }} />
      <Skeleton className="h-4 w-1/2" style={{ marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} variant="kpi" />)}
      </div>
    </div>
  )

  if (!school) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ fontSize: '1.25rem' }}>😕</p>
      <p style={{ color: '#6B6B6B' }}>Établissement introuvable</p>
      <a href="/schools" style={{ color: '#EC1F27', fontWeight: 600 }}>← Retour à la liste</a>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7', paddingBottom: 40, fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: school.cover_image_url ? `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(${school.cover_image_url}) center/cover no-repeat` : 'linear-gradient(135deg,#1A1A1A,#3A3A3A)', padding: '52px 20px 24px', color: '#fff', position: 'relative' }}>
        <a href="/schools" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>← Retour</a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>{school.type}</span>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.375rem', fontWeight: 800, lineHeight: 1.2 }}>{school.name}</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.75 }}>📍 {school.city}</p>
          </div>
          <button onClick={toggleBookmark} style={{ background: bookmarked ? '#EC1F27' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontSize: 20 }}>
            {bookmarked ? '❤️' : '🤍'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {school.parcoursup && <span style={{ background: '#0066CC', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>Parcoursup</span>}
          {school.apprenticeship && <span style={{ background: '#15803d', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>Alternance</span>}
          {school.scholarship_allowed && <span style={{ background: '#92400e', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>Bourses</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #F0F0F0' }}>
        {([['info', 'Infos'], ['formations', 'Formations'], ['stats', 'Stats'], ['rdv', appointment ? '📅 RDV ✓' : 'Rendez-vous']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '14px 6px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#EC1F27' : 'transparent'}`, fontWeight: activeTab === tab ? 700 : 400, color: activeTab === tab ? '#EC1F27' : tab === 'rdv' && appointment ? '#15803d' : '#6B6B6B', cursor: 'pointer', fontSize: '0.8125rem' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 20px' }}>
        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Description */}
            {school.description ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '0.9375rem', fontWeight: 700 }}>Présentation</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B4B4B', lineHeight: 1.6 }}>{school.description}</p>
              </div>
            ) : (
              <div style={{ background: '#FFF9E6', border: '1px solid #FCD716', borderRadius: 12, padding: '12px 16px', fontSize: '0.8125rem', color: '#92400e' }}>
                💡 L&apos;exposant n&apos;a pas encore renseigné de présentation.
              </div>
            )}

            {/* Quick facts */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: 700 }}>En bref</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, width: 28 }}>🏛️</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B6B6B' }}>Type</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{school.type || '—'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, width: 28 }}>📍</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B6B6B' }}>Ville</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{school.city || '—'}</p>
                  </div>
                </div>
                {school.tuition_fee != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18, width: 28 }}>💰</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B6B6B' }}>Frais de scolarité</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                        {school.tuition_fee === 0 ? 'Gratuit' : `${school.tuition_fee.toLocaleString('fr-FR')} €/an`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Website */}
            {school.website && (
              <a href={school.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '14px 16px', textDecoration: 'none', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 20 }}>🌐</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>Site officiel</p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#0066CC' }}>{school.website}</p>
                </div>
              </a>
            )}

            {/* Target levels */}
            {(school.target_levels ?? []).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: 700 }}>Niveaux recrutés</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(school.target_levels ?? []).map(l => (
                    <span key={l} style={{ background: '#FFF0F1', border: '1px solid #EC1F27', borderRadius: 8, padding: '5px 12px', fontSize: '0.8125rem', fontWeight: 500, color: '#C41520' }}>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Target fields */}
            {(school.target_fields ?? []).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: 700 }}>Filières proposées</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(school.target_fields ?? []).map(f => (
                    <span key={f} style={{ background: '#F5F5F5', borderRadius: 8, padding: '5px 12px', fontSize: '0.8125rem', fontWeight: 500, color: '#4B4B4B' }}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'formations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {formations.length === 0 ? (
              <p style={{ color: '#6B6B6B', textAlign: 'center', padding: 32 }}>Aucune formation renseignée</p>
            ) : formations.map(f => (
              <div key={f.id} style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.9375rem', color: '#1A1A1A' }}>{f.name}</p>
                <p style={{ margin: '0 0 8px', fontSize: '0.8125rem', color: '#6B6B6B' }}>{f.level} · {f.duration}</p>
                {f.rncp_code && <span style={{ background: '#F5F5F5', borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', color: '#6B6B6B' }}>{f.rncp_code}</span>}
                {f.cost !== null && <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: '#4B4B4B' }}>💰 {f.cost === 0 ? 'Gratuit' : `${f.cost?.toLocaleString('fr-FR')} €/an`}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rdv' && (
          <RdvTab
            school={school}
            appointment={appointment}
            bookingSlot={bookingSlot}
            bookingNote={bookingNote}
            bookingLoading={bookingLoading}
            eventDate={activeEventDate}
            onSelectSlot={setBookingSlot}
            onNoteChange={setBookingNote}
            onBook={handleBook}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'stats' && (() => {
          const stats = [
            { label: 'Bac Général acceptés', value: school.nb_accepted_bac_g, display: school.nb_accepted_bac_g != null ? String(school.nb_accepted_bac_g) : null, icon: '📘' },
            { label: 'Bac Techno acceptés',  value: school.nb_accepted_bac_t, display: school.nb_accepted_bac_t != null ? String(school.nb_accepted_bac_t) : null, icon: '📗' },
            { label: 'Bac Pro acceptés',     value: school.nb_accepted_bac_p, display: school.nb_accepted_bac_p != null ? String(school.nb_accepted_bac_p) : null, icon: '📙' },
            { label: 'Insertion pro',        value: school.rate_professional_insertion, display: school.rate_professional_insertion != null ? `${school.rate_professional_insertion}%` : null, icon: '💼' },
            { label: 'Frais de scolarité',   value: school.tuition_fee, display: school.tuition_fee != null ? (school.tuition_fee === 0 ? 'Gratuit' : `${school.tuition_fee.toLocaleString('fr-FR')} €/an`) : null, icon: '💰' },
          ];
          const hasAny = stats.some(s => s.display !== null);
          return hasAny ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {stats.map(stat => (
                <div key={stat.label} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 24 }}>{stat.icon}</p>
                  <p style={{ margin: '0 0 3px', fontSize: '1.0625rem', fontWeight: 800, color: stat.display ? '#EC1F27' : '#D4D4D4' }}>{stat.display ?? '—'}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B6B6B' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B6B6B' }}>
              <p style={{ fontSize: 36, margin: '0 0 12px' }}>📊</p>
              <p style={{ fontWeight: 600, margin: '0 0 6px', color: '#3D3D3D' }}>Chiffres non encore renseignés</p>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>L&apos;établissement n&apos;a pas encore publié ses statistiques.</p>
            </div>
          );
        })()}
      </div>
    </div>
  )
}

// ─── Rendez-vous Tab ──────────────────────────────────────────────────────────

const SLOT_LABELS: Record<string, string> = {
  '09:00': '9h00 – 9h15',
  '09:30': '9h30 – 9h45',
  '10:00': '10h00 – 10h15',
  '10:30': '10h30 – 10h45',
  '11:00': '11h00 – 11h15',
  '11:30': '11h30 – 11h45',
  '14:00': '14h00 – 14h15',
  '14:30': '14h30 – 14h45',
  '15:00': '15h00 – 15h15',
  '15:30': '15h30 – 15h45',
}

function RdvTab({
  school,
  appointment,
  bookingSlot,
  bookingNote,
  bookingLoading,
  eventDate,
  onSelectSlot,
  onNoteChange,
  onBook,
  onCancel,
}: {
  school: SchoolRow
  appointment: AppointmentRow | null
  bookingSlot: string | null
  bookingNote: string
  bookingLoading: boolean
  eventDate: string | null
  onSelectSlot: (slot: string) => void
  onNoteChange: (note: string) => void
  onBook: () => void
  onCancel: () => void
}) {
  const fairDate = eventDate
    ? new Date(eventDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const datePrefix = eventDate ?? '2026-06-07'

  if (appointment) {
    const slotKey = new Date(appointment.slot_time).toTimeString().slice(0, 5)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#E8F5EC', border: '1.5px solid #4caf50', borderRadius: 14, padding: 20 }}>
          <p style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#1B7F3A' }}>✓ Rendez-vous réservé</p>
          <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#2d5a3d' }}>{fairDate} · {SLOT_LABELS[slotKey] ?? slotKey}</p>
          <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#2d5a3d' }}>Stand <strong>{school.name}</strong></p>
          {appointment.student_notes && (
            <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: '#4B4B4B', fontStyle: 'italic' }}>Note : {appointment.student_notes}</p>
          )}
        </div>
        <div style={{ background: '#F0F4FF', border: '1px solid #C5D3F0', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.875rem', fontWeight: 700, color: '#0066CC' }}>💡 Ce RDV booste ton profil</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#4B4B4B', lineHeight: 1.5 }}>
            Votre rendez-vous est confirmé ! Retrouvez {school.name} le jour du salon pour votre créneau réservé.
          </p>
        </div>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: '1.5px solid #EC1F27', color: '#EC1F27', borderRadius: 10, padding: '12px 20px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          Annuler ce rendez-vous
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Context */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '0.9375rem', fontWeight: 700 }}>Réservez un créneau avec un représentant</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B6B6B', lineHeight: 1.5 }}>
          Rencontrez un conseiller <strong>{school.name}</strong> lors du salon du <strong>{fairDate}</strong>.
          Créneaux de 15 minutes — gratuit, sur place.
        </p>
      </div>

      {/* Slot picker */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
        <p style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>Choisissez un créneau</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(SLOT_LABELS).map(([key, label]) => {
            const isSelected = bookingSlot?.endsWith(key + ':00')
            return (
              <button
                key={key}
                onClick={() => onSelectSlot(`${datePrefix}T${key}:00`)}
                style={{
                  background: isSelected ? '#EC1F27' : '#F5F5F5',
                  color: isSelected ? '#fff' : '#1A1A1A',
                  border: isSelected ? '2px solid #EC1F27' : '2px solid transparent',
                  borderRadius: 10,
                  padding: '10px 8px',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Optional note */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
          Votre question principale <span style={{ color: '#6B6B6B', fontWeight: 400 }}>(optionnel)</span>
        </label>
        <textarea
          value={bookingNote}
          onChange={e => onNoteChange(e.target.value)}
          placeholder="Ex : Je veux en savoir plus sur le programme Architecture intérieure…"
          rows={3}
          style={{ width: '100%', border: '1.5px solid #E8E8E8', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: '#1A1A1A', resize: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* CTA */}
      <button
        onClick={onBook}
        disabled={!bookingSlot || bookingLoading}
        style={{
          background: bookingSlot ? '#EC1F27' : '#E8E8E8',
          color: bookingSlot ? '#fff' : '#6B6B6B',
          border: 'none',
          borderRadius: 12,
          padding: '15px 20px',
          fontWeight: 800,
          fontSize: '1rem',
          cursor: bookingSlot ? 'pointer' : 'not-allowed',
        }}
      >
        {bookingLoading ? 'Réservation en cours…' : bookingSlot ? 'Confirmer le rendez-vous →' : 'Sélectionnez un créneau'}
      </button>

      <p style={{ fontSize: '0.75rem', color: '#6B6B6B', textAlign: 'center' }}>
        Vous pouvez annuler jusqu'à 24h avant le salon
      </p>
    </div>
  )
}
