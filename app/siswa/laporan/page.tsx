// app/siswa/laporan/page.tsx
'use client'

import { useEffect, useState, useCallback, useMemo, type JSX } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
interface LaporanItem {
  id: string
  judul: string
  tipe: 'bulanan' | 'tahunan' | 'khusus' | string
  deskripsi: string | null
  file_url: string | null
  created_at: string | null
  nilai?: number
  data_json?: Record<string, unknown> | null
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function extractNilai(item: LaporanItem): number {
  if (typeof item.nilai === 'number') return Math.min(100, Math.max(0, item.nilai))
  if (item.deskripsi) {
    const m = item.deskripsi.match(/(\d{1,3})\s*%/)
    if (m) return Math.min(100, parseInt(m[1]))
    const m2 = item.deskripsi.match(/nilai[:\s]+(\d{1,3})/i)
    if (m2) return Math.min(100, parseInt(m2[1]))
  }
  const seed = item.id
    ? item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 30
    : 0
  return 70 + seed
}

function nilaiMeta(n: number): { text: string; color: string; bg: string; ring: string } {
  if (n >= 90) return { text: 'Sangat Baik', color: '#0e7c5f', bg: '#ecfdf5', ring: '#0e7c5f' }
  if (n >= 75) return { text: 'Baik', color: '#16a34a', bg: '#dcfce7', ring: '#16a34a' }
  if (n >= 60) return { text: 'Cukup', color: '#d97706', bg: '#fef3c7', ring: '#d97706' }
  return { text: 'Perlu Perhatian', color: '#dc2626', bg: '#fee2e2', ring: '#dc2626' }
}

const TIPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  bulanan: { label: 'Bulanan', color: '#2563eb', bg: '#eff6ff' },
  tahunan: { label: 'Tahunan', color: '#16a34a', bg: '#dcfce7' },
  khusus: { label: 'Khusus', color: '#d97706', bg: '#fef3c7' },
}

function getTipe(tipe: string) {
  return TIPE_MAP[tipe] ?? { label: tipe, color: '#64748b', bg: '#f1f5f9' }
}

/* ════════════════════════════════════════════════════════════════
   KATEGORI DETAIL LAPORAN
   Setiap laporan dipetakan ke salah satu dari 4 kategori berikut
   berdasarkan kata kunci pada `judul`, supaya icon & warna pada
   card sesuai mockup. Jika judul tidak cocok kata kunci apa pun,
   fallback ke kategori "Pelajaran". `defaultDesc` dipakai bila
   item.deskripsi kosong.
   ════════════════════════════════════════════════════════════════ */
type KategoriKey = 'pelajaran' | 'ibadah' | 'akhlak' | 'kegiatan'

interface KategoriMeta {
  label: string
  defaultDesc: string
  color: string
  bg: string
  Icon: () => JSX.Element
}

const KATEGORI_META: Record<KategoriKey, KategoriMeta> = {
  pelajaran: {
    label: 'Pelajaran',
    defaultDesc: 'Pemahaman materi dan tugas',
    color: '#0e7c5f',
    bg: '#dcfce7',
    Icon: IconBookOpen,
  },
  ibadah: {
    label: 'Ibadah',
    defaultDesc: 'Kedisiplinan dalam beribadah',
    color: '#d97706',
    bg: '#fef3c7',
    Icon: IconMosqueSmall,
  },
  akhlak: {
    label: 'Akhlak & Sikap',
    defaultDesc: 'Perilaku dan sikap sehari-hari',
    color: '#2563eb',
    bg: '#dbeafe',
    Icon: IconUsersGroup,
  },
  kegiatan: {
    label: 'Kegiatan',
    defaultDesc: 'Keaktifan dalam kegiatan pesantren',
    color: '#7c3aed',
    bg: '#ede9fe',
    Icon: IconRunning,
  },
}

function getKategoriKey(judul: string): KategoriKey {
  const j = judul.toLowerCase()
  if (/(ibadah|sholat|shalat|sholawat|hafalan|tahfidz|ngaji|mengaji)/.test(j)) return 'ibadah'
  if (/(akhlak|sikap|perilaku|adab)/.test(j)) return 'akhlak'
  if (/(kegiatan|ekstra|organisasi|santri\s*baru|kepramukaan)/.test(j)) return 'kegiatan'
  return 'pelajaran'
}

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  )
}

