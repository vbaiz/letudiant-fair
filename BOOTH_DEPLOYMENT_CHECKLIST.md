# Booth Orientation Capture — Phase 1 Deployment Checklist

## Pre-Deployment (Local Verification)

- [x] **Build verification**
  - Command: `npm run build`
  - ✅ Build succeeds with `ƒ /api/booth/capture-orientation` in output
  - No TypeScript errors

- [x] **Migration file created**
  - File: `supabase/migrations/011_booth_captures.sql`
  - Contains: table, RLS, trigger, merge function
  - Status: Ready for Supabase SQL Editor

- [x] **API endpoint created**
  - File: `app/api/booth/capture-orientation/route.ts`
  - Method: POST
  - Auth: Uses `createServiceClient()` (service role)
  - Status: Compiled & tested

- [x] **Form component created**
  - File: `components/features/BoothCaptureForm.tsx`
  - Features: 3-question form, success screen, error handling
  - Status: Ready to use

- [x] **Exhibitor dashboard updated**
  - File: `app/exhibitor/leads/page.tsx`
  - New: Booth-Captured Non-Users card with orientation breakdown
  - Status: Compiled & integrated

---

## Deployment Steps

### Step 1: Apply Supabase Migration

1. Go to your Supabase project dashboard
   - URL: `https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql`

2. Click **SQL Editor** → **New Query**

3. Copy-paste the entire contents of:
   ```
   supabase/migrations/011_booth_captures.sql
   ```

4. Click **▶ Run** button

5. **Verify:**
   - No errors appear
   - Check **Table Editor** → new `booth_captures` table exists
   - Check **SQL Editor** → execute verification query:
     ```sql
     select * from public.booth_captures limit 1;
     ```
     Expected: returns empty table (0 rows), no error

---

### Step 2: Deploy Code to Vercel

1. **Commit code locally:**
   ```bash
   git add -A
   git commit -m "feat: Phase 1 booth orientation capture (phygital MVP)

   - Migration 011: booth_captures table with RLS & auto-merge trigger
   - API: POST /api/booth/capture-orientation (service role)
   - Component: BoothCaptureForm for staff (3-question form)
   - Dashboard: Exhibitor dashboard shows booth-captured student stats
   - Scoring: Enhanced intent score includes booth signals (30% weight if app activity exists)
   
   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin [current-branch]
   ```

3. **Vercel auto-deploys:**
   - Check Vercel dashboard: builds complete in ~3 minutes
   - Wait for **Build Success** ✅

4. **Verify API is live:**
   ```bash
   curl -X POST https://your-domain.com/api/booth/capture-orientation \
     -H "Content-Type: application/json" \
     -d '{
       "event_id": "a1b2c3d4-0000-0000-0000-000000000001",
       "stand_id": "b1b2c3d4-0000-0000-0000-000000000001",
       "orientation_stage": "exploring",
       "education_level": ["Terminale"],
       "education_branches": ["Ingénierie"]
     }'
   ```
   Expected response:
   ```json
   {
     "success": true,
     "capture_id": "uuid-here",
     "message": "..."
   }
   ```

---

### Step 3: Create Booth Tablet Page (Optional)

If you want a dedicated booth interface, create:

**File: `app/(public)/booth/page.tsx`** (or `/app/booth/capture/page.tsx`)

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import BoothCaptureForm from '@/components/features/BoothCaptureForm'

