'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { EventRow, EventProgramRow } from '@/lib/supabase/types'

const C = {
  tomate: '#EC1F27', tomateLight: '#FFF0F1',
  piscine: '#0066CC',
  nuit: '#2B1B4D', noir: '#191829',
  gray700: '#3D3D3D', gray500: '#6B6B6B',
  gray200: '#E8E8E8', gray100: '#F4F4F4', blanc: '#F8F7F2',
  green: '#15803d',
}

interface ExhibitorRegistration {
  id: string
  event_id: string
  school_id: string
  school_name: string
  registered_at: string
}

interface StudentRegistration {
  id: string
  event_id: string
  user_id: string
  user_name: string
  registered_at: string
  scanned_entry: boolean
  scanned_exit: boolean
  entry_qr: string | null
  exit_qr: string | null
}

interface SchoolOption {
  id: string
  name: string
  type: string
  city: string
}

type Tab = 'details' | 'exhibitors' | 'students' | 'programme' | 'qrcodes'

export default function SalonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [salon, setSalon] = useState<EventRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({ name: '', city: '', event_date: '', is_active: false })
  const [tab, setTab] = useState<Tab>('details')

  const [exhibitors, setExhibitors] = useState<ExhibitorRegistration[]>([])
  const [students, setStudents] = useState<StudentRegistration[]>([])
  const [programs, setPrograms] = useState<EventProgramRow[]>([])

  const [updating, setUpdating] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Manual exhibitor add
  const [showAddExhibitor, setShowAddExhibitor] = useState(false)
  const [schoolQuery, setSchoolQuery] = useState('')
  const [schoolResults, setSchoolResults] = useState<SchoolOption[]>([])
  const [addingExhibitor, setAddingExhibitor] = useState(false)

  // Program form
  const [showAddProgram, setShowAddProgram] = useState(false)
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null)
  const [programForm, setProgramForm] = useState({
    title: '', description: '', speaker: '', location: '',
    start_time: '', end_time: '',
  })
  const [savingProgram, setSavingProgram] = useState(false)

  useEffect(() => { fetchSalon() }, [eventId])

  useEffect(() => {
    if (!salon) return
    if (tab === 'exhibitors') fetchExhibitors()
    if (tab === 'students') fetchStudents()
    if (tab === 'programme') fetchPrograms()
  }, [tab, salon])

  // Live school search (debounced)
  useEffect(() => {
    if (!showAddExhibitor) return
    const t = setTimeout(() => searchSchools(schoolQuery), 250)
    return () => clearTimeout(t)
  }, [schoolQuery, showAddExhibitor])

  // ── Fetchers ────────────────────────────────────────────────────────────────
  async function fetchSalon() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Salon non trouvé')
      setSalon(data.data)
      setFormData({
        name: data.data.name,
        city: data.data.city,
        event_date: data.data.event_date?.split('T')[0] ?? '',
        is_active: data.data.is_active ?? false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally { setLoading(false) }
  }

  async function fetchExhibitors() {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/exhibitors`)
      const data = await res.json()
      setExhibitors(data.data || [])
    } catch (err) { console.error(err) }
  }

  async function fetchStudents() {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/students`)
      const data = await res.json()
      setStudents(data.data || [])
    } catch (err) { console.error(err) }
  }

  async function fetchPrograms() {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/programs`)
      const data = await res.json()
      setPrograms(data.data || [])
    } catch (err) { console.error(err) }
  }

  async function searchSchools(q: string) {
    try {
      const url = q.trim()
        ? `/api/admin/schools?q=${encodeURIComponent(q)}&limit=20`
        : `/api/admin/schools?limit=20`
      const res = await fetch(url)
      const data = await res.json()
      setSchoolResults(data.data || [])
    } catch (err) { console.error(err) }
  }

  // ── Mutations ───────────────────────────────────────────────────────────────
  async function handleUpdate() {
    setUpdating(true); setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          city: formData.city,
          event_date: new Date(formData.event_date).toISOString(),
          is_active: formData.is_active,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSalon(data.data)
      setEditMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour')
    } finally { setUpdating(false) }
  }

  async function handleRemoveExhibitor(exhibitorId: string) {
    setRemovingId(exhibitorId)
    try {
      const res = await fetch(
        `/api/admin/events/${eventId}/exhibitors?exhibitor_id=${exhibitorId}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      setExhibitors(prev => prev.filter(e => e.id !== exhibitorId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally { setRemovingId(null) }
  }

  async function handleAddExhibitor(school: SchoolOption) {
    setAddingExhibitor(true); setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/exhibitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_id: school.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setExhibitors(prev => [data.data, ...prev])
      setShowAddExhibitor(false)
      setSchoolQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally { setAddingExhibitor(false) }
  }

  async function handleGenerateEventQR() {
    setGeneratingQR(true); setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/generate-qr?mode=event`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // refresh salon to pick up entry_qr / exit_qr
      setSalon(prev => prev ? { ...prev, entry_qr: data.data.entry_qr, exit_qr: data.data.exit_qr } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de génération QR')
    } finally { setGeneratingQR(false) }
  }

  function openProgramForm(p?: EventProgramRow) {
    if (p) {
      setEditingProgramId(p.id)
      setProgramForm({
        title: p.title,
        description: p.description ?? '',
        speaker: p.speaker ?? '',
        location: p.location ?? '',
        start_time: p.start_time.slice(0, 16),
        end_time: p.end_time.slice(0, 16),
      })
    } else {
      setEditingProgramId(null)
      setProgramForm({ title: '', description: '', speaker: '', location: '', start_time: '', end_time: '' })
    }
    setShowAddProgram(true)
  }

  async function handleSaveProgram() {
    if (!programForm.title || !programForm.start_time || !programForm.end_time) {
      setError('Titre, début et fin sont requis'); return
    }
    setSavingProgram(true); setError(null)
    try {
      const body = {
        ...programForm,
        start_time: new Date(programForm.start_time).toISOString(),
        end_time: new Date(programForm.end_time).toISOString(),
      }
      const res = editingProgramId
        ? await fetch(`/api/admin/events/${eventId}/programs`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ programId: editingProgramId, ...body }),
          })
        : await fetch(`/api/admin/events/${eventId}/programs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowAddProgram(false)
      await fetchPrograms()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally { setSavingProgram(false) }
  }

  async function handleDeleteProgram(programId: string) {
    if (!confirm('Supprimer cette session du programme ?')) return
    try {
      const res = await fetch(
        `/api/admin/events/${eventId}/programs?program_id=${programId}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Erreur')
      setPrograms(prev => prev.filter(p => p.id !== programId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const statusBadge = useMemo(() => {
    if (!salon) return null
    if (salon.is_active) return { label: 'En direct', bg: '#dcfce7', color: C.green }
    if (new Date(salon.event_date) > new Date()) return { label: 'À venir', bg: C.tomateLight, color: C.tomate }
    return { label: 'Archivé', bg: C.gray100, color: C.gray500 }
  }, [salon])

  if (loading) {
    return <div style={loadingBox}>Chargement...</div>
  }
  if (!salon) {
    return (
      <div style={{ ...loadingBox, flexDirection: 'column', gap: 12 }}>
        <p style={{ color: C.tomate, fontWeight: 700 }}>Salon non trouvé</p>
        <button onClick={() => router.push('/admin/salons')} style={btnSecondary}>Retour aux salons</button>
      </div>
    )
  }

  return (
    <div style={{ background: C.blanc, minHeight: '100vh' }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.tomate} 0% 33%, ${C.piscine} 33% 66%, #FCD716 66% 100%)` }} />

      <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <button onClick={() => router.push('/admin/salons')} style={{ ...btnSecondary, marginBottom: 24 }}>
          ← Retour aux salons
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, color: C.noir, textTransform: 'uppercase' }}>{salon.name}</h1>
              {statusBadge && (
                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>
                  {statusBadge.label}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 15, color: C.gray500 }}>
              {salon.city} · {new Date(salon.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {!editMode && (
            <button onClick={() => setEditMode(true)} style={btnPrimary}>Éditer</button>
          )}
        </div>

        {error && (
          <div style={errorBox}>
            {error}
            <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: C.tomate, cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `2px solid ${C.gray200}`, overflowX: 'auto' }}>
          {([
            ['details', 'Détails'],
            ['exhibitors', `Exposants (${exhibitors.length})`],
            ['students', `Étudiants (${students.length})`],
            ['programme', `Programme (${programs.length})`],
            ['qrcodes', 'Codes QR'],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Details Tab ── */}
        {tab === 'details' && (
          <div style={card}>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Field label="Nom du salon">
                  <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                </Field>
                <Field label="Ville">
                  <input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} style={inputStyle} />
                </Field>
                <Field label="Date">
                  <input type="date" value={formData.event_date} onChange={e => setFormData(p => ({ ...p, event_date: e.target.value }))} style={inputStyle} />
                </Field>
                <Field label="Statut">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))} style={{ width: 16, height: 16, accentColor: C.tomate }} />
                    <span style={{ fontSize: 14, color: C.noir }}>Salon en direct (actif)</span>
                  </label>
                </Field>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={() => { setEditMode(false); setError(null) }} style={btnSecondary}>Annuler</button>
                  <button onClick={handleUpdate} disabled={updating} style={{ ...btnPrimary, opacity: updating ? 0.6 : 1 }}>
                    {updating ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <InfoCell label="Nom" value={salon.name} />
                <InfoCell label="Ville" value={salon.city} />
                <InfoCell label="Date" value={new Date(salon.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoCell label="Statut" value={salon.is_active ? '🟢 En direct' : '⚫ Inactif'} />
              </div>
            )}
          </div>
        )}

        {/* ── Exhibitors Tab ── */}
        {tab === 'exhibitors' && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.noir }}>
                Exposants inscrits ({exhibitors.length})
              </h3>
              <button onClick={() => { setShowAddExhibitor(true); searchSchools('') }} style={btnPrimary}>
                + Ajouter un exposant
              </button>
            </div>

            {showAddExhibitor && (
              <div style={{ background: C.blanc, border: `1.5px solid ${C.gray200}`, borderRadius: 6, padding: 16, marginBottom: 16 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: C.noir }}>
                  Rechercher un établissement
                </p>
                <input
                  autoFocus
                  type="text"
                  placeholder="Tapez un nom d'école..."
                  value={schoolQuery}
                  onChange={e => setSchoolQuery(e.target.value)}
                  style={inputStyle}
                />
                <div style={{ marginTop: 12, maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {schoolResults.length === 0 ? (
                    <p style={{ color: C.gray500, fontSize: 12, padding: '12px 0' }}>Aucun résultat</p>
                  ) : schoolResults.map(s => {
                    const already = exhibitors.some(e => e.school_id === s.id)
                    return (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: `1px solid ${C.gray200}`, borderRadius: 4 }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: C.noir }}>{s.name}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: C.gray500 }}>{s.type} · {s.city}</p>
                        </div>
                        <button
                          disabled={already || addingExhibitor}
                          onClick={() => handleAddExhibitor(s)}
                          style={{ ...btnPrimary, padding: '6px 12px', fontSize: 11, opacity: already ? 0.4 : 1, cursor: already ? 'not-allowed' : 'pointer' }}
                        >
                          {already ? 'Inscrit' : 'Ajouter'}
                        </button>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <button onClick={() => { setShowAddExhibitor(false); setSchoolQuery('') }} style={btnSecondary}>Fermer</button>
                </div>
              </div>
            )}

            {exhibitors.length === 0 ? (
              <p style={{ color: C.gray500, textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
                Aucun exposant inscrit pour ce salon
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exhibitors.map(ex => (
                  <div key={ex.id} style={listItem}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: C.noir, fontSize: 14 }}>{ex.school_name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: C.gray500 }}>
                        Inscrit le {new Date(ex.registered_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveExhibitor(ex.id)}
                      disabled={removingId === ex.id}
                      style={{ padding: '6px 14px', background: 'transparent', color: C.tomate, border: `1px solid ${C.tomate}`, borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 12, opacity: removingId === ex.id ? 0.5 : 1 }}
                    >
                      {removingId === ex.id ? '...' : 'Retirer'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Students Tab ── */}
        {tab === 'students' && (
          <div style={card}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: C.noir }}>
              Étudiants inscrits ({students.length})
            </h3>
            {students.length === 0 ? (
              <p style={{ color: C.gray500, textAlign: 'center', padding: '40px 0', fontSize: 14 }}>Aucun étudiant inscrit</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: C.gray100 }}>
                      <th style={th}>Nom</th>
                      <th style={{ ...th, textAlign: 'center' }}>Entrée</th>
                      <th style={{ ...th, textAlign: 'center' }}>Sortie</th>
                      <th style={{ ...th, textAlign: 'right' }}>Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.gray200}`, background: i % 2 === 0 ? '#fff' : C.gray100 }}>
                        <td style={{ padding: '12px 14px', fontWeight: 500 }}>{s.user_name}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: s.scanned_entry ? C.green : C.gray500, fontWeight: 700, fontSize: 16 }}>
                          {s.scanned_entry ? '✓' : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: s.scanned_exit ? C.green : C.gray500, fontWeight: 700, fontSize: 16 }}>
                          {s.scanned_exit ? '✓' : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12, color: C.gray500 }}>
                          {new Date(s.registered_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Programme Tab ── */}
        {tab === 'programme' && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.noir }}>
                Programme du salon ({programs.length} session{programs.length > 1 ? 's' : ''})
              </h3>
              {!showAddProgram && (
                <button onClick={() => openProgramForm()} style={btnPrimary}>+ Ajouter une session</button>
              )}
            </div>

            {showAddProgram && (
              <div style={{ background: C.blanc, border: `1.5px solid ${C.gray200}`, borderRadius: 6, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.noir }}>
                  {editingProgramId ? 'Modifier la session' : 'Nouvelle session'}
                </p>
                <Field label="Titre"><input value={programForm.title} onChange={e => setProgramForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></Field>
                <Field label="Description (optionnel)"><textarea value={programForm.description} onChange={e => setProgramForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Intervenant"><input value={programForm.speaker} onChange={e => setProgramForm(p => ({ ...p, speaker: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Lieu / Salle"><input value={programForm.location} onChange={e => setProgramForm(p => ({ ...p, location: e.target.value }))} style={inputStyle} /></Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Début"><input type="datetime-local" value={programForm.start_time} onChange={e => setProgramForm(p => ({ ...p, start_time: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Fin"><input type="datetime-local" value={programForm.end_time} onChange={e => setProgramForm(p => ({ ...p, end_time: e.target.value }))} style={inputStyle} /></Field>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowAddProgram(false)} style={btnSecondary}>Annuler</button>
                  <button onClick={handleSaveProgram} disabled={savingProgram} style={{ ...btnPrimary, opacity: savingProgram ? 0.6 : 1 }}>
                    {savingProgram ? 'Enregistrement...' : editingProgramId ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )}

            {programs.length === 0 && !showAddProgram ? (
              <p style={{ color: C.gray500, textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
                Aucune session programmée. Ajoutez la première !
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {programs.map(p => (
                  <div key={p.id} style={{ ...listItem, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: C.noir, fontSize: 14 }}>{p.title}</p>
                      {p.description && (
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: C.gray700 }}>{p.description}</p>
                      )}
                      <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 11, color: C.gray500, flexWrap: 'wrap' }}>
                        <span>🕐 {new Date(p.start_time).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} → {new Date(p.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {p.speaker && <span>👤 {p.speaker}</span>}
                        {p.location && <span>📍 {p.location}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openProgramForm(p)} style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${C.gray200}`, borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Éditer
                      </button>
                      <button onClick={() => handleDeleteProgram(p.id)} style={{ padding: '6px 10px', background: 'transparent', color: C.tomate, border: `1px solid ${C.tomate}`, borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── QR Codes Tab ── */}
        {tab === 'qrcodes' && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: C.noir }}>Codes QR du salon</h3>
                <p style={{ margin: 0, color: C.gray500, fontSize: 13 }}>
                  Génère un code QR Entrée et un code QR Sortie pour ce salon — utilisable par tous les étudiants connectés, sans inscription préalable.
                </p>
              </div>
              <button onClick={handleGenerateEventQR} disabled={generatingQR} style={{ ...btnPrimary, opacity: generatingQR ? 0.6 : 1 }}>
                {generatingQR ? 'Génération...' : (salon.entry_qr ? 'Régénérer' : 'Générer les codes QR')}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              <QRDisplay label="Entrée" src={salon.entry_qr} accent={C.green} />
              <QRDisplay label="Sortie" src={salon.exit_qr} accent={C.tomate} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components & styles ────────────────────────────────────────────────────

function QRDisplay({ label, src, accent }: { label: string; src: string | null; accent: string }) {
  return (
    <div style={{ padding: 20, border: `1px solid #E8E8E8`, borderRadius: 8, background: '#fff', textAlign: 'center' }}>
      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>QR {label}</p>
      {src ? (
        <>
          <img src={src} alt={`QR ${label}`} style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto', borderRadius: 4 }} />
          <a href={src} download={`qr-${label.toLowerCase()}.png`} style={{ display: 'inline-block', marginTop: 12, fontSize: 11, color: '#3D3D3D', textDecoration: 'underline' }}>
            Télécharger PNG
          </a>
        </>
      ) : (
        <div style={{ padding: 32, background: '#F4F4F4', borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#6B6B6B' }}>Pas encore généré</p>
        </div>
      )}
    </div>
  )
}

const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: '#EC1F27', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }
const btnSecondary: React.CSSProperties = { padding: '10px 20px', background: 'transparent', color: '#3D3D3D', border: '1.5px solid #E8E8E8', borderRadius: 4, fontWeight: 600, fontSize: 13, cursor: 'pointer' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #E8E8E8', borderRadius: 4, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 28, border: `1px solid #E8E8E8` }
const loadingBox: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#6B6B6B', fontSize: 15 }
const errorBox: React.CSSProperties = { padding: '12px 16px', background: '#FFF0F1', border: `1px solid #EC1F27`, borderRadius: 6, color: '#EC1F27', fontSize: 13, marginBottom: 24, fontWeight: 500 }
const listItem: React.CSSProperties = { padding: '14px 16px', background: '#F4F4F4', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }
const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#3D3D3D', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '12px 20px',
  background: 'none',
  border: 'none',
  borderBottom: active ? `2px solid #EC1F27` : '2px solid transparent',
  marginBottom: -2,
  color: active ? '#EC1F27' : '#6B6B6B',
  fontWeight: active ? 700 : 500,
  cursor: 'pointer',
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
})

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#191829', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6B6B6B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#191829' }}>{value}</p>
    </div>
  )
}
