# Phygical Feature: Booth Orientation Capture — Phase 1 (MVP) Implementation Guide

## Overview
This implementation adds a phygital feature to capture student orientation data from non-app-users at fair booths. Staff answer 3 quick questions (~30 seconds) per student, and the data flows into the exhibitor dashboard and student profiles.

---

## Phase 1: MVP Components

### 1. Database Schema (`supabase/migrations/011_booth_captures.sql`)

**Table:** `public.booth_captures`
- Stores staff-entered orientation signals for non-app users
- Auto-merges with student profiles when email matches
- RLS policies gate access by exhibitor (their stands only) or admin

**Key Features:**
- `orientation_stage`: 'exploring' | 'comparing' | 'deciding'
- `education_level[]`, `education_branches[]`: academic interests
- `email`, `phone`: optional contact info (with opt-in flag)
- `synced_to_user_id`: reference after email merge
- Trigger `trigger_merge_booth_on_user_create`: auto-merges when student signs up

**To Apply:**
```sql
-- Copy full contents of supabase/migrations/011_booth_captures.sql
-- Paste into Supabase SQL Editor
-- https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql
-- Execute
```

---

### 2. API Endpoint (`app/api/booth/capture-orientation/route.ts`)

**Method:** `POST /api/booth/capture-orientation`

**Request Body:**
```json
{
  "event_id": "uuid",
  "stand_id": "uuid",
  "orientation_stage": "exploring" | "comparing" | "deciding",
  "education_level": ["Terminale", "Bac+1"],
  "education_branches": ["Ingénierie", "Droit"],
  "email": "student@example.com",
  "phone": "+33612345678",
  "optin_contact": true,
  "captured_by_staff": "Jean Dupont" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "capture_id": "uuid",
  "message": "Booth capture saved for exploring stage student at stand..."
}
```

**No authentication required** — uses Supabase service role to insert.

---

### 3. Booth Staff Form (`components/features/BoothCaptureForm.tsx`)

**Usage:**
```tsx
import BoothCaptureForm from '@/components/features/BoothCaptureForm'

export default function BoothPage() {
  return (
    <BoothCaptureForm
      eventId="a1b2c3d4-0000-0000-0000-000000000001"
      standId="c1c2d3e4-0000-0000-0000-000000000001"
      onSuccess={(captureId) => console.log('Saved:', captureId)}
      onError={(msg) => console.error(msg)}
    />
  )
}
```

**Features:**
- Simple 3-question form (~30 seconds to complete)
- Radio buttons for orientation stage
- Checkboxes for branches
- Optional email/phone for contact opt-in
- Success confirmation screen
- Automatic form reset after submission

---

### 4. Exhibitor Dashboard Update (`app/exhibitor/leads/page.tsx`)

**New Section:** "Capture Booth (Non-app)" card showing:
- Total non-app students captured at stand
- Orientation stage breakdown (🟢 Deciding | 🟡 Comparing | 🔵 Exploring)
- Percentages and counts
- Note: "These students will be included in your J+1 data export"

