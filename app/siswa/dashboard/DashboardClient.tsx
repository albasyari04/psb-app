'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link  from 'next/link'
import type { Pendaftaran } from '@/types'
import styles from './dashboard.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  fullName:      string
  avatarInitial: string
  avatarUrl:     string | null
  pendaftaran:   Pendaftaran | null
  status:        Pendaftaran['status'] | null
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PROGRESS_VALUE: Record<string, number> = {
  menunggu: 25,
  diproses: 60,
  diterima: 100,
  ditolak:  100,
}

const STATUS_LABEL: Record<string, string> = {
  menunggu: 'Menunggu Review',
  diproses: 'Sedang Diproses',
  diterima: 'Diterima! 🎉',
  ditolak:  'Tidak Diterima',
}

const PROGRESS_CLASS: Record<string, string> = {
  menunggu: styles.progress25,
  diproses: styles.progress60,
  diterima: styles.progress100,
  ditolak:  styles.progress100red,
}

const MENU_ITEMS = [
  { href: '/siswa/pendaftaran', icon: '📝', title: 'Formulir', sub: 'Isi & edit data diri',   bgClass: 'menuBgBlue',   iconClass: 'iconBgBlue'   },
  { href: '/siswa/status',      icon: '📊', title: 'Status',   sub: 'Pantau progres seleksi', bgClass: 'menuBgViolet', iconClass: 'iconBgViolet' },
  { href: '/siswa/profile',     icon: '👤', title: 'Profil',   sub: 'Kelola akun & foto',     bgClass: 'menuBgGreen',  iconClass: 'iconBgGreen'  },
  { href: '/siswa/pendaftaran', icon: '📁', title: 'Berkas',   sub: 'Upload dokumen wajib',   bgClass: 'menuBgAmber',  iconClass: 'iconBgAmber'  },
] as const

