import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Client browser (anon key) ─────────────────────────────────────────────
// Gunakan di 'use client' components → tunduk pada RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Client server (service role key) ─────────────────────────────────────
// Gunakan di Server Components & API routes → BYPASS RLS
// Key ini RAHASIA — tidak boleh dikirim ke browser
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  }
)