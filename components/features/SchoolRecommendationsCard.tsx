'use client'

/**
 * School Recommendations Display Card
 *
 * Shows recommended schools with:
 * - Fit score (0-100)
 * - Tier badge (Strong/Moderate/Exploratory)
 * - Component breakdown
 * - Reason for recommendation
 * - Call-to-action (save, compare, etc.)
 */

import type { RecommendationResult } from '@/lib/scoring/schoolRecommendation'

interface SchoolRecommendationsCardProps {
  recommendations: RecommendationResult[]
  studentProfile?: {
    currentEducationLevel: string
    educationBranches: string[]
    academicGrade: number
  }
  onSchoolClick?: (schoolId: string) => void
  isLoading?: boolean
}

export default function SchoolRecommendationsCard({
  recommendations,
  studentProfile,
  onSchoolClick,
  isLoading = false,
}: SchoolRecommendationsCardProps) {
  if (isLoading) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E8E8',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          color: '#6B6B6B',
        }}
      >
        <p>Calcul des recommandations en cours...</p>
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div
        style={{
          background: '#FFF7ED',
          border: '1px solid #FECD89',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h3 style={{ margin: '0 0 8px', color: '#92400E' }}>
          📚 Aucune recommandation trouvée
        </h3>
        <p style={{ margin: 0, color: '#B45309', fontSize: '0.875rem' }}>
          Vérifie que les écoles ont rempli leurs profils sur la plateforme.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Header */}
      <div>
        <h2
          style={{
            margin: '0 0 8px',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#1A1A1A',
          }}
        >
          🎯 Écoles Recommandées
        </h2>
        {studentProfile && (
          <p style={{ margin: 0, color: '#6B6B6B', fontSize: '0.9375rem' }}>
            Basé sur {studentProfile.currentEducationLevel} • Note:{' '}
            <strong>{studentProfile.academicGrade}/20</strong> • Domaines:{' '}
            <strong>{studentProfile.educationBranches.join(', ')}</strong>
          </p>
        )}
      </div>

      {/* Recommendations List */}
      <div style={{ display: 'grid', gap: 16 }}>
        {recommendations.map((rec, idx) => {
          const tierLabel = {
            strong: { emoji: '🟢', label: 'Correspondance Forte', bg: '#ECFDF5', border: '#10B981' },
            moderate: { emoji: '🟡', label: 'Correspondance Modérée', bg: '#FFFBEB', border: '#F59E0B' },
            exploratory: { emoji: '🔴', label: 'À Explorer', bg: '#FEF2F2', border: '#EF4444' },
          }[rec.tier]

          return (
            <div
              key={rec.school_id}
              onClick={() => onSchoolClick?.(rec.school_id)}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid #E8E8E8`,
                borderRadius: 12,
                padding: 24,
                cursor: onSchoolClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
                ...(onSchoolClick
                  ? {
                      '&:hover': {
                        borderColor: '#E3001B',
                        boxShadow: '0 4px 12px rgba(227, 0, 27, 0.1)',
                      },
                    }
                  : {}),
              }}
            >
              {/* Rank + Title + Score */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#1A1A1A',
                    }}
                  >
                    {idx + 1}. {rec.school_name}
                  </h3>
                </div>

                {/* Tier + Score Box */}
                <div
                  style={{
                    background: tierLabel.bg,
                    border: `1.5px solid ${tierLabel.border}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    textAlign: 'center',
                    minWidth: 120,
                  }}
                >
                  <div style={{ fontSize: '1.75rem', lineHeight: 1, marginBottom: 4 }}>
                    {tierLabel.emoji}
                  </div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: '#E3001B',
                      marginBottom: 4,
                    }}
                  >
                    {rec.fit_score}%
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: tierLabel.border,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {tierLabel.label}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <p
                style={{
                  margin: '0 0 16px',
                  color: '#3D3D3D',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                }}
              >
                <strong>Pourquoi :</strong> {rec.reason}
              </p>

              {/* Component Scores Breakdown */}
              <div
                style={{
                  background: '#F4F4F4',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6B6B', fontWeight: 600, marginBottom: 4 }}>
                      NIVEAU D'ÉTUDE
                    </div>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#003C8F',
                      }}
                    >
                      {Math.round(rec.component_scores.education_level_fit * 100)}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6B6B', fontWeight: 600, marginBottom: 4 }}>
                      DOMAINES
                    </div>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#003C8F',
                      }}
                    >
                      {Math.round(rec.component_scores.domain_relevance * 100)}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6B6B', fontWeight: 600, marginBottom: 4 }}>
                      ACADÉMIQUE
                    </div>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#003C8F',
                      }}
                    >
                      {Math.round(rec.component_scores.academic_feasibility * 100)}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6B6B', fontWeight: 600, marginBottom: 4 }}>
                      SPÉCIALISATION
                    </div>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#003C8F',
                      }}
                    >
                      {Math.round(rec.component_scores.specialization_alignment * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {onSchoolClick && (
                <button
                  onClick={() => onSchoolClick(rec.school_id)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#E3001B',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  En savoir plus →
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Note */}
      <div
        style={{
          background: '#E6ECF8',
          border: '1px solid #003C8F',
          borderRadius: 8,
          padding: 16,
          fontSize: '0.875rem',
          color: '#003C8F',
        }}
      >
        <p style={{ margin: '0 0 8px' }}>
          <strong>💡 Comment cette note est calculée :</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>35% : Alignement avec ton niveau d'études</li>
          <li>25% : Correspondance avec tes domaines d'intérêt</li>
          <li>20% : Compatibilité académique (notes)</li>
          <li>10% : Alignement avec ta spécialisation Bac</li>
          <li>10% : Préférences mentionnées</li>
        </ul>
      </div>
    </div>
  )
}
