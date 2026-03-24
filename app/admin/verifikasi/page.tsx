// app/admin/verifikasi/page.tsx
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import type { Pendaftaran } from '@/types'
export const dynamic = 'force-dynamic'

const avatarGradients = [
  'vrk-av-violet',
  'vrk-av-amber',
  'vrk-av-blue',
  'vrk-av-rose',
  'vrk-av-emerald',
]

export default async function VerifikasiPage() {
  const { data: pending, error } = await supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .in('status', ['menunggu', 'diproses'])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Verifikasi page error:', error.message)
  }

  const list = (pending ?? []) as Pendaftaran[]

  const menungguCount = list.filter(p => p.status === 'menunggu').length
  const diprosesCount = list.filter(p => p.status === 'diproses').length
  const totalPending  = menungguCount + diprosesCount

  return (
    <div className="app-shell vrk-page-bg">

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div className="vrk-hero">
        <div className="vrk-orb vrk-orb-1" />
        <div className="vrk-orb vrk-orb-2" />
        <div className="vrk-orb vrk-orb-3" />
        <div className="vrk-grid-overlay" />

        <div className="vrk-hero-content">
          <div className="vrk-eyebrow">
            <span className="vrk-eyebrow-dot" />
            <span>ADMIN · PSB 2025/2026</span>
          </div>

          <h1 className="vrk-hero-title">
            Verifikasi<br />
            <span className="vrk-hero-title-accent">Pendaftar</span>
          </h1>
          <p className="vrk-hero-subtitle">
            {list.length > 0
              ? `${list.length} pendaftar perlu ditinjau`
              : 'Semua pendaftar sudah diverifikasi ✓'}
          </p>

          {list.length > 0 && (
            <div className="vrk-stats-row">
              <div className="vrk-stat-chip vrk-stat-chip-white">
                <span className="vrk-stat-chip-num">{totalPending}</span>
                <span className="vrk-stat-chip-lbl">Total Antrian</span>
              </div>
              <div className="vrk-stat-divider" />
              <div className="vrk-stat-chip">
                <span className="vrk-stat-indicator vrk-ind-amber" />
                <span className="vrk-stat-chip-num">{menungguCount}</span>
                <span className="vrk-stat-chip-lbl">Menunggu</span>
              </div>
              <div className="vrk-stat-chip">
                <span className="vrk-stat-indicator vrk-ind-blue" />
                <span className="vrk-stat-chip-num">{diprosesCount}</span>
                <span className="vrk-stat-chip-lbl">Diproses</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="vrk-body">

        {/* Empty state */}
        {list.length === 0 && (
          <div className="vrk-empty">
            <div className="vrk-empty-ring">
              <div className="vrk-empty-inner">🎉</div>
            </div>
            <h2 className="vrk-empty-title">Semua sudah diverifikasi!</h2>
            <p className="vrk-empty-sub">
              Tidak ada pendaftar yang sedang menunggu review saat ini
            </p>
            <Link href="/admin/pendaftar" className="vrk-btn-outline no-underline">
              <span>📋</span> Lihat Semua Pendaftar
            </Link>
          </div>
        )}

        {/* Menunggu */}
        {menungguCount > 0 && (
          <section className="vrk-section">
            <div className="vrk-section-head">
              <div className="vrk-section-label vrk-label-amber">
                <span className="vrk-label-dot vrk-label-dot-amber" />
                Menunggu Review
              </div>
              <span className="vrk-count-badge vrk-count-amber">{menungguCount}</span>
            </div>
            <div className="vrk-cards">
              {list
                .filter(p => p.status === 'menunggu')
                .map((p, i) => (
                  <VerifikasiCard
                    key={p.id}
                    p={p}
                    avatarIdx={i}
                    urgency="high"
                    isLast={i === menungguCount - 1}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Diproses */}
        {diprosesCount > 0 && (
          <section className="vrk-section">
            <div className="vrk-section-head">
              <div className="vrk-section-label vrk-label-blue">
                <span className="vrk-label-dot vrk-label-dot-blue" />
                Sedang Diproses
              </div>
              <span className="vrk-count-badge vrk-count-blue">{diprosesCount}</span>
            </div>
            <div className="vrk-cards">
              {list
                .filter(p => p.status === 'diproses')
                .map((p, i) => (
                  <VerifikasiCard
                    key={p.id}
                    p={p}
                    avatarIdx={i + menungguCount}
                    urgency="medium"
                    isLast={i === diprosesCount - 1}
                  />
                ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

// ── Card Component ───────────────────────────────────────────────────────────
function VerifikasiCard({
  p, avatarIdx, urgency, isLast,
}: {
  p: Pendaftaran
  avatarIdx: number
  urgency: 'high' | 'medium'
  isLast: boolean
}) {
  const avatarCls = avatarGradients[avatarIdx % avatarGradients.length]
  const isHigh    = urgency === 'high'

  // ✅ Handle null created_at
  const date = p.created_at
    ? new Date(p.created_at).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '-'

  return (
    <Link
      href={'/admin/pendaftar/' + p.id}
      className={'vrk-card no-underline' + (!isLast ? ' vrk-card-divider' : '')}
    >
      <div className={'vrk-avatar ' + avatarCls}>
        {p.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
      <div className="vrk-card-info">
        <p className="vrk-card-name">{p.nama_lengkap}</p>
        <p className="vrk-card-jurusan">📚 {p.jurusan_pilihan ?? '—'}</p>
        <div className="vrk-card-meta">
          {/* ✅ Hapus nilai_rata_rata — tidak ada di database */}
          <span className="vrk-meta-date">{date}</span>
        </div>
      </div>
      <div className="vrk-card-right">
        {isHigh ? (
          <span className="vrk-badge vrk-badge-amber">
            <span className="vrk-badge-dot vrk-badge-dot-amber" />
            Menunggu
          </span>
        ) : (
          <span className="vrk-badge vrk-badge-blue">
            <span className="vrk-badge-dot vrk-badge-dot-blue" />
            Diproses
          </span>
        )}
        <span className="vrk-cta">Tinjau →</span>
      </div>
    </Link>
  )
}