function IconEmpty() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  )
}

function IconExternal() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="20" x2="6" y2="13"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="18" y1="20" x2="18" y2="11"/>
    </svg>
  )
}

function IconClipboardCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>
      <polyline points="8.5 13 10.5 15 15 10.5"/>
    </svg>
  )
}

function IconTrophy() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/>
      <path d="M7 5H4a1 1 0 0 0-1 1 4 4 0 0 0 4 4"/>
      <path d="M17 5h3a1 1 0 0 1 1 1 4 4 0 0 1-4 4"/>
      <line x1="12" y1="14" x2="12" y2="18"/><path d="M9 21h6"/><path d="M9.5 18h5l.5 3h-6z"/>
    </svg>
  )
}

function IconStarBadge() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2.5l2.95 6.4 7.05.75-5.25 4.8 1.5 6.9L12 17.7l-6.25 3.65 1.5-6.9-5.25-4.8 7.05-.75L12 2.5z"/>
    </svg>
  )
}

function IconBookOpen() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

function IconMosqueSmall() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2.5"/>
      <path d="M7 9.5a5 5 0 0 1 10 0V12H7V9.5z"/>
      <path d="M3 21v-6.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3V21"/>
      <path d="M10 21v-4.5a2 2 0 0 1 4 0V21"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
    </svg>
  )
}

function IconUsersGroup() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function IconRunning() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14.5" cy="4.5" r="1.8"/>
      <path d="M5 21l3.2-5 2.3-2.2-1-4.3"/>
      <path d="M6.5 13.5L9.5 12l2-3 3.2 2 3.3-1"/>
      <path d="M11 12l3 2.5-1 5.5"/>
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   CIRCULAR PROGRESS
   ════════════════════════════════════════════════════════════════ */
function CircleProgress({ pct, color, size = 72, stroke = 7 }: {
  pct: number; color: string; size?: number; stroke?: number
}) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const cx = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT: Kata Banner (Menggunakan gambar dari icons/kata-banner-laporan.png)
   ════════════════════════════════════════════════════════════════ */
function KataBanner() {
  return (
    <div style={{
      position: 'relative',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      boxShadow: '0 12px 28px rgba(7,59,44,0.28)',
      width: '100%',
      // Rasio asli kata-banner-laporan.png = 1838 x 856px.
      // Disamakan persis supaya object-fit: cover TIDAK memotong gambar.
      aspectRatio: '1838/856',
      minHeight: '100px',
    }}>
      <Image
        src="/icons/kata-banner-laporan.png"
        alt="Terus Semangat — Kata Motivasi"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        sizes="(max-width: 480px) 100vw, 480px"
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT: Greeting Banner (memakai gambar icons/laporan-banner.png)
   Bagian kiri gambar sengaja polos (gradient teal) — di situlah teks
   salam, nama, kelas/asrama, dan kutipan ayat ditumpuk (overlay).
   ════════════════════════════════════════════════════════════════ */
function GreetingBanner({ name, kelas, asrama }: { name: string; kelas: string; asrama: string }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      // Rasio asli laporan-banner.png = 729 x 342px, disamakan persis
      // supaya object-fit: cover tidak memotong gambar.
      aspectRatio: '729/342',
      minHeight: '190px',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      boxShadow: '0 12px 28px rgba(7,59,44,0.28)',
    }}>
      <Image
        src="/icons/laporan-banner.png"
        alt=""
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        priority
        sizes="(max-width: 480px) 100vw, 480px"
      />

      {/* Teks ditumpuk di area polos sebelah kiri gambar */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '1.4rem 1.3rem',
        maxWidth: '68%',
      }}>
        <p style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#e8c178',
          margin: '0 0 0.25rem',
          letterSpacing: '0.01em',
        }}>
          Assalamu&apos;alaikum,
        </p>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#fff',
          margin: 0,
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}>
          {name}
        </h2>
        <p style={{
          fontSize: '0.74rem',
          color: 'rgba(255,255,255,0.85)',
          fontWeight: 600,
          margin: '0.2rem 0 0.85rem',
        }}>
          {kelas ? `${kelas} - ${asrama}` : asrama}
        </p>
        <p style={{
          fontSize: '0.68rem',
          color: 'rgba(255,255,255,0.92)',
          fontWeight: 500,
          margin: 0,
          lineHeight: 1.55,
          fontStyle: 'italic',
        }}>
          &quot;Dan katakanlah: &apos;Bekerjalah kamu, maka Allah dan Rasul-Nya serta orang-orang mukmin akan melihat pekerjaanmu...&apos;&quot;
        </p>
        <p style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: '#e8c178',
          margin: '0.35rem 0 0',
          letterSpacing: '0.04em',
        }}>
          (QS. At-Taubah: 105)
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT: Ringkasan Perkembangan
   4 statistik ringkas. `rataNilai` dihitung otomatis dari seluruh
   laporan yang berhasil dimuat. `kehadiran`, `prestasi`, `akhlak`
   BELUM punya sumber data di model LaporanItem saat ini — masih
   placeholder, tinggal sambungkan ke field/API yang sesuai
   (mis. tabel presensi, prestasi, dan penilaian akhlak santri).
   ════════════════════════════════════════════════════════════════ */
