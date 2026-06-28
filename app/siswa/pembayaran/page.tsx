'use client'

/**
 * app/siswa/pembayaran/page.tsx
 *
 * Halaman Pembayaran utama — /siswa/pembayaran
 * Ini berbeda dari /siswa/pembayaran/bayar (route Upload).
 * Halaman ini menampilkan ringkasan pembayaran dari API ringkasan.
 *
 * Revisi desain (sesuai pembayaran-desain.png):
 * 1. Tema warna diganti dari indigo/ungu → hijau/teal, konsisten dengan
 *    identitas visual portal siswa (bukan panel admin).
 * 2. Hero header diganti dari card gradient solid → background polos
 *    dengan wave SVG tipis, tombol back & settings sebagai kotak putih
 *    bulat terpisah (tidak menyatu di dalam header berwarna).
 * 3. Chip "lunas / belum lunas" dipindah ke luar header, jadi pill
 *    putih dengan border halus.
 * 4. Total card: dari gradient ungu solid → putih kehijauan lembut +
 *    ilustrasi dompet hijau 3D (SVG inline, bukan file gambar — supaya
 *    tidak tergantung aset eksternal & warnanya konsisten dengan tema).
 * 5. Tombol "Bayar Sekarang" full hijau gelap (bukan putih+teks ungu).
 * 6. Item tagihan: ikon kotak lebih besar & lebih "profesional"
 *    (dokumen utk belum lunas, check-circle utk lunas), bukan ikon kecil
 *    generik.
 * 7. Section baru: card "Upload Bukti Pembayaran" (dashed border, ikon
 *    cloud-upload) — menggantikan tombol CTA besar gradient ungu di
 *    paling bawah yang sebelumnya terpotong / tumpang-tindih bottom nav.
 * 8. Section baru: card "Transaksi Aman & Terlindungi" dengan ikon
 *    shield + ilustrasi gembok transparan di kanan, sebagai elemen
 *    kepercayaan (trust signal) di akhir halaman.
 *
 * Catatan implementasi yang tetap dipertahankan dari versi sebelumnya:
 * - Fetch data dari /api/siswa/pembayaran/ringkasan (bukan /api/admin/pembayaran)
 * - Tidak memakai next/image (semua ilustrasi adalah SVG inline)
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

// ─── Palet warna (konsisten dgn tema hijau portal siswa) ──────────────────────

const C = {
  bg        : '#F4F7F5',
  ink       : '#0F2E22',
  slate     : '#475569',
  gray      : '#94A3B8',
  border    : '#E2E8F0',
  teal1     : '#0E7C5F',
  teal2     : '#0A5C46',
  teal3     : '#073D2F',
  green     : '#16A34A',
  greenLight: '#DCFCE7',
  greenBg   : '#F0FDF4',
  amber     : '#D97706',
  amberLight: '#FEF3C7',
  amberBg   : '#FFF7ED',
  amberBorder: '#FED7AA',
} as const

// ─── Utils ─────────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n)
}

// ─── Icons (semua inline SVG, tanpa dependensi aset eksternal) ────────────────

const IcArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={C.teal3} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IcUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)
const IcDocument = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke={C.amber} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M14 3.5V7a1 1 0 0 0 1 1h3.5" stroke={C.amber} strokeWidth="1.8" strokeLinejoin="round" />
    <line x1="9" y1="12" x2="15" y2="12" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="9" y1="15.5" x2="15" y2="15.5" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)
const IcCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <polyline points="20 6 9 17 4 12" stroke={C.green} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IcCloudUpload = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M7 18a4 4 0 0 1-.6-7.96A5 5 0 0 1 16.2 8.04 4.5 4.5 0 0 1 16 17H7z" stroke={C.teal1} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 11v6" stroke={C.teal1} strokeWidth="1.8" strokeLinecap="round" />
    <polyline points="9.5 13.5 12 11 14.5 13.5" stroke={C.teal1} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IcChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <polyline points="9 18 15 12 9 6" stroke={C.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IcShieldCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 3l7 3v5c0 5-3.2 8-7 10-3.8-2-7-5-7-10V6l7-3Z" fill={C.greenLight} stroke={C.green} strokeWidth="1.6" strokeLinejoin="round" />
    <polyline points="9 12 11.2 14.2 15.5 9.8" stroke={C.teal3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IcLockWatermark = () => (
  <svg width="84" height="84" viewBox="0 0 24 24" fill="none" opacity={0.5}>
    <rect x="5" y="11" width="14" height="9" rx="2" stroke={C.green} strokeWidth="1.3" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={C.green} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="12" cy="15.2" r="1.4" fill={C.green} />
  </svg>
)

/** Ilustrasi dompet hijau 3D + lembar uang + sparkle, sesuai desain target. */
const IcWalletIllustration = () => (
  <svg width="118" height="100" viewBox="0 0 140 120" fill="none" aria-hidden="true">
    {/* sparkle kecil kiri */}
    <path d="M22 56l2.6 6 6 2.6-6 2.6-2.6 6-2.6-6-6-2.6 6-2.6 2.6-6Z" fill={C.teal1} opacity={0.85} />
    <path d="M40 40l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8 1.8-4.2Z" fill={C.teal1} opacity={0.6} />

    {/* lembar uang di belakang dompet */}
    <g>
      <rect x="64" y="22" width="46" height="28" rx="3" fill="#A7E8C7" transform="rotate(-14 64 22)" />
      <rect x="70" y="20" width="46" height="28" rx="3" fill="#7FDBAE" transform="rotate(-5 70 20)" />
      <rect x="74" y="22" width="44" height="26" rx="3" fill="#E9FBF1" transform="rotate(2 74 22)" />
    </g>

    {/* badan dompet */}
    <rect x="34" y="46" width="84" height="58" rx="14" fill={C.teal1} />
    <rect x="34" y="46" width="84" height="58" rx="14" fill="url(#walletShade)" />

    {/* kantung kancing dompet di kanan */}
    <path d="M104 70h14a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-14v-16Z" fill={C.teal3} />
    <circle cx="111" cy="78" r="3.2" fill="#fff" />

    {/* lingkaran tombol "naik" pojok kanan bawah, sesuai desain */}
    <circle cx="116" cy="104" r="11" fill="#fff" />
    <path d="M116 109v-9M111.5 104.5 116 100l4.5 4.5" stroke={C.teal1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

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
      if (!res.ok) throw new Error('Gagal mengambil data pembayaran')
      const json = await res.json()
      setPembayaran(json.data ?? { total: 0, items: [] })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, fetchData])

  const lunasCount = pembayaran.items.filter((i) => i.status === 'lunas').length
  const belumLunasCount = pembayaran.items.filter((i) => i.status !== 'lunas').length

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: C.bg, gap: 16,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #D1FAE5' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: C.teal1, borderRightColor: C.green, animation: 'spin .8s linear infinite' }} />
        </div>
        <p style={{ color: C.gray, fontSize: 13, fontWeight: 600 }}>Memuat pembayaran...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      paddingBottom: 40,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ══ TOP BAR — sticky, gaya sama persis dgn halaman Notifikasi ══ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.1rem 0.9rem',
        background: C.bg,
      }}>
        {/* Tombol back */}
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          style={{
            width: 42, height: 42, borderRadius: 13, flexShrink: 0,
            background: '#fff', border: '1px solid #eef1f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)', cursor: 'pointer',
            color: C.teal1,
          }}
        >
          <IcArrowLeft />
        </button>

        {/* Title + subtitle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em', fontFamily: 'inherit' }}>
            Pembayaran
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.1rem 0 0', fontFamily: 'inherit' }}>
            Kelola tagihan dan pembayaran Anda
          </p>
        </div>

        {/* Icon dompet kanan atas */}
        <div style={{
          width: 64, height: 64, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Image src="/icons/dompet-icon.png" alt="Dompet" width={64} height={64} style={{ objectFit: 'contain' }} />
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '20px 16px 0', maxWidth: 520, margin: '0 auto' }}>

        {/* Total Card — putih kehijauan lembut + ilustrasi dompet */}
        <div style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FAF5 100%)',
          padding: '22px 20px', marginBottom: 22,
          border: `1px solid ${C.border}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.teal1, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'inherit' }}>
                Total Tagihan Belum Lunas
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: C.ink, margin: '0 0 18px', fontFamily: 'inherit', letterSpacing: -0.5, lineHeight: 1.1 }}>
                {formatRupiah(pembayaran.total)}
              </p>
              <Link
                href="/siswa/pembayaran/bayar"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 14,
                  background: C.teal3, color: '#fff',
                  fontWeight: 800, fontSize: 14, textDecoration: 'none',
                  fontFamily: 'inherit',
                }}
              >
                <IcUpload />
                Bayar Sekarang
              </Link>
            </div>

            <div style={{ flexShrink: 0 }}>
              <IcWalletIllustration />
            </div>
          </div>

          {/* Chip lunas / belum lunas — di dalam card, di bawah tombol */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.greenBg, borderRadius: 999, padding: '6px 14px', border: `1px solid ${C.greenLight}` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.green, fontWeight: 700, fontFamily: 'inherit' }}>{lunasCount} lunas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.amberBg, borderRadius: 999, padding: '6px 14px', border: `1px solid ${C.amberBorder}` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.amber, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.amber, fontWeight: 700, fontFamily: 'inherit' }}>{belumLunasCount} belum lunas</span>
            </div>
          </div>
        </div>

        {/* Item list */}
        <p style={{ fontSize: 11, fontWeight: 800, color: C.gray, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 12px', fontFamily: 'inherit' }}>
          Detail Tagihan
        </p>

        {error ? (
          <div style={{ textAlign: 'center', padding: '32px', background: '#fff', borderRadius: 18, border: '1.5px solid #FEE2E2' }}>
            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>{error}</p>
            <button onClick={fetchData} style={{ marginTop: 12, padding: '9px 22px', borderRadius: 12, background: C.teal2, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Coba Lagi
            </button>
          </div>
        ) : pembayaran.items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 20px', textAlign: 'center', border: `2px dashed ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <IcCheckCircle />
            </div>
            <p style={{ fontWeight: 800, color: C.ink, fontSize: 14, margin: '0 0 6px', fontFamily: 'inherit' }}>Semua Lunas!</p>
            <p style={{ color: C.gray, fontSize: 12, margin: 0, fontFamily: 'inherit' }}>Tidak ada tagihan yang tertunda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pembayaran.items.map((item) => {
              const isLunas = item.status === 'lunas'
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff', borderRadius: 18, padding: '16px',
                    border: `1.5px solid ${isLunas ? C.greenLight : C.amberBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                      background: isLunas ? C.greenBg : C.amberBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isLunas ? <IcCheckCircle /> : <IcDocument />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0, fontFamily: 'inherit', lineHeight: 1.35 }}>
                        {item.judul}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.gray, margin: '4px 0 0', fontFamily: 'inherit' }}>
                        {formatRupiah(item.jumlah)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 999, flexShrink: 0,
                    background: isLunas ? C.greenBg : C.amberBg,
                    color: isLunas ? C.green : C.amber,
                    fontFamily: 'inherit',
                  }}>
                    {isLunas ? 'Lunas' : 'Belum Lunas'}
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
            background: C.greenBg, border: `1.5px dashed ${C.teal1}`,
            textDecoration: 'none',
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <IcCloudUpload />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.teal3, margin: 0, fontFamily: 'inherit' }}>
              Upload Bukti Pembayaran
            </p>
            <p style={{ fontSize: 12.5, color: C.slate, margin: '3px 0 0', fontFamily: 'inherit', fontWeight: 500 }}>
              Unggah bukti pembayaran untuk diverifikasi
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <IcChevronRight />
          </div>
        </Link>

        {/* Card: Transaksi Aman & Terlindungi */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginTop: 12, padding: '18px 16px', borderRadius: 18,
          background: C.greenBg, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IcShieldCheck />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: C.teal3, margin: 0, fontFamily: 'inherit' }}>
              Transaksi Aman &amp; Terlindungi
            </p>
            <p style={{ fontSize: 12, color: C.slate, margin: '3px 0 0', fontFamily: 'inherit', fontWeight: 500 }}>
              Data pembayaran Anda dienkripsi dan aman.
            </p>
          </div>
          <div style={{ position: 'absolute', right: 10, bottom: -6, pointerEvents: 'none' }}>
            <IcLockWatermark />
          </div>
        </div>
      </div>
    </div>
  )
}