/**
 * School Recommendation Algorithm
 *
 * Deterministic algorithm for recommending top 3 schools based on:
 * - Student's current education level
 * - Academic performance (0-20 scale)
 * - Bac specialty
 * - Interest domains
 * - School requirements and offerings
 */

export interface StudentProfile {
  current_education_level: string // e.g., "Terminale", "Bac+1", "2nde"
  education_branches: string[] // e.g., ["Ingénierie", "Informatique"]
  booth_academic_level: number // 0-20 numeric scale (e.g., 15 = Très Bon)
  bac_specialty: string[] // e.g., ["Maths", "Physique-Chimie"]
  school_preferences: string[] // e.g., ["École X", "École Y"] (optional)
}

export interface SchoolProfile {
  school_id: string
  school_name: string
  target_education_levels: string[] // e.g., ["Bac+1", "Bac+2", "Bac+3"]
  programme_domains: string[] // e.g., ["Ingénierie", "Informatique"]
  minimum_academic_requirement: number // 0-20 scale (e.g., 12 = Bon, 16 = Très Bon)
  bac_specialty_preference?: string[] // Optional: e.g., ["Maths", "Physique-Chimie"]
}

export interface RecommendationResult {
  school_id: string
  school_name: string
  fit_score: number // 0-100
  tier: 'strong' | 'moderate' | 'exploratory' // 🟢 | 🟡 | 🔴
  reason: string
  component_scores: {
    education_level_fit: number
    domain_relevance: number
    academic_feasibility: number
    specialization_alignment: number
    preference_signal: number
  }
}

// ─── Education Level Progression Mapping ───────────────────────────────────

const EDUCATION_LEVEL_PROGRESSION: Record<string, string[]> = {
  // Collégien (3ème-6ème) → long-term planning
  '3ème': ['Bac+3', 'Bac+4', 'Bac+5'],
  '4ème': ['Bac+3', 'Bac+4', 'Bac+5'],
  '5ème': ['Bac+3', 'Bac+4', 'Bac+5'],
  '6ème': ['Bac+3', 'Bac+4', 'Bac+5'],

  // Lycéen (2nde-1ère) → Bac+3+ options
  '2nde': ['Bac+3', 'Bac+4', 'Bac+5'],
  '1ère': ['Bac+1', 'Bac+2', 'Bac+3'],
  'Terminale': ['Bac+1', 'Bac+2', 'Bac+3'],

  // Étudiant → next level
  'Bac+1': ['Bac+2', 'Bac+3', 'Bac+4'],
  'Bac+2': ['Bac+3', 'Bac+4', 'Bac+5'],
  'Bac+3': ['Bac+4', 'Bac+5'],
  'Bac+4': ['Bac+5'],
  'Bac+5': [],
}

// ─── Numeric Grade Scale Mapping ───────────────────────────────────────────

const GRADE_SCALE = {
  0: 'Non déclaré',
  10: 'Moyen',
  12: 'Bon',
  16: 'Très Bon',
  18: 'Excellent',
}

export function getGradeLabel(grade: number): string {
  if (grade >= 18) return 'Excellent'
  if (grade >= 16) return 'Très Bon'
  if (grade >= 12) return 'Bon'
  if (grade >= 10) return 'Moyen'
  return 'Non déclaré'
}

// ─── Algorithm: Step 1 - Map Current Level to Target Levels ────────────────

function mapCurrentToTargetLevels(currentLevel: string): string[] {
  return EDUCATION_LEVEL_PROGRESSION[currentLevel] || []
}

// ─── Algorithm: Step 2 - Filter by Education Level ────────────────────────

function filterByEducationLevel(
  schools: SchoolProfile[],
  targetLevels: string[]
): { school: SchoolProfile; levelMatch: boolean }[] {
  return schools.map((school) => ({
    school,
    levelMatch: targetLevels.some((level) =>
      school.target_education_levels.includes(level)
    ),
  }))
}

// ─── Algorithm: Step 3 - Filter by Domain Overlap ────────────────────────

function calculateDomainRelevance(
  studentBranches: string[],
  schoolDomains: string[]
): number {
  if (studentBranches.length === 0 || schoolDomains.length === 0) return 0

  const matches = studentBranches.filter((branch) =>
    schoolDomains.includes(branch)
  ).length

  // Exact match: 1.0 | Partial match (1-2 of 3): 0.7 | Single match: 0.5
  if (matches === studentBranches.length) return 1.0
  if (matches > 0 && matches < studentBranches.length) return 0.7
  return 0
}