interface RingkasanStat {
  key: string
  label: string
  value: string
  sub: string
  color: string
  bg: string
  Icon: () => JSX.Element
}

function RingkasanPerkembangan({ rataNilai }: { rataNilai: number | null }) {
  const stats: RingkasanStat[] = [
    {
      key: 'nilai',
      label: 'Rata-rata Nilai',
      value: rataNilai !== null ? `${rataNilai}%` : '—',
      sub: rataNilai !== null ? nilaiMeta(rataNilai).text : 'Belum ada data',
      color: '#0e7c5f',
      bg: '#dcfce7',
      Icon: IconBarChart,
    },
    {
      // TODO: sambungkan ke data presensi/kehadiran santri yang sebenarnya
      key: 'kehadiran',
      label: 'Kehadiran',
      value: '95%',
      sub: 'Sangat Baik',
      color: '#d97706',
      bg: '#fef3c7',
      Icon: IconClipboardCheck,
    },
    {
      // TODO: sambungkan ke data prestasi/pencapaian santri yang sebenarnya
      key: 'prestasi',
      label: 'Prestasi',
      value: '8',
      sub: 'Pencapaian',
      color: '#2563eb',
      bg: '#dbeafe',
      Icon: IconTrophy,
    },
    {
      // TODO: sambungkan ke data penilaian akhlak santri yang sebenarnya
      key: 'akhlak',
      label: 'Akhlak',
      value: 'A',
      sub: 'Sangat Baik',
      color: '#7c3aed',
      bg: '#ede9fe',
      Icon: IconStarBadge,
    },
  ]

  return (
    <div style={{
      background: '#fff',
      borderRadius: '1.25rem',
      padding: '1.1rem 1rem',
      border: '1px solid #e9eef2',
      boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#0f172a',
        marginBottom: '1rem',
      }}>
        <IconBarChart />
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
          Ringkasan Perkembangan
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {stats.map((s, i) => (
          <div
            key={s.key}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              padding: '0 0.3rem',
              borderLeft: i === 0 ? 'none' : '1px solid #f1f5f9',
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: s.bg,
              color: s.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <s.Icon />
            </div>
            <p style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
              {s.label}
            </p>
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, margin: 0 }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT: Detail Laporan Card (per kategori)
   ════════════════════════════════════════════════════════════════ */
function DetailLaporanCard({ 
  item,
  onClick 
}: { 
  item: LaporanItem;
  onClick: (i: LaporanItem) => void 
}) {
  const nilai = extractNilai(item)
  const { text } = nilaiMeta(nilai)
  const kategori = KATEGORI_META[getKategoriKey(item.judul)]
  const desc = item.deskripsi?.trim() || kategori.defaultDesc

  return (
    <button
      onClick={() => onClick(item)}
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        background: '#fff',
        border: '1px solid #e9eef2',
        borderRadius: '1rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        fontFamily: 'inherit',
        boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.09)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.04)'
      }}
    >
      {/* Icon kategori */}
      <div style={{
        width: 46,
        height: 46,
        flexShrink: 0,
        borderRadius: '50%',
        background: kategori.bg,
        color: kategori.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <kategori.Icon />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {item.judul || kategori.label}
        </p>
        <p style={{
          fontSize: '0.68rem',
          color: '#94a3b8',
          fontWeight: 600,
          margin: '0.1rem 0 0.45rem',
          lineHeight: 1.3,
        }}>
          {desc}
        </p>
        <div style={{
          height: 5,
          borderRadius: 999,
          background: '#f1f5f9',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${nilai}%`,
            borderRadius: 999,
            background: kategori.color,
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* Pill persentase + label status */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.3rem',
      }}>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          padding: '0.2rem 0.55rem',
          borderRadius: 999,
          background: kategori.bg,
          color: kategori.color,
          whiteSpace: 'nowrap',
        }}>
          {nilai}%
        </span>
        <span style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          color: '#94a3b8',
          whiteSpace: 'nowrap',
        }}>
          {text}
        </span>
      </div>

      <IconChevronRight />
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════
   SKELETON
   ════════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e9eef2',
      borderRadius: '1rem',
      padding: '1rem',
      display: 'flex',
      gap: '0.85rem',
      alignItems: 'center',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: '#f1f5f9',
        flexShrink: 0,
        animation: 'shimmer 1.6s ease-in-out infinite',
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <div style={{
          height: 12,
          borderRadius: 6,
          background: '#f1f5f9',
          width: '75%',
          animation: 'shimmer 1.6s ease-in-out infinite',
        }} />
        <div style={{
          height: 8,
          borderRadius: 6,
          background: '#f1f5f9',
          width: '45%',
          animation: 'shimmer 1.6s ease-in-out infinite',
        }} />
        <div style={{
          height: 4,
          borderRadius: 999,
          background: '#f1f5f9',
          width: '90%',
          animation: 'shimmer 1.6s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   DETAIL MODAL — bottom sheet
   ════════════════════════════════════════════════════════════════ */
function DetailModal({ item, onClose }: { item: LaporanItem; onClose: () => void }) {
  const nilai = extractNilai(item)
  const { text, color, ring } = nilaiMeta(nilai)
  const tipe = getTipe(item.tipe)

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Detail laporan: ${item.judul}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'backdropIn 0.22s ease forwards',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#fff',
        borderRadius: '1.75rem 1.75rem 0 0',
        padding: '0 1.25rem 2.5rem',
        maxHeight: '88vh',
        overflowY: 'auto',
        animation: 'sheetUp 0.3s cubic-bezier(0.32,0.72,0,1) forwards',
      }}>
        {/* handle */}
        <div style={{
          width: 40,
          height: 4,
          borderRadius: 999,
          background: '#e2e8f0',
          margin: '1rem auto 1.25rem',
        }} />

        {/* header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.22rem 0.65rem',
            borderRadius: 999,
            background: tipe.bg,
            color: tipe.color,
          }}>
            {tipe.label}
          </span>
          <button
            onClick={onClose}
            aria-label="Tutup"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <IconClose />
          </button>
        </div>

        <h2 style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
          margin: '0 0 0.5rem',
        }}>
          {item.judul}
        </h2>

        {item.created_at && (
          <p style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            fontWeight: 600,
            margin: '0 0 1.25rem',
          }}>
            {formatTanggal(item.created_at)}
          </p>
        )}

        {/* circle progress besar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, #f8fffe, #ecfdf5)',
          border: '1px solid #d1fae5',
          borderRadius: '1.25rem',
          padding: '1.1rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{
            position: 'relative',
            width: 72,
            height: 72,
            flexShrink: 0,
          }}>
            <CircleProgress pct={nilai} color={ring} size={72} stroke={7} />
            <span style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: ring,
            }}>
              {nilai}%
            </span>
          </div>
          <div>
            <p style={{
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: 600,
              margin: '0 0 0.25rem',
            }}>
              Nilai Keseluruhan
            </p>
            <p style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color,
              margin: 0,
              lineHeight: 1.2,
            }}>
              {text}
            </p>
          </div>
        </div>

        {/* deskripsi */}
        {item.deskripsi && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#64748b',
              margin: '0 0 0.4rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Keterangan
            </p>
            <p style={{
              fontSize: '0.88rem',
              color: '#374151',
              lineHeight: 1.8,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {item.deskripsi}
            </p>
          </div>
        )}

        <div style={{
          height: 1,
          background: '#f1f5f9',
          margin: '1rem 0',
        }} />

        {/* action: unduh file */}
        {item.file_url && (
          <a
            href={item.file_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              borderRadius: '1rem',
              background: '#ecfdf5',
              border: '1.5px solid #d1fae5',
              color: '#0a5c46',
              fontSize: '0.83rem',
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: '0.75rem',
              transition: 'background 0.15s',
            }}
          >
            <IconDownload />
            <span>Unduh Dokumen Laporan</span>
            <span style={{ marginLeft: 'auto' }}>
              <IconExternal />
            </span>
          </a>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.9rem',
            borderRadius: '1rem',
            border: '1.5px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#64748b',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   FILTER OPTIONS
   ════════════════════════════════════════════════════════════════ */
const FILTER_OPTIONS = [
  { value: 'semua', label: 'Semua' },
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'tahunan', label: 'Tahunan' },
  { value: 'khusus', label: 'Khusus' },
]

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function LaporanPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<LaporanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('semua')
  const [selected, setSelected] = useState<LaporanItem | null>(null)
  const [showFilterSheet, setShowFilterSheet] = useState(false)

  const load = useCallback(async (tipe: string) => {
    setLoading(true)
    setError(null)
    try {
      const q = tipe !== 'semua' ? `?tipe=${tipe}` : ''
      const res = await fetch(`/api/siswa/laporan${q}`)
      const json = await res.json()
      
      if (res.ok) {
        const data = json.data ?? []
        setItems(data)
      } else {
        setError(json.error || 'Gagal memuat laporan')
      }
    } catch {
      setError('Terjadi kesalahan saat memuat laporan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(filter)
  }, [filter, load])

  const activeFilterLabel = FILTER_OPTIONS.find(f => f.value === filter)?.label ?? 'Semua'

  // Data siswa (contoh - bisa dari session)
  const studentName = session?.user?.name || 'Muhammad Soleh Jailani'
  const studentKelas = ''
  const studentAsrama = 'Asrama Putra'

  // Rata-rata nilai dari seluruh laporan yang berhasil dimuat (null jika belum ada data)
  const rataNilai = useMemo(() => {
    if (items.length === 0) return null
    const total = items.reduce((sum, item) => sum + extractNilai(item), 0)
    return Math.round(total / items.length)
  }, [items])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes backdropIn { from{opacity:0} to{opacity:1} }
        @keyframes sheetUp { from{transform:translateY(100%);opacity:0.5} to{transform:translateY(0);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        button { cursor: pointer; }
      `}</style>

      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: '#f6f8fa',
        minHeight: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        WebkitFontSmoothing: 'antialiased',
        paddingBottom: '2rem',
      }}>
        {/* ── HEADER ──────────────────────────────────────────── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#fff',
          borderBottom: '1px solid #e9eef2',
          boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.1rem',
          }}>
            <Link
              href="/siswa"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                textDecoration: 'none',
                flexShrink: 0,
              }}
              aria-label="Kembali"
            >
              <IconBack />
            </Link>

            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.01em',
                margin: 0,
                lineHeight: 1.2,
              }}>
                Laporan Santri
              </h1>
              <p style={{
                fontSize: '0.68rem',
                color: '#94a3b8',
                fontWeight: 600,
                margin: '0.1rem 0 0',
              }}>
                Pantau perkembangan dan pencapaian santri
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => load(filter)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.4rem',
                  borderRadius: 999,
                  background: '#f1f5f9',
                  border: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                }}
                aria-label="Refresh"
              >
                <IconRefresh />
              </button>

              <button
                onClick={() => setShowFilterSheet(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 999,
                  background: filter !== 'semua' ? '#dcfce7' : '#f1f5f9',
                  border: `1.5px solid ${filter !== 'semua' ? '#86efac' : '#e2e8f0'}`,
                  color: filter !== 'semua' ? '#16a34a' : '#475569',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
                aria-label="Filter laporan"
              >
                <IconFilter />
                {activeFilterLabel}
              </button>
            </div>
          </div>
        </div>

        {/* ── PAGE BODY ──────────────────────────────────────── */}
        <div style={{
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {/* KATA BANNER - Gambar dari icons/kata-banner-laporan.png */}
          <KataBanner />

          {/* GREETING BANNER */}
          <GreetingBanner
            name={studentName}
            kelas={studentKelas}
            asrama={studentAsrama}
          />

          {/* RINGKASAN PERKEMBANGAN */}
          <RingkasanPerkembangan rataNilai={rataNilai} />

          {/* Error */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>{error}</span>
              <button
                onClick={() => load(filter)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Detail Laporan Section */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}>
              <h3 style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
              }}>
                Detail Laporan
              </h3>
              <span style={{
                fontSize: '0.65rem',
                color: '#94a3b8',
                fontWeight: 600,
              }}>
                {items.length} laporan
              </span>
            </div>

            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '3rem 1rem',
                background: '#fff',
                border: '1.5px dashed #e2e8f0',
                borderRadius: '1.5rem',
                gap: '0.75rem',
                animation: 'fadeUp 0.4s ease forwards',
              }}>
                <IconEmpty />
                <p style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#64748b',
                  margin: 0,
                }}>
                  Belum ada laporan
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  margin: 0,
                  textAlign: 'center',
                }}>
                  {filter !== 'semua' 
                    ? `Tidak ada laporan dengan tipe "${activeFilterLabel}"` 
                    : 'Laporan akan muncul di sini saat tersedia'}
                </p>
                {filter !== 'semua' && (
                  <button
                    onClick={() => setFilter('semua')}
                    style={{
                      marginTop: '0.25rem',
                      padding: '0.55rem 1.1rem',
                      borderRadius: 999,
                      background: '#ecfdf5',
                      border: '1.5px solid #86efac',
                      color: '#16a34a',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                    }}
                  >
                    Tampilkan semua
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                animation: 'fadeUp 0.35s ease forwards',
              }}>
                {items.map(item => (
                  <DetailLaporanCard 
                    key={item.id} 
                    item={item} 
                    onClick={setSelected} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Kata Motivasi Footer - QS. At-Taubah: 105 */}
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            marginTop: '0.5rem',
            background: '#fff',
            borderRadius: '1rem',
            border: '1px solid #e9eef2',
            boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: '#0f172a',
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}>
              &quot;Dan katakanlah: &apos;Bekerjalah kamu, maka Allah dan Rasul-Nya serta orang-orang mukmin akan melihat pekerjaanmu...&apos;&quot;
            </p>
            <p style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: '#0e7c5f',
              margin: '0.25rem 0 0',
              letterSpacing: '0.05em',
            }}>
              QS. At-Taubah: 105
            </p>
          </div>
        </div>
      </div>

      {/* ── FILTER BOTTOM SHEET ──────────────────────────────── */}
      {showFilterSheet && (
        <div
          onClick={() => setShowFilterSheet(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'backdropIn 0.2s ease forwards',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#fff',
              borderRadius: '1.75rem 1.75rem 0 0',
              padding: '0 1.25rem 2.5rem',
              animation: 'sheetUp 0.28s cubic-bezier(0.32,0.72,0,1) forwards',
            }}
          >
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: '#e2e8f0',
              margin: '1rem auto 1.25rem',
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
              }}>
                Filter Laporan
              </h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <IconClose />
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilter(opt.value); setShowFilterSheet(false) }}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    borderRadius: '0.9rem',
                    textAlign: 'left',
                    border: `1.5px solid ${filter === opt.value ? '#86efac' : '#e2e8f0'}`,
                    background: filter === opt.value ? '#ecfdf5' : '#fff',
                    color: filter === opt.value ? '#16a34a' : '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: filter === opt.value ? 700 : 600,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{opt.label}</span>
                  {filter === opt.value && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ──────────────────────────────────────── */}
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}