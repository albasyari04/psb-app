import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { supabaseAdmin }    from '@/lib/supabase'
import type { Pendaftaran } from '@/types'
import Image                from 'next/image'
import Link                 from 'next/link'

// ── Fetch pendaftaran pakai supabaseAdmin (bypass RLS) ────────────────────────
async function getPendaftaran(userId: string): Promise<Pendaftaran | null> {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

// ── Progress label per status ─────────────────────────────────────────────────
const PROGRESS_LABEL: Record<Pendaftaran['status'], string> = {
  menunggu: '25%',
  diproses: '60%',
  diterima: '100%',
  ditolak:  '100%',
}

const STATUS_LABEL: Record<Pendaftaran['status'], string> = {
  menunggu: 'Menunggu Review',
  diproses: 'Sedang Diproses',
  diterima: 'Diterima! 🎉',
  ditolak:  'Tidak Diterima',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

// ── Menu items ────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    href:  '/siswa/pendaftaran',
    icon:  '📝',
    title: 'Formulir',
    sub:   'Isi & edit data diri',
    color: 'blue',
  },
  {
    href:  '/siswa/status',
    icon:  '📊',
    title: 'Status',
    sub:   'Pantau progres seleksi',
    color: 'violet',
  },
  {
    href:  '/siswa/profile',
    icon:  '👤',
    title: 'Profil',
    sub:   'Kelola akun & foto',
    color: 'green',
  },
  {
    href:  '/siswa/pendaftaran',
    icon:  '📁',
    title: 'Berkas',
    sub:   'Upload dokumen wajib',
    color: 'amber',
  },
] as const

// ── Jadwal ────────────────────────────────────────────────────────────────────
const JADWAL = [
  { label: 'Batas Pendaftaran', date: '28 Feb 2025',   dot: 'red'   },
  { label: 'Pengumuman Hasil',  date: '15 Maret 2025', dot: 'blue'  },
  { label: 'Daftar Ulang',      date: '1–15 Apr 2025', dot: 'green' },
] as const

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session     = await getServerSession(authOptions)
  const pendaftaran = session ? await getPendaftaran(session.user.id) : null
  const firstName   = session?.user.name?.split(' ')[0] ?? 'Siswa'
  const status      = pendaftaran?.status ?? null
  const avatarUrl   = session?.user.avatar_url ?? null

  return (
    <div className="app-shell sd-bg">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div className="sd-hero">
        <div className="sd-hero-grid" />
        <div className="sd-orb sd-orb-1" />
        <div className="sd-orb sd-orb-2" />
        <div className="sd-orb sd-orb-3" />

        <div className="sd-hero-content">
          <div className="sd-hero-top">
            <div>
              <p className="sd-greeting">{getGreeting()},</p>
              <h1 className="sd-hero-name">{session?.user.name ?? 'Siswa'} 👋</h1>
              <p className="sd-hero-sub">PSB Tahun Ajaran 2025/2026 · SMA Negeri 1</p>
            </div>

            {/* ✅ Avatar dengan Next.js Image */}
            <Link href="/siswa/profile" className="sd-avatar-btn">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={session?.user.name ?? 'avatar'}
                  width={48}
                  height={48}
                  style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <span className="sd-avatar-initials">
                  {firstName[0].toUpperCase()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ══ FLOATING STATUS CARD ══════════════════════════════════════════════ */}
      <div className="sd-float-zone">

        {pendaftaran && status ? (
          /* ── Sudah mendaftar ── */
          <div className="sd-status-card">

            {/* Status row */}
            <div className="sd-status-row">
              <div className="sd-status-left">
                <div className={`sd-status-dot-wrap ${status}`}>
                  <div className={`sd-pulse-dot ${status}`} />
                </div>
                <div>
                  <p className="sd-status-label-sm">Status Pendaftaran</p>
                  <p className={`sd-status-label-lg ${status}`}>
                    {STATUS_LABEL[status]}
                  </p>
                </div>
              </div>
              <Link href="/siswa/status" className="sd-detail-btn">
                Detail →
              </Link>
            </div>

            {/* Progress bar */}
            <div className="sd-progress-wrap">
              <div className="sd-progress-meta">
                <span>Progress Seleksi</span>
                <span>{PROGRESS_LABEL[status]}</span>
              </div>
              <div className="sd-progress-track">
                <div className={`sd-progress-fill ${status}`} />
              </div>
            </div>

            {/* Info rows */}
            <div className="sd-info-divider" />
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span className="sd-info-key">Nama Lengkap</span>
                <span className="sd-info-val">{pendaftaran.nama_lengkap}</span>
              </div>
              <div className="sd-info-row">
                <span className="sd-info-key">Jurusan</span>
                <span className="sd-info-val">{pendaftaran.jurusan_pilihan}</span>
              </div>
              <div className="sd-info-row">
                <span className="sd-info-key">No. Reg</span>
                <span className="sd-info-val-mono">
                  {pendaftaran.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

        ) : (
          /* ── Belum mendaftar ── */
          <div className="sd-empty-card">
            <div className="sd-empty-row">
              <div className="sd-empty-icon-box">📋</div>
              <div>
                <p className="sd-empty-title">Belum Mendaftar</p>
                <p className="sd-empty-sub">
                  Lengkapi formulir pendaftaran untuk memulai proses seleksi.
                </p>
              </div>
            </div>
            <Link href="/siswa/pendaftaran" className="sd-cta-btn">
              <span>Mulai Pendaftaran Sekarang</span>
              <span className="sd-cta-arrow">→</span>
            </Link>
          </div>
        )}
      </div>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
      <div className="sd-main">

        {/* ── Quick Menu ── */}
        <div>
          <p className="sd-section-label">Menu Utama</p>
          <div className="sd-menu-grid">
            {MENU_ITEMS.map((item) => (
              <Link key={item.title} href={item.href} className={`sd-menu-card ${item.color}`}>
                <div className="sd-menu-icon-box">{item.icon}</div>
                <p className="sd-menu-title">{item.title}</p>
                <p className="sd-menu-sub">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Jadwal Penting ── */}
        <div>
          <p className="sd-section-label">Jadwal Penting</p>
          <div className="sd-jadwal-card">
            <div className="sd-jadwal-header">
              <span className="sd-jadwal-header-icon">📅</span>
              <span className="sd-jadwal-header-title">Timeline Penerimaan 2025/2026</span>
            </div>
            {JADWAL.map((j) => (
              <div key={j.label} className="sd-jadwal-row">
                <div className="sd-jadwal-left">
                  <div className={`sd-jadwal-dot ${j.dot}`} />
                  <span className="sd-jadwal-label">{j.label}</span>
                </div>
                <span className="sd-jadwal-date">{j.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tip / Motivasi ── */}
        <div className="sd-tip-card">
          <span className="sd-tip-emoji">💡</span>
          <div className="sd-tip-text">
            <p className="sd-tip-title">Tips Pendaftaran</p>
            <p className="sd-tip-sub">
              Pastikan semua berkas terbaca jelas dan nilai rata-rata rapor ≥ 80
              untuk meningkatkan peluang diterima.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}