import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Singleton instances ───────────────────────────────────────────────────────
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

// ── Browser client (anon key) - Gunakan HANYA di 'use client' components ──────
export function getSupabaseClient(): ReturnType<typeof createClient> {
  if (typeof window === 'undefined') {
    throw new Error('[supabase] Browser client hanya tersedia di browser')
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  }
  return supabaseInstance
}

// ── Server admin client (service role) - Lazy initialized, safe untuk modules ──
export function getSupabaseAdmin(): ReturnType<typeof createClient> {
  if (!supabaseAdminInstance) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[supabase] SUPABASE_SERVICE_ROLE_KEY is not set!')
    }
    supabaseAdminInstance = createClient(
      supabaseUrl,
      serviceRoleKey || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return supabaseAdminInstance
}

// ── Client browser (anon key) - Gunakan di 'use client' components ──────────
// FIX: Cast prop ke keyof SupabaseClient agar TypeScript strict mode tidak error
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop: string | symbol) => {
    if (typeof window === 'undefined') return undefined
    const client = getSupabaseClient()
    return client[prop as keyof SupabaseClient]
  },
})

// ── Server admin client (service role) - Gunakan di Server Components & API ──
// FIX: Cast prop ke keyof SupabaseClient agar TypeScript strict mode tidak error
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_target, prop: string | symbol) => {
    const client = getSupabaseAdmin()
    return client[prop as keyof SupabaseClient]
  },
})