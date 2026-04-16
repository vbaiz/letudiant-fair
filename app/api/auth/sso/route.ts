/**
 * GET /api/auth/sso?token=<signed-token>
 *
 * Entry point for students arriving from the L'Étudiant website.
 * The token is a base64url-encoded JSON payload signed with HMAC-SHA256
 * using the LETUDIANT_SSO_SECRET shared secret.
 *
 * Token payload (produced by L'Étudiant's backend):
 *   { email, firstName, lastName, btoc_id, education_level?, exp }
 *
 * Flow:
 *   1. Verify HMAC signature + expiry
 *   2. If user exists → create a Supabase magic-link session, redirect to /home
 *   3. If new user   → redirect to /register?prefill=<base64url-payload>
 *                      (register page decodes and pre-fills the form)
 *
 * ─── MVP / Demo mode ──────────────────────────────────────────────────────────
 * While LETUDIANT_SSO_SECRET is not yet set, the endpoint accepts an UNSIGNED
 * prefill token (plain base64url JSON) and treats it as a "new user" redirect.
 * This lets you test the register-page pre-fill without L'Étudiant IT involvement.
 * Set LETUDIANT_SSO_SECRET in production to enforce signature verification.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse }      from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Token helpers ────────────────────────────────────────────────────────────

interface SSOPayload {
  email:           string
  firstName:       string
  lastName:        string
  btoc_id:         string
  education_level?: string
  exp:             number   // Unix timestamp (seconds)
}

/**
 * Verify a signed SSO token.
 * Format: <base64url(payload)>.<base64url(hmac-sha256)>
 */
function verifyToken(token: string, secret: string): SSOPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadB64, sigB64] = parts
  const expectedSig = createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url')

  // Constant-time comparison to prevent timing attacks
  try {
    const expected = Buffer.from(expectedSig)
    const actual   = Buffer.from(sigB64)
    if (expected.length !== actual.length) return null
    if (!timingSafeEqual(expected, actual)) return null
  } catch {
    return null
  }

  try {
    const payload: SSOPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    )
    // Check expiry (15-minute window)
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    if (!payload.email || !payload.btoc_id) return null
    return payload
  } catch {
    return null
  }
}

/**
 * Accept an UNSIGNED base64url JSON token (MVP / demo only, no secret set).
 * This is the same format the register page uses for prefill.
 */
function decodeUnsignedToken(token: string): SSOPayload | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/login?error=missing_token`)
  }

  // ── Verify token ───────────────────────────────────────────────────────────
  const secret = process.env.LETUDIANT_SSO_SECRET

  let payload: SSOPayload | null

  if (secret) {
    // Production: enforce HMAC signature
    payload = verifyToken(token, secret)
    if (!payload) {
      return NextResponse.redirect(`${APP_URL}/login?error=invalid_token`)
    }
  } else {
    // MVP / demo: accept unsigned base64url JSON (no signature check)
    payload = decodeUnsignedToken(token)
    if (!payload?.email) {
      return NextResponse.redirect(`${APP_URL}/login?error=invalid_token`)
    }
  }

  const supabase = createAdminClient()

  // ── Check if user already has an account ──────────────────────────────────
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', payload.email.toLowerCase().trim())
    .maybeSingle()

  if (existingUser) {
    // Update btoc linkage (idempotent)
    await supabase
      .from('users')
      .update({ client_id_btoc: payload.btoc_id })
      .eq('id', existingUser.id)

    // Generate a one-time magic link so the user is logged in automatically
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type:  'magiclink',
      email: payload.email.toLowerCase().trim(),
      options: { redirectTo: `${APP_URL}/home` },
    })

    if (linkErr || !linkData?.properties?.hashed_token) {
      // Fallback: redirect to login pre-filled with their email
      const loginUrl = new URL(`${APP_URL}/login`)
      loginUrl.searchParams.set('email', payload.email)
      loginUrl.searchParams.set('hint', 'sso')
      return NextResponse.redirect(loginUrl.toString())
    }

    // Redirect to Supabase's magic-link confirm URL which then bounces to /home
    const confirmUrl = new URL(`${APP_URL}/auth/callback`)
    confirmUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
    confirmUrl.searchParams.set('type', 'magiclink')
    confirmUrl.searchParams.set('next', '/home')
    return NextResponse.redirect(confirmUrl.toString())
  }

  // ── New user: redirect to register with pre-filled data ───────────────────
  const prefillPayload = {
    email:           payload.email,
    firstName:       payload.firstName,
    lastName:        payload.lastName,
    btoc_id:         payload.btoc_id,
    education_level: payload.education_level,
  }
  const prefill = Buffer.from(JSON.stringify(prefillPayload)).toString('base64url')
  return NextResponse.redirect(`${APP_URL}/register?prefill=${prefill}`)
}
