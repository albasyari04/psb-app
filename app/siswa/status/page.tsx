// app/siswa/status/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'

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

// ── Timeline steps with i18n ──────────────────────────────────────────────────
const TIMELINE = [
  {
    key:   'menunggu',
    label: { id: 'Pendaftaran Dikirim', en: 'Registration Sent' },
    icon:  '📤',
    desc:  { id: 'Formulir berhasil diterima oleh sistem', en: 'Form successfully received by system' },
  },
  {
    key:   'diproses',
    label: { id: 'Verifikasi Berkas', en: 'Document Verification' },
    icon:  '🔍',
    desc:  { id: 'Panitia sedang memeriksa kelengkapan berkas', en: 'Committee is checking document completeness' },
  },
  {
    key:   'diterima',
    label: { id: 'Pengumuman Hasil', en: 'Result Announcement' },
    icon:  '🎉',
    desc:  { id: 'Keputusan akhir penerimaan telah ditetapkan', en: 'Final admission decision has been made' },
  },
]
const STATUS_ORDER = ['menunggu', 'diproses', 'diterima']

const STATUS_META: Record<Pendaftaran['status'], { icon: string; tag: { id: string; en: string }; name: { id: string; en: string } }> = {
  menunggu: { icon: '⏳', tag: { id: 'Menunggu Review', en: 'Pending Review' }, name: { id: 'Menunggu', en: 'Pending' } },
  diproses: { icon: '🔍', tag: { id: 'Sedang Diproses', en: 'Processing' }, name: { id: 'Diproses', en: 'Processing' } },
  diterima: { icon: '🎉', tag: { id: 'Diterima!', en: 'Accepted!' }, name: { id: 'Diterima', en: 'Accepted' } },
  ditolak:  { icon: '❌', tag: { id: 'Tidak Diterima', en: 'Not Accepted' }, name: { id: 'Ditolak', en: 'Rejected' } },
}

