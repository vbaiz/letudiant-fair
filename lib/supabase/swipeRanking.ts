import { UserRow, SchoolSwipeRow } from '@/lib/supabase/types'
import { getSupabase } from '@/lib/supabase/client'

export interface SchoolSwipeForDisplay extends SchoolSwipeRow {
  school_name?: string
  school_type?: string
  score?: number
  reason?: string
}

export async function rankSwipesForStudent(
  studentId: string,
  userProfile: UserRow,
  allSwipes: SchoolSwipeRow[]
): Promise<SchoolSwipeForDisplay[]> {
  try {
    // Get schools data for each swipe
    const supabase = getSupabase()
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, type')

    const schoolMap = schools?.reduce((acc, s) => {
      acc[s.id] = s
      return acc
    }, {} as Record<string, any>) || {}

    // Get user's saved formations to understand interests
    const { data: savedFormations } = await supabase
      .from('user_saved_formations')
      .select('formation_id')
      .eq('user_id', studentId)

    // Build saved fields array from formations (for behavioral boost)
    const savedFields = new Set<string>()
    if (savedFormations?.length) {
      const { data: formations } = await supabase
        .from('formations')
        .select('fields')
        .in('id', savedFormations.map(f => f.formation_id))

      formations?.forEach(f => {
        (f.fields || []).forEach(field => savedFields.add(field))
      })
    }

    // Score each swipe
    const scoredSwipes: SchoolSwipeForDisplay[] = allSwipes.map(swipe => {
      const userBranches = userProfile.education_branches || []
      const swipeFields = (swipe.tags || []).filter(tag =>
        userBranches.some(branch =>
          branch.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(branch.toLowerCase())
        )
      )

      // Profile Match Score (0-100)
      let profileMatch = 0

      // Field overlap (60%)
      const fieldOverlapScore = swipe.tags?.length
        ? (swipeFields.length / swipe.tags.length) * 60
        : 0
      profileMatch += fieldOverlapScore

      // Education level match (20%)
      if (swipe.niveau && userProfile.education_level) {
        const niveauMatch =
          swipe.niveau.toLowerCase().includes(userProfile.education_level.toLowerCase()) ||
          userProfile.education_level.toLowerCase().includes(swipe.niveau.toLowerCase())
        if (niveauMatch) profileMatch += 20
      }

      // Region match (20%) - using postal code first 2 digits
      if (swipe.image_url && userProfile.postal_code) {
        // Simple heuristic: if there's any image (school has presence), +20
        profileMatch += 20
      }

      // Behavioral Boost (0-100)
      let behavioralBoost = 0
      swipeFields.forEach(field => {
        if (savedFields.has(field)) {
          behavioralBoost += 25
        }
      })

      // Cap behavioral boost at 100
      behavioralBoost = Math.min(behavioralBoost, 100)

      // Total score formula: 60% profile + 40% behavioral
      const totalScore = (profileMatch * 0.6) + (behavioralBoost * 0.4)

      // Get school info
      const school = swipe.school_id ? schoolMap[swipe.school_id] : null

      // Reason for recommendation
      let reason = 'Découverte'
      if (profileMatch > 70) reason = 'Domaine intéressant'
      if (behavioralBoost > 25) reason = 'Basé sur vos intérêts'

      return {
        ...swipe,
        school_name: school?.name,
        school_type: school?.type,
        score: totalScore,
        reason
      }
    })

    // Sort by score descending
    return scoredSwipes.sort((a, b) => (b.score || 0) - (a.score || 0))
  } catch (error) {
    console.error('Error ranking swipes:', error)
    // Fallback: return swipes sorted by view count if error
    return allSwipes
      .map(s => ({
        ...s,
        score: s.view_count || 0
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
  }
}
