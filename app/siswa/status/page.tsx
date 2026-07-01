// app/siswa/status/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'  // ← pakai supabaseAdmin agar bypass RLS
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

// Tema warna per status
const STATUS_COLORS: Record<Pendaftaran['status'], { pillBg: string; text: string; dot: string }> = {
  menunggu: { pillBg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  diproses: { pillBg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  diterima: { pillBg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  ditolak:  { pillBg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function StatusPage() {
  const session = await getServerSession(authOptions)

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .eq('user_id', session!.user.id)
    .maybeSingle()

  if (error) {
    console.error('Status page query error:', error.message)
  }

  const p          = data as Pendaftaran | null
  const currentIdx = p ? STATUS_ORDER.indexOf(p.status) : -1
  const isDitolak  = p?.status === 'ditolak'
  const isDiterima = p?.status === 'diterima'
  const meta       = p ? STATUS_META[p.status] : null
  const sc         = p ? STATUS_COLORS[p.status] : null

  const tanggalDaftar = p
    ? new Date(p.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const nilaiStr = p && Number.isFinite(Number(p.nilai_rata_rata))
    ? `${Number(p.nilai_rata_rata).toFixed(2)} / 100`
    : '-'

  return (
    // ══════ APP SHELL — tinggi dikunci 100dvh + overflow hidden ══════
    // Top bar & bottom nav ada di flow normal (bukan fixed/sticky) di dalam
    // flex column, sehingga tidak mungkin ikut ter-scroll. Hanya <main>
    // di tengah yang bisa di-scroll.
    <div style={{
      height: '100dvh',
      backgroundColor: '#F5F3FF',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ══════ TOP APP BAR (STATIS — tidak ikut scroll, tanpa icon kanan) ══════ */}
      <div style={{
        flexShrink: 0,
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        zIndex: 30,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '18px 20px 18px',
        }}>
          <Link
            href="/siswa/dashboard"
            aria-label="Kembali"
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: '#EDE9FE', color: '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, textDecoration: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', margin: '0 0 3px', letterSpacing: -0.3, lineHeight: 1.2 }}>
              Status Pendaftaran
            </h1>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, fontWeight: 500 }}>
              Pantau progres seleksi kamu
            </p>
          </div>
        </div>
      </div>

      {/* ══════ AREA SCROLL — HANYA INI YANG BOLEH SCROLL ══════ */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '16px 16px 120px',
      }}>

        {/* ── Empty state ── */}
        {!p && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', margin: '0 0 8px' }}>
              Belum Ada Pendaftaran
            </p>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
              Kamu belum mengisi formulir pendaftaran. Segera daftarkan diri sebelum batas waktu.
            </p>
            <Link href="/siswa/pendaftaran" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#5B21B6', color: '#fff',
              padding: '12px 24px', borderRadius: 14,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              <span>📝</span>
              <span>Isi Formulir Sekarang</span>
            </Link>
          </div>
        )}

        {p && (
          <>
            {/* ── No. Registrasi ── */}
            <div style={{
              background: '#fff', borderRadius: 18, padding: '16px 18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 0 6px' }}>
                No. Registrasi
              </p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', letterSpacing: 0.5, margin: '0 0 4px' }}>
                {p.id.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                Didaftarkan: {tanggalDaftar}
              </p>
            </div>

            {/* ── Status badge pill ── */}
            {meta && sc && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: sc.pillBg, borderRadius: 16, padding: '12px 16px',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {meta.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: sc.text, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 0 2px' }}>
                      {meta.tag}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: sc.text, margin: 0 }}>
                      {meta.name}
                    </p>
                  </div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
              </div>
            )}

            {/* ── Diterima Banner ── */}
            {isDiterima && (
              <div style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: 20, padding: '28px 20px', textAlign: 'center',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
                marginBottom: 12,
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎊</div>
                  <p style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                    Selamat! Anda Diterima
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 16px' }}>
                    di Jurusan <span style={{ fontWeight: 700, color: '#fff' }}>{p.jurusan_pilihan || '-'}</span>
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
                    🏠 Kembali ke Beranda
                  </Link>
                </div>
              </div>
            )}

            {/* ── Ditolak Card ── */}
            {isDitolak && (
              <div style={{
                background: '#fff', borderRadius: 18, padding: '18px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12,
                borderLeft: '3px solid #EF4444',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: '#FEE2E2', color: '#DC2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    ❌
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#1E293B', margin: '0 0 2px' }}>
                      Pendaftaran Tidak Diterima
                    </p>
                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                      Maaf, pendaftaran Anda tidak lolos seleksi
                    </p>
                  </div>
                </div>
                {p.catatan_admin && (
                  <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', margin: '0 0 4px' }}>
                      📌 Catatan Panitia
                    </p>
                    <p style={{ fontSize: 12, color: '#7F1D1D', margin: 0, lineHeight: 1.5 }}>
                      {p.catatan_admin}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Timeline (hanya jika bukan ditolak) ── */}
            {!isDitolak && (
              <div style={{
                background: '#fff', borderRadius: 18, padding: '18px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12,
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', margin: '0 0 6px' }}>
                  📊 Timeline Proses Seleksi
                </p>
                <div style={{ height: 1, background: '#F1F5F9', margin: '0 0 16px' }} />

                <div>
                  {TIMELINE.map((step, i) => {
                    const isDone   = i < currentIdx
                    const isActive = i === currentIdx
                    const isLast   = i === TIMELINE.length - 1

                    const dotBg   = isDone ? '#DCFCE7' : isActive ? '#DBEAFE' : '#F1F5F9'
                    const dotText = isDone ? '#16A34A' : isActive ? '#2563EB' : '#94A3B8'
                    const dotBorder = isDone ? '#BBF7D0' : isActive ? '#BFDBFE' : '#E2E8F0'
                    const labelColor = isDone ? '#15803D' : isActive ? '#1D4ED8' : '#94A3B8'
                    const descColor  = isDone ? '#4ADE80' : isActive ? '#60A5FA' : '#94A3B8'
                    const lineColor  = isDone ? '#22C55E' : '#E2E8F0'

                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 14 }}>

                        {/* Track: dot + line */}
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

                        {/* Content */}
                        <div style={{ paddingBottom: isLast ? 0 : 20, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: labelColor, margin: '6px 0 3px' }}>
                            {step.label}
                          </p>
                          <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 8px', lineHeight: 1.4 }}>
                            {step.desc}
                          </p>
                          {isActive && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 700, color: '#2563EB',
                              background: '#DBEAFE', borderRadius: 20, padding: '3px 10px',
                            }}>
                              ● Sedang berlangsung
                            </span>
                          )}
                          {isDone && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 700, color: '#16A34A',
                              background: '#DCFCE7', borderRadius: 20, padding: '3px 10px',
                            }}>
                              ✓ Selesai
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
              background: '#fff', borderRadius: 18, padding: '18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12,
            }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', margin: '0 0 6px' }}>
                📋 Data Pendaftaran
              </p>
              <div style={{ height: 1, background: '#F1F5F9', margin: '0 0 8px' }} />
              <div>
                {(
                  [
                    ['Nama Lengkap',    p.nama_lengkap],
                    ['Jurusan Pilihan', p.jurusan_pilihan],
                    ['Asal Sekolah',    p.asal_sekolah],
                    ['Nilai Rata-rata', nilaiStr],
                  ] as [string, string][]
                ).map(([k, v], idx, arr) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: idx < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', textAlign: 'right' }}>
                      {v || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Edit button (hanya jika masih menunggu) ── */}
            {p.status === 'menunggu' && (
              <Link href="/siswa/pendaftaran" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#fff', color: '#5B21B6',
                border: '1.5px solid #DDD6FE',
                padding: '13px', borderRadius: 14,
                fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}>
                <span>✏️</span>
                <span>Edit Formulir Pendaftaran</span>
              </Link>
            )}
          </>
        )}

      </main>

      {/* ─── BOTTOM NAV (STATIS — tidak ikut scroll) ─── */}
      <nav style={{
        flexShrink: 0,
        background: '#fff',
        borderTop: '1px solid #F1F5F9',
        display: 'flex',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {([
          { href: '/siswa',              label: 'Beranda', active: false },
          { href: '/siswa/pendaftaran',  label: 'Daftar',  active: false },
          { href: '/siswa/pembayaran',   label: 'Bayar',   active: false },
          { href: '/siswa/status',       label: 'Status',  active: true  },
          { href: '/siswa/profile',      label: 'Profil',  active: false },
        ] as { href: string; label: string; active: boolean }[]).map((nav) => {
          const color = nav.active ? '#4F46E5' : '#94A3B8'
          return (
            <Link key={nav.href} href={nav.href} style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 0 14px', gap: 3,
              color, textDecoration: 'none',
              fontSize: 10, fontWeight: nav.active ? 600 : 400,
            }}>
              {nav.label === 'Beranda' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill={nav.active ? '#4F46E5' : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              )}
              {nav.label === 'Daftar' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              )}
              {nav.label === 'Bayar' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              )}
              {nav.label === 'Status' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              )}
              {nav.label === 'Profil' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              <span>{nav.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}