// Tema warna per status dengan dukungan dark mode
const STATUS_COLORS = {
  menunggu: { 
    pillBg: '#FEF3C7', pillBgDark: '#2e2a1a', 
    text: '#B45309', textDark: '#fbbf24', 
    dot: '#F59E0B', dotDark: '#fbbf24' 
  },
  diproses: { 
    pillBg: '#DBEAFE', pillBgDark: '#1a2a3d', 
    text: '#1D4ED8', textDark: '#60a5fa', 
    dot: '#3B82F6', dotDark: '#60a5fa' 
  },
  diterima: { 
    pillBg: '#DCFCE7', pillBgDark: '#1a2e1a', 
    text: '#15803D', textDark: '#34d399', 
    dot: '#22C55E', dotDark: '#34d399' 
  },
  ditolak: { 
    pillBg: '#FEE2E2', pillBgDark: '#2e1a1a', 
    text: '#DC2626', textDark: '#fca5a5', 
    dot: '#EF4444', dotDark: '#fca5a5' 
  },
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconBack = ({ color = '#7C3AED' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (sessionStatus === 'authenticated' && session?.user?.id) {
      fetch(`/api/siswa/pendaftaran/status`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch')
          return res.json()
        })
        .then(data => {
          setPendaftaran(data.data)
          setError(null)
        })
        .catch(() => {
          setError(isEn ? 'Failed to load registration data' : 'Gagal memuat data pendaftaran')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [sessionStatus, session, router, isEn])

  // ─── Helper: get localized text ─────────────────────────────────────────────
  const getText = (obj: { id: string; en: string }) => isEn ? obj.en : obj.id

  // ─── Dark mode colors ──────────────────────────────────────────────────────
  const bgColor = isDark ? '#15131f' : '#F5F3FF'
  const cardBg = isDark ? '#1e1b2e' : '#fff'
  const cardBorder = isDark ? '1px solid #2e2a40' : 'none'
  const textColor = isDark ? '#f1f0f5' : '#1F2937'
  const mutedColor = isDark ? '#94a3b8' : '#9CA3AF'
  const subColor = isDark ? '#94a3b8' : '#64748B'
  const topBarBg = isDark ? '#1e1b2e' : '#fff'
  const topBarBorder = isDark ? '1px solid #2e2a40' : '0 2px 10px rgba(0,0,0,0.04)'
  const backBtnBg = isDark ? '#2e2a40' : '#EDE9FE'
  const backBtnColor = isDark ? '#a5b4fc' : '#7C3AED'
  const dividerColor = isDark ? '#2e2a40' : '#F1F5F9'
  const acceptedBg = isDark ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' : 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  const acceptedShadow = isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(5,150,105,0.3)'
  const editBtnBg = isDark ? '#1e1b2e' : '#fff'
  const editBtnBorder = isDark ? '1.5px solid #2e2a40' : '1.5px solid #DDD6FE'
  const editBtnColor = isDark ? '#a5b4fc' : '#5B21B6'

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (sessionStatus === 'loading' || loading) {
    const spinnerColor = isDark ? '#2e2a40' : '#E2E8F0'
    const spinnerTopColor = isDark ? '#a5b4fc' : '#7C3AED'
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgColor,
        gap: 16,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: `4px solid ${spinnerColor}`,
          borderTopColor: spinnerTopColor,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: mutedColor, fontSize: 13, fontWeight: 500 }}>
          {isEn ? 'Loading registration data...' : 'Memuat data pendaftaran...'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const p = pendaftaran
  const currentIdx = p ? STATUS_ORDER.indexOf(p.status) : -1
  const isDitolak = p?.status === 'ditolak'
  const isDiterima = p?.status === 'diterima'
  const meta = p ? STATUS_META[p.status] : null
  const sc = p ? STATUS_COLORS[p.status] : null

  const tanggalDaftar = p
    ? new Date(p.created_at).toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const nilaiStr = p && Number.isFinite(Number(p.nilai_rata_rata))
    ? `${Number(p.nilai_rata_rata).toFixed(2)} / 100`
    : '-'

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: bgColor,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ══════ TOP APP BAR ══════ */}
      <div style={{
        flexShrink: 0,
        background: topBarBg,
        boxShadow: topBarBorder,
        borderBottom: isDark ? '1px solid #2e2a40' : 'none',
        zIndex: 30,
        position: 'sticky',
        top: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '18px 20px 18px',
        }}>
          <Link
            href="/siswa/dashboard"
            aria-label={isEn ? 'Back' : 'Kembali'}
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: backBtnBg, color: backBtnColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, textDecoration: 'none',
            }}
          >
            <IconBack color={backBtnColor} />
          </Link>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontSize: 20, fontWeight: 800, color: textColor,
              margin: '0 0 3px', letterSpacing: -0.3, lineHeight: 1.2,
            }}>
              {isEn ? 'Registration Status' : 'Status Pendaftaran'}
            </h1>
            <p style={{ fontSize: 12, color: mutedColor, margin: 0, fontWeight: 500 }}>
              {isEn ? 'Track your selection progress' : 'Pantau progres seleksi kamu'}
            </p>
          </div>
        </div>
      </div>

      {/* ══════ AREA SCROLL ══════ */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '16px 16px 40px',
      }}>

        {/* ── Empty state ── */}
        {!p && (
          <div style={{
            background: cardBg,
            borderRadius: 20,
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
            border: cardBorder,
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 800, color: textColor, margin: '0 0 8px' }}>
              {isEn ? 'No Registration Yet' : 'Belum Ada Pendaftaran'}
            </p>
            <p style={{ fontSize: 13, color: subColor, margin: '0 0 20px', lineHeight: 1.5 }}>
              {isEn 
                ? 'You haven\'t filled out the registration form yet. Register before the deadline.'
                : 'Kamu belum mengisi formulir pendaftaran. Segera daftarkan diri sebelum batas waktu.'}
            </p>
            <Link href="/siswa/pendaftaran" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#5B21B6', color: '#fff',
              padding: '12px 24px', borderRadius: 14,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              <span>📝</span>
              <span>{isEn ? 'Fill Form Now' : 'Isi Formulir Sekarang'}</span>
            </Link>
          </div>
        )}

        {p && (
          <>
            {/* ── No. Registrasi ── */}
            <div style={{
              background: cardBg,
              borderRadius: 18,
              padding: '16px 18px',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
              border: cardBorder,
              marginBottom: 12,
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: mutedColor,
                letterSpacing: 0.6, textTransform: 'uppercase',
                margin: '0 0 6px',
              }}>
                {isEn ? 'Registration No.' : 'No. Registrasi'}
              </p>
              <p style={{
                fontSize: 24, fontWeight: 800, color: textColor,
                letterSpacing: 0.5, margin: '0 0 4px',
              }}>
                {p.id.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>
                {isEn ? 'Registered' : 'Didaftarkan'}: {tanggalDaftar}
              </p>
            </div>

            {/* ── Status badge pill ── */}
            {meta && sc && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: isDark ? sc.pillBgDark : sc.pillBg,
                borderRadius: 16, padding: '12px 16px',
                marginBottom: 12,
                border: isDark ? '1px solid #2e2a40' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {meta.icon}
                  </div>
                  <div>
                    <p style={{
                      fontSize: 10, fontWeight: 700,
                      color: isDark ? sc.textDark : sc.text,
                      letterSpacing: 0.6, textTransform: 'uppercase',
                      margin: '0 0 2px',
                    }}>
                      {getText(meta.tag)}
                    </p>
                    <p style={{
                      fontSize: 15, fontWeight: 800,
                      color: isDark ? sc.textDark : sc.text,
                      margin: 0,
                    }}>
                      {getText(meta.name)}
                    </p>
                  </div>
                </div>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: isDark ? sc.dotDark : sc.dot,
                  flexShrink: 0,
                }} />
              </div>
            )}

            {/* ── Diterima Banner ── */}
            {isDiterima && (
              <div style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: 20, padding: '28px 20px', textAlign: 'center',
                background: acceptedBg,
                boxShadow: acceptedShadow,
                marginBottom: 12,
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎊</div>
                  <p style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                    {isEn ? 'Congratulations! You\'re Accepted' : 'Selamat! Anda Diterima'}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 16px' }}>
                    {isEn ? 'in Major' : 'di Jurusan'}{' '}
                    <span style={{ fontWeight: 700, color: '#fff' }}>{p.jurusan_pilihan || '-'}</span>
                  </p>
                  {p.catatan_admin && (
                    <p style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.85)',
                      background: 'rgba(255,255,255,0.12)', borderRadius: 12,
                      padding: '10px 14px', margin: '0 0 16px', lineHeight: 1.5,
                    }}>
                      {p.catatan_admin}
                    </p>
                  )}
                  <Link href="/siswa/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.18)', color: '#fff',
                    padding: '11px 22px', borderRadius: 12,
                    fontWeight: 700, fontSize: 13, textDecoration: 'none',
                  }}>
                    🏠 {isEn ? 'Back to Home' : 'Kembali ke Beranda'}
                  </Link>
                </div>
              </div>
            )}

            {/* ── Ditolak Card ── */}
            {isDitolak && (
              <div style={{
                background: cardBg,
                borderRadius: 18,
                padding: '18px',
                boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                border: cardBorder,
                marginBottom: 12,
                borderLeft: `3px solid ${isDark ? '#fca5a5' : '#EF4444'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: isDark ? '#2e1a1a' : '#FEE2E2',
                    color: isDark ? '#fca5a5' : '#DC2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    ❌
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: textColor, margin: '0 0 2px' }}>
                      {isEn ? 'Registration Not Accepted' : 'Pendaftaran Tidak Diterima'}
                    </p>
                    <p style={{ fontSize: 12, color: subColor, margin: 0 }}>
                      {isEn ? 'Sorry, your registration did not pass the selection' : 'Maaf, pendaftaran Anda tidak lolos seleksi'}
                    </p>
                  </div>
                </div>
                {p.catatan_admin && (
                  <div style={{
                    background: isDark ? '#2e1a1a' : '#FEF2F2',
                    borderRadius: 12, padding: '12px 14px',
                    border: isDark ? '1px solid #4a1a1a' : 'none',
                  }}>
                    <p style={{
                      fontSize: 11, fontWeight: 700,
                      color: isDark ? '#fca5a5' : '#DC2626',
                      margin: '0 0 4px',
                    }}>
                      📌 {isEn ? 'Committee Note' : 'Catatan Panitia'}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: isDark ? '#fca5a5' : '#7F1D1D',
                      margin: 0, lineHeight: 1.5,
                    }}>
                      {p.catatan_admin}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Timeline ── */}
            {!isDitolak && (
              <div style={{
                background: cardBg,
                borderRadius: 18,
                padding: '18px',
                boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                border: cardBorder,
                marginBottom: 12,
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: textColor, margin: '0 0 6px' }}>
                  📊 {isEn ? 'Selection Process Timeline' : 'Timeline Proses Seleksi'}
                </p>
                <div style={{ height: 1, background: dividerColor, margin: '0 0 16px' }} />

                <div>
                  {TIMELINE.map((step, i) => {
                    const isDone = i < currentIdx
                    const isActive = i === currentIdx
                    const isLast = i === TIMELINE.length - 1

                    const dotBg = isDone ? (isDark ? '#1a2e1a' : '#DCFCE7') : isActive ? (isDark ? '#1a2a3d' : '#DBEAFE') : (isDark ? '#2e2a40' : '#F1F5F9')
                    const dotText = isDone ? (isDark ? '#34d399' : '#16A34A') : isActive ? (isDark ? '#60a5fa' : '#2563EB') : (isDark ? '#6b6885' : '#94A3B8')
                    const dotBorder = isDone ? (isDark ? '#1a4a2e' : '#BBF7D0') : isActive ? (isDark ? '#2a3a5d' : '#BFDBFE') : (isDark ? '#2e2a40' : '#E2E8F0')
                    const labelColor = isDone ? (isDark ? '#34d399' : '#15803D') : isActive ? (isDark ? '#60a5fa' : '#1D4ED8') : (isDark ? '#6b6885' : '#94A3B8')
                    const descColor = isDone ? (isDark ? '#34d399' : '#4ADE80') : isActive ? (isDark ? '#60a5fa' : '#60A5FA') : (isDark ? '#6b6885' : '#94A3B8')
                    const lineColor = isDone ? (isDark ? '#34d399' : '#22C55E') : (isDark ? '#2e2a40' : '#E2E8F0')

                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: dotBg, color: dotText,
                            border: `2px solid ${dotBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 800,
                          }}>
                            {isDone ? '✓' : step.icon}
                          </div>
                          {!isLast && (
                            <div style={{ width: 2, flex: 1, minHeight: 32, background: lineColor, margin: '4px 0' }} />
                          )}
                        </div>

                        <div style={{ paddingBottom: isLast ? 0 : 20, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: labelColor, margin: '6px 0 3px' }}>
                            {getText(step.label)}
                          </p>
                          <p style={{ fontSize: 12, color: isDark ? descColor : '#64748B', margin: '0 0 8px', lineHeight: 1.4 }}>
                            {getText(step.desc)}
                          </p>
                          {isActive && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 700,
                              color: isDark ? '#60a5fa' : '#2563EB',
                              background: isDark ? '#1a2a3d' : '#DBEAFE',
                              borderRadius: 20, padding: '3px 10px',
                            }}>
                              ● {isEn ? 'In progress' : 'Sedang berlangsung'}
                            </span>
                          )}
                          {isDone && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 700,
                              color: isDark ? '#34d399' : '#16A34A',
                              background: isDark ? '#1a2e1a' : '#DCFCE7',
                              borderRadius: 20, padding: '3px 10px',
                            }}>
                              ✓ {isEn ? 'Completed' : 'Selesai'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Data Pendaftaran ── */}
            <div style={{
              background: cardBg,
              borderRadius: 18,
              padding: '18px',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
              border: cardBorder,
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: textColor, margin: '0 0 6px' }}>
                📋 {isEn ? 'Registration Data' : 'Data Pendaftaran'}
              </p>
              <div style={{ height: 1, background: dividerColor, margin: '0 0 8px' }} />
              <div>
                {([
                  [isEn ? 'Full Name' : 'Nama Lengkap', p.nama_lengkap],
                  [isEn ? 'Major Choice' : 'Jurusan Pilihan', p.jurusan_pilihan],
                  [isEn ? 'School Origin' : 'Asal Sekolah', p.asal_sekolah],
                  [isEn ? 'Average Score' : 'Nilai Rata-rata', nilaiStr],
                ] as [string, string][]).map(([k, v], idx, arr) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: idx < arr.length - 1 ? `1px solid ${dividerColor}` : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: subColor }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: textColor, textAlign: 'right' }}>
                      {v || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Edit button ── */}
            {p.status === 'menunggu' && (
              <Link href="/siswa/pendaftaran" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: editBtnBg,
                color: editBtnColor,
                border: editBtnBorder,
                padding: '13px', borderRadius: 14,
                fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}>
                <span>✏️</span>
                <span>{isEn ? 'Edit Registration Form' : 'Edit Formulir Pendaftaran'}</span>
              </Link>
            )}
          </>
        )}

      </main>
    </div>
  )
}