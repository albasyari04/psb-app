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

const IcArrowLeft = ({ color = '#073D2F' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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

const IcCloudUpload = ({ color = '#0E7C5F' }: { color?: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M7 18a4 4 0 0 1-.6-7.96A5 5 0 0 1 16.2 8.04 4.5 4.5 0 0 1 16 17H7z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 11v6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <polyline points="9.5 13.5 12 11 14.5 13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IcChevronRight = ({ color = '#94A3B8' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IcShieldCheck = ({ color = '#16A34A', bgColor = '#DCFCE7' }: { color?: string; bgColor?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 3l7 3v5c0 5-3.2 8-7 10-3.8-2-7-5-7-10V6l7-3Z" fill={bgColor} stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <polyline points="9 12 11.2 14.2 15.5 9.8" stroke="#073D2F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IcLockWatermark = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="84" height="84" viewBox="0 0 24 24" fill="none" opacity={0.5}>
    <rect x="5" y="11" width="14" height="9" rx="2" stroke={color} strokeWidth="1.3" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="12" cy="15.2" r="1.4" fill={color} />
  </svg>
)

const IcWalletIllustration = ({ color = '#0E7C5F', colorDark = '#0A5C46', colorLight = '#A7E8C7' }: { color?: string; colorDark?: string; colorLight?: string }) => (
  <svg width="118" height="100" viewBox="0 0 140 120" fill="none" aria-hidden="true">
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
  const { status } = useSession()
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

  const [pembayaran, setPembayaran] = useState<PembayaranData>({ total: 0, items: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // ─── Dark mode colors ──────────────────────────────────────────────────────
  const bgColor = isDark ? '#15131f' : '#F4F7F5'
  const cardBg = isDark ? '#1e1b2e' : '#FFFFFF'
  const cardBorder = isDark ? '1px solid #2e2a40' : '1px solid #E2E8F0'
  const textColor = isDark ? '#f1f0f5' : '#0F2E22'
  const mutedColor = isDark ? '#94a3b8' : '#94A3B8'
  const borderColor = isDark ? '#2e2a40' : '#E2E8F0'
  const tealColor = isDark ? '#34d399' : '#0E7C5F'
  const tealDark = isDark ? '#065f46' : '#0A5C46'
  const tealDarker = isDark ? '#047857' : '#073D2F'
  const greenColor = isDark ? '#34d399' : '#16A34A'
  const greenBg = isDark ? '#1a2e1a' : '#F0FDF4'
  const greenLight = isDark ? '#1a4a2e' : '#DCFCE7'
  const amberColor = isDark ? '#fbbf24' : '#D97706'
  const amberBg = isDark ? '#2e2a1a' : '#FFF7ED'
  const amberBorder = isDark ? '#4a3a1a' : '#FED7AA'
  const inkColor = isDark ? '#f1f0f5' : '#0F2E22'
  const grayColor = isDark ? '#6b6885' : '#94A3B8'
  const slateColor = isDark ? '#94a3b8' : '#475569'
  const headerBg = isDark ? '#15131f' : '#F4F7F5'
  const headerBorder = isDark ? '1px solid #2e2a40' : '1px solid #E2E8F0'
  const backBtnBg = isDark ? '#1e1b2e' : '#fff'
  const backBtnBorder = isDark ? '1px solid #2e2a40' : '1px solid #eef1f5'
  const backBtnColor = isDark ? '#a5b4fc' : '#073D2F'

  // ─── i18n labels ──────────────────────────────────────────────────────────
  const getStatusLabel = (status: string) => {
    if (status === 'lunas') return isEn ? 'Paid' : 'Lunas'
    return isEn ? 'Unpaid' : 'Belum Lunas'
  }

  if (status === 'loading' || loading) {
    const spinnerColor = isDark ? '#2e2a40' : '#D1FAE5'
    const spinnerTopColor = isDark ? '#a5b4fc' : '#0E7C5F'
    const textColor2 = isDark ? '#6b6885' : '#94A3B8'
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: bgColor, gap: 16,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${spinnerColor}` }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: spinnerTopColor, borderRightColor: greenColor, animation: 'spin .8s linear infinite' }} />
        </div>
        <p style={{ color: textColor2, fontSize: 13, fontWeight: 600 }}>
          {isEn ? 'Loading payments...' : 'Memuat pembayaran...'}
        </p>
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
          onClick={() => router.back()}
          aria-label={isEn ? 'Back' : 'Kembali'}
          style={{
            width: 42, height: 42, borderRadius: 13, flexShrink: 0,
            background: backBtnBg, border: backBtnBorder,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(15,23,42,0.04)',
            cursor: 'pointer', color: backBtnColor,
          }}
        >
          <IcArrowLeft color={backBtnColor} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: textColor, margin: 0, letterSpacing: '-0.01em', fontFamily: 'inherit' }}>
            {isEn ? 'Payment' : 'Pembayaran'}
          </h1>
          <p style={{ fontSize: '0.78rem', color: mutedColor, margin: '0.1rem 0 0', fontFamily: 'inherit' }}>
            {isEn ? 'Manage your payments' : 'Kelola pembayaran Anda'}
          </p>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '20px 16px 0', maxWidth: 520, margin: '0 auto' }}>

        {/* Total Card */}
        <div style={{
          borderRadius: 24,
          background: isDark ? 'linear-gradient(135deg, #1e1b2e 0%, #1a2e1a 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F0FAF5 100%)',
          padding: '22px 20px', marginBottom: 22,
          border: cardBorder,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: tealColor, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'inherit' }}>
                {isEn ? 'Total Unpaid Bills' : 'Total Tagihan Belum Lunas'}
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: inkColor, margin: '0 0 18px', fontFamily: 'inherit', letterSpacing: -0.5, lineHeight: 1.1 }}>
                {formatRupiah(pembayaran.total)}
              </p>
              <Link
                href="/siswa/pembayaran/bayar"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 14,
                  background: tealDarker, color: '#fff',
                  fontWeight: 800, fontSize: 14, textDecoration: 'none',
                  fontFamily: 'inherit',
                }}
              >
                <IcUpload />
                {isEn ? 'Pay Now' : 'Bayar Sekarang'}
              </Link>
            </div>

            <div style={{ flexShrink: 0 }}>
              <IcWalletIllustration 
                color={isDark ? '#34d399' : '#0E7C5F'}
                colorDark={isDark ? '#065f46' : '#0A5C46'}
                colorLight={isDark ? '#1a4a2e' : '#A7E8C7'}
              />
            </div>
          </div>

          {/* Chip status */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: greenBg, borderRadius: 999, padding: '6px 14px', border: `1px solid ${greenLight}` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: greenColor, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: greenColor, fontWeight: 700, fontFamily: 'inherit' }}>
                {lunasCount} {isEn ? 'paid' : 'lunas'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: amberBg, borderRadius: 999, padding: '6px 14px', border: `1px solid ${amberBorder}` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: amberColor, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: amberColor, fontWeight: 700, fontFamily: 'inherit' }}>
                {belumLunasCount} {isEn ? 'unpaid' : 'belum lunas'}
              </span>
            </div>
          </div>
        </div>

        {/* Item list */}
        <p style={{ fontSize: 11, fontWeight: 800, color: grayColor, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 12px', fontFamily: 'inherit' }}>
          {isEn ? 'Bill Details' : 'Detail Tagihan'}
        </p>

        {error ? (
          <div style={{ textAlign: 'center', padding: '32px', background: cardBg, borderRadius: 18, border: '1.5px solid #FEE2E2' }}>
            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>{error}</p>
            <button onClick={fetchData} style={{ marginTop: 12, padding: '9px 22px', borderRadius: 12, background: tealDark, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isEn ? 'Try Again' : 'Coba Lagi'}
            </button>
          </div>
        ) : pembayaran.items.length === 0 ? (
          <div style={{ background: cardBg, borderRadius: 20, padding: '40px 20px', textAlign: 'center', border: `2px dashed ${borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <IcCheckCircle color={greenColor} />
            </div>
            <p style={{ fontWeight: 800, color: inkColor, fontSize: 14, margin: '0 0 6px', fontFamily: 'inherit' }}>
              {isEn ? 'All Paid!' : 'Semua Lunas!'}
            </p>
            <p style={{ color: grayColor, fontSize: 12, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'No pending bills' : 'Tidak ada tagihan yang tertunda'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pembayaran.items.map((item) => {
              const isLunas = item.status === 'lunas'
              const statusColor = isLunas ? greenColor : amberColor
              const statusBg = isLunas ? greenBg : amberBg
              const statusBorder = isLunas ? greenLight : amberBorder
              const iconColor = isLunas ? greenColor : amberColor
              return (
                <div
                  key={item.id}
                  style={{
                    background: cardBg, borderRadius: 18, padding: '16px',
                    border: `1.5px solid ${statusBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                      background: statusBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isLunas ? <IcCheckCircle color={iconColor} /> : <IcDocument color={iconColor} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: inkColor, margin: 0, fontFamily: 'inherit', lineHeight: 1.35 }}>
                        {item.judul}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: grayColor, margin: '4px 0 0', fontFamily: 'inherit' }}>
                        {formatRupiah(item.jumlah)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 999, flexShrink: 0,
                    background: statusBg,
                    color: statusColor,
                    fontFamily: 'inherit',
                  }}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Card: Upload Bukti Pembayaran */}
        <Link
          href="/siswa/pembayaran/bayar"
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            marginTop: 16, padding: '18px 16px', borderRadius: 18,
            background: isDark ? '#1e1b2e' : '#F0FDF4',
            border: `1.5px dashed ${tealColor}`,
            textDecoration: 'none',
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <IcCloudUpload color={tealColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: tealDarker, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'Upload Payment Proof' : 'Upload Bukti Pembayaran'}
            </p>
            <p style={{ fontSize: 12.5, color: slateColor, margin: '3px 0 0', fontFamily: 'inherit', fontWeight: 500 }}>
              {isEn ? 'Upload payment proof for verification' : 'Unggah bukti pembayaran untuk diverifikasi'}
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <IcChevronRight color={isDark ? '#6b6885' : '#94A3B8'} />
          </div>
        </Link>

        {/* Card: Transaksi Aman & Terlindungi */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginTop: 12, padding: '18px 16px', borderRadius: 18,
          background: isDark ? '#1e1b2e' : '#F0FDF4',
          position: 'relative', overflow: 'hidden',
          border: isDark ? '1px solid #2e2a40' : 'none',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: isDark ? '#15131f' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IcShieldCheck 
              color={greenColor}
              bgColor={isDark ? '#1a2e1a' : '#DCFCE7'}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: tealDarker, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'Secure & Protected Transaction' : 'Transaksi Aman & Terlindungi'}
            </p>
            <p style={{ fontSize: 12, color: slateColor, margin: '3px 0 0', fontFamily: 'inherit', fontWeight: 500 }}>
              {isEn ? 'Your payment data is encrypted and secure.' : 'Data pembayaran Anda dienkripsi dan aman.'}
            </p>
          </div>
          <div style={{ position: 'absolute', right: 10, bottom: -6, pointerEvents: 'none' }}>
            <IcLockWatermark color={greenColor} />
          </div>
        </div>
      </div>
    </div>
  )
}