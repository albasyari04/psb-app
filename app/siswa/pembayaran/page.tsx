'use client'

/**
 * app/siswa/pembayaran/page.tsx
 *
 * Halaman Pembayaran utama — /siswa/pembayaran
 * Ini berbeda dari /siswa/pembayaran/bayar (route Upload).
 * Halaman ini menampilkan ringkasan pembayaran dari API ringkasan.
 *
 * Bug yang diperbaiki vs versi lama:
 * 1. Fetch data dari /api/siswa/pembayaran/ringkasan (bukan /api/admin/pembayaran)
 * 2. Image layout="fill" deprecated → pakai fill prop saja
 * 3. Tombol back di pojok kiri atas hero header dihapus karena tumpang
 *    tindih secara visual dengan icon dompet (IcWallet) pada title row
 *    di bawahnya. Navigasi balik ke beranda kini cukup lewat bottom nav.
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
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

// ─── Utils ─────────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n)
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IcWallet = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1.5"/>
  </svg>
)
const IcCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
        background: '#F4F6FA', gap: 16,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #E0E7FF' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366F1', borderRightColor: '#8B5CF6', animation: 'spin .8s linear infinite' }} />
        </div>
        <p style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>Memuat pembayaran...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F4F6FA',
      paddingBottom: 100,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6D28D9 100%)',
        padding: '28px 20px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', marginBottom: 18 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 16,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid rgba(255,255,255,0.25)',
          }}>
            <IcWallet />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: 0, fontFamily: 'inherit' }}>Pembayaran</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: 0, fontFamily: 'inherit' }}>Ringkasan tagihan santri</p>
          </div>
        </div>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.14)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontFamily: 'inherit' }}>{lunasCount} lunas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.14)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FBBF24', boxShadow: '0 0 6px #FBBF24' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontFamily: 'inherit' }}>{belumLunasCount} belum lunas</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '22px 16px', maxWidth: 520, margin: '0 auto' }}>

        {/* Total Card */}
        <div style={{
          borderRadius: 22,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          padding: '20px', marginBottom: 20,
          boxShadow: '0 12px 32px rgba(79,70,229,0.35)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: 'inherit' }}>
            Total Tagihan Belum Lunas
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 16px', fontFamily: 'inherit', letterSpacing: -0.5 }}>
            {formatRupiah(pembayaran.total)}
          </p>
          <Link
            href="/siswa/pembayaran/bayar"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 14,
              background: '#fff', color: '#4F46E5',
              fontWeight: 800, fontSize: 13, textDecoration: 'none',
              fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Bayar Sekarang
          </Link>
        </div>

        {/* Item list */}
        <p style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.3, margin: '0 0 12px', fontFamily: 'inherit' }}>
          Detail Tagihan
        </p>

        {error ? (
          <div style={{ textAlign: 'center', padding: '32px', background: '#fff', borderRadius: 18, border: '1.5px solid #FEE2E2' }}>
            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>⚠️ {error}</p>
            <button onClick={fetchData} style={{ marginTop: 12, padding: '9px 22px', borderRadius: 12, background: '#6366F1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Coba Lagi
            </button>
          </div>
        ) : pembayaran.items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '48px 20px', textAlign: 'center', border: '2px dashed #E2E8F0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <p style={{ fontWeight: 800, color: '#1E293B', fontSize: 14, margin: '0 0 6px', fontFamily: 'inherit' }}>Semua Lunas!</p>
            <p style={{ color: '#94A3B8', fontSize: 12, margin: 0, fontFamily: 'inherit' }}>Tidak ada tagihan yang tertunda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pembayaran.items.map((item) => {
              const isLunas = item.status === 'lunas'
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff', borderRadius: 18, padding: '14px 16px',
                    border: `1.5px solid ${isLunas ? '#BBF7D0' : '#FED7AA'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                      background: isLunas ? '#F0FDF4' : '#FFF7ED',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isLunas ? '#16A34A' : '#D97706',
                    }}>
                      {isLunas ? <IcCheck /> : <IcClock />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: 0, fontFamily: 'inherit', lineHeight: 1.3 }}>
                        {item.judul}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '3px 0 0', fontFamily: 'inherit' }}>
                        {formatRupiah(item.jumlah)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '5px 12px', borderRadius: 999, flexShrink: 0,
                    background: isLunas ? '#F0FDF4' : '#FFF7ED',
                    color: isLunas ? '#16A34A' : '#D97706',
                    border: `1px solid ${isLunas ? '#BBF7D0' : '#FED7AA'}`,
                    fontFamily: 'inherit',
                  }}>
                    {isLunas ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: 24 }}>
          <Link
            href="/siswa/pembayaran/bayar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '17px', borderRadius: 18, textDecoration: 'none',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: '#fff', fontWeight: 800, fontSize: 15,
              boxShadow: '0 10px 30px rgba(79,70,229,0.45)',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Upload Bukti Pembayaran
          </Link>
        </div>
      </div>
    </div>
  )
}