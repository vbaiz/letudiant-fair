# School Recommendations — Quick Deployment Checklist

## Pre-Deployment (Local)

- [x] Algorithm created: `lib/scoring/schoolRecommendation.ts`
- [x] API endpoint created: `app/api/booth/recommendations/route.ts`
- [x] Booth form V2 created: `components/features/BoothCaptureFormV2.tsx`
- [x] Display component created: `components/features/SchoolRecommendationsCard.tsx`
- [x] Migration created: `supabase/migrations/012_exhibitor_school_profile.sql`
- [ ] Run locally: `npm run build` → no errors?
- [ ] Test algorithm in Node: `node -e "const { recommendSchools } = require('./lib/scoring/schoolRecommendation'); ..."`

---

## Step 1: Apply Supabase Migration (5 min)

1. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

2. Copy entire contents of:
   ```
   supabase/migrations/012_exhibitor_school_profile.sql
   ```

3. Paste and click **▶ Run**

4. **Verify success:**
   ```sql
   SELECT 
     id,
     name,
     target_education_levels,
     programme_domains,
     minimum_academic_requirement,
     bac_specialty_preference
   FROM public.schools LIMIT 1;
   ```
   Expected: Columns exist (may be NULL/empty if not filled yet)

---

## Step 2: Deploy Code to Vercel (5 min)

1. **Commit code:**
   ```bash
   git add -A
   git commit -m "feat: School recommendation system with instant booth display

   - Algorithm: Deterministic scoring (education level + domain + grade + specialty)
   - Booth form V2: 4-step form (orientation, grades, specialty, preferences)
   - API: POST /api/booth/recommendations with top-3 schools
   - Display: Instant tablet display + post-fair app integration
   - Database: Migration 012 adds school profile fields
   
   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin [current-branch]
   ```

3. **Wait for Vercel:** Auto-deploys, watch for "Build Success" ✅

4. **Verify API is live:**
   ```bash
   curl -X POST https://your-domain.com/api/booth/recommendations \
     -H "Content-Type: application/json" \
     -d '{
       "event_id": "test-uuid",
       "current_education_level": "Terminale",
       "education_branches": ["Ingénierie"],
       "booth_academic_level": 15,
       "bac_specialty": ["Maths"],
       "school_preferences": []
     }'
   ```
   Expected: 200 OK with recommendations array (or empty if no schools have profiles)

---

## Step 3: Configure School Profiles (15 min)

Exhibitors must fill in their school's recommendation profile.

### Option A: Admin SQL Script (Fastest)

For each school, run in Supabase SQL Editor:

```sql
UPDATE public.schools
SET
  target_education_levels = ARRAY['Bac+1', 'Bac+2', 'Bac+3'],
  programme_domains = ARRAY['Ingénierie', 'Informatique'],
  minimum_academic_requirement = 12,
  bac_specialty_preference = ARRAY['Maths', 'Physique-Chimie']
WHERE id = '00000000-0000-0000-0000-000000000001';
```

**What to fill in:**
| Field | Example | Notes |
|-------|---------|-------|
| `target_education_levels` | [Bac+1, Bac+2] | What levels does school recruit? |
| `programme_domains` | [Ingénierie, Informatique] | What domains offered? |
| `minimum_academic_requirement` | 12 (0-20 scale) | Minimum grade for admission |
| `bac_specialty_preference` | [Maths, Physique-Chimie] | Optional: preferred specialties |

### Option B: Create Admin UI (Later)

Create `/app/admin/schools/[schoolId]/edit.tsx` with form fields.

### Verify Setup

```sql
SELECT 
  name,
  target_education_levels,
  programme_domains,
  minimum_academic_requirement,
  bac_specialty_preference
FROM public.schools
WHERE target_education_levels IS NOT NULL
ORDER BY name;
```

Expected: At least 5-10 schools with filled profiles

---

## Step 4: Test Booth Form End-to-End (10 min)

### Setup Test URL

```
https://your-domain.com/booth/capture?event_id=00000000-0000-0000-0000-000000000001&stand_id=00000000-0000-0000-0000-000000000002
```

Replace event_id and stand_id with real UUIDs from Supabase.

### Test Flow

1. **Open on tablet/phone browser**
   - Form should display without errors
   - "1️⃣ Orientation" header visible

2. **Step 1: Orientation**
   - Select "🟡 Je compare les options"
   - Select "Terminale"
   - Check "Ingénierie" and "Informatique"
   - Click "Suivant →"

3. **Step 2: Academic Grade**
   - Move slider to **15** (Très Bon)
   - Should see "15" displayed
   - Click "Suivant →"

4. **Step 3: Bac Specialty**
   - Check "Maths" and "Physique-Chimie"
   - Click "Suivant →"

5. **Step 4: Preferences & Contact**
   - Type "Télécom Paris" in school preference field
   - Check "Oui, j'accepte le contact"
   - Enter test email: `test@example.com`
   - Click "✅ Enregistrer"

6. **Step 5: Recommendations Screen** ✅
   - Should show "Top 3 Écoles Recommandées"
   - Display 1-3 schools with:
     - School name
     - Fit score (0-100)
     - Tier emoji (🟢/🟡/🔴)
     - Reason ("Strong domain match + ...")
     - Component scores
   - Auto-resets to Step 1 after 5 seconds

### Verify Supabase

In SQL Editor, check booth capture was saved:

```sql
SELECT 
  id,
  event_id,
  stand_id,
  orientation_stage,
  booth_academic_level,
  bac_specialty,
  school_preferences,
  email,
  optin_contact,
  created_at
FROM public.booth_captures
WHERE email = 'test@example.com'
ORDER BY created_at DESC LIMIT 1;
```

