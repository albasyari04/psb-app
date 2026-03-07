// app/siswa/status/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'  // ← PERBAIKAN: pakai supabaseAdmin bukan supabase
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Pendaftaran {
  id: string
  status: 'menunggu' | 'diproses' | 'diterima' | 'ditolak'
  nama_lengkap: string
  jurusan_pilihan: string
  asal_sekolah: string
  nilai_rata_rata: number
  catatan_admin: string | null
  created_at: string
}

// ── Timeline steps ─────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    key:   'menunggu',
    label: 'Pendaftaran Dikirim',
    icon:  '📤',
    desc:  'Formulir berhasil diterima oleh sistem',
  },
  {
    key:   'diproses',
    label: 'Verifikasi Berkas',
    icon:  '🔍',
    desc:  'Panitia sedang memeriksa kelengkapan berkas',
  },
  {
    key:   'diterima',
    label: 'Pengumuman Hasil',
    icon:  '🎉',
    desc:  'Keputusan akhir penerimaan telah ditetapkan',
  },
]
const STATUS_ORDER = ['menunggu', 'diproses', 'diterima']

const STATUS_META: Record<Pendaftaran['status'], { icon: string; tag: string; name: string }> = {
  menunggu: { icon: '⏳', tag: 'Menunggu Review',  name: 'Menunggu' },
  diproses: { icon: '🔍', tag: 'Sedang Diproses',  name: 'Diproses' },
  diterima: { icon: '🎉', tag: 'Diterima!',         name: 'Diterima' },
  ditolak:  { icon: '❌', tag: 'Tidak Diterima',    name: 'Ditolak'  },
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function StatusPage() {
  const session = await getServerSession(authOptions)

  // PERBAIKAN: Gunakan supabaseAdmin (service role key) agar bypass RLS
  // sehingga data pasti terbaca meskipun RLS policy belum dikonfigurasi
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .eq('user_id', session!.user.id)
    .maybeSingle()  // ← PERBAIKAN: pakai maybeSingle() bukan single()
                    //   single() akan throw error jika tidak ada data,
                    //   maybeSingle() return null jika tidak ada data

  if (error) {
    console.error('Status page query error:', error.message)
  }

  const p          = data as Pendaftaran | null
  const currentIdx = p ? STATUS_ORDER.indexOf(p.status) : -1
  const isDitolak  = p?.status === 'ditolak'
  const isDiterima = p?.status === 'diterima'
  const meta       = p ? STATUS_META[p.status] : null

  const tanggalDaftar = p
    ? new Date(p.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  return (
    <div className="app-shell ss-bg">

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <div className="ss-hero">
        <div className="ss-hero-grid" />
        <div className="ss-hero-orb-1" />
        <div className="ss-hero-orb-2" />
        <div className="ss-hero-content">

          <div className="ss-hero-top">
            <Link href="/siswa/dashboard" className="ss-back-btn">←</Link>
            <div>
              <h1 className="ss-hero-title">Status Pendaftaran</h1>
              <p className="ss-hero-sub">Pantau progres seleksi kamu</p>
            </div>
          </div>

          {/* No. Registrasi di hero */}
          {p && (
            <div>
              <div className="ss-reg-chip">
                <div>
                  <p className="ss-reg-label">No. Registrasi</p>
                  <p className="ss-reg-number">{p.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <p className="ss-reg-date">Didaftarkan: {tanggalDaftar}</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ FLOATING STATUS BADGE ════════════════════════════════════════════ */}
      {p && meta && (
        <div className="ss-float-zone">
          <div className={`ss-status-badge ${p.status}`}>
            <div className="ss-status-left">
              <div className="ss-status-icon-wrap">{meta.icon}</div>
              <div>
                <p className="ss-status-tag">{meta.tag}</p>
                <p className="ss-status-name">{meta.name}</p>
              </div>
            </div>
            <div className="ss-pulse-dot" />
          </div>
        </div>
      )}

      {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
      <div className="ss-body">

        {/* ── Empty state ── */}
        {!p && (
          <div className="ss-card ss-empty">
            <div className="ss-empty-icon">📋</div>
            <p className="ss-empty-title">Belum Ada Pendaftaran</p>
            <p className="ss-empty-sub">
              Kamu belum mengisi formulir pendaftaran. Segera daftarkan diri sebelum batas waktu.
            </p>
            <Link href="/siswa/pendaftaran" className="ss-empty-btn">
              <span>📝</span>
              <span>Isi Formulir Sekarang</span>
            </Link>
          </div>
        )}

        {p && (
          <>
            {/* ── Diterima Banner ── */}
            {isDiterima && (
              <div className="ss-diterima-banner">
                <span className="ss-diterima-emoji">🎊</span>
                <p className="ss-diterima-title">Selamat! Anda Diterima</p>
                <p className="ss-diterima-sub">
                  di Jurusan <span className="ss-diterima-jurusan">{p.jurusan_pilihan}</span>
                </p>
                {p.catatan_admin && (
                  <p className="ss-diterima-note">{p.catatan_admin}</p>
                )}
                <Link href="/siswa/dashboard" className="ss-diterima-btn">
                  🏠 Kembali ke Beranda
                </Link>
              </div>
            )}

            {/* ── Ditolak Card ── */}
            {isDitolak && (
              <div className="ss-ditolak-card">
                <div className="ss-ditolak-header">
                  <div className="ss-ditolak-icon-wrap">❌</div>
                  <div>
                    <p className="ss-ditolak-title">Pendaftaran Tidak Diterima</p>
                    <p className="ss-ditolak-sub">Maaf, pendaftaran Anda tidak lolos seleksi</p>
                  </div>
                </div>
                {p.catatan_admin && (
                  <div className="ss-ditolak-note">
                    <p className="ss-ditolak-note-label">📌 Catatan Panitia</p>
                    <p className="ss-ditolak-note-text">{p.catatan_admin}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Timeline (hanya jika bukan ditolak) ── */}
            {!isDitolak && (
              <div className="ss-card">
                <p className="ss-card-title">📊 Timeline Proses Seleksi</p>
                <div className="ss-timeline">
                  {TIMELINE.map((step, i) => {
                    const isDone   = i < currentIdx
                    const isActive = i === currentIdx
                    const state    = isDone ? 'done' : isActive ? 'active' : 'pending'
                    const isLast   = i === TIMELINE.length - 1

                    return (
                      <div key={step.key} className="ss-tl-row">

                        {/* Track: dot + line */}
                        <div className="ss-tl-track">
                          <div className={`ss-tl-dot ${state}`}>
                            {isDone ? '✓' : step.icon}
                          </div>
                          {!isLast && (
                            <div className={`ss-tl-line ${isDone ? 'done' : 'pending'}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="ss-tl-content">
                          <p className={`ss-tl-label ${state}`}>{step.label}</p>
                          <p className={`ss-tl-desc ${state}`}>{step.desc}</p>
                          {isActive && (
                            <span className="ss-tl-badge-now">● Sedang berlangsung</span>
                          )}
                          {isDone && (
                            <span className="ss-tl-badge-done">✓ Selesai</span>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Data Pendaftaran ── */}
            <div className="ss-card">
              <p className="ss-card-title">📋 Data Pendaftaran</p>
              <div className="ss-data-rows">
                {(
                  [
                    ['Nama Lengkap',    p.nama_lengkap],
                    ['Jurusan Pilihan', p.jurusan_pilihan],
                    ['Asal Sekolah',    p.asal_sekolah],
                    ['Nilai Rata-rata', `${Number(p.nilai_rata_rata).toFixed(2)} / 100`],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="ss-data-row">
                    <span className="ss-data-key">{k}</span>
                    <span className="ss-data-val">{v || '-'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Edit button (hanya jika masih menunggu) ── */}
            {p.status === 'menunggu' && (
              <Link href="/siswa/pendaftaran" className="ss-edit-btn">
                <span>✏️</span>
                <span>Edit Formulir Pendaftaran</span>
              </Link>
            )}
          </>
        )}

      </div>
    </div>
  )
}