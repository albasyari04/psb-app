// app/api/push/subscribe/route.ts
//
// Dipanggil dari client (PushNotificationManager.tsx) setelah browser
// berhasil bikin PushSubscription. Berlaku untuk SISWA maupun ADMIN —
// makanya cuma cek session ada atau tidak, tanpa cek role spesifik.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

interface PushSubscriptionBody {
  subscription?: {
    endpoint: string
    keys?: { p256dh?: string; auth?: string }
  }
}

// ── POST: simpan / update subscription ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as PushSubscriptionBody | null
  const sub = body?.subscription

  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: 'Data subscription tidak valid' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const userAgent = req.headers.get('user-agent') ?? null

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id:    session.user.id,
        endpoint:   sub.endpoint,
        p256dh:     sub.keys.p256dh,
        auth:       sub.keys.auth,
        user_agent: userAgent,
      } as never,
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('[POST /api/push/subscribe]', error)
    return NextResponse.json({ error: 'Gagal menyimpan subscription' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ── DELETE: hapus subscription (misal saat user nonaktifkan notifikasi) ──────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const endpoint = body?.endpoint

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint diperlukan' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .eq('user_id', session.user.id)

  if (error) {
    console.error('[DELETE /api/push/subscribe]', error)
    return NextResponse.json({ error: 'Gagal menghapus subscription' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}