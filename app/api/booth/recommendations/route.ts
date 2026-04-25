/**
 * POST /api/booth/recommendations
 *
 * Generates top-3 school recommendations based on student profile + booth data
 *
 * Body:
 * {
 *   event_id: string (uuid)
 *   current_education_level: string (e.g., "Terminale", "Bac+1")
 *   education_branches: string[] (e.g., ["Ingénierie", "Informatique"])
 *   booth_academic_level: number (0-20 scale, e.g., 15 = Très Bon)
 *   bac_specialty: string[] (e.g., ["Maths", "Physique-Chimie"])
 *   school_preferences: string[] (optional, e.g., ["École X"])
 * }
 *
 * Returns:
 * {
 *   success: boolean
 *   recommendations: [
 *     {
 *       school_id: string
 *       school_name: string
 *       fit_score: number (0-100)
 *       tier: 'strong' | 'moderate' | 'exploratory'
 *       reason: string
 *       component_scores: {...}
 *     }
 *   ]
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  recommendSchools,
  type StudentProfile,
  type SchoolProfile,
} from '@/lib/scoring/schoolRecommendation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      event_id,
      current_education_level,
      education_branches = [],
      booth_academic_level,
      bac_specialty = [],
      school_preferences = [],
      capture_id, // optional — Score Booth flow passes this to persist top-3 result
    } = body

    // ─── Validation ───────────────────────────────────────────────────────

    if (!event_id || !current_education_level || booth_academic_level === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: event_id, current_education_level, booth_academic_level',
        },
        { status: 400 }
      )
    }

    if (booth_academic_level < 0 || booth_academic_level > 20) {
      return NextResponse.json(
        {
          success: false,
          message: 'booth_academic_level must be between 0 and 20',
        },
        { status: 400 }
      )
    }

    // ─── Fetch schools for event with recommendation fields ────────────────

    const supabase = await createServiceClient()

    // First, get all schools (via exhibitor_schools relationship to event)
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select(
        `
        id,
        name,
        target_education_levels,
        programme_domains,
        minimum_academic_requirement,
        bac_specialty_preference
      `
      )
      .order('name', { ascending: true })

    if (schoolsError) {
      console.error('[booth/recommendations] Schools query error:', schoolsError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch schools',
        },
        { status: 500 }
      )
    }

    if (!schools || schools.length === 0) {
      return NextResponse.json(
        {
          success: true,
          recommendations: [],
          message: 'No schools available for recommendations (schools table may be empty)',
        },
        { status: 200 }
      )
    }

    // ─── Transform to algorithm format ────────────────────────────────────

    const studentProfile: StudentProfile = {
      current_education_level,
      education_branches: Array.isArray(education_branches) ? education_branches : [],
      booth_academic_level: Number(booth_academic_level),
      bac_specialty: Array.isArray(bac_specialty) ? bac_specialty : [],
      school_preferences: Array.isArray(school_preferences) ? school_preferences : [],
    }

    const schoolProfiles: SchoolProfile[] = schools
      .filter((school: any) => school.id && school.name)
      .map((school: any) => ({
        school_id: school.id,
        school_name: school.name,
        target_education_levels: Array.isArray(school.target_education_levels)
          ? school.target_education_levels
          : ['Bac+1', 'Bac+2', 'Bac+3'],
        programme_domains: Array.isArray(school.programme_domains)
          ? school.programme_domains
          : [],
        minimum_academic_requirement: Number(school.minimum_academic_requirement) || 12,
        bac_specialty_preference: Array.isArray(school.bac_specialty_preference)
          ? school.bac_specialty_preference
          : undefined,
      }))

    // ─── Run recommendation algorithm ──────────────────────────────────────

    const recommendations = recommendSchools(studentProfile, schoolProfiles)

    // ─── Persist top-3 onto the booth_captures row (Score Booth flow) ─────
    // Only when the caller passed a capture_id — keeps backward-compat with
    // recommendation requests that aren't tied to a stored capture.

    if (capture_id && recommendations.length > 0) {
      const schoolIds = recommendations.map((r) => r.school_id)
      const { error: linkErr } = await supabase.rpc('set_booth_recommendations', {
        p_capture_id: capture_id,
        p_school_ids: schoolIds,
      })
      if (linkErr) {
        // Non-fatal: log and continue — the recommendations are still
        // returned to the booth UI even if persistence failed.
        console.error('[booth/recommendations] set_booth_recommendations failed:', linkErr)
      }
    }

    // ─── Log for audit/debugging ──────────────────────────────────────────

    if (recommendations.length > 0) {
      console.log(
        `[booth/recommendations] Generated ${recommendations.length} recommendations for ${current_education_level} student with grade ${booth_academic_level}`
      )
    } else {
      console.log(
        `[booth/recommendations] No recommendations found for ${current_education_level} student (possible: no matching education level path)`
      )
    }

    // ─── Success ───────────────────────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        recommendations,
        message: `Generated ${recommendations.length} school recommendations for ${current_education_level} student`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[booth/recommendations] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
