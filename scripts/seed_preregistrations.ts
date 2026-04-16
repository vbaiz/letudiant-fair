/**
 * seed_preregistrations.ts
 *
 * Generates realistic Eventmaker pre-registrations for demo purposes.
 * Produces 50 records across two upcoming events:
 *   - 30 resolved (linked to existing auth users created inline)
 *   - 20 pending   (no matching app account yet)
 *
 * Usage:
 *   npx tsx scripts/seed_preregistrations.ts
 *
 * Requirements:
 *   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.
 *   An event must already exist in the `events` table.
 *   Pass the event UUID as the first argument, or set EVENT_ID env var.
 *
 *   npx tsx scripts/seed_preregistrations.ts <event-uuid>
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const eventId = process.argv[2] ?? process.env.EVENT_ID
if (!eventId) {
  console.error('Usage: npx tsx scripts/seed_preregistrations.ts <event-uuid>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Realistic French student data ───────────────────────────────────────────

const FIRST_NAMES = [
  'Emma', 'Lucas', 'Chloé', 'Hugo', 'Camille', 'Nathan', 'Léa', 'Théo',
  'Inès', 'Louis', 'Manon', 'Tom', 'Jade', 'Mathis', 'Lucie', 'Enzo',
  'Alice', 'Raphaël', 'Océane', 'Liam', 'Sarah', 'Baptiste', 'Clara',
  'Antoine', 'Eva', 'Quentin', 'Pauline', 'Maxime', 'Julie', 'Alexis',
]

const LAST_NAMES = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
  'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel',
  'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet',
  'François', 'Martinez',
]

const EDUCATION_LEVELS = ['Terminale', 'Première', 'Seconde', 'Post-bac']
const BAC_SERIES       = ['Général', 'Technologique', 'Professionnel']
const POSTAL_CODES     = ['75001', '69001', '13001', '31000', '33000', '59000', '44000', '67000', '06000', '34000']
const DOMAINS_POOL     = ['Business', 'Ingénierie', 'Design', 'Santé', 'Droit', 'Sciences', 'Arts', 'Communication']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
function uid(): string {
  return 'em_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

// ─── Build student records ────────────────────────────────────────────────────

interface StudentRecord {
  firstName:   string
  lastName:    string
  email:       string
  level:       string
  bacSeries:   string | null
  postalCode:  string
  domains:     string[]
  eventmakerId: string
}

function makeStudent(index: number): StudentRecord {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
  const lastName  = LAST_NAMES[index % LAST_NAMES.length]
  const email     = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@demo-letudiant.fr`
  const level     = pick(EDUCATION_LEVELS)
  return {
    firstName,
    lastName,
    email,
    level,
    bacSeries:   level !== 'Post-bac' ? pick(BAC_SERIES) : null,
    postalCode:  pick(POSTAL_CODES),
    domains:     pickN(DOMAINS_POOL, Math.floor(Math.random() * 3) + 1),
    eventmakerId: uid(),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding pre-registrations for event ${eventId}...\n`)

  const students = Array.from({ length: 50 }, (_, i) => makeStudent(i))

  // Split: first 30 will be "resolved" (we create auth users for them),
  // last 20 stay "pending" (no matching app account).
  const RESOLVED_COUNT = 30

  let resolvedOk = 0
  let pendingOk  = 0

  for (let i = 0; i < students.length; i++) {
    const s = students[i]
    const willResolve = i < RESOLVED_COUNT

    let resolvedUserId: string | null = null
    let resolvedAt: string | null     = null

    if (willResolve) {
      // Create an auth user so the pre_registration resolves immediately
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email:    s.email,
        password: 'DemoPassword123!',
        email_confirm: true,
        user_metadata: { name: `${s.firstName} ${s.lastName}`, role: 'student' },
      })

      if (authErr) {
        // User may already exist from a previous seed run — look them up
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', s.email)
          .maybeSingle()
        resolvedUserId = existing?.id ?? null
      } else if (authData.user) {
        resolvedUserId = authData.user.id

        // Upsert profile row
        await supabase.from('users').upsert({
          id:               authData.user.id,
          email:            s.email,
          name:             `${s.firstName} ${s.lastName}`,
          role:             'student',
          education_level:  s.level,
          education_branches: s.domains,
          eventmaker_ids:   [s.eventmakerId],
          optin_letudiant:  true,
          parent_approved:  true,
          is_minor:         false,
          consent_date:     new Date().toISOString(),
          orientation_stage: 'exploring',
          orientation_score: 0,
          intent_score:     0,
          intent_level:     'low',
        })
      }

      if (resolvedUserId) {
        resolvedAt = new Date().toISOString()
        resolvedOk++
      }
    } else {
      pendingOk++
    }

    // Insert/upsert the pre_registration record
    const { error } = await supabase.from('pre_registrations').upsert({
      email:                      s.email,
      first_name:                 s.firstName,
      last_name:                  s.lastName,
      education_level:            s.level,
      bac_series:                 s.bacSeries,
      postal_code:                s.postalCode,
      declared_domains:           s.domains,
      event_id:                   eventId,
      eventmaker_registration_id: s.eventmakerId,
      resolved_user_id:           resolvedUserId,
      resolved_at:                resolvedAt,
    }, { onConflict: 'email' })

    if (error) {
      console.error(`  [!] Error on ${s.email}:`, error.message)
    } else {
      const tag = willResolve && resolvedUserId ? '✓ resolved' : '○ pending '
      console.log(`  ${tag}  ${s.firstName} ${s.lastName} <${s.email}>`)
    }
  }

  console.log(`\nDone. ${resolvedOk} resolved, ${pendingOk} pending.\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