**Visual Style:**
- Yellow/golden background (#FFF7E0) to distinguish from app data
- Yellow accent border (#FFD100)
- Same intent stage visualization as app users

---

### 5. Enhanced Scoring (`lib/supabase/database.ts`)

**New Function:** `refreshIntentScoreWithBoothData(userId)`

**Weighting Logic:**
- **If student has app activity:** blend app signals (70%) + booth signals (30%)
- **If student has ONLY booth data:** use booth orientation_stage directly
- **Recency weight:** fresh captures (<7 days) get higher weight; decay after

**Example:**
```
// App user + booth capture
finalScore = (appScore * 0.7) + (boothValue * 0.3 * recencyWeight)

// Non-app user with only booth data
finalScore = boothValue * recencyWeight
```

---

## Implementation Checklist

- [ ] **Step 1: Apply Migration**
  - Copy `supabase/migrations/011_booth_captures.sql` to Supabase SQL Editor
  - Execute to create table, RLS policies, trigger, and merge function
  - Verify: table appears in Supabase Table Editor

- [ ] **Step 2: Deploy API Endpoint**
  - Endpoint file `app/api/booth/capture-orientation/route.ts` is created
  - Run `npm run build` locally to verify no TypeScript errors
  - Push to Vercel (auto-deploys)
  - Test: `curl -X POST https://your-domain.com/api/booth/capture-orientation -H "Content-Type: application/json" -d '{"event_id":"...", ...}'`

- [ ] **Step 3: Verify Exhibitor Dashboard**
  - File `app/exhibitor/leads/page.tsx` updated with booth stats
  - Run `npm run dev` locally
  - Navigate to exhibitor dashboard as logged-in exhibitor
  - Should see "Capture Booth (Non-app)" card if booth captures exist

- [ ] **Step 4: Create Booth Tablet Interface**
  - Create new route `/app/[eventId]/booth/page.tsx` (or mount form in existing admin dashboard)
  - Import `BoothCaptureForm` component
  - Pass `eventId` and staff's `standId`
  - Display on tablet at booth stand

- [ ] **Step 5: Test End-to-End**
  - Staff captures orientation data → POST `/api/booth/capture-orientation`
  - Verify row created in `booth_captures` table
  - Student signs up with same email → trigger auto-merges data to user profile
  - Check `users` table: `orientation_stage`, `education_level`, `education_branches` updated
  - Exhibitor views dashboard → "Capture Booth" card shows captured student

---

## Booth Tablet Setup

**Where to Display Form:**
Option 1: Create standalone page `/app/booth/page.tsx` (new route)
Option 2: Add to admin dashboard as a tab

**Minimal Example:**
```tsx
// app/booth/page.tsx
'use client'

import { useState, useEffect } from 'react'
import BoothCaptureForm from '@/components/features/BoothCaptureForm'
import { getSupabase } from '@/lib/supabase/client'

export default function BoothPage() {
  const [eventId, setEventId] = useState<string | null>(null)
  const [standId, setStandId] = useState<string | null>(null)

  useEffect(() => {
    // Load event & stand from URL or local config
    const params = new URLSearchParams(window.location.search)
    setEventId(params.get('event_id'))
    setStandId(params.get('stand_id'))
  }, [])

  if (!eventId || !standId) {
    return <p>Missing event_id or stand_id in URL</p>
  }

  return (
    <main style={{ padding: '24px' }}>
      <BoothCaptureForm
        eventId={eventId}
        standId={standId}
        onSuccess={() => console.log('Saved!')}
        onError={(msg) => alert('Error: ' + msg)}
      />
    </main>
  )
}
```

**URL Format:**
```
https://your-domain.com/booth?event_id=a1b2c3d4-...&stand_id=c1c2d3e4-...
```

---

## Database Merge Logic

### When Student Doesn't Have App Account Yet

1. Staff captures orientation at booth → insert to `booth_captures`
2. Student later signs up with email → user created in `users` table
3. **Trigger fires:** `trigger_merge_booth_on_user_create`
4. **Function executes:** `merge_booth_capture_to_user(user_id, email)`
5. **Result:**
   - `users.orientation_stage` = booth_capture.orientation_stage
   - `users.education_level` = booth_capture.education_level[0]
   - `users.education_branches` += booth_capture.education_branches
   - `booth_captures.synced_to_user_id` = user_id (link established)

### When Student Already Has App Account

- Staff captures orientation at booth (email already exists in users)
- Data stored in `booth_captures` (not synced automatically)
- Call `refreshIntentScoreWithBoothData(user_id)` after manually linking, OR
- Next time student's intent score refreshes, booth data is incorporated

---

## Verification Queries (Supabase SQL Editor)

**Check captures by event:**
```sql
select id, stand_id, orientation_stage, optin_contact, synced_to_user_id, captured_at
from public.booth_captures
where event_id = 'a1b2c3d4-0000-0000-0000-000000000001'
order by captured_at desc;
```

**Check merged captures (synced to user):**
```sql
select bc.id, u.email, u.orientation_stage, bc.synced_at
from public.booth_captures bc
join public.users u on bc.synced_to_user_id = u.id
order by bc.synced_at desc;
```

**Count captures by orientation stage per stand:**
```sql
select 
  s.id,
  s.school_id,
  bc.orientation_stage,
  count(*) as count
from public.booth_captures bc
join public.stands s on bc.stand_id = s.id
group by s.id, s.school_id, bc.orientation_stage
order by s.id;
```

---

## Phase 2: Future Enhancements (Not MVP)

- [ ] **Staff dashboard**: view captured students for their stand, export list
- [ ] **Data quality scoring**: admins rate staff capture accuracy for training
- [ ] **Batch import**: CSV upload for offline-captured data (tablet goes offline)
- [ ] **Confidence flag**: staff rate their confidence in each capture (1-5)
- [ ] **Teacher insights**: class-level breakdown of app vs. booth captures
- [ ] **QR scanner integration**: scan student QR → auto-fill education_level if exists

---

## Troubleshooting

**Issue:** Migration fails with "constraint error"
- **Fix:** Ensure `events` and `schools` tables exist first; migrations run in order

**Issue:** Exhibitor sees "Booth-Captured" card but no data
- **Fix:** Check if any `booth_captures` rows exist for their stand:
  ```sql
  select count(*) from booth_captures where stand_id = '...';
  ```

**Issue:** Student signs up but `education_level` not copied
- **Fix:** Verify trigger exists:
  ```sql
  select * from pg_trigger where tgname = 'trigger_merge_booth_on_user_create';
  ```

**Issue:** Form submits but capture not created
- **Fix:** Check API endpoint logs in Vercel; verify RLS policy allows inserts:
  ```sql
  select * from pg_policy where relname = 'booth_captures';
  ```

---

## Files Modified/Created

### Created
- `supabase/migrations/011_booth_captures.sql` — schema, RLS, trigger, function
- `app/api/booth/capture-orientation/route.ts` — API endpoint
- `components/features/BoothCaptureForm.tsx` — staff form component
- `BOOTH_CAPTURE_PHASE1_GUIDE.md` — this file

### Modified
- `lib/supabase/database.ts` — added `getBoothCapturesByEmail()`, `getBoothCapturesForStudent()`, `refreshIntentScoreWithBoothData()`
- `app/exhibitor/leads/page.tsx` — added booth stats UI, booth data queries

---

## Next Steps

1. **Deploy migration** to Supabase
2. **Build & push** code to Vercel
3. **Create booth tablet page** at `/booth` or admin tab
4. **Train staff** on 3-question form (~30 seconds)
5. **Monitor** exhibitor dashboard to see booth captures flowing in
6. **Plan Phase 2** enhancements based on fair results

---

## Contact & Support

For questions on:
- **Database/RLS:** Check Supabase documentation for row level security
- **API routing:** Next.js App Router docs
- **Booth component:** See `BoothCaptureForm.tsx` inline comments
- **Scoring logic:** See `lib/supabase/database.ts::refreshIntentScoreWithBoothData`

---

**Status:** Phase 1 MVP Complete ✅
**Ready for:** Testing at next physical fair
