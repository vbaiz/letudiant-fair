'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

// ─── Types ───────────────────────────────────────────────────────────────
type StudentSummary = {
  user_id: string
  student_name: string
  email: string
  education_level: string | null
  bac_series: string | null
  education_branches: string[] | null
  event_id: string | null
  event_name: string | null
  entered_at: string | null
  last_seen_at: string | null
  dwell_minutes: number | null
  unique_stands_visited: number
  total_stand_scans: number
  conferences_attended: number
  appointments_total: number
  appointments_confirmed: number
  engagement_score: number
  behavioral_profile: 'Décideur' | 'Explorateur' | 'Comparateur' | 'Observateur' | 'Inscrit'
}

type EventOption = { id: string; name: string }

// ─── Supabase client ─────────────────────────────────────────────────────
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Style tokens ────────────────────────────────────────────────────────
const PROFILE_COLORS: Record<StudentSummary['behavioral_profile'], string> = {
  'Décideur':     'bg-[#E30613] text-white',
  'Explorateur':  'bg-[#FFD100] text-black',
  'Comparateur':  'bg-[#003DA5] text-white',
  'Observateur':  'bg-neutral-200 text-neutral-700',
  'Inscrit':      'bg-neutral-100 text-neutral-500',
}

// ─── Composant principal ─────────────────────────────────────────────────
export default function StudentsListPage() {
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [search, setSearch] = useState('')
  const [profileFilter, setProfileFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'dwell' | 'stands' | 'name'>('score')
  const [loading, setLoading] = useState(true)

  // Load events
  useEffect(() => {
    supabase
      .from('events')
      .select('id, name')
      .order('start_date', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEvents(data)
          if (data.length > 0) setSelectedEvent(data[0].id)
        }
      })
  }, [])

  // Load students for selected event
  useEffect(() => {
    if (!selectedEvent) return
    setLoading(true)
    supabase
      .from('v_student_summary')
      .select('*')
      .eq('event_id', selectedEvent)
      .order('engagement_score', { ascending: false })
      .then(({ data }) => {
        setStudents(data ?? [])
        setLoading(false)
      })
  }, [selectedEvent])

  // Filter + sort
  const filteredStudents = useMemo(() => {
    let list = students

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.student_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.education_level?.toLowerCase().includes(q),
      )
    }

    if (profileFilter !== 'all') {
      list = list.filter((s) => s.behavioral_profile === profileFilter)
    }

    const sorted = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.engagement_score - a.engagement_score
        case 'dwell':
          return (b.dwell_minutes ?? 0) - (a.dwell_minutes ?? 0)
        case 'stands':
          return b.unique_stands_visited - a.unique_stands_visited
        case 'name':
          return (a.student_name ?? '').localeCompare(b.student_name ?? '')
        default:
          return 0
      }
    })

    return sorted
  }, [students, search, profileFilter, sortBy])

  // Aggregated KPIs
  const kpis = useMemo(() => {
    const total = students.length
    const deciders = students.filter((s) => s.behavioral_profile === 'Décideur').length
    const explorers = students.filter((s) => s.behavioral_profile === 'Explorateur').length
    const avgScore = total > 0
      ? Math.round(students.reduce((sum, s) => sum + s.engagement_score, 0) / total)
      : 0
    const avgDwell = total > 0
      ? Math.round(
          students.reduce((sum, s) => sum + (s.dwell_minutes ?? 0), 0) / total,
        )
      : 0
    return { total, deciders, explorers, avgScore, avgDwell }
  }, [students])

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-neutral-900">
      {/* ─── En-tête éditorial ─────────────────────────────────────── */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">
                L'Étudiant Salons · Intelligence
              </p>
              <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight">
                Parcours
                <span className="italic text-[#E30613]"> étudiants</span>
              </h1>
              <p className="mt-4 text-neutral-600 max-w-xl">
                Chaque visiteur, son cheminement, ses choix. L'orientation en temps réel.
              </p>
            </div>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-3 bg-white border border-neutral-300 font-mono text-sm min-w-[280px] focus:border-black focus:outline-none transition"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ─── Bande KPIs éditoriaux ────────────────────────────────── */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          <KpiBlock label="Visiteurs" value={kpis.total} accent="red" />
          <KpiBlock label="Décideurs" value={kpis.deciders} accent="red" />
          <KpiBlock label="Explorateurs" value={kpis.explorers} accent="yellow" />
          <KpiBlock label="Score moyen" value={`${kpis.avgScore}/100`} accent="blue" />
          <KpiBlock label="Durée moyenne" value={`${kpis.avgDwell} min`} accent="neutral" />
        </div>
      </section>

      {/* ─── Filtres ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 py-6 flex flex-wrap gap-3 items-center border-b border-neutral-200">
        <input
          type="text"
          placeholder="Rechercher un étudiant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-white border border-neutral-300 text-sm flex-1 min-w-[200px] focus:border-black focus:outline-none"
        />

        <div className="flex gap-2 text-xs">
          {(['all', 'Décideur', 'Explorateur', 'Comparateur', 'Observateur'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProfileFilter(p)}
              className={`px-3 py-2 border transition ${
                profileFilter === p
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-neutral-300 hover:border-black'
              }`}
            >
              {p === 'all' ? 'Tous' : p}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 bg-white border border-neutral-300 text-sm focus:border-black focus:outline-none"
        >
          <option value="score">Trier : Score d'engagement</option>
          <option value="dwell">Trier : Durée sur place</option>
          <option value="stands">Trier : Stands visités</option>
          <option value="name">Trier : Nom</option>
        </select>

        <div className="ml-auto font-mono text-xs text-neutral-500">
          {filteredStudents.length} / {students.length}
        </div>
      </section>

      {/* ─── Liste ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 py-10">
        {loading ? (
          <p className="text-center text-neutral-500 py-20">Chargement…</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-center text-neutral-500 py-20">Aucun étudiant ne correspond.</p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {filteredStudents.map((s, idx) => (
              <StudentRow key={s.user_id} student={s} rank={idx + 1} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

// ─── Sous-composants ─────────────────────────────────────────────────────
function KpiBlock({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent: 'red' | 'blue' | 'yellow' | 'neutral'
}) {
  const accentClass = {
    red:     'text-[#E30613]',
    blue:    'text-[#003DA5]',
    yellow:  'text-[#B8860B]',
    neutral: 'text-neutral-900',
  }[accent]

  return (
    <div className="border-l-2 border-neutral-200 pl-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-1">
        {label}
      </p>
      <p className={`font-mono text-3xl font-light tabular-nums ${accentClass}`}>
        {value}
      </p>
    </div>
  )
}

function StudentRow({ student, rank }: { student: StudentSummary; rank: number }) {
  const initials = (student.student_name ?? '??')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const profileClass = PROFILE_COLORS[student.behavioral_profile]

  return (
    <li>
      <Link
        href={`/admin/students/${student.user_id}`}
        className="group grid grid-cols-12 gap-4 items-center py-5 hover:bg-white transition px-3 -mx-3"
      >
        {/* Rank */}
        <div className="col-span-1 font-mono text-xs text-neutral-400 tabular-nums">
          {String(rank).padStart(2, '0')}
        </div>

        {/* Identité */}
        <div className="col-span-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-mono text-xs">
            {initials}
          </div>
          <div>
            <p className="font-serif text-lg leading-tight group-hover:text-[#E30613] transition">
              {student.student_name}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {student.education_level}
              {student.bac_series && ` · ${student.bac_series}`}
            </p>
          </div>
        </div>

        {/* Profil */}
        <div className="col-span-2">
          <span className={`inline-block px-2 py-1 text-[10px] tracking-wider uppercase font-medium ${profileClass}`}>
            {student.behavioral_profile}
          </span>
        </div>

        {/* Stats */}
        <div className="col-span-4 grid grid-cols-3 gap-2 text-center">
          <StatMicro label="Stands" value={student.unique_stands_visited} />
          <StatMicro label="Conf." value={student.conferences_attended} />
          <StatMicro label="RDV" value={student.appointments_total} />
        </div>

        {/* Score */}
        <div className="col-span-1 text-right">
          <p className="font-mono text-xl font-light tabular-nums">
            {student.engagement_score}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            /100
          </p>
        </div>
      </Link>
    </li>
  )
}

function StatMicro({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-sm tabular-nums">{value}</p>
      <p className="text-[9px] tracking-wider uppercase text-neutral-500">{label}</p>
    </div>
  )
}