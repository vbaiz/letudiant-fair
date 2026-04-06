import { getSupabase } from '@/lib/supabase/client'

export interface ConsentRecord {
  uid: string
  action: 'grant' | 'revoke'
  types: string[]
  timestamp: string
  version: string
  userAgent?: string
  legalBasis: string
}

export async function writeConsent(record: ConsentRecord): Promise<void> {
  const supabase = getSupabase()
  // Store consent audit in a generic metadata table or just log to console for MVP
  // In production: add a consent_audit table to schema.sql
  console.info('[GDPR Consent]', record)
  // Upsert the consent flags on the user row
  if (record.action === 'grant') {
    await supabase.from('users').update({
      optin_letudiant: record.types.includes('optinLetudiant'),
      optin_commercial: record.types.includes('optinCommercial'),
      optin_wax: record.types.includes('optinWAX'),
      consent_date: record.timestamp,
    }).eq('id', record.uid)
  }
}

export async function revokeConsent(uid: string): Promise<void> {
  const supabase = getSupabase()
  await supabase.from('users').update({
    optin_letudiant: false,
    optin_commercial: false,
    optin_wax: false,
  }).eq('id', uid)

  await writeConsent({
    uid,
    action: 'revoke',
    types: ['optinLetudiant', 'optinCommercial', 'optinWAX'],
    timestamp: new Date().toISOString(),
    version: '1.0',
    legalBasis: 'withdrawal',
  })
}

export async function cascadeDelete(uid: string): Promise<void> {
  const supabase = getSupabase()
  // Anonymize scans (replace user_id with hash placeholder)
  const { data: userScans } = await supabase.from('scans').select('id').eq('user_id', uid)
  if (userScans && userScans.length > 0) {
    // In Supabase we can't easily anonymize FKs without breaking constraints
    // Production: use a soft-delete / anonymized_user_id pattern
    // For MVP: just delete the scans
    await supabase.from('scans').delete().eq('user_id', uid)
  }
  // Delete the user (cascades to matches, leads via FK)
  await supabase.from('users').delete().eq('id', uid)
}

export function requiresParentalConsent(dob: string): boolean {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age < 16
}

export function calculateAge(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}
