'use client';
export const dynamic = 'force-dynamic';

import { use, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';

interface School {
  id: string;
  name: string;
  city: string;
  type: string;
  description: string | null;
  target_fields: string[] | null;
  target_levels: string[] | null;
  cover_image_url: string | null;
  website: string | null;
  parcoursup: boolean | null;
  apprenticeship: boolean | null;
}

interface Formation {
  id: string;
  name: string;
  level: string;
  duration: string;
}

const C = {
  red: '#EC1F27',
  blue: '#0066CC',
  yellow: '#FCD716',
  dark: '#1A1A1A',
  gray: '#6B6B6B',
  lightGray: '#F4F4F4',
  border: '#E8E8E8',
};

export default function SchoolPreviewPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = use(params);
  const [school, setSchool] = useState<School | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();

      const [{ data: session }, schoolRes, formRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('schools').select('id,name,city,type,description,target_fields,target_levels,cover_image_url,website,parcoursup,apprenticeship').eq('id', schoolId).maybeSingle(),
        supabase.from('formations').select('id,name,level,duration').eq('school_id', schoolId).order('name'),
      ]);

      setIsLoggedIn(!!session?.session?.user);
      if (schoolRes.data) setSchool(schoolRes.data);
      setFormations(formRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [schoolId]);

  const appProfileUrl = `/schools/${schoolId}`;
  const loginUrl = `/login?redirect=${encodeURIComponent(appProfileUrl)}`;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${C.red}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: C.gray, fontSize: 14 }}>Chargement du profil…</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div style={{ minHeight: '100vh', background: C.lightGray, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, textAlign: 'center' }}>
        <Logo variant="default" size="sm" />
        <p style={{ fontSize: 40 }}>😕</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>Établissement introuvable</p>
        <p style={{ color: C.gray, fontSize: 14 }}>Ce profil n'existe pas ou a été supprimé.</p>
        <a href="/" style={{ color: C.red, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.lightGray, fontFamily: 'system-ui, sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo variant="default" size="sm" />
        <a
          href={isLoggedIn ? appProfileUrl : loginUrl}
          style={{ background: C.red, color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 16px', borderRadius: 6, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {isLoggedIn ? 'Ouvrir dans l\'app →' : 'Se connecter →'}
        </a>
      </div>

      {/* Hero */}
      <div style={{
        background: school.cover_image_url
          ? `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(${school.cover_image_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1A1A1A, #3A3A3A)',
        padding: '48px 20px 32px',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {school.type && (
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              {school.type}
            </span>
          )}
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 900, lineHeight: 1.15 }}>
            {school.name}
          </h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>📍 {school.city}</p>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {school.parcoursup && <span style={{ background: C.blue, color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>Parcoursup</span>}
            {school.apprenticeship && <span style={{ background: '#15803d', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>Alternance</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 20px' }}>

        {/* Description */}
        {school.description && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: C.dark }}>Présentation</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#4B4B4B', lineHeight: 1.6 }}>{school.description}</p>
          </div>
        )}

        {/* Filières */}
        {(school.target_fields ?? []).length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.dark }}>Filières proposées</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(school.target_fields ?? []).map(f => (
                <span key={f} style={{ background: C.lightGray, borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 500, color: '#4B4B4B' }}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Formations */}
        {formations.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: C.dark }}>Formations ({formations.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {formations.slice(0, 5).map(f => (
                <div key={f.id} style={{ borderLeft: `3px solid ${C.red}`, paddingLeft: 12 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, color: C.dark }}>{f.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: C.gray }}>{f.level} · {f.duration}</p>
                </div>
              ))}
              {formations.length > 5 && (
                <p style={{ margin: 0, fontSize: 13, color: C.gray, fontStyle: 'italic' }}>
                  + {formations.length - 5} autres formations disponibles dans l'app
                </p>
              )}
            </div>
          </div>
        )}

        {/* Website */}
        {school.website && (
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: '14px 16px', textDecoration: 'none', marginBottom: 16 }}
          >
            <span style={{ fontSize: 22 }}>🌐</span>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, color: C.dark }}>Site officiel</p>
              <p style={{ margin: 0, fontSize: 12, color: C.blue }}>{school.website}</p>
            </div>
          </a>
        )}

        {/* CTA banner */}
        <div style={{ background: C.dark, borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 24 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            L'Étudiant Salons
          </p>
          <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
            Sauvegardez ce profil et prenez rendez-vous
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            Connectez-vous à l'application pour sauvegarder cet établissement dans votre dossier, consulter toutes les formations et réserver un créneau.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={loginUrl}
              style={{ display: 'block', background: C.red, color: '#fff', fontWeight: 800, fontSize: 14, padding: '14px 20px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.05em' }}
            >
              Se connecter → accéder au profil complet
            </a>
            <a
              href={`/register?redirect=${encodeURIComponent(appProfileUrl)}`}
              style={{ display: 'block', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '12px 20px', borderRadius: 8, textDecoration: 'none' }}
            >
              Créer un compte étudiant
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.gray }}>
          © L'Étudiant Salons · Profil public
        </p>
      </div>
    </div>
  );
}
