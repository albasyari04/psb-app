'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSettings, type FontSize, type Theme } from '@/contexts/SettingsContext'
import type { Language } from '@/lib/i18n'
import styles from './pengaturan.module.css'

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
function IconGear() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
function IconPerson() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#0e7c5f" strokeWidth="1.8" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#0e7c5f" strokeWidth="1.8" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="#0e7c5f" strokeWidth="1.8" />
    </svg>
  )
}
function IconMonitor() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="#0e7c5f" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function IconTextSize() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 7V5h16v2M9 19h6M12 5v14" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function IconHelp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#0e7c5f" strokeWidth="1.8" />
      <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.5" fill="#0e7c5f" stroke="#0e7c5f" strokeWidth="1" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.5" stroke="#d97706" strokeWidth="2" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="#6366f1" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════════ */

/** Satu baris menu di dalam card */
function SettingRow({
  icon,
  title,
  sub,
  href,
  onClick,
  chevron = true,
  isLast = false,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  href?: string
  onClick?: () => void
  chevron?: boolean
  isLast?: boolean
}) {
  const inner = (
    <>
      <div className={styles.rowIconWrap}>{icon}</div>
      <div className={styles.rowText}>
        <p className={styles.rowTitle}>{title}</p>
        <p className={styles.rowSub}>{sub}</p>
      </div>
      {chevron && (
        <span className={styles.rowChevron}>
          <IconChevronRight />
        </span>
      )}
    </>
  )

  const cls = `${styles.settingRow} ${isLast ? styles.settingRowLast : ''}`

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════
   MODAL — Bahasa
   ════════════════════════════════════════════════════════════════ */
function ModalBahasa({
  language,
  onSelect,
  onClose,
}: {
  language: Language
  onSelect: (v: Language) => void
  onClose: () => void
}) {
  return (
    <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modalSheet}>
        <div className={styles.modalHandle} />
        <p className={styles.modalTitle}>Pilih Bahasa</p>
        <p className={styles.modalSub}>Ubah bahasa tampilan seluruh aplikasi</p>
        <div className={styles.modalDivider} />
        <div className={styles.segment}>
          {(['id', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              className={`${styles.segBtn} ${language === lang ? styles.segBtnActive : ''}`}
              onClick={() => { onSelect(lang); onClose() }}
            >
              <span className={styles.segFlag}>{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
              <span className={styles.segText}>{lang === 'id' ? 'Indonesia' : 'English'}</span>
              {language === lang && <span className={styles.segCheck}><IconCheck /></span>}
            </button>
          ))}
        </div>
        <button className={styles.modalCloseBtn} onClick={onClose}>Tutup</button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MODAL — Tampilan (Tema)
   ════════════════════════════════════════════════════════════════ */
function ModalTampilan({
  theme,
  onSelect,
  onClose,
}: {
  theme: Theme
  onSelect: (v: Theme) => void
  onClose: () => void
}) {
  return (
    <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modalSheet}>
        <div className={styles.modalHandle} />
        <p className={styles.modalTitle}>Mode Tampilan</p>
        <p className={styles.modalSub}>Pilih antara tema terang atau gelap</p>
        <div className={styles.modalDivider} />
        <div className={styles.themeGrid}>
          {/* Light */}
          <button
            type="button"
            className={`${styles.themeCard} ${theme === 'light' ? styles.themeCardActive : ''}`}
            onClick={() => { onSelect('light'); onClose() }}
          >
            <div className={`${styles.themePreview} ${styles.themePreviewLight}`}>
              <div className={styles.themePreviewTopBar} />
              <div className={styles.themePreviewLineWrap}>
                <div className={`${styles.themePreviewLine} ${styles.themePreviewLineLong}`} />
                <div className={`${styles.themePreviewLine} ${styles.themePreviewLineShort}`} />
                <div className={`${styles.themePreviewLine} ${styles.themePreviewLineMed}`} />
              </div>
              {theme === 'light' && (
                <div className={styles.themeActiveOverlay}>
                  <div className={styles.themeActiveBadge}><IconCheck /></div>
                </div>
              )}
            </div>
            <div className={styles.themeCardLabel}>
              <IconSun /><span>Terang</span>
            </div>
          </button>
          {/* Dark */}
          <button
            type="button"
            className={`${styles.themeCard} ${theme === 'dark' ? styles.themeCardActive : ''}`}
            onClick={() => { onSelect('dark'); onClose() }}
          >
            <div className={`${styles.themePreview} ${styles.themePreviewDark}`}>
              <div className={styles.themePreviewTopBar} />
              <div className={styles.themePreviewLineWrap}>
                <div className={`${styles.themePreviewLine} ${styles.themePreviewLineLong}`} />
                <div className={`${styles.themePreviewLine} ${styles.themePreviewLineShort}`} />
                <div className={`${styles.themePreviewLine} ${styles.themePreviewLineMed}`} />
              </div>
              {theme === 'dark' && (
                <div className={styles.themeActiveOverlay}>
                  <div className={styles.themeActiveBadge}><IconCheck /></div>
                </div>
              )}
            </div>
            <div className={styles.themeCardLabel}>
              <IconMoon /><span>Gelap</span>
            </div>
          </button>
        </div>
        <button className={styles.modalCloseBtn} onClick={onClose}>Tutup</button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MODAL — Ukuran Teks
   ════════════════════════════════════════════════════════════════ */
function ModalTeks({
  fontSize,
  onSelect,
  onClose,
}: {
  fontSize: FontSize
  onSelect: (v: FontSize) => void
  onClose: () => void
}) {
  return (
    <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modalSheet}>
        <div className={styles.modalHandle} />
        <p className={styles.modalTitle}>Ukuran Teks</p>
        <p className={styles.modalSub}>Sesuaikan ukuran huruf agar nyaman dibaca</p>
        <div className={styles.modalDivider} />
        <div className={styles.fontGroup}>
          {(['small', 'medium', 'large'] as FontSize[]).map((size) => {
            const label = size === 'small' ? 'Kecil' : size === 'large' ? 'Besar' : 'Sedang'
            const glyphClass = size === 'small' ? styles.fontGlyphSm : size === 'large' ? styles.fontGlyphLg : styles.fontGlyphMd
            return (
              <button
                key={size}
                type="button"
                className={`${styles.fontBtn} ${fontSize === size ? styles.fontBtnActive : ''}`}
                onClick={() => { onSelect(size); onClose() }}
              >
                <span className={`${styles.fontGlyph} ${glyphClass} ${fontSize === size ? styles.fontGlyphActive : ''}`}>A</span>
                <span className={`${styles.fontLabel} ${fontSize === size ? styles.fontLabelActive : ''}`}>{label}</span>
                {fontSize === size && <span className={styles.fontCheckDot}><IconCheck /></span>}
              </button>
            )
          })}
        </div>
        <button className={styles.modalCloseBtn} onClick={onClose}>Tutup</button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function SiswaPengaturanPage() {
  const {
    theme,
    language,
    fontSize,
    setTheme,
    setLanguage,
    setFontSize,
    ready,
  } = useSettings()

  const [showToast, setShowToast] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [modal, setModal] = useState<'bahasa' | 'tampilan' | 'teks' | null>(null)

  useEffect(() => {
    if (!ready || !hasInteracted) return
    setShowToast(true)
    const timer = setTimeout(() => setShowToast(false), 1800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, language, fontSize, ready])

  const handle = {
    theme: (v: Theme) => { setHasInteracted(true); setTheme(v) },
    language: (v: Language) => { setHasInteracted(true); setLanguage(v) },
    fontSize: (v: FontSize) => { setHasInteracted(true); setFontSize(v) },
  }

  if (!ready) {
    return (
      <div className={styles.shell}>
        <div className={styles.skeletonPage} />
      </div>
    )
  }

  return (
    <div className={styles.shell}>

      {/* ══ TOP BAR ════════════════════════════════════════════════ */}
      <header className={styles.topBar}>
        <Link href="/siswa" className={styles.backBtn} aria-label="Kembali ke Beranda">
          <IconArrowLeft />
        </Link>
        <div className={styles.topBarCenter}>
          <h1 className={styles.topBarTitle}>Pengaturan</h1>
          <p className={styles.topBarSub}>Preferensi aplikasi santri</p>
        </div>
        <div className={styles.topBarIconBtn}>
          <IconGear />
        </div>
      </header>

      {/* Spacer: mengisi ruang yang ditinggalkan topBar karena position:fixed */}
      <div className={styles.topBarSpacer} aria-hidden="true" />

      {/* ══ PAGE BODY ══════════════════════════════════════════════ */}
      <div className={styles.pageBody}>

        {/* ── SECTION: AKUN & PROFIL ─────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Akun &amp; Profil</p>
          <div className={styles.card}>
            <SettingRow
              icon={<IconPerson />}
              title="Pengaturan Akun & Profil"
              sub="Kelola informasi akun, keamanan, dan profil Anda"
              href="/siswa/profile"
              isLast
            />
          </div>
        </div>

        {/* ── SECTION: PREFERENSI & TAMPILAN ───────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Preferensi &amp; Tampilan</p>
          <div className={styles.card}>
            <SettingRow
              icon={<IconGlobe />}
              title="Bahasa / Language"
              sub="Ubah bahasa tampilan aplikasi"
              onClick={() => setModal('bahasa')}
            />
            <div className={styles.rowDivider} />
            <SettingRow
              icon={<IconMonitor />}
              title="Tampilan"
              sub="Atur mode tampilan, tema, dan ukuran teks"
              onClick={() => setModal('tampilan')}
            />
            <div className={styles.rowDivider} />
            <SettingRow
              icon={<IconTextSize />}
              title="Teks"
              sub="Sesuaikan ukuran huruf agar nyaman dibaca"
              onClick={() => setModal('teks')}
              isLast
            />
          </div>
        </div>

        {/* ── SECTION: NOTIFIKASI ────────────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Notifikasi</p>
          <div className={styles.card}>
            <SettingRow
              icon={<IconBell />}
              title="Notifikasi"
              sub="Kelola preferensi notifikasi dan pengingat"
              href="/siswa/notifikasi"
              isLast
            />
          </div>
        </div>

        {/* ── SECTION: BANTUAN & INFORMASI ──────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Bantuan &amp; Informasi</p>
          <div className={styles.card}>
            <SettingRow
              icon={<IconHelp />}
              title="Bantuan & Informasi Aplikasi"
              sub="Temukan bantuan, panduan, dan informasi aplikasi"
              href="/siswa/bantuan"
              isLast
            />
          </div>
        </div>

      </div>

      {/* ══ MODALS ════════════════════════════════════════════════ */}
      {modal === 'bahasa' && (
        <ModalBahasa
          language={language}
          onSelect={handle.language}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'tampilan' && (
        <ModalTampilan
          theme={theme}
          onSelect={handle.theme}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'teks' && (
        <ModalTeks
          fontSize={fontSize}
          onSelect={handle.fontSize}
          onClose={() => setModal(null)}
        />
      )}

      {/* ══ TOAST ════════════════════════════════════════════════ */}
      {showToast && (
        <div className={styles.toast} role="status" aria-live="polite">
          <span className={styles.toastIcon}>✓</span>
          <span>Pengaturan tersimpan</span>
        </div>
      )}
    </div>
  )
}