export default function BoothCapturePage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('event_id')
  const standId = searchParams.get('stand_id')

  if (!eventId || !standId) {
    return (
      <main style={{ padding: '24px', textAlign: 'center' }}>
        <h1>⚠️ Configuration manquante</h1>
        <p>URL doit contenir: ?event_id=uuid&stand_id=uuid</p>
        <p style={{ fontSize: '0.875rem', color: '#6B6B6B' }}>
          Exemple: <code>/booth?event_id=a1b2c3d4-...&stand_id=c1c2d3e4-...</code>
        </p>
      </main>
    )
  }

  return (
    <main style={{ padding: '24px 0', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F4F4F4' }}>
      <BoothCaptureForm
        eventId={eventId}
        standId={standId}
        onSuccess={(id) => console.log('✅ Saved:', id)}
        onError={(msg) => console.error('❌ Error:', msg)}
      />
    </main>
  )
}
```

**Then bookmark:**
```
https://your-domain.com/booth?event_id=a1b2c3d4-0000-0000-0000-000000000001&stand_id=b1b2c3d4-0000-0000-0000-000000000001
```

Display on booth tablet during fair.

---

### Step 4: Verify Exhibitor Dashboard

1. **Login as exhibitor** (any exhibitor account)
2. **Navigate to:** `/exhibitor/leads`
3. **Look for:** New card with 📱 emoji
   - Title: "Capture Booth (Non-app)"
   - Shows: "X étudiants capturés au stand"
   - Shows: Orientation breakdown (🟢 Décideurs, 🟡 Comparateurs, 🔵 Explorateurs)

4. **If no card appears:**
   - This is expected if no booth captures exist yet
   - After first staff capture, card will appear
   - Check Supabase: does `booth_captures` have rows?

---

## Testing End-to-End (Before Fair)

### Test 1: Staff Captures Orientation

1. Open booth form on tablet: `/booth?event_id=...&stand_id=...`
2. Fill form:
   - Orientation: Select "Comparing"
   - Education Level: Select "Bac+1"
   - Branches: Check "Ingénierie" + "Informatique"
   - Email: `test.student@example.com`
   - Opt-in: Yes
3. Click **"✅ Enregistrer"**
4. See success screen ✅

### Test 2: Verify Supabase Row

In Supabase SQL Editor:
```sql
select * from public.booth_captures 
where email = 'test.student@example.com'
order by created_at desc limit 1;
```
Expected: 1 row with orientation_stage='comparing'

### Test 3: Exhibitor Sees Booth Data

1. **Login as exhibitor** for the school/stand
2. **Go to:** `/exhibitor/leads`
3. **Scroll down** to "Capture Booth (Non-app)" card
4. **Verify:**
   - Card visible (yellow background)
   - Shows "1 étudiants capturés au stand"
   - Shows "Comparateurs: 1 (100%)"

### Test 4: Auto-Merge on Signup

1. **Student signs up** with email `test.student@example.com`
2. **Check Supabase:**
   ```sql
   select 
     u.email, 
     u.orientation_stage, 
     u.education_level, 
     bc.synced_at
   from public.users u
   left join public.booth_captures bc 
     on bc.synced_to_user_id = u.id
   where u.email = 'test.student@example.com';
   ```
3. **Expected:**
   - `users.orientation_stage` = 'comparing' (from booth)
   - `users.education_level` = 'Bac+1'
   - `booth_captures.synced_to_user_id` = user.id
   - `booth_captures.synced_at` = timestamp of signup

---

## Rollback Plan

If issues occur:

1. **Drop migration (in Supabase SQL Editor):**
   ```sql
   drop trigger trigger_merge_booth_on_user_create on public.users;
   drop function public.merge_booth_capture_to_user(uuid, text);
   drop table if exists public.booth_captures;
   ```

2. **Revert code:**
   ```bash
   git revert [commit-hash]
   git push
   # Vercel auto-redeploys
   ```

3. **Re-apply later** after fixing issues

---

## Environment Variables Check

Before deploying to Vercel, ensure these env vars exist:

**Required (already in Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (for API route)

**Verify in Vercel:**
1. Go to project **Settings** → **Environment Variables**
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
   - If missing, copy from Supabase project → **Settings** → **API** → **Service Role Secret**
   - Paste into Vercel env var with same name
3. **Redeploy** after adding

---

## Monitoring (After Fair)

### Check Data Quality

**Total captures by orientation stage:**
```sql
select 
  orientation_stage,
  count(*) as count,
  round(100.0 * count(*) / sum(count(*)) over (), 1) as pct
from public.booth_captures
where event_id = '[YOUR_EVENT_ID]'
group by orientation_stage
order by count desc;
```

**Captures with contact opt-in:**
```sql
select 
  count(*) as opted_in,
  count(*) filter (where email is not null) as has_email,
  count(*) filter (where phone is not null) as has_phone
from public.booth_captures
where event_id = '[YOUR_EVENT_ID]' and optin_contact = true;
```

**Captures that synced to users:**
```sql
select 
  count(*) as total_captures,
  count(synced_to_user_id) as synced_to_users,
  round(100.0 * count(synced_to_user_id) / count(*), 1) as sync_rate_pct
from public.booth_captures
where event_id = '[YOUR_EVENT_ID]';
```

---

## Success Criteria

Phase 1 is **successfully deployed** when:

✅ Migration applies without error
✅ API endpoint responds to POST requests
✅ Booth form displays on tablet
✅ Staff can submit 3-question form in <30 seconds
✅ Exhibitor dashboard shows booth-captured students
✅ Auto-merge trigger works (student signup merges booth data)
✅ Next-day exhibitor data export includes booth-captured students

---

## Next Steps (Phase 2 Planning)

- [ ] Gather staff feedback from first fair
- [ ] Plan confidence scoring (staff rate their captures 1-5)
- [ ] Plan offline mode (tablet WiFi fallback)
- [ ] Plan teacher insights dashboard
- [ ] Plan contact export feature (for opted-in students)

---

**Deployment Date:** [TO BE FILLED]
**Fair Event:** [TO BE FILLED]
**Status:** Ready for Deployment ✅
