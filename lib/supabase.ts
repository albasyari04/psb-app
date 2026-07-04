// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

// ─────────────────────────────────────────────────────────────────────────
// ✅ FIX: Proxy versi sebelumnya membuat instance client BARU di SETIAP
// akses property (`getSupabaseAdmin()` dipanggil ulang tiap kali), dan
// method yang diambil dari proxy dipanggil dengan `this` = proxy itu
// sendiri (bukan instance client asli). Kalau method internal supabase-js
// mengakses `this.rest` / `this.headers` dst, akses itu memicu trap `get`
// lagi → instance client LAIN lagi dibuat di tengah satu chain query.
// Ini boros dan rawan menghasilkan request yang state-nya campur dari
// beberapa instance berbeda — kandidat kuat penyebab UPDATE/SELECT yang
// hasilnya tidak konsisten.
//
// Solusinya BUKAN kembali ke `let cachedClient` module-level biasa (itu
// penyebab corrupt saat Turbopack hot-reload yang sudah pernah dialami:
// modul di-reset, referensi lama jadi stale). Solusi yang benar: cache
// instance di `globalThis`, yang TIDAK ikut ter-reset saat hot-reload —
// pola yang sama dipakai resmi oleh Next.js/Prisma untuk masalah identik.
// ─────────────────────────────────────────────────────────────────────────

const globalForSupabase = globalThis as unknown as {
  __supabaseBrowser?: TypedSupabaseClient
  __supabaseAdmin?: TypedSupabaseClient
}

function createBrowserClient(): TypedSupabaseClient {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak diset'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: false,
    },
  })
}

function createAdminClient(): TypedSupabaseClient {
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL is not set!')
  }
  if (!serviceRoleKey) {
    throw new Error('[supabase] SUPABASE_SERVICE_ROLE_KEY is not set!')
  }

  // ✅ Sanity check: JWT service_role key punya klaim role "service_role".
  // Kalau env var ini ke-tuker dengan anon key, ketahuan langsung di log
  // startup — bukan diam-diam bikin semua query kena RLS.
  try {
    const payload = JSON.parse(
      Buffer.from(serviceRoleKey.split('.')[1] ?? '', 'base64').toString('utf8')
    )
    if (payload?.role !== 'service_role') {
      console.warn(
        `[supabase] PERINGATAN: SUPABASE_SERVICE_ROLE_KEY punya role "${payload?.role}", ` +
        `bukan "service_role". Kalau ini sebenarnya anon key, semua query lewat supabaseAdmin ` +
        `akan kena RLS dan bisa silently return 0 rows tanpa error eksplisit — persis gejala ` +
        `"tidak ada baris admin yang cocok" yang muncul di /api/profile/upload & /api/profile/update.`
      )
    }
  } catch {
    console.warn('[supabase] Tidak bisa memvalidasi payload SUPABASE_SERVICE_ROLE_KEY (bukan format JWT standar)')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}

// ── Browser client (anon key) ─────────────────────────────────────────────
export function getSupabaseClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('[supabase] Browser client hanya tersedia di browser')
  }
  if (!globalForSupabase.__supabaseBrowser) {
    globalForSupabase.__supabaseBrowser = createBrowserClient()
  }
  return globalForSupabase.__supabaseBrowser
}

// ── Server admin client (service role) ─────────────────────────────────────
export function getSupabaseAdmin(): TypedSupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('[supabase] Admin client hanya tersedia di server-side!')
  }
  if (!globalForSupabase.__supabaseAdmin) {
    globalForSupabase.__supabaseAdmin = createAdminClient()
  }
  return globalForSupabase.__supabaseAdmin
}

// ── Export langsung untuk dipakai sebagai `supabase.from(...)` dsb ─────────
// Instance HANYA dibuat sekali (di-cache di globalThis via getter di atas),
// dan setiap method yang diambil lewat proxy di-`bind()` ke instance client
// yang SAMA — jadi `this` di dalam supabase-js selalu benar, apa pun cara
// pemanggilannya (destructuring, disimpan ke variabel, dsb).
export const supabase: TypedSupabaseClient = new Proxy({} as TypedSupabaseClient, {
  get: (_target, prop: string | symbol, receiver) => {
    const client = getSupabaseClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export const supabaseAdmin: TypedSupabaseClient = new Proxy({} as TypedSupabaseClient, {
  get: (_target, prop: string | symbol, receiver) => {
    if (typeof window !== 'undefined') {
      throw new Error('[supabase] Admin client hanya tersedia di server-side!')
    }
    const client = getSupabaseAdmin()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})