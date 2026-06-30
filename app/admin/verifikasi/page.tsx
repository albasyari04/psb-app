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

  return (
    <div className="app-shell vrk-page-bg">

      {/* ── Header (putih, garis lurus, FIXED — tidak ikut ter-scroll) ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          padding: '20px 16px 18px',
          background: '#ffffff',
          borderBottom: '1px solid #EDEAF6',
          boxShadow: '0 6px 20px rgba(109,61,245,0.08)',
        }}
      >
        {/* Tombol back + judul */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Link
            href="/admin/dashboard"
            aria-label="Kembali"
            className="no-underline"
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: '#F5F0FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="#6D3DF5"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: '#1e1b2e',
                letterSpacing: '-0.3px',
              }}
            >
              Verifikasi Pendaftaran
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13.5,
                color: '#8b86a3',
              }}
            >
              Kelola status verifikasi pendaftaran Anda
            </p>
          </div>
        </div>

        {/* Ikon shield di pojok kanan atas sudah dihapus sesuai permintaan */}
      </div>

      {/* Spacer pengganti tinggi header fixed di atas, supaya body tidak ketutupan */}
      <div style={{ height: 90 }} />

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