// ─── Algorithm: Step 4 - Academic Fit Scoring ──────────────────────────────

function calculateAcademicFeasibility(
  studentGrade: number,
  schoolMinimum: number
): number {
  // If student meets or exceeds minimum: 1.0
  // Partial credit if within 2 points of minimum: 0.5
  // Below minimum: 0
  if (studentGrade >= schoolMinimum) return 1.0
  if (studentGrade >= schoolMinimum - 2) return 0.5
  return 0
}

// ─── Algorithm: Step 5 - Specialization Alignment ─────────────────────────

function calculateSpecializationAlignment(
  studentSpecialties: string[],
  schoolPreference?: string[]
): number {
  if (!schoolPreference || schoolPreference.length === 0) return 0.5 // Neutral if school has no preference

  const matches = studentSpecialties.filter((specialty) =>
    schoolPreference.includes(specialty)
  ).length

  if (matches > 0) return 1.0
  return 0
}

// ─── Algorithm: Step 6 - Preference Signal ────────────────────────────────

function calculatePreferenceSignal(
  studentPreferences: string[],
  schoolName: string
): number {
  return studentPreferences.some((pref) =>
    schoolName.toLowerCase().includes(pref.toLowerCase())
  )
    ? 1.0
    : 0
}

// ─── Main Recommendation Function ──────────────────────────────────────────

export function recommendSchools(
  student: StudentProfile,
  schools: SchoolProfile[]
): RecommendationResult[] {
  // Step 1: Map current level to target levels
  const targetLevels = mapCurrentToTargetLevels(student.current_education_level)
  if (targetLevels.length === 0) {
    return [] // No valid progression path
  }

  // Step 2: Filter by education level
  const levelFiltered = filterByEducationLevel(schools, targetLevels).filter(
    (item) => item.levelMatch
  )

  // Step 3-6: Score each school
  const scored = levelFiltered.map(({ school }) => {
    // Domain relevance
    const domain_relevance = calculateDomainRelevance(
      student.education_branches,
      school.programme_domains
    )

    // Academic feasibility
    const academic_feasibility = calculateAcademicFeasibility(
      student.booth_academic_level,
      school.minimum_academic_requirement
    )

    // Specialization alignment
    const specialization_alignment = calculateSpecializationAlignment(
      student.bac_specialty,
      school.bac_specialty_preference
    )

    // Preference signal
    const preference_signal = calculatePreferenceSignal(
      student.school_preferences || [],
      school.school_name
    )

    // Education level fit (1.0 if matches)
    const education_level_fit = 1.0

    // Composite fit score
    const fit_score = Math.round(
      (0.35 * education_level_fit +
        0.25 * domain_relevance +
        0.2 * academic_feasibility +
        0.1 * specialization_alignment +
        0.1 * preference_signal) *
        100
    )

    // Determine tier
    let tier: 'strong' | 'moderate' | 'exploratory'
    if (fit_score >= 70) tier = 'strong'
    else if (fit_score >= 40) tier = 'moderate'
    else tier = 'exploratory'

    // Generate reason
    const reasons: string[] = []
    if (domain_relevance > 0.5) {
      reasons.push('Strong domain match')
    }
    if (academic_feasibility > 0.5) {
      reasons.push('Meets academic requirements')
    }
    if (specialization_alignment > 0.5) {
      reasons.push('Bac specialty alignment')
    }
    const reason =
      reasons.length > 0
        ? reasons.join(' + ')
        : `${student.current_education_level} → ${targetLevels.join('/')}`

    return {
      school_id: school.school_id,
      school_name: school.school_name,
      fit_score,
      tier,
      reason,
      component_scores: {
        education_level_fit,
        domain_relevance,
        academic_feasibility,
        specialization_alignment,
        preference_signal,
      },
    }
  })

  // Step 7: Sort by fit_score descending and return top 3
  return scored.sort((a, b) => b.fit_score - a.fit_score).slice(0, 3)
}

// ─── Batch Recommendations (for multiple students) ────────────────────────

export function recommendSchoolsBatch(
  students: StudentProfile[],
  schools: SchoolProfile[]
): Map<string, RecommendationResult[]> {
  const results = new Map<string, RecommendationResult[]>()

  students.forEach((student, index) => {
    const recommendations = recommendSchools(student, schools)
    results.set(`student_${index}`, recommendations)
  })

  return results
}