Expected: 1 row with all fields populated correctly

---

## Step 5: Test API Directly (5 min)

Test with real school data from Supabase:

```bash
curl -X POST https://your-domain.com/api/booth/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "00000000-0000-0000-0000-000000000001",
    "current_education_level": "Terminale",
    "education_branches": ["Ingénierie", "Informatique"],
    "booth_academic_level": 15,
    "bac_specialty": ["Maths", "Physique-Chimie"],
    "school_preferences": ["Télécom Paris"]
  }' | jq
```

Expected:
```json
{
  "success": true,
  "recommendations": [
    {
      "school_id": "...",
      "school_name": "Télécom Paris",
      "fit_score": 85,
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

---

## Step 6: Create Post-Fair Recommendations Page (10 min)

Create: `/app/(student)/schools/recommendations/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import SchoolRecommendationsCard from '@/components/features/SchoolRecommendationsCard'
import type { RecommendationResult } from '@/lib/scoring/schoolRecommendation'

export default function RecommendationsPage() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Fetch booth capture data for this student
    async function loadRecommendations() {
      try {
        // Query booth_captures where synced_to_user_id = user.id
        // Then call /api/booth/recommendations with that data
        // Or fetch pre-computed recommendations from a recommendations table

        const res = await fetch('/api/booth/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: 'current_event_id',
            current_education_level: user.current_education_level,
            education_branches: user.education_branches,
            booth_academic_level: user.booth_academic_level,
            bac_specialty: user.bac_specialty,
          }),
        })

        const data = await res.json()
        if (data.success) {
          setRecommendations(data.recommendations)
        }
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [user])

  return (
    <main style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <SchoolRecommendationsCard
        recommendations={recommendations}
        studentProfile={{
          currentEducationLevel: user?.current_education_level || '',
          educationBranches: user?.education_branches || [],
          academicGrade: user?.booth_academic_level || 0,
        }}
        isLoading={loading}
        onSchoolClick={(schoolId) => {
          // Navigate to school profile: /schools/[schoolId]
          window.location.href = `/schools/${schoolId}`
        }}
      />
    </main>
  )
}
```

---

## Step 7: Train Staff (5 min)

**Booth tablet script (~2 minutes to show):**

> "On vient d'ajouter 2 étapes au formulaire de capture. Maintenant, on demande:
> 
> 1. **Note académique (0-20)** — la moyenne de l'étudiant (utilise le curseur)
> 2. **Spécialités Bac** — ce qu'ils ont pris au Bac (optionnel)
> 
> Après que vous remplissiez, le système vous recommend les 3 meilleures écoles pour cet étudiant. Vous montrez ça sur la tablette, et l'étudiant peut prendre une photo ou les noter.
> 
> **Temps total:** ~45 secondes pour tout remplir + lire les recommandations.
> 
> Questions?"

---

## Step 8: Verify Recommendations Quality (10 min)

### Test Case 1: Terminale → Bac+1 Path

- Current level: Terminale
- Branches: Ingénierie
- Grade: 16 (Très Bon)
- Expected: Schools with target_education_levels = [Bac+1, Bac+2, Bac+3]

### Test Case 2: Bac+2 → Bac+3 Path

- Current level: Bac+2
- Branches: Commerce
- Grade: 12 (Bon)
- Expected: Schools with target_education_levels = [Bac+3, Bac+4, Bac+5]

### Test Case 3: No Matching Schools

- Current level: Obscure path
- Branches: Domain school doesn't offer
- Expected: Empty recommendations array with helpful message

---

## Rollback Plan

If issues occur:

### Step 1: Drop migration (in Supabase)

```sql
ALTER TABLE public.schools
DROP COLUMN IF EXISTS target_education_levels,
DROP COLUMN IF EXISTS programme_domains,
DROP COLUMN IF EXISTS minimum_academic_requirement,
DROP COLUMN IF EXISTS bac_specialty_preference;
```

### Step 2: Revert code

```bash
git revert [commit-hash]
git push
# Vercel auto-redeploys
```

### Step 3: Re-apply later

After fixing issues, re-run migration and code.

---

## Environment Variables

Verify in Vercel:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (for API)

All should already be set from Phase 1.

---

## Success Criteria

Phase 2 deployment is successful when:

✅ Migration applies without errors
✅ API endpoint responds in <500ms
✅ Booth form V2 displays all 4 steps
✅ Recommendations appear on success screen (tablet)
✅ Recommendations appear in app post-fair
✅ Staff can complete form in <45 seconds
✅ Fit scores align with school feedback ("matches our profile")
✅ Zero TypeScript/build errors
✅ Zero errors in recommendation algorithm

---

## Monitoring (Post-Fair)

```sql
-- Check recommendation distribution
SELECT 
  fit_score / 10 * 10 AS score_bucket,
  tier,
  count(*) as count
FROM (
  SELECT 
    CASE 
      WHEN fit_score >= 70 THEN 'strong'
      WHEN fit_score >= 40 THEN 'moderate'
      ELSE 'exploratory'
    END AS tier,
    fit_score
  FROM booth_captures
  WHERE booth_academic_level IS NOT NULL
) sub
GROUP BY score_bucket, tier
ORDER BY score_bucket DESC;

-- Check school profile completion
SELECT 
  name,
  target_education_levels IS NOT NULL AS has_target,
  programme_domains IS NOT NULL AS has_domains,
  minimum_academic_requirement IS NOT NULL AS has_minimum
FROM public.schools
ORDER BY name;
```

---

**Deployment Date:** [TO BE FILLED]
**Event:** [TO BE FILLED]
**Status:** Ready for Booth Testing ✅