const JADWAL = [
  { label: 'Batas Pendaftaran', date: '28 Feb 2025',   dotClass: 'dotRed'   },
  { label: 'Pengumuman Hasil',  date: '15 Maret 2025', dotClass: 'dotBlue'  },
  { label: 'Daftar Ulang',      date: '1–15 Apr 2025', dotClass: 'dotGreen' },
] as const

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(hour: number): string {
  if (hour >= 4  && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function formatDate(d: Date) {
  return d.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function cx(s: Record<string, string>, ...names: (string | false | undefined)[]) {
  return names.filter(Boolean).map((n) => s[n as string] ?? '').join(' ').trim()
}

// ── Gear Icon SVG ─────────────────────────────────────────────────────────────
function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardClient({
  fullName, avatarInitial, avatarUrl, pendaftaran, status,
}: Props) {

  const [now, setNow] = useState<Date | null>(null)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => { setNow(new Date()) }, 60_000)
    Promise.resolve().then(() => setNow(new Date()))
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const mounted      = now !== null
  const hour         = now?.getHours() ?? 13
  const greetingText = getGreeting(hour)
  const dateStr      = mounted ? formatDate(now!) : ''

  const progressClass = status ? (PROGRESS_CLASS[status] ?? styles.progress25) : styles.progress25

  return (
    <div className={styles.shell}>

      {/* ══ TOPBAR FIXED — avatar + gear ══════════════════════════════════ */}
      <div className={styles.topbar}>
        <Link href="/siswa/profile" className={styles.topbarAvatar} aria-label="Profil saya">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={38}
              height={38}
              className={styles.avatarImg}
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            <span className={styles.avatarInitialText}>{avatarInitial}</span>
          )}
        </Link>
        {/* ✅ Gear → /siswa/profile */}
        <Link href="/siswa/profile" className={styles.topbarGear} aria-label="Profil & Pengaturan">
          <GearIcon />
        </Link>
      </div>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div className={styles.hero}>
        <div className={styles.orbA} />
        <div className={styles.orbB} />
        <div className={styles.orbC} />

        <div className={styles.heroContent}>
          {/* ✅ Tidak ada emoji greeting, posisi lebih ke atas */}
          <div className={cx(styles, 'fadeUp', 'd1')}>
            <p className={styles.greetingText}>{greetingText},</p>
            <h1 className={styles.heroName}>{fullName} 👋</h1>
            <p className={styles.heroSchool}>PSB 2025/2026 · SMA Negeri 1</p>
          </div>

          {mounted && (
            <p className={cx(styles, 'dateText', 'fadeUp', 'd2')}>📅 {dateStr}</p>
          )}
        </div>
      </div>

      {/* ══ FLOAT ZONE ════════════════════════════════════════════════════ */}
      <div className={cx(styles, 'floatZone', 'fadeUp', 'd3')}>
        {pendaftaran && status ? (
          <div className={styles.statusCard}>

            <div className={styles.statusHeader}>
              <div className={styles.statusLeft}>
                <div className={cx(styles, 'statusDot', `statusDot_${status}`)} />
                <div>
                  <p className={styles.statusLabelSm}>Status Pendaftaran</p>
                  <p className={cx(styles, 'statusLabelLg', `statusLg_${status}`)}>
                    {STATUS_LABEL[status]}
                  </p>
                </div>
              </div>
              <Link href="/siswa/status" className={styles.detailBtn}>Detail →</Link>
            </div>

            <div className={styles.progressMeta}>
              <span>Progress Seleksi</span>
              <span className={styles.progressPct}>{PROGRESS_VALUE[status]}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={progressClass} />
            </div>

            <div className={styles.infoDivider} />
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Nama Lengkap</span>
              <span className={styles.infoVal}>{pendaftaran.nama_lengkap}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Jurusan</span>
              <span className={styles.infoVal}>{pendaftaran.jurusan_pilihan}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>No. Reg</span>
              <span className={styles.infoValMono}>
                {pendaftaran.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyRow}>
              <div className={styles.emptyIconBox}>📋</div>
              <div>
                <p className={styles.emptyTitle}>Belum Mendaftar</p>
                <p className={styles.emptySub}>
                  Lengkapi formulir untuk memulai proses seleksi.
                </p>
              </div>
            </div>
            <Link href="/siswa/pendaftaran" className={styles.ctaBtn}>
              <span>Mulai Pendaftaran Sekarang</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <div className={styles.mainContent}>

        {/* ── Quick Menu ── */}
        <div className={cx(styles, 'fadeUp', 'd4')}>
          <p className={styles.sectionLabel}>Menu Utama</p>
          <div className={styles.menuGrid}>
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`${styles.menuCard} ${styles[item.bgClass]}`}
              >
                <div className={`${styles.menuIconBox} ${styles[item.iconClass]}`}>
                  {item.icon}
                </div>
                <p className={styles.menuTitle}>{item.title}</p>
                <p className={styles.menuSub}>{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Jadwal ── */}
        <div className={cx(styles, 'fadeUp', 'd5')}>
          <p className={styles.sectionLabel}>Jadwal Penting</p>
          <div className={styles.jadwalCard}>
            <div className={styles.jadwalHeader}>
              <span>📅</span>
              <span className={styles.jadwalHeaderTitle}>Timeline Penerimaan 2025/2026</span>
            </div>
            {JADWAL.map((j) => (
              <div key={j.label} className={styles.jadwalRow}>
                <div className={styles.jadwalLeft}>
                  <div className={`${styles.jadwalDot} ${styles[j.dotClass]}`} />
                  <span className={styles.jadwalLabel}>{j.label}</span>
                </div>
                <span className={styles.jadwalDate}>{j.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tip ── */}
        <div className={cx(styles, 'tipCard', 'fadeUp', 'd5')}>
          <span className={styles.tipEmoji}>💡</span>
          <div>
            <p className={styles.tipTitle}>Tips Pendaftaran</p>
            <p className={styles.tipSub}>
              Pastikan semua berkas terbaca jelas dan nilai rata-rata rapor ≥ 80
              untuk meningkatkan peluang diterima.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}