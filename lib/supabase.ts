// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

// ✅ FIX #2: Hapus singleton module-level (let supabaseAdminInstance)
// Singleton di module-level bisa corrupt saat Turbopack hot-reload,
// menyebabkan getSupabaseAdmin() return instance rusak → auth crash → return HTML.
// Instance dibuat fresh tiap pemanggilan — overhead minimal karena hanya di server.

// ── Browser client (anon key) ─────────────────────────────────────────────────
export function getSupabaseClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('[supabase] Browser client hanya tersedia di browser')
  }

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: false,
    },
  })
}

// ── Server admin client (service role) ───────────────────────────────────────
export function getSupabaseAdmin(): TypedSupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('[supabase] Admin client hanya tersedia di server-side!')
  }

  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL is not set!')
  }
  if (!serviceRoleKey) {
    throw new Error('[supabase] SUPABASE_SERVICE_ROLE_KEY is not set!')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}

// ── Browser Proxy ─────────────────────────────────────────────────────────────
export const supabase = new Proxy({} as TypedSupabaseClient, {
  get: (_target, prop: string | symbol) => {
    if (typeof window === 'undefined') return undefined
    const client = getSupabaseClient()
    return client[prop as keyof TypedSupabaseClient]
  },
})

// ── Admin Proxy ───────────────────────────────────────────────────────────────
export const supabaseAdmin = new Proxy({} as TypedSupabaseClient, {
  get: (_target, prop: string | symbol) => {
    if (typeof window !== 'undefined') {
      throw new Error('[supabase] Admin client hanya tersedia di server-side!')
    }
    const client = getSupabaseAdmin()
    return client[prop as keyof TypedSupabaseClient]
  },
})