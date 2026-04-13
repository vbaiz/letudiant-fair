import { getSupabase } from './client'

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await getSupabase().auth.getSession()
  return data.session
}

export function onAuthChange(callback: Parameters<ReturnType<typeof getSupabase>['auth']['onAuthStateChange']>[0]) {
  return getSupabase().auth.onAuthStateChange(callback)
}
