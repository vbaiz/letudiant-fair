# School Recommendation System — Implementation Guide

## Overview

The School Recommendation System generates personalized top-3 school recommendations for students based on their:
- Current education level (Terminale, Bac+1, etc.)
- Academic performance (numeric 0-20 scale)
- Bac specialties
- Interest domains
- Optional school preferences

Recommendations are **deterministic** (no ML/AI) using a weighted scoring algorithm and display:
1. **Instantly on booth tablet** (within 500ms)
2. **Post-fair in app** (dashboard/recommendations page)

---

## Architecture

```
Physical Fair Booth
  ↓
Student scans QR → profile loads
  ↓
Staff fills form (4 new sections):
  - Orientation stage
  - Current education level
  - Interest domains
  - Grade (0-20 numeric)
  - Bac specialty (optional)
  - School preferences (optional)
  ↓
POST /api/booth/capture-orientation
  (saves to booth_captures table)
  ↓
POST /api/booth/recommendations
  (calls deterministic algorithm)
  ↓
┌─────────────────────────────────┐
│ BOOTH DISPLAY                   │
│ Shows top 3 schools instantly   │
│ with fit scores & reasons       │
│ (staff shows student on tablet) │
└─────────────────────────────────┘
  ↓
POST /api/booth/capture-orientation stores:
  - booth_academic_level (numeric 0-20)
  - bac_specialty[] (array)
  - school_preferences[] (array)
  ↓
┌─────────────────────────────────┐
│ POST-FAIR IN APP                │
│ Student logs in → sees recs     │
│ in /schools/recommendations     │
│ Full breakdown + component scores
└─────────────────────────────────┘
```

---

## Files Created/Modified

### New Files

1. **`supabase/migrations/012_exhibitor_school_profile.sql`**
   - Adds fields to `schools` table:
     - `target_education_levels[]` (e.g., [Bac+1, Bac+2, Bac+3])
     - `programme_domains[]` (e.g., [Ingénierie, Informatique])
     - `minimum_academic_requirement` (numeric 0-20)
     - `bac_specialty_preference[]` (optional)

2. **`lib/scoring/schoolRecommendation.ts`**
   - Deterministic recommendation algorithm
   - `recommendSchools(studentProfile, schools)` → top 3 schools
   - Functions:
     - `mapCurrentToTargetLevels()` — maps current education level to progression path
     - `filterByEducationLevel()` — removes schools at wrong level
     - `calculateDomainRelevance()` — scores domain overlap (0-1)
     - `calculateAcademicFeasibility()` — scores grade vs. school minimum (0-1)
     - `calculateSpecializationAlignment()` — scores Bac specialty match (0-1)
     - `calculatePreferenceSignal()` — scores student preferences (0-1)

3. **`app/api/booth/recommendations/route.ts`**
   - POST endpoint: accepts student profile + booth data
   - Returns top 3 recommendations with fit scores
   - Response: `{success, recommendations[], message}`

4. **`components/features/BoothCaptureFormV2.tsx`**
   - Enhanced form with 4 steps:
     1. Orientation (existing Q1-Q3)
     2. Academic Grade (numeric slider 0-20)
     3. Bac Specialty (optional checkboxes)
     4. Preferences & Contact (optional)
   - Auto-calls `/api/booth/recommendations` on submit
   - Displays top 3 schools instantly on success screen
   - Auto-resets after 5 seconds

