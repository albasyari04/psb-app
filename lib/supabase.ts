// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Type alias agar tidak perlu tulis panjang terus ───────────────────────────
export type TypedSupabaseClient = SupabaseClient<Database>

// ── Singleton instances ───────────────────────────────────────────────────────
let supabaseInstance: TypedSupabaseClient | null = null
let supabaseAdminInstance: TypedSupabaseClient | null = null

// ── Browser client (anon key) - Gunakan HANYA di 'use client' components ──────
export function getSupabaseClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('[supabase] Browser client hanya tersedia di browser')
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  }
  return supabaseInstance
}

// ── Server admin client (service role) ───────────────────────────────────────
export function getSupabaseAdmin(): TypedSupabaseClient {
  if (!supabaseAdminInstance) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[supabase] SUPABASE_SERVICE_ROLE_KEY is not set!')
    }
    supabaseAdminInstance = createClient<Database>(
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

// ── Browser Proxy (untuk 'use client' components) ─────────────────────────────
export const supabase = new Proxy({} as TypedSupabaseClient, {
  get: (_target, prop: string | symbol) => {
    if (typeof window === 'undefined') return undefined
    const client = getSupabaseClient()
    return client[prop as keyof TypedSupabaseClient]
  },
})

// ── Admin Proxy (untuk Server Components & API routes) ───────────────────────
export const supabaseAdmin = new Proxy({} as TypedSupabaseClient, {
  get: (_target, prop: string | symbol) => {
    const client = getSupabaseAdmin()
    return client[prop as keyof TypedSupabaseClient]
  },
})