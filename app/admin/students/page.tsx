'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase/client'
import SegmentExplainer from '@/components/ui/SegmentExplainer'


// ─── Types ───────────────────────────────────────────────────────────────
interface RUser {
  id: string; email: string; name: string | null; role: string
  education_level: string | null; bac_series: string | null
  education_branches: string[] | null; wishlist: string[] | null
  intent_score: number; intent_level: string
  orientation_score: number; last_dwell_minutes: number | null
  optin_letudiant: boolean; created_at: string
}
interface RScan { id: string; user_id: string; event_id: string; stand_id: string | null; channel: string; created_at: string }
interface RAppt { id: string; student_id: string; school_id: string; event_id: string; status: string }
interface REvent { id: string; name: string; city: string; event_date: string }

// ─── Segment colors (ACTION 4 — unified) ─────────────────────────────────
const SEG = {
  high:   { label: 'Décideur',     color: '#059669', bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  medium: { label: 'Comparateur',  color: '#2563EB', bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  low:    { label: 'Explorateur',  color: '#F59E0B', bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
} as const

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)
const fmtMin = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, '0')}` : `${Math.round(m)} min`

// ─── Main ─────────────────────────────────────────────────────────────────
export default function StudentsListPage() {
  const [users, setUsers] = useState<RUser[]>([])
  const [scans, setScans] = useState<RScan[]>([])
  const [appointments, setAppointments] = useState<RAppt[]>([])
  const [events, setEvents] = useState<REvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [search, setSearch] = useState('')
  const [profileFilter, setProfileFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'dwell' | 'stands' | 'name'>('score')
  const [loading, setLoading] = useState(true)

  // Load events
  useEffect(() => {
    (async () => {
      const sb = getSupabase()
      const { data } = await sb.from('events').select('id, name, city, event_date').order('event_date', { ascending: false })
      if (data?.length) {
        setEvents(data as REvent[])
        setSelectedEvent(data[0].id)
      }
    })()
  }, [])

  // Load data for selected event
  useEffect(() => {
    if (!selectedEvent) return
    setLoading(true)
    ;(async () => {
      const sb = getSupabase()
      const [uR, scR, apR] = await Promise.all([
        sb.from('users').select('id,email,name,role,education_level,bac_series,education_branches,wishlist,intent_score,intent_level,orientation_score,last_dwell_minutes,optin_letudiant,created_at'),
        sb.from('scans').select('id,user_id,event_id,stand_id,channel,created_at').eq('event_id', selectedEvent),
        sb.from('appointments').select('id,student_id,school_id,event_id,status').eq('event_id', selectedEvent),
      ])
      setUsers((uR.data ?? []) as RUser[])
      setScans((scR.data ?? []) as RScan[])
      setAppointments((apR.data ?? []) as RAppt[])
      setLoading(false)
    })()
  }, [selectedEvent])

  // ─── Compute student data ───
  const students = useMemo(() => users.filter(u => u.role === 'student'), [users])
  const entryIds = useMemo(() => new Set(scans.filter(s => s.channel === 'entry').map(s => s.user_id)), [scans])
  const attendees = useMemo(() => students.filter(s => entryIds.has(s.id)), [students, entryIds])

  // Per-student computed stats
  const studentStats = useMemo(() => {
    const standsByUser: Record<string, Set<string>> = {}
    const standScansByUser: Record<string, number> = {}
    const confByUser: Record<string, number> = {}
    const dwellByUser: Record<string, number> = {}

    scans.forEach(sc => {
      if (sc.channel === 'stand' && sc.stand_id) {
        if (!standsByUser[sc.user_id]) standsByUser[sc.user_id] = new Set()
        standsByUser[sc.user_id].add(sc.stand_id)
        standScansByUser[sc.user_id] = (standScansByUser[sc.user_id] ?? 0) + 1
      }
      if (sc.channel === 'conference') {
        confByUser[sc.user_id] = (confByUser[sc.user_id] ?? 0) + 1
      }
    })

    // Dwell: time between first and last scan
    const scanTimes: Record<string, number[]> = {}
    scans.forEach(sc => {
      if (!scanTimes[sc.user_id]) scanTimes[sc.user_id] = []
      scanTimes[sc.user_id].push(new Date(sc.created_at).getTime())
    })
    Object.entries(scanTimes).forEach(([uid, times]) => {
      if (times.length >= 2) {
        dwellByUser[uid] = Math.round((Math.max(...times) - Math.min(...times)) / 60000)
      }
    })

    const rdvByUser: Record<string, number> = {}
    const rdvConfByUser: Record<string, number> = {}
    appointments.forEach(a => {
      rdvByUser[a.student_id] = (rdvByUser[a.student_id] ?? 0) + 1
      if (a.status === 'confirmed') rdvConfByUser[a.student_id] = (rdvConfByUser[a.student_id] ?? 0) + 1
    })

    return { standsByUser, standScansByUser, confByUser, dwellByUser, rdvByUser, rdvConfByUser }
  }, [scans, appointments])

  // Build enriched student list
  const enrichedStudents = useMemo(() => {
    return attendees.map(u => ({
      ...u,
      uniqueStands: studentStats.standsByUser[u.id]?.size ?? 0,
      totalStandScans: studentStats.standScansByUser[u.id] ?? 0,
      conferences: studentStats.confByUser[u.id] ?? 0,
      dwellMinutes: studentStats.dwellByUser[u.id] ?? (u.last_dwell_minutes ?? 0),
      rdvTotal: studentStats.rdvByUser[u.id] ?? 0,
      rdvConfirmed: studentStats.rdvConfByUser[u.id] ?? 0,
    }))
  }, [attendees, studentStats])

  // Filter + sort
  const filteredStudents = useMemo(() => {
    let list = enrichedStudents

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.education_level?.toLowerCase().includes(q)
      )
    }

    if (profileFilter !== 'all') {
      const levelMap: Record<string, string> = { 'Décideur': 'high', 'Comparateur': 'medium', 'Explorateur': 'low' }
      list = list.filter(s => s.intent_level === (levelMap[profileFilter] ?? profileFilter))
    }

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.intent_score - a.intent_score
        case 'dwell': return b.dwellMinutes - a.dwellMinutes
        case 'stands': return b.uniqueStands - a.uniqueStands
        case 'name': return (a.name ?? '').localeCompare(b.name ?? '')
        default: return 0
      }
    })
  }, [enrichedStudents, search, profileFilter, sortBy])

  // KPIs
  const kpis = useMemo(() => {
    const total = enrichedStudents.length
    const deciders = enrichedStudents.filter(s => s.intent_level === 'high').length
    const comparators = enrichedStudents.filter(s => s.intent_level === 'medium').length
    const explorers = enrichedStudents.filter(s => s.intent_level === 'low').length
    const avgScore = total > 0 ? Math.round(enrichedStudents.reduce((sum, s) => sum + s.intent_score, 0) / total) : 0
    const avgDwell = total > 0 ? Math.round(enrichedStudents.reduce((sum, s) => sum + s.dwellMinutes, 0) / total) : 0
    return { total, deciders, comparators, explorers, avgScore, avgDwell }
  }, [enrichedStudents])

  const segForLevel = (level: string) => SEG[level as keyof typeof SEG] ?? SEG.low

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF7', color: '#1a1a1a' }}>
      {/* ─── Header ─── */}
      <header style={{ borderBottom: '1px solid #E8E8E8', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' as const, gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#6B6B6B', marginBottom: 10 }}>
                L&apos;Étudiant Salons · Intelligence
              </p>
              <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: '#2B1B4D', letterSpacing: '-0.02em' }}>
                Parcours <span style={{ color: '#EC1F27' }}>étudiants</span>
              </h1>
              <p style={{ marginTop: 10, color: '#6B6B6B', fontSize: 14, maxWidth: 500 }}>
                Chaque visiteur, son cheminement, ses choix. Score d&apos;engagement calculé automatiquement.
              </p>
            </div>
            <select
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #E8E8E8', borderRadius: 8, fontSize: 13, background: '#fff', color: '#2B1B4D', fontWeight: 600, minWidth: 280, cursor: 'pointer' }}
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} — {ev.city} ({new Date(ev.event_date).toLocaleDateString('fr-FR')})</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ─── KPIs ─── */}
      <section style={{ borderBottom: '1px solid #E8E8E8', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24 }}>
          <KpiBlock label="Visiteurs" value={kpis.total} color="#2B1B4D" />
          <KpiBlock label="Décideurs" value={kpis.deciders} color={SEG.high.color} />
          <KpiBlock label="Comparateurs" value={kpis.comparators} color={SEG.medium.color} />
          <KpiBlock label="Explorateurs" value={kpis.explorers} color={SEG.low.color} />
          <KpiBlock label="Score moyen" value={`${kpis.avgScore}/100`} color="#2B1B4D" />
          <KpiBlock label="Durée moyenne" value={fmtMin(kpis.avgDwell)} color="#6B6B6B" />
        </div>
      </section>
    
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 32px 0' }}>
  <SegmentExplainer collapsible />
</div>
      {/* ─── Filters ─── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 32px', display: 'flex', flexWrap: 'wrap' as const, gap: 10, alignItems: 'center', borderBottom: '1px solid #E8E8E8' }}>
        <input
          type="text"
          placeholder="Rechercher un étudiant…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 14px', border: '1px solid #E8E8E8', borderRadius: 8, fontSize: 13, flex: 1, minWidth: 200 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'Décideur', 'Comparateur', 'Explorateur'] as const).map(p => {
            const isActive = profileFilter === p
            const seg = p === 'all' ? null : SEG[p === 'Décideur' ? 'high' : p === 'Comparateur' ? 'medium' : 'low']
            return (
              <button
                key={p}
                onClick={() => setProfileFilter(p)}
                style={{
                  padding: '7px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  letterSpacing: '0.04em', textTransform: 'uppercase' as const, border: '1px solid',
                  background: isActive ? (seg?.color ?? '#2B1B4D') : '#fff',
                  color: isActive ? '#fff' : (seg?.color ?? '#3D3D3D'),
                  borderColor: isActive ? (seg?.color ?? '#2B1B4D') : '#E8E8E8',
                }}
              >
                {p === 'all' ? 'Tous' : p}
              </button>
            )
          })}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          style={{ padding: '8px 14px', border: '1px solid #E8E8E8', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}
        >
          <option value="score">Trier : Score</option>
          <option value="dwell">Trier : Durée</option>
          <option value="stands">Trier : Stands</option>
          <option value="name">Trier : Nom</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6B6B6B', fontFamily: 'monospace' }}>
          {filteredStudents.length} / {enrichedStudents.length}
        </div>
      </section>

      {/* ─── Table ─── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6B6B6B', padding: '80px 0' }}>Chargement…</p>
        ) : filteredStudents.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B6B6B', padding: '80px 0' }}>Aucun étudiant ne correspond.</p>
        ) : (
          <div style={{ overflowX: 'auto' as const }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E8E8E8' }}>
                  {['#', 'Étudiant', 'Segment', 'Stands', 'Conf.', 'RDV', 'Durée', 'Score'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Étudiant' ? 'left' as const : h === '#' ? 'center' as const : 'right' as const, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#6B6B6B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => {
                  const seg = segForLevel(s.intent_level)
                  const initials = (s.name ?? '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F4F4F4', background: i % 2 === 0 ? '#fff' : '#FAFAF7' }}>
                      <td style={{ padding: '12px', textAlign: 'center' as const, fontSize: 11, color: '#D4D4D4', fontFamily: 'monospace' }}>{String(i + 1).padStart(2, '0')}</td>
                      <td style={{ padding: '12px' }}>
                        <Link href={`/admin/students/${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2B1B4D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#2B1B4D', fontSize: 14 }}>{s.name ?? s.email}</div>
                            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>
                              {s.education_level}{s.bac_series ? ` · ${s.bac_series}` : ''}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' as const }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: seg.bg, color: seg.text }}>{seg.label}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' as const, fontFamily: 'monospace', fontWeight: 600 }}>{s.uniqueStands}</td>
                      <td style={{ padding: '12px', textAlign: 'right' as const, fontFamily: 'monospace' }}>{s.conferences}</td>
                      <td style={{ padding: '12px', textAlign: 'right' as const, fontFamily: 'monospace' }}>{s.rdvTotal}{s.rdvConfirmed > 0 && <span style={{ color: '#059669', fontSize: 10 }}> ({s.rdvConfirmed}✓)</span>}</td>
                      <td style={{ padding: '12px', textAlign: 'right' as const, fontSize: 12, color: '#6B6B6B' }}>{s.dwellMinutes > 0 ? fmtMin(s.dwellMinutes) : '—'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' as const }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: seg.color, fontFamily: 'monospace' }}>{s.intent_score}</span>
                        <span style={{ fontSize: 10, color: '#6B6B6B' }}>/100</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────
function KpiBlock({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#6B6B6B', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
    </div>
  )
}