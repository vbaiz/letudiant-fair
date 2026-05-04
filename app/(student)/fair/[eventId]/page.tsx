'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import Tag from '@/components/ui/Tag';
import SectionLabel from '@/components/ui/SectionLabel';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MapPosition { x: number; y: number; w: number; h: number }

interface StandData {
  id: string;
  school_id: string;
  stand_label: string | null;
  category: string;
  map_position: MapPosition;
  schools: { name: string; type: string; city: string | null; website: string | null } | null;
}

interface ProgramSession {
  id: string;
  title: string;
  description: string | null;
  speaker: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
}

interface EventData {
  name: string;
  event_date: string;
  city: string | null;
  address: string | null;
}

// ── Map constants ─────────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  'Écoles de Commerce':        { fill: '#DBEAFE', stroke: '#3B82F6', text: '#1D4ED8' },
  'Écoles Spécialisées':       { fill: '#EDE9FE', stroke: '#8B5CF6', text: '#6D28D9' },
  'Centres de Formation':      { fill: '#FFEDD5', stroke: '#F97316', text: '#C2410C' },
  'Organismes et Partenaires': { fill: '#D1FAE5', stroke: '#10B981', text: '#065F46' },
  'Recruteurs et Entreprises': { fill: '#FEE2E2', stroke: '#EF4444', text: '#B91C1C' },
  "Écoles d'Ingénieurs":       { fill: '#CFFAFE', stroke: '#06B6D4', text: '#0E7490' },
  'Universités':               { fill: '#FEF9C3', stroke: '#EAB308', text: '#A16207' },
  'Grandes Écoles':            { fill: '#EFF6FF', stroke: '#1D4ED8', text: '#1E3A8A' },
  "Écoles d'Art et Design":    { fill: '#FCE7F3', stroke: '#EC4899', text: '#9D174D' },
  "Écoles d'Architecture":     { fill: '#F0FDF4', stroke: '#22C55E', text: '#15803D' },
};
const DEFAULT_COLORS = { fill: '#F3F4F6', stroke: '#9CA3AF', text: '#4B5563' };
const C = (cat: string) => CAT_COLORS[cat] ?? DEFAULT_COLORS;

// Horizontal landscape layout: 5 rows × 7 cols, left-to-right
const MAP_W = 570;
const MAP_H = 265;
const STAND_W = 50;
const STAND_H = 36;
// x positions for each of the 7 columns (groups of 2 separated by 18px aisles)
const COL_X  = [10, 66, 134, 190, 258, 314, 382];
// y positions for each of the 5 rows
const ROW_Y  = [10, 54, 98, 142, 186];
// Vertical aisles between column groups
const VERT_AISLES = [
  { x: 116, w: 18, label: 'Allée A' },
  { x: 240, w: 18, label: 'Allée B' },
  { x: 364, w: 18, label: 'Allée C' },
];
const CONF = { x: 442, y: 10, w: 118, h: 212 };
const ENTRANCE_Y = 228;

// ── Floor plan SVG (horizontal landscape layout) ─────────────────────────────