5. **`components/features/SchoolRecommendationsCard.tsx`**
   - Display component for post-fair app
   - Shows:
     - School name + rank (#1, #2, #3)
     - Fit score (0-100) with tier emoji
     - Reason for recommendation
     - Component score breakdown
     - Call-to-action (learn more)

### Modified Files

- None yet — use V2 form instead of original BoothCaptureForm

---

## Database Schema

### Migration: `012_exhibitor_school_profile.sql`

```sql
ALTER TABLE public.schools
ADD COLUMN target_education_levels TEXT[] DEFAULT '{Bac+1,Bac+2,Bac+3}'::TEXT[],
ADD COLUMN programme_domains TEXT[] DEFAULT '{Ingénierie}'::TEXT[],
ADD COLUMN minimum_academic_requirement NUMERIC DEFAULT 12 CHECK (minimum_academic_requirement >= 0 AND minimum_academic_requirement <= 20),
ADD COLUMN bac_specialty_preference TEXT[] DEFAULT NULL;
```

### Updated `booth_captures` table fields (from 011)

```sql
booth_academic_level NUMERIC, -- 0-20 scale (new in V2)
bac_specialty TEXT[], -- e.g., ['Maths', 'Physique-Chimie'] (new in V2)
school_preferences TEXT[] -- e.g., ['École X', 'École Y'] (new in V2)
```

---

## Algorithm: Deterministic Scoring

### Step 1: Education Level Progression Mapping

Map current level → natural progression:

```
3ème/4ème/5ème/6ème        → [Bac+3, Bac+4, Bac+5]
2nde                        → [Bac+3, Bac+4, Bac+5]
1ère                        → [Bac+1, Bac+2, Bac+3]
Terminale                   → [Bac+1, Bac+2, Bac+3]
Bac+1                       → [Bac+2, Bac+3, Bac+4]
Bac+2                       → [Bac+3, Bac+4, Bac+5]
Bac+3+                      → [next level only]
```

### Step 2-6: Scoring Formula

```
fit_score = (
  0.35 * education_level_fit +        // 0-1: is school in progression path?
  0.25 * domain_relevance +            // 0-1: domain overlap
  0.20 * academic_feasibility +        // 0-1: grade vs. school minimum
  0.10 * specialization_alignment +    // 0-1: Bac specialty match
  0.10 * preference_signal              // 0-1: student mentioned school
) * 100
```

### Tier Assignment

- **🟢 Strong Fit:** 70-100 points
- **🟡 Moderate Fit:** 40-69 points
- **🔴 Exploratory:** 0-39 points

---

## API Endpoint: POST /api/booth/recommendations

### Request Body

```json
{
  "event_id": "uuid",
  "current_education_level": "Terminale",
  "education_branches": ["Ingénierie", "Informatique"],
  "booth_academic_level": 15,
  "bac_specialty": ["Maths", "Physique-Chimie"],
  "school_preferences": ["École X"]
}
```

### Response

```json
{
  "success": true,
  "recommendations": [
    {
      "school_id": "uuid",
      "school_name": "École X",
      "fit_score": 82,
      "tier": "strong",
      "reason": "Strong domain match + Meets academic requirements",
      "component_scores": {
        "education_level_fit": 1.0,
        "domain_relevance": 0.85,
        "academic_feasibility": 0.8,
        "specialization_alignment": 0.7,
        "preference_signal": 1.0
      }
    },
    ...
  ],
  "message": "Generated 3 school recommendations"
}
```

### Status Codes

- **200** — Recommendations generated successfully
- **400** — Missing/invalid required fields
- **500** — Server error (Supabase query failed, etc.)

---

## Implementation Steps

### Step 1: Deploy Migration (5 min)

1. Go to Supabase SQL Editor
2. Copy `supabase/migrations/012_exhibitor_school_profile.sql`
3. Run migration
4. Verify: `SELECT * FROM public.schools LIMIT 1;` → should show new columns

### Step 2: Add Algorithm Library (already created)

- File: `lib/scoring/schoolRecommendation.ts`
- No dependencies; pure TypeScript functions
- Export: `recommendSchools(student, schools)`

### Step 3: Add API Endpoint (already created)

- File: `app/api/booth/recommendations/route.ts`
- Requires: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Test with curl before booth deployment

### Step 4: Replace Booth Form (5 min)

**Option A: Replace existing BoothCaptureForm**
```bash
cp components/features/BoothCaptureFormV2.tsx components/features/BoothCaptureForm.tsx
```
Then update import in booth page to use V2.

**Option B: Use alongside (recommended for safety)**
- Keep original form
- Add V2 form as new route: `/booth/capture-v2?event_id=...&stand_id=...`
- Test V2 separately before switching

### Step 5: Update Booth Page (1 min)

If using V2 form, update `/app/booth/capture/page.tsx`:

```tsx
import BoothCaptureFormV2 from '@/components/features/BoothCaptureFormV2'

// Replace <BoothCaptureForm ... /> with:
<BoothCaptureFormV2
  eventId={eventId}
  standId={standId}
  currentEducationLevel={studentProfile?.current_education_level}
  educationBranches={studentProfile?.education_branches}
  onSuccess={(id) => console.log('✅', id)}
  onError={(msg) => console.error('❌', msg)}
/>
```

### Step 6: Add App Display Component (10 min)

Create page: `/app/(student)/schools/recommendations/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import SchoolRecommendationsCard from '@/components/features/SchoolRecommendationsCard'
import type { RecommendationResult } from '@/lib/scoring/schoolRecommendation'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch from /api/booth/recommendations or from user's booth_captures
    // This depends on how you store the data
  }, [])

  return (
    <main style={{ padding: '24px' }}>
      <SchoolRecommendationsCard
        recommendations={recommendations}
        isLoading={loading}
        onSchoolClick={(schoolId) => {
          // Navigate to school profile
        }}
      />
    </main>
  )
}
```

---

## Exhibitor Setup

**Exhibitors must fill in:**
- `target_education_levels[]` — e.g., [Bac+1, Bac+2, Bac+3]
- `programme_domains[]` — e.g., [Ingénierie, Informatique, Commerce]
- `minimum_academic_requirement` — numeric 0-20 (e.g., 12 = Bon, 16 = Très Bon)
- `bac_specialty_preference[]` (optional) — e.g., [Maths, Physique-Chimie]

**Admin UI for Exhibitor Setup:**
- Create `/app/admin/schools/[schoolId]/edit.tsx`
- Or extend existing exhibitor profile form

### SQL Example: Set School Profile

```sql
UPDATE public.schools
SET
  target_education_levels = ARRAY['Bac+1', 'Bac+2', 'Bac+3'],
  programme_domains = ARRAY['Ingénierie', 'Informatique'],
  minimum_academic_requirement = 14,
  bac_specialty_preference = ARRAY['Maths', 'Physique-Chimie']
WHERE name = 'École Polytechnique';
```

---

## Testing

### Test 1: Algorithm Unit Tests

```ts
import { recommendSchools, type StudentProfile, type SchoolProfile } from '@/lib/scoring/schoolRecommendation'

const student: StudentProfile = {
  current_education_level: 'Terminale',
  education_branches: ['Ingénierie', 'Informatique'],
  booth_academic_level: 15,
  bac_specialty: ['Maths', 'Physique-Chimie'],
  school_preferences: [],
}

const schools: SchoolProfile[] = [
  {
    school_id: '1',
    school_name: 'École X',
    target_education_levels: ['Bac+1', 'Bac+2', 'Bac+3'],
    programme_domains: ['Ingénierie', 'Informatique'],
    minimum_academic_requirement: 12,
  },
  // ...
]

const recommendations = recommendSchools(student, schools)
console.log(recommendations) // Should return top 3 schools
```

### Test 2: API Endpoint

```bash
curl -X POST http://localhost:3000/api/booth/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "event-uuid",
    "current_education_level": "Terminale",
    "education_branches": ["Ingénierie", "Informatique"],
    "booth_academic_level": 15,
    "bac_specialty": ["Maths"],
    "school_preferences": []
  }'

# Expected: 200 OK with recommendations array
```

### Test 3: Booth Form Flow

1. Open `/booth/capture?event_id=...&stand_id=...`
2. Fill step 1 (orientation) → click Suivant
3. Fill step 2 (grade slider) → click Suivant
4. Fill step 3 (Bac specialty) → click Suivant
5. Fill step 4 (contact info) → click ✅ Enregistrer
6. **Verify:** Recommendations screen displays top 3 schools with scores

### Test 4: Post-Fair App Display

1. Login as student
2. Navigate to `/schools/recommendations`
3. See recommendations with:
   - School names + ranks
   - Fit scores (0-100)
   - Tier emojis
   - Component score breakdown
   - Reasons for recommendation

---

## Grade Scale Reference

| Numeric | Label |
|---------|-------|
| 0-9 | Moyen |
| 10-11 | Moyen |
| 12-15 | Bon |
| 16-17 | Très Bon |
| 18-20 | Excellent |

Used for:
- Displaying grade label in form
- Comparing student grade vs. school minimum
- Calculating `academic_feasibility` score

---

## Deployment Checklist

- [ ] Migration 012 applied to Supabase
- [ ] New columns exist in `schools` table
- [ ] Exhibitors have filled in school profile fields
- [ ] `lib/scoring/schoolRecommendation.ts` created
- [ ] `app/api/booth/recommendations/route.ts` created
- [ ] `components/features/BoothCaptureFormV2.tsx` created
- [ ] Booth page updated to use V2 form
- [ ] API endpoint tested with curl
- [ ] Booth form tested end-to-end (5 steps)
- [ ] Recommendations display correctly on tablet
- [ ] Post-fair `/schools/recommendations` page created
- [ ] App recommendations display correctly
- [ ] Staff trained on new 4-step form (5 min)

---

## Success Metrics (Post-Fair)

**Adoption:**
- % of stands using booth form with recommendations
- Average recommendations per stand (target: 50-500)

**Quality:**
- % of students reporting recommendations as accurate
- Staff feedback: "Did recommendations help explain school fit?"
- School feedback: "Did recommended students match our profile?"

**Performance:**
- API response time <500ms (instant on tablet)
- 0 errors in recommendation algorithm
- 100% of displays show top 3 schools

---

## Troubleshooting

### Issue: No schools appear in recommendations

**Cause:** Exhibitors haven't filled school profile fields

**Fix:**
1. Go to Supabase → schools table
2. Check if `target_education_levels` is NULL or empty
3. Update manually:
   ```sql
   UPDATE public.schools
   SET target_education_levels = ARRAY['Bac+1', 'Bac+2', 'Bac+3'],
       programme_domains = ARRAY['Ingénierie', 'Informatique'],
       minimum_academic_requirement = 12
   WHERE school_name = 'My School';
   ```

### Issue: API returns 500 error

**Cause:** Service role key missing or Supabase query failed

**Fix:**
1. Check Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL` present?
2. Check Supabase: schools table exists and has data?
3. Run test query:
   ```sql
   SELECT id, name, target_education_levels FROM public.schools LIMIT 1;
   ```

### Issue: Grade slider doesn't work

**Cause:** Browser doesn't support HTML5 range input

**Fix:**
- Use numeric input instead of range:
  ```tsx
  <input type="number" min="0" max="20" value={academicGrade} />
  ```

---

## Next Steps (Phase 2)

- [ ] Add confidence scoring (staff rate their captures 1-5)
- [ ] Add school comparison feature (compare 2+ schools side-by-side)
- [ ] Add teacher dashboard showing class-level recommendations
- [ ] Add contact export (exhibitors email opted-in students matching their profile)
- [ ] Add AI/ML refinement (optional, post-fair scoring based on actual conversions)

---

**Status:** ✅ Ready for Deployment
**Build:** ✅ All files created
**Testing:** ✅ Ready for booth testing
**Timeline:** Deploy before next fair event
