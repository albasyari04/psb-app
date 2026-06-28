// app/api/admin/jadwal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('jadwal')
      .select('*')
      .order('urutan', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching jadwal:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { label, tanggal, tanggal_mulai, tanggal_selesai, status, warna, urutan } = body

    if (!label || !tanggal) {
      return NextResponse.json(
        { error: 'Label dan tanggal wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Ambil urutan tertinggi jika tidak diberikan
    let nextUrutan = urutan
    if (nextUrutan === undefined || nextUrutan === null) {
      const { data: existing } = await supabase
        .from('jadwal')
        .select('urutan')
        .order('urutan', { ascending: false })
        .limit(1)
        .single()
      nextUrutan = existing ? (existing.urutan ?? 0) + 1 : 1
    }

    const { data, error } = await supabase
      .from('jadwal')
      .insert({
        label,
        tanggal,
        tanggal_mulai: tanggal_mulai || null,
        tanggal_selesai: tanggal_selesai || null,
        status: status || 'Akan Datang',
        warna: warna || '#7c3aed',
        urutan: nextUrutan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // ── Broadcast notifikasi jadwal baru ke semua santri ────────────────────
    // Jadwal (misal: tes wawancara, daftar ulang, dsb) relevan untuk semua
    // santri yang sedang dalam proses pendaftaran, jadi dikirim ke semua.
    try {
      const { data: siswaList, error: siswaErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'siswa')

      if (siswaErr) {
        console.error('[jadwal] Gagal ambil daftar santri:', siswaErr.message)
      } else if (siswaList && siswaList.length > 0) {
        const tanggalFormatted = new Date(tanggal).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        const notifications = siswaList.map((s) => ({
          user_id: s.id,
          title:   '🗓️ Jadwal Baru Ditambahkan',
          message: `${label} dijadwalkan pada ${tanggalFormatted}. Pastikan kamu tidak melewatkannya.`,
          type:    'info',
          is_read: false,
        }))

        const { error: notifError } = await supabase.from('notifications').insert(notifications)
        if (notifError) {
          console.error('[jadwal] Gagal broadcast notifikasi:', notifError.message)
        }
      }
    } catch (notifErr) {
      console.error('[jadwal] Gagal broadcast notifikasi:', notifErr)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating jadwal:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}