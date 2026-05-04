'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';

interface SwipeFormData {
  titre: string;
  duree_value: number;
  duree_unit: 'mois' | 'ans';
  niveau: string;
  modalite: string;
  admission: string;
  cout: number;
  cout_devise: string;
  description: string;
  couleur: string;
  image_url: string;
}

interface Swipe {
  id: string;
  titre: string;
  duree_value: number;
  duree_unit: string;
  niveau: string;
  modalite: string;
  admission: string;
  cout: string;
  description: string;
  couleur: string;
  image_url: string;
  view_count: number;
  save_count: number;
  status: string;
}

const C = {
  tomate: '#EC1F27',
  nuit: '#191829',
  blanc: '#F8F7F2',
  gray700: '#3D3D3D',
  gray500: '#6B6B6B',
  gray300: '#D4D4D4',
  gray100: '#F4F4F4',
};

// Tooltip Component
function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: C.gray300,
          color: C.nuit,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'help',
        }}
      >
        i
      </div>
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: C.nuit,
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            marginBottom: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default function CollaborerPage() {
  const router = useRouter();
  const [view, setView] = useState<'intro' | 'create-swipe'>('intro');
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string>('');

  const [formData, setFormData] = useState<SwipeFormData>({
    titre: '',
    duree_value: 0,
    duree_unit: 'mois',
    niveau: '',
    modalite: '',
    admission: '',
    cout: 0,
    cout_devise: 'EUR',
    description: '',
    couleur: '#932D99',
    image_url: '',
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('school_id')
            .eq('id', user.id)
            .single();

          if (profile?.school_id) {
            setSchoolId(profile.school_id);
            // Fetch swipes for this school
            const { data: swipesData } = await supabase
              .from('school_swipes')
              .select('*')
              .eq('school_id', profile.school_id);

            if (swipesData) {
              setSwipes(swipesData as Swipe[]);
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const totalViews = swipes.reduce((sum, s) => sum + (s.view_count || 0), 0);
  const totalSaves = swipes.reduce((sum, s) => sum + (s.save_count || 0), 0);
  const activeContent = swipes.filter(s => s.status === 'published').length;
  const engagementRate = totalViews > 0 ? ((totalSaves / totalViews) * 100).toFixed(1) : '0';

  const handleCreateSwipe = async () => {
    try {
      if (!schoolId) {
        console.error('School ID not set');
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('school_swipes')
        .insert([
          {
            school_id: schoolId,
            titre: formData.titre,
            duree_value: formData.duree_value,
            duree_unit: formData.duree_unit,
            niveau: formData.niveau,
            modalite: formData.modalite,
            admission: formData.admission,
            cout: formData.cout,
            cout_devise: formData.cout_devise,
            description: formData.description,
            couleur: formData.couleur,
            image_url: formData.image_url,
            status: 'published',
            view_count: 0,
            save_count: 0,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSwipes([...swipes, data as Swipe]);
        setFormData({
          titre: '',
          duree_value: 0,
          duree_unit: 'mois',
          niveau: '',
          modalite: '',
          admission: '',
          cout: 0,
          cout_devise: 'EUR',
          description: '',
          couleur: '#932D99',
          image_url: '',
        });
        setView('intro');
      }
    } catch (err) {
      console.error('Error creating swipe:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: C.blanc }}>
      {view === 'intro' && (
        <>
          {/* Header */}
          <div style={{ padding: '40px', borderBottom: `1px solid ${C.gray300}` }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: C.nuit }}>
              Collaborer
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: C.gray500 }}>
              Créez et publiez du contenu pour attirer les étudiants
            </p>
          </div>

          {/* KPIs */}
          <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: 8,
              borderLeft: `4px solid ${C.tomate}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: C.gray500, fontWeight: 600, textTransform: 'uppercase' }}>
                  Vues Totales
                </p>
                <Tooltip text="Nombre total de vues sur tous vos swipes" />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: C.nuit }}>
                {totalViews}
              </p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: 8,
              borderLeft: `4px solid #0066CC`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: C.gray500, fontWeight: 600, textTransform: 'uppercase' }}>
                  Enregistrements
                </p>
                <Tooltip text="Nombre de fois où les étudiants ont sauvegardé vos swipes" />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: C.nuit }}>
                {totalSaves}
              </p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: 8,
              borderLeft: `4px solid #FCD716`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: C.gray500, fontWeight: 600, textTransform: 'uppercase' }}>
                  Contenus Actifs
                </p>
                <Tooltip text="Nombre de swipes en statut 'publié'" />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: C.nuit }}>
                {activeContent}
              </p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: 8,
              borderLeft: `4px solid #FF6B35`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: C.gray500, fontWeight: 600, textTransform: 'uppercase' }}>
                  Taux d'Engagement
                </p>
                <Tooltip text="Pourcentage : Enregistrements / Vues" />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: C.nuit }}>
                {engagementRate}%
              </p>
            </div>
          </div>

          {/* Swipes / Reels Section */}
          <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
            {/* Swipes */}
            <div style={{
              padding: '30px',
              backgroundColor: '#fff',
              borderRadius: 12,
              border: `1px solid ${C.gray300}`,
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.nuit }}>
                Swipes
              </h3>
              <div style={{ margin: '16px 0', display: 'flex', gap: 16, fontSize: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <p style={{ margin: 0, color: C.gray500 }}>Publiés</p>
                    <Tooltip text="Swipes actifs" />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: C.nuit }}>
                    {swipes.filter(s => s.status === 'published').length}
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <p style={{ margin: 0, color: C.gray500 }}>Vues</p>
                    <Tooltip text="Total des vues" />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: C.nuit }}>
                    {totalViews}
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <p style={{ margin: 0, color: C.gray500 }}>Enregistrés</p>
                    <Tooltip text="Total des enregistrements" />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: C.nuit }}>
                    {totalSaves}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setView('create-swipe')}
                style={{
                  marginTop: '20px',
                  padding: '10px 16px',
                  backgroundColor: C.tomate,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Créer un swipe
              </button>
            </div>

            {/* Reels */}
            <div style={{
              padding: '30px',
              backgroundColor: '#fff',
              borderRadius: 12,
              border: `1px solid ${C.gray300}`,
              opacity: 0.5,
              pointerEvents: 'none',
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.nuit }}>
                🎬 Reels
              </h3>
              <p style={{ margin: '12px 0 0', fontSize: 13, color: C.gray500 }}>
                Bientôt disponible
              </p>
            </div>
          </div>
        </>
      )}

      {view === 'create-swipe' && (
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setView('intro')}
            style={{
              marginBottom: '20px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: C.gray500,
              border: `1px solid ${C.gray300}`,
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Retour
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {/* Form */}
            <div>
              <h2 style={{ margin: '0 0 30px', fontSize: 24, fontWeight: 800, color: C.nuit }}>
                Créer un Swipe
              </h2>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Master in Computer Science"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.gray300}`,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                    Durée (valeur) *
                  </label>
                  <input
                    type="number"
                    value={formData.duree_value || ''}
                    onChange={(e) => setFormData({ ...formData, duree_value: e.target.value ? parseInt(e.target.value) : 0 })}
                    placeholder="2"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `1px solid ${C.gray300}`,
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                    Unité *
                  </label>
                  <select
                    value={formData.duree_unit}
                    onChange={(e) => setFormData({ ...formData, duree_unit: e.target.value as 'mois' | 'ans' })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `1px solid ${C.gray300}`,
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="mois">Mois</option>
                    <option value="ans">Ans</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                  Niveau *
                </label>
                <select
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.gray300}`,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Bac">Bac</option>
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Doctorat">Doctorat</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                  Modalité *
                </label>
                <select
                  value={formData.modalite}
                  onChange={(e) => setFormData({ ...formData, modalite: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.gray300}`,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Présentiel">Présentiel</option>
                  <option value="En ligne">En ligne</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                  Admission *
                </label>
                <select
                  value={formData.admission}
                  onChange={(e) => setFormData({ ...formData, admission: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.gray300}`,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Sélection">Sélection</option>
                  <option value="Dossier">Dossier</option>
                  <option value="Entretien">Entretien</option>
                  <option value="Examen">Examen</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                    Coût (valeur) *
                  </label>
                  <input
                    type="number"
                    value={formData.cout || ''}
                    onChange={(e) => setFormData({ ...formData, cout: e.target.value ? parseFloat(e.target.value) : 0 })}
                    placeholder="5000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `1px solid ${C.gray300}`,
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                    Devise *
                  </label>
                  <select
                    value={formData.cout_devise}
                    onChange={(e) => setFormData({ ...formData, cout_devise: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `1px solid ${C.gray300}`,
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre programme..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.gray300}`,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                  Couleur de fond *
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="color"
                    value={formData.couleur}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    style={{ width: 50, height: 40, borderRadius: 6, cursor: 'pointer', border: 'none' }}
                  />
                  <input
                    type="text"
                    value={formData.couleur}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `1px solid ${C.gray300}`,
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.gray700 }}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.gray300}`,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                onClick={handleCreateSwipe}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: C.tomate,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Enregistrer & Publier
              </button>
            </div>

            {/* Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ alignSelf: 'flex-start', margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: C.nuit }}>
                Aperçu
              </h3>

              {/* Flip Card */}
              <div
                onClick={() => setFlipped(!flipped)}
                style={{
                  perspective: '1000px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: 350,
                  aspectRatio: '3/4',
                  position: 'relative',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.6s',
                  }}
                >
                  {/* Front */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      backgroundColor: formData.couleur || '#932D99',
                      borderRadius: 12,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      backgroundImage: formData.image_url ? `url(${formData.image_url})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div style={{
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: 16,
                      borderRadius: 8,
                    }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                        {formData.titre || 'Titre du programme'}
                      </h4>
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                        {formData.duree_value > 0 ? `${formData.duree_value} ${formData.duree_unit}` : 'Durée'}
                      </p>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      transform: 'rotateY(180deg)',
                      fontSize: 12,
                      overflow: 'auto',
                    }}
                  >
                    {formData.niveau && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: C.gray700 }}>Niveau</p>
                        <p style={{ margin: 0, color: C.gray500 }}>{formData.niveau}</p>
                      </div>
                    )}
                    {formData.modalite && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: C.gray700 }}>Modalité</p>
                        <p style={{ margin: 0, color: C.gray500 }}>{formData.modalite}</p>
                      </div>
                    )}
                    {formData.admission && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: C.gray700 }}>Admission</p>
                        <p style={{ margin: 0, color: C.gray500 }}>{formData.admission}</p>
                      </div>
                    )}
                    {formData.cout > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: C.gray700 }}>Coût</p>
                        <p style={{ margin: 0, color: C.gray500 }}>{formData.cout} {formData.cout_devise}</p>
                      </div>
                    )}
                    {formData.description && (
                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: C.gray700 }}>Description</p>
                        <p style={{ margin: 0, color: C.gray500, lineHeight: 1.4 }}>{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: C.gray500, textAlign: 'center', marginTop: 20 }}>
                Cliquez sur la carte pour la retourner
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