function FloorPlanSVG({
  stands, selectedId, hoveredId, onSelect, onHover, svgRef,
}: {
  stands: StandData[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (s: StandData | null) => void;
  onHover: (id: string | null) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  // Sort by label so A-01…A-34 fill columns top-to-bottom, left-to-right
  const sorted = useMemo(
    () => [...stands].sort((a, b) => (a.stand_label ?? '').localeCompare(b.stand_label ?? '')),
    [stands],
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width={MAP_W} height={MAP_H} fill="#F7F7F7" />
      <rect width={MAP_W} height={MAP_H} fill="none" stroke="#D4D4D4" strokeWidth="1" />

      {/* Vertical aisles between column groups */}
      {VERT_AISLES.map(({ x, w, label }) => (
        <g key={x}>
          <rect x={x} y={8} width={w} height={ROW_Y[4] + STAND_H - 8} fill="#E5E5E5" />
          <text
            x={x + w / 2} y={ROW_Y[2] + STAND_H / 2}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={5} fill="#A0A0A0" fontFamily="system-ui, sans-serif"
            transform={`rotate(-90,${x + w / 2},${ROW_Y[2] + STAND_H / 2})`}
          >{label}</text>
        </g>
      ))}

      {/* Entrance strip at bottom */}
      <rect x={0} y={ENTRANCE_Y} width={MAP_W} height={MAP_H - ENTRANCE_Y} fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
      <text
        x={MAP_W / 2} y={ENTRANCE_Y + (MAP_H - ENTRANCE_Y) / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={7} fontWeight="bold" fill="#EC1F27" fontFamily="system-ui, sans-serif"
      >▼  ENTRÉE  ▼</text>

      {/* Conference room — no interaction */}
      <rect
        x={CONF.x} y={CONF.y} width={CONF.w} height={CONF.h}
        rx={4} fill="#F0FDF4" stroke="#22C55E" strokeWidth="1.5"
      />
      <text x={CONF.x + CONF.w / 2} y={CONF.y + CONF.h / 2 - 10}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={12} fontFamily="system-ui, sans-serif"
      >🎙️</text>
      <text x={CONF.x + CONF.w / 2} y={CONF.y + CONF.h / 2 + 6}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={6} fontWeight="700" fill="#15803D" fontFamily="system-ui, sans-serif"
      >Salle de</text>
      <text x={CONF.x + CONF.w / 2} y={CONF.y + CONF.h / 2 + 16}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={6} fontWeight="700" fill="#15803D" fontFamily="system-ui, sans-serif"
      >Conférence</text>

      {/* Stands — label number only, positions computed from sort index */}
      {sorted.map((stand, idx) => {
        const col = Math.floor(idx / 5);
        const row = idx % 5;
        const x = COL_X[col];
        const y = ROW_Y[row];
        const colors = C(stand.category);
        const isSelected = stand.id === selectedId;
        const isHovered  = stand.id === hoveredId && !isSelected;

        return (
          <g
            key={stand.id}
            onClick={() => onSelect(isSelected ? null : stand)}
            onMouseEnter={() => onHover(stand.id)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: 'pointer' }}
          >
            {(isSelected || isHovered) && (
              <rect
                x={x - 2} y={y - 2} width={STAND_W + 4} height={STAND_H + 4}
                rx={5} fill={colors.stroke} opacity={0.18}
              />
            )}
            <rect
              x={x} y={y} width={STAND_W} height={STAND_H}
              rx={3}
              fill={isSelected ? colors.stroke : colors.fill}
              stroke={colors.stroke}
              strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
              opacity={isHovered && !isSelected ? 0.85 : 1}
            />
            <text
              x={x + STAND_W / 2} y={y + STAND_H / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={7} fontWeight="700"
              fill={isSelected ? '#fff' : colors.text}
              fontFamily="system-ui, sans-serif"
            >{stand.stand_label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── PDF print window ──────────────────────────────────────────────────────────

function openPrintWindow(svgEl: SVGSVGElement, stands: StandData[], event: EventData | null) {
  const eventName = event?.name ?? 'Salon';
  const eventDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const venueLine = [event?.address, event?.city].filter(Boolean).join(', ');

  const svgString = new XMLSerializer().serializeToString(svgEl);

  const grouped: Record<string, StandData[]> = {};
  stands.forEach(s => {
    const cat = s.category || 'Autre';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });
  Object.values(grouped).forEach(arr =>
    arr.sort((a, b) => (a.stand_label ?? '').localeCompare(b.stand_label ?? ''))
  );

  const rowsHtml = Object.entries(grouped).map(([cat, items]) => {
    const colors = CAT_COLORS[cat] ?? DEFAULT_COLORS;
    const rows = items.map(s => `
      <tr>
        <td style="padding:4px 8px;font-size:11px;font-weight:700;color:#6B6B6B;white-space:nowrap;">${s.stand_label ?? ''}</td>
        <td style="padding:4px 8px;font-size:12px;font-weight:600;">${s.schools?.name ?? ''}</td>
        <td style="padding:4px 8px;font-size:11px;color:#9CA3AF;">${s.schools?.city ?? ''}</td>
      </tr>`).join('');
    return `
      <tr>
        <td colspan="3" style="padding:10px 8px 4px;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${colors.text};background:${colors.fill};border-left:3px solid ${colors.stroke};">
          ${cat}
        </td>
      </tr>${rows}`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Plan — ${eventName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, Arial, sans-serif; color: #1A1A1A; padding: 24px 28px; max-width: 780px; margin: 0 auto; }
  .header { border-bottom: 3px solid #EC1F27; padding-bottom: 14px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; font-weight: 900; letter-spacing: -.04em; color: #191829; }
  .header p { font-size: 12px; color: #6B6B6B; margin-top: 4px; }
  .map-wrap { text-align: center; margin-bottom: 24px; }
  .map-wrap svg { max-width: 280px; width: 100%; border-radius: 8px; border: 1px solid #E5E5E5; }
  h2 { font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; }
  tr:nth-child(even) td { background: #FAFAFA; }
  td { border-bottom: 1px solid #F0F0F0; vertical-align: middle; }
  .footer { margin-top: 20px; font-size: 10px; color: #C0C0C0; text-align: center; }
  @page { margin: 1.2cm; size: A4 portrait; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="header">
    <h1>${eventName}</h1>
    <p>${eventDate}${venueLine ? '  ·  ' + venueLine : ''}</p>
  </div>
  <div class="map-wrap">${svgString}</div>
  <h2>Liste des exposants (${stands.length} stands)</h2>
  <table><tbody>${rowsHtml}</tbody></table>
  <p class="footer">L'Étudiant Salons 2026 — Plan généré le ${new Date().toLocaleDateString('fr-FR')}</p>
  <script>window.addEventListener('load', () => { setTimeout(() => window.print(), 300); });<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank', 'width=800,height=900');
  win?.addEventListener('unload', () => URL.revokeObjectURL(url), { once: true });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FairPage() {
  const router    = useRouter();
  const { eventId } = useParams<{ eventId: string }>();
  const svgRef    = useRef<SVGSVGElement>(null);

  const [activeTab, setActiveTab]             = useState<'plan' | 'programme'>('plan');
  const [event, setEvent]                     = useState<EventData | null>(null);
  const [eventLoading, setEventLoading]       = useState(true);
  const [stands, setStands]                   = useState<StandData[]>([]);
  const [standsLoading, setStandsLoading]     = useState(true);
  const [standsError, setStandsError]         = useState<string | null>(null);
  const [sessions, setSessions]               = useState<ProgramSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [pdfLoading, setPdfLoading]           = useState(false);
  const [selectedStand, setSelectedStand]     = useState<StandData | null>(null);
  const [hoveredId, setHoveredId]             = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('events')
        .select('name, event_date, city, address')
        .eq('id', eventId)
        .maybeSingle();
      if (data) setEvent(data as EventData);
      setEventLoading(false);
    }
    load();
  }, [eventId]);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/events/${eventId}/stands`);
        const json = await res.json();
        if (json.success) setStands(json.data || []);
        else setStandsError(json.error ?? 'Erreur lors du chargement du plan');
      } catch {
        setStandsError('Impossible de charger le plan du salon');
      } finally {
        setStandsLoading(false);
      }
    }
    load();
  }, [eventId]);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/events/${eventId}/programs`);
        const json = await res.json();
        if (json.success) setSessions(json.data || []);
      } catch { /* silent */ } finally {
        setSessionsLoading(false);
      }
    }
    load();
  }, [eventId]);

  const standsByCategory = stands.reduce<Record<string, StandData[]>>((acc, s) => {
    const cat = s.category || 'Autre';
    (acc[cat] ??= []).push(s);
    return acc;
  }, {});
  Object.values(standsByCategory).forEach(arr =>
    arr.sort((a, b) => (a.stand_label ?? '').localeCompare(b.stand_label ?? ''))
  );

  const presentCategories = Object.keys(CAT_COLORS).filter(cat => stands.some(s => s.category === cat));

  const formattedDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const venueLine = [event?.address, event?.city].filter(Boolean).join(', ');

  const handlePDF = useCallback(() => {
    if (!svgRef.current || stands.length === 0) return;
    setPdfLoading(true);
    try { openPrintWindow(svgRef.current, stands, event); }
    finally { setPdfLoading(false); }
  }, [stands, event]);

  const selColors = selectedStand ? C(selectedStand.category) : DEFAULT_COLORS;

  return (
    <div className="page-with-nav" style={{ background: '#F4F4F4', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', padding: '20px 20px 0', borderBottom: '1px solid #E8E8E8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: '#6B6B6B', fontSize: 22, lineHeight: 1, cursor: 'pointer', padding: 0 }}
          >←</button>
          <div style={{ flex: 1 }}>
            <Tag variant="red" style={{ marginBottom: 6 }}>Salon</Tag>
            {eventLoading ? (
              <>
                <Skeleton style={{ height: 22, width: '70%', marginBottom: 6 }} />
                <Skeleton style={{ height: 14, width: '55%' }} />
              </>
            ) : (
              <>
                <h1 className="le-h2" style={{ margin: '4px 0 2px', lineHeight: 1.2 }}>{event?.name ?? 'Salon'}</h1>
                <p className="le-caption" style={{ margin: 0 }}>
                  {formattedDate && <>📅 {formattedDate}</>}
                  {venueLine && <>&nbsp;|&nbsp; 📍 {venueLine}</>}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E8E8E8', marginTop: 4 }}>
          {(['plan', 'programme'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                color: activeTab === tab ? '#EC1F27' : '#6B6B6B',
                borderBottom: activeTab === tab ? '2px solid #EC1F27' : '2px solid transparent',
                marginBottom: '-2px', transition: 'color 0.15s',
              }}
            >
              {tab === 'plan' ? '🗺️ Plan' : '📋 Programme'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: '20px' }}>

        {activeTab === 'plan' ? (
          <div>
            {/* ── Plan (landscape SVG, auto-height) ── */}
            <div style={{ marginBottom: 24 }}>
              {/* Title row + PDF button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <SectionLabel>Plan du salon</SectionLabel>
                {!standsLoading && stands.length > 0 && (
                  <button
                    onClick={handlePDF}
                    disabled={pdfLoading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 8,
                      background: pdfLoading ? '#F4F4F4' : '#191829',
                      color: pdfLoading ? '#9CA3AF' : '#fff',
                      border: 'none', cursor: pdfLoading ? 'default' : 'pointer',
                      fontSize: 12, fontWeight: 700, letterSpacing: '.04em',
                      transition: 'background .15s',
                    }}
                  >📄 Plan PDF</button>
                )}
              </div>

              {/* SVG floor plan */}
              <div style={{
                background: '#fff', borderRadius: 12,
                border: '1px solid #E8E8E8', overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}>
                {standsLoading ? (
                  <Skeleton style={{ height: 160, margin: 16, borderRadius: 8 }} />
                ) : standsError ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p className="le-caption" style={{ color: '#EC1F27' }}>⚠️ {standsError}</p>
                  </div>
                ) : stands.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p className="le-caption">Le plan du salon sera disponible prochainement.</p>
                  </div>
                ) : (
                  <FloorPlanSVG
                    stands={stands}
                    selectedId={selectedStand?.id ?? null}
                    hoveredId={hoveredId}
                    onSelect={setSelectedStand}
                    onHover={setHoveredId}
                    svgRef={svgRef}
                  />
                )}
              </div>
            </div>

            {/* ── Exhibitor list (below the fold) ── */}
            {!standsLoading && stands.length > 0 && (
              <div style={{ paddingBottom: 100 }}>
                {/* Category legend */}
                {presentCategories.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {presentCategories.map(cat => {
                      const colors = C(cat);
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 2, background: colors.stroke, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: '#6B6B6B' }}>{cat}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                  paddingBottom: 8, borderBottom: '2px solid #E8E8E8',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6B6B6B' }}>
                    Exposants
                  </span>
                  <span style={{
                    background: '#EC1F27', color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 10,
                  }}>{stands.length}</span>
                </div>

                {Object.entries(standsByCategory).map(([cat, items]) => {
                  const colors = C(cat);
                  return (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                        padding: '5px 10px',
                        background: colors.fill,
                        borderLeft: `3px solid ${colors.stroke}`,
                        borderRadius: '0 6px 6px 0',
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: colors.stroke, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: colors.text }}>{cat}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: colors.text, opacity: 0.7 }}>
                          {items.length} stand{items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items.map(stand => {
                          const isActive = stand.id === selectedStand?.id;
                          return (
                            <button
                              key={stand.id}
                              onClick={() => setSelectedStand(isActive ? null : stand)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '7px 10px',
                                background: isActive ? colors.fill : '#fff',
                                borderRadius: 8,
                                border: isActive ? `1.5px solid ${colors.stroke}` : '1px solid #F0F0F0',
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'background 0.1s, border-color 0.1s',
                              }}
                            >
                              <span style={{
                                fontSize: 10, fontWeight: 800, color: colors.text,
                                background: isActive ? '#fff' : colors.fill,
                                border: `1px solid ${colors.stroke}`,
                                padding: '2px 6px', borderRadius: 5,
                                minWidth: 36, textAlign: 'center', flexShrink: 0,
                              }}>
                                {stand.stand_label}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', flex: 1, minWidth: 0 }}>
                                {stand.schools?.name ?? '—'}
                              </span>
                              {stand.schools?.city && (
                                <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
                                  {stand.schools.city}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Selected stand — centered modal (works on all screen sizes) ── */}
            {selectedStand && (
              <>
                {/* Overlay — click to close */}
                <div
                  onClick={() => setSelectedStand(null)}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(0,0,0,0.45)',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                />
                {/* Modal card */}
                <div style={{
                  position: 'fixed',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 51,
                  background: '#fff',
                  borderRadius: 16,
                  border: `1.5px solid ${selColors.stroke}`,
                  padding: '20px 22px',
                  width: 'min(88vw, 420px)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
                  animation: 'slideUp 0.2s ease-out',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, color: selColors.text,
                          background: selColors.fill, border: `1px solid ${selColors.stroke}`,
                          padding: '3px 8px', borderRadius: 6,
                        }}>
                          {selectedStand.stand_label}
                        </span>
                        <span style={{ fontSize: 11, color: selColors.text, fontWeight: 600 }}>
                          {selectedStand.category}
                        </span>
                      </div>
                      <p style={{ fontSize: 17, fontWeight: 800, color: '#191829', margin: '0 0 4px', lineHeight: 1.2 }}>
                        {selectedStand.schools?.name ?? '—'}
                      </p>
                      {selectedStand.schools?.city && (
                        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 16px' }}>
                          📍 {selectedStand.schools.city}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selectedStand.schools?.website && (
                          <a
                            href={selectedStand.schools.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 13, fontWeight: 700, color: '#fff',
                              background: selColors.stroke, padding: '9px 16px',
                              borderRadius: 8, textDecoration: 'none',
                            }}
                          >Voir le site →</a>
                        )}
                        <a
                          href={`/schools/${selectedStand.school_id}`}
                          style={{
                            fontSize: 13, fontWeight: 700,
                            color: selColors.text, background: selColors.fill,
                            border: `1px solid ${selColors.stroke}`,
                            padding: '9px 16px', borderRadius: 8, textDecoration: 'none',
                          }}
                        >Fiche école</a>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStand(null)}
                      style={{
                        background: '#F4F4F4', border: 'none', borderRadius: '50%',
                        width: 30, height: 30, cursor: 'pointer', flexShrink: 0,
                        fontSize: 14, color: '#6B6B6B',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>
                </div>
              </>
            )}
          </div>

        ) : (
          /* ── Programme tab ── */
          <div>
            <SectionLabel>Programme du jour</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {sessionsLoading ? (
                <>
                  <Skeleton style={{ height: 70 }} />
                  <Skeleton style={{ height: 70 }} />
                </>
              ) : sessions.length === 0 ? (
                <p style={{ color: '#6B6B6B', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                  Le programme sera publié prochainement par l&apos;organisateur du salon.
                </p>
              ) : (
                sessions.map(session => {
                  const start = new Date(session.start_time);
                  const timeLabel = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={session.id} className="le-card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ background: '#F4F4F4', borderRadius: 8, padding: '8px 10px', textAlign: 'center', flexShrink: 0, minWidth: 56 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#EC1F27', display: 'block' }}>{timeLabel}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 6px', color: '#1A1A1A' }}>{session.title}</p>
                        {session.description && (
                          <p style={{ fontSize: 12, color: '#6B6B6B', margin: '0 0 6px' }}>{session.description}</p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {session.location && <Tag variant="blue">{session.location}</Tag>}
                          {session.speaker && (
                            <span className="le-caption" style={{ fontSize: 11 }}>👤 {session.speaker}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating scan button */}
      <a
        href={`/fair/${eventId}/scan`}
        style={{
          position: 'fixed', bottom: 80, right: 20,
          background: '#EC1F27', color: '#fff',
          padding: '14px 20px', borderRadius: 30,
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 20px rgba(227,0,27,0.4)',
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 40,
        }}
      >
        <span style={{ fontSize: 18 }}>📷</span>
        Scanner un stand
      </a>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px) translate(-50%,-50%); }
          to   { opacity: 1; transform: translateY(0)   translate(-50%,-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
