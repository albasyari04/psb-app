'use client'

/**
 * app/siswa/pembayaran/page.tsx
 *
 * Halaman Pembayaran utama — /siswa/pembayaran
 * Ini berbeda dari /siswa/pembayaran/bayar (route Upload).
 * Halaman ini menampilkan ringkasan pembayaran dari API ringkasan.
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/SettingsContext'
import { CircleHelp, History, Landmark } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PembayaranItem {
  id: string
  judul: string
  jumlah: number
  status: 'lunas' | 'belum_lunas' | string
}

interface PembayaranData {
  total: number
  items: PembayaranItem[]
}

// ─── Utils ─────────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n)
}

// ─── Icons (semua inline SVG) ────────────────────────────────────────────────

const IcArrowLeft = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m12 19-7-7 7-7" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IcUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

const IcDocument = ({ color = '#D97706' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M14 3.5V7a1 1 0 0 0 1 1h3.5" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="9" y1="15.5" x2="15" y2="15.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IcCheckCircle = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IcWalletIllustration = ({ color = '#0E7C5F', colorDark = '#0A5C46', colorLight = '#A7E8C7' }: { color?: string; colorDark?: string; colorLight?: string }) => (
  <svg width="88" height="75" viewBox="0 0 140 120" fill="none" aria-hidden="true">
    <path d="M22 56l2.6 6 6 2.6-6 2.6-2.6 6-2.6-6-6-2.6 6-2.6 2.6-6Z" fill={color} opacity={0.85} />
    <path d="M40 40l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8 1.8-4.2Z" fill={color} opacity={0.6} />
    <g>
      <rect x="64" y="22" width="46" height="28" rx="3" fill={colorLight} transform="rotate(-14 64 22)" />
      <rect x="70" y="20" width="46" height="28" rx="3" fill="#7FDBAE" transform="rotate(-5 70 20)" />
      <rect x="74" y="22" width="44" height="26" rx="3" fill="#E9FBF1" transform="rotate(2 74 22)" />
    </g>
    <rect x="34" y="46" width="84" height="58" rx="14" fill={color} />
    <rect x="34" y="46" width="84" height="58" rx="14" fill="url(#walletShade)" />
    <path d="M104 70h14a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-14v-16Z" fill={colorDark} />
    <circle cx="111" cy="78" r="3.2" fill="#fff" />
    <circle cx="116" cy="104" r="11" fill="#fff" />
    <path d="M116 109v-9M111.5 104.5 116 100l4.5 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="walletShade" x1="34" y1="46" x2="118" y2="104" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
)

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SiswaPembayaranPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

  const [pembayaran, setPembayaran] = useState<PembayaranData>({ total: 0, items: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllTransactions, setShowAllTransactions] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/siswa/pembayaran/ringkasan')
      if (!res.ok) throw new Error(isEn ? 'Failed to fetch payment data' : 'Gagal mengambil data pembayaran')
      const json = await res.json()
      setPembayaran(json.data ?? { total: 0, items: [] })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (isEn ? 'An error occurred' : 'Terjadi kesalahan'))
    } finally {
      setLoading(false)
    }
  }, [isEn])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, fetchData])

  const lunasCount = pembayaran.items.filter((i) => i.status === 'lunas').length
  const belumLunasCount = pembayaran.items.filter((i) => i.status !== 'lunas').length
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || 'Santri'

  // ─── Dark mode colors ──────────────────────────────────────────────────────
  const bgColor = isDark ? '#15131f' : '#F4F7F5'
  const cardBg = isDark ? '#1e1b2e' : '#FFFFFF'
  const cardBorder = isDark ? '1px solid #2e2a40' : '1px solid #E2E8F0'
  const textColor = isDark ? '#f1f0f5' : '#0F2E22'
  const mutedColor = isDark ? '#94a3b8' : '#94A3B8'
  const borderColor = isDark ? '#2e2a40' : '#E2E8F0'
  const greenColor = isDark ? '#34d399' : '#16A34A'
  const amberColor = isDark ? '#fbbf24' : '#D97706'
  const inkColor = isDark ? '#f1f0f5' : '#0F2E22'
  const grayColor = isDark ? '#6b6885' : '#94A3B8'
  const headerBg = isDark ? '#15131f' : '#F4F7F5'
  const headerBorder = isDark ? '1px solid #2e2a40' : '1px solid #E2E8F0'
  // ─── i18n labels ──────────────────────────────────────────────────────────
  const getStatusLabel = (status: string) => {
    if (status === 'lunas') return isEn ? 'Paid' : 'Lunas'
    return isEn ? 'Unpaid' : 'Belum Lunas'
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: bgColor, gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderWidth: 4, borderStyle: 'solid',
          borderColor: isDark ? '#2e2a40' : '#E2E8F0', borderTopColor: '#6366F1',
          borderRadius: '50%', animation: 'spin .8s linear infinite',
        }} />
        <p style={{ color: mutedColor, fontSize: 13, fontWeight: 500, margin: 0 }}>
          {isEn ? 'Loading payment data...' : 'Memuat data pembayaran...'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: bgColor,
      paddingBottom: 40,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ══ TOP BAR — sticky ══ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.1rem 0.9rem',
        background: headerBg,
        borderBottom: headerBorder,
      }}>
        <button
          type="button"
          className="psmb-back"
          onClick={() => router.back()}
          aria-label={isEn ? 'Back' : 'Kembali'}
          style={{
            width: 40, height: 40, minWidth: 40, borderRadius: '50%', flexShrink: 0,
            background: isDark ? '#2e2a40' : '#F3F0FF',
            border: isDark ? '1px solid #3b3656' : '1px solid #E9E4FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(124,58,237,.08)',
            cursor: 'pointer', color: isDark ? '#c4b5fd' : '#7C3AED',
          }}
        >
          <IcArrowLeft />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: textColor, margin: 0, letterSpacing: '-0.01em', fontFamily: 'inherit' }}>
            {isEn ? `Hi, ${firstName}!` : `Halo, ${firstName}!`}
          </h1>
          <p style={{ fontSize: '0.78rem', color: mutedColor, margin: '0.1rem 0 0', fontFamily: 'inherit' }}>
            {isEn ? 'Your payment overview' : 'Ringkasan pembayaran Anda'}
          </p>
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: '14px 16px 32px', maxWidth: 430, margin: '0 auto' }}>
        <section style={{
          minHeight: 170, padding: 16, marginBottom: 20, borderRadius: 16,
          background: isDark ? '#351076' : '#39008A', color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 18px rgba(50, 9, 117, .18)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0, position: 'relative', zIndex: 1 }}>
              <p style={{ margin: '1px 0 5px', maxWidth: 175, fontSize: 9, lineHeight: 1.3, fontWeight: 800, color: '#D8C8FF', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {isEn ? 'Total unpaid bills' : 'Total tagihan belum lunas'}
              </p>
              <p style={{ margin: 0, fontSize: 28, lineHeight: 1.1, fontWeight: 800, letterSpacing: 0 }}>
                {formatRupiah(pembayaran.total)}
              </p>
              <p style={{ margin: '5px 0 0', fontSize: 10, color: '#D7C8F2' }}>
                {isEn ? `${belumLunasCount} bills awaiting payment` : `${belumLunasCount} tagihan menunggu pembayaran`}
              </p>
            </div>
            <div style={{ position: 'absolute', top: 17, right: 7, opacity: 0.92, pointerEvents: 'none' }}>
              <IcWalletIllustration color="#7EE2B8" colorDark="#168E6D" colorLight="#A7E8C7" />
            </div>
          </div>

          <div style={{ position: 'absolute', left: 16, bottom: 13, display: 'flex', alignItems: 'end', gap: 22 }}>
            <div style={{ display: 'flex', gap: 22 }}>
              <div>
                <p style={{ margin: 0, fontSize: 8, color: '#C8B5E7' }}>{isEn ? 'PAID' : 'LUNAS'}</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700 }}>{lunasCount} {isEn ? 'bills' : 'tagihan'}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 8, color: '#C8B5E7' }}>{isEn ? 'UNPAID' : 'BELUM LUNAS'}</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700 }}>{belumLunasCount} {isEn ? 'bills' : 'tagihan'}</p>
              </div>
            </div>
          </div>

          <div style={{
            position: 'absolute', right: 0, bottom: 0,
            background: bgColor, padding: '8px 0 0 8px', borderTopLeftRadius: 22,
          }}>
            <span aria-hidden style={{
              position: 'absolute', right: 0, top: -16, width: 16, height: 16,
              background: `radial-gradient(circle at 0 0, transparent 16px, ${bgColor} 16.5px)`,
            }} />
            <span aria-hidden style={{
              position: 'absolute', left: -16, bottom: 0, width: 16, height: 16,
              background: `radial-gradient(circle at 0 0, transparent 16px, ${bgColor} 16.5px)`,
            }} />
            <Link href="/siswa/pembayaran/bayar" className="psmb-press" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 46, padding: '0 20px', borderRadius: 16, border: 'none',
              background: isDark ? '#312E81' : '#17171C', color: '#fff', textDecoration: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap',
              margin: '0 8px 8px 0',
            }}>
              <IcUpload />
              {isEn ? 'Pay' : 'Bayar'}
            </Link>
          </div>
        </section>

        <nav aria-label={isEn ? 'Payment shortcuts' : 'Pintasan pembayaran'} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 9, marginBottom: 21 }}>
          {[
            { label: isEn ? 'Pay' : 'Bayar', href: '/siswa/pembayaran/bayar', icon: <IcUpload /> },
            { label: isEn ? 'Account' : 'Rekening', href: '/siswa/pembayaran/bayar', icon: <Landmark size={19} strokeWidth={1.8} /> },
            { label: isEn ? 'History' : 'Riwayat', href: '#riwayat', icon: <History size={19} strokeWidth={1.8} />, onClick: () => setShowAllTransactions(true) },
            { label: isEn ? 'Help' : 'Bantuan', href: '/siswa/bantuan', icon: <CircleHelp size={19} strokeWidth={1.8} /> },
          ].map((action) => (
            <Link key={action.label} href={action.href} onClick={action.onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: isDark ? '#c7d2fe' : '#1E2A5A', textDecoration: 'none', minWidth: 0 }}>
              <span style={{ width: '100%', maxWidth: 58, height: 48, borderRadius: 9, background: isDark ? '#241f3a' : '#E8ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {action.icon}
              </span>
              <span style={{ fontSize: 10, lineHeight: 1.2, color: grayColor, fontWeight: 600, textAlign: 'center' }}>{action.label}</span>
            </Link>
          ))}
        </nav>

        <section id="riwayat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 11 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: textColor }}>
              {isEn ? 'Transactions' : 'Transaksi'}
            </h2>
            {pembayaran.items.length > 4 && (
              <button type="button" onClick={() => setShowAllTransactions((current) => !current)} style={{ border: 0, padding: 4, background: 'transparent', color: '#3157A4', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {showAllTransactions ? (isEn ? 'Show less' : 'Lebih sedikit') : (isEn ? 'See all' : 'Lihat semua')}
              </button>
            )}
          </div>

          {error ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', background: cardBg, borderRadius: 10, border: cardBorder }}>
              <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 12, margin: 0 }}>{error}</p>
              <button type="button" onClick={fetchData} style={{ marginTop: 10, padding: '8px 16px', borderRadius: 8, background: '#39008A', color: '#fff', border: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {isEn ? 'Try again' : 'Coba lagi'}
              </button>
            </div>
          ) : pembayaran.items.length === 0 ? (
            <div style={{ background: cardBg, borderRadius: 10, padding: '28px 16px', textAlign: 'center', border: `1px dashed ${borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><IcCheckCircle color={greenColor} /></div>
              <p style={{ fontWeight: 800, color: inkColor, fontSize: 12, margin: '0 0 4px' }}>{isEn ? 'All paid!' : 'Semua lunas!'}</p>
              <p style={{ color: grayColor, fontSize: 10, margin: 0 }}>{isEn ? 'No pending bills' : 'Tidak ada tagihan tertunda'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(showAllTransactions ? pembayaran.items : pembayaran.items.slice(0, 4)).map((item) => {
                const isLunas = item.status === 'lunas'
                const statusColor = isLunas ? greenColor : amberColor
                const iconColor = isLunas ? greenColor : amberColor
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, padding: '9px 10px', borderRadius: 9, background: isDark ? '#241f3a' : '#E8ECF5' }}>
                    <span style={{ width: 35, height: 35, flexShrink: 0, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#1e1b2e' : '#F8FAFD' }}>
                      {isLunas ? <IcCheckCircle color={iconColor} /> : <IcDocument color={iconColor} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, color: inkColor, fontSize: 11, lineHeight: 1.35, fontWeight: 800 }}>{item.judul}</p>
                      <p style={{ margin: '3px 0 0', color: grayColor, fontSize: 9, lineHeight: 1.3 }}>{isLunas ? (isEn ? 'Payment complete' : 'Pembayaran selesai') : (isEn ? 'Education bill' : 'Tagihan pendidikan')}</p>
                    </div>
                    <div style={{ flexShrink: 0, maxWidth: '40%', textAlign: 'right' }}>
                      <p style={{ margin: 0, color: inkColor, fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>{formatRupiah(item.jumlah)}</p>
                      <p style={{ margin: '3px 0 0', color: statusColor, fontSize: 9, fontWeight: 700 }}>{getStatusLabel(item.status)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}