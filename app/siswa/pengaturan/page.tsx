'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#0e7c5f" strokeWidth="1.8" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="#0e7c5f" strokeWidth="1.8" />
    </svg>
  )
}
function IconPalette() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" fill="rgba(14,124,95,0.12)" stroke="#0e7c5f" strokeWidth="1.8" />
      <circle cx="6.5" cy="11.5" r="1.5" fill="#0e7c5f" />
      <circle cx="9.5" cy="7.5" r="1.5" fill="#0a5c46" />
      <circle cx="14.5" cy="7.5" r="1.5" fill="#16a34a" />
      <circle cx="17.5" cy="11.5" r="1.5" fill="#0e7c5f" />
    </svg>
  )
}
function IconText() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 7V5h16v2M9 19h6M12 5v14" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
function IconReset() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 1 0 2.6-6.3M3 4v5h5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconHomeFilled() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )
}
function IconWalletOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  )
}
function IconDocumentOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  )
}
function IconPersonOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
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
    resetSettings,
    ready,
  } = useSettings()

  const [showToast, setShowToast] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

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
    reset: () => { setHasInteracted(true); resetSettings() },
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
        <div className={styles.topBarRight}>
          <Image
            src="/icons/pengaturan-icon.png"
            alt="Pengaturan"
            width={36}
            height={36}
            className={styles.topBarIcon}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      </header>
      
      {/* ══ PAGE BODY ══════════════════════════════════════════════ */}
      <div className={styles.pageBody}>

        {/* ── SECTION: Bahasa ──────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionLabelRow}>
            <span className={styles.sectionDot} />
            <p className={styles.sectionLabel}>Bahasa / Language</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={`${styles.cardIconWrap} ${styles.cardIconTeal}`}>
                <IconGlobe />
              </div>
              <div className={styles.cardTextWrap}>
                <p className={styles.cardTitle}>Pilih Bahasa</p>
                <p className={styles.cardSub}>Ubah bahasa tampilan seluruh aplikasi</p>
              </div>
            </div>
            <div className={styles.cardDivider} />
            <div className={styles.segment} role="tablist" aria-label="Pilih bahasa">
              <button
                type="button"
                role="tab"
                aria-selected={language === 'id'}
                className={`${styles.segBtn} ${language === 'id' ? styles.segBtnActive : ''}`}
                onClick={() => handle.language('id')}
              >
                <span className={styles.segFlag}>🇮🇩</span>
                <span className={styles.segText}>Indonesia</span>
                {language === 'id' && <span className={styles.segCheck}><IconCheck /></span>}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={language === 'en'}
                className={`${styles.segBtn} ${language === 'en' ? styles.segBtnActive : ''}`}
                onClick={() => handle.language('en')}
              >
                <span className={styles.segFlag}>🇬🇧</span>
                <span className={styles.segText}>English</span>
                {language === 'en' && <span className={styles.segCheck}><IconCheck /></span>}
              </button>
            </div>
          </div>
        </div>

        {/* ── SECTION: Tema ─────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionLabelRow}>
            <span className={styles.sectionDot} />
            <p className={styles.sectionLabel}>Tampilan</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={`${styles.cardIconWrap} ${styles.cardIconGreen}`}>
                <IconPalette />
              </div>
              <div className={styles.cardTextWrap}>
                <p className={styles.cardTitle}>Mode Tampilan</p>
                <p className={styles.cardSub}>Pilih antara tema terang atau gelap</p>
              </div>
            </div>
            <div className={styles.cardDivider} />
            <div className={styles.themeGrid}>
              {/* Light */}
              <button
                type="button"
                aria-pressed={theme === 'light'}
                className={`${styles.themeCard} ${theme === 'light' ? styles.themeCardActive : ''}`}
                onClick={() => handle.theme('light')}
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
                  <IconSun />
                  <span>Terang</span>
                </div>
              </button>

              {/* Dark */}
              <button
                type="button"
                aria-pressed={theme === 'dark'}
                className={`${styles.themeCard} ${theme === 'dark' ? styles.themeCardActive : ''}`}
                onClick={() => handle.theme('dark')}
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
                  <IconMoon />
                  <span>Gelap</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── SECTION: Ukuran Font ──────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionLabelRow}>
            <span className={styles.sectionDot} />
            <p className={styles.sectionLabel}>Teks</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={`${styles.cardIconWrap} ${styles.cardIconAmber}`}>
                <IconText />
              </div>
              <div className={styles.cardTextWrap}>
                <p className={styles.cardTitle}>Ukuran Teks</p>
                <p className={styles.cardSub}>Sesuaikan ukuran huruf agar nyaman dibaca</p>
              </div>
            </div>
            <div className={styles.cardDivider} />

            {/* Font buttons */}
            <div className={styles.fontGroup} role="radiogroup" aria-label="Pilih ukuran teks">
              {(['small', 'medium', 'large'] as FontSize[]).map((size) => {
                const label = size === 'small' ? 'Kecil' : size === 'large' ? 'Besar' : 'Sedang'
                const glyphClass = size === 'small' ? styles.fontGlyphSm : size === 'large' ? styles.fontGlyphLg : styles.fontGlyphMd
                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={fontSize === size}
                    className={`${styles.fontBtn} ${fontSize === size ? styles.fontBtnActive : ''}`}
                    onClick={() => handle.fontSize(size)}
                  >
                    <span className={`${styles.fontGlyph} ${glyphClass} ${fontSize === size ? styles.fontGlyphActive : ''}`}>A</span>
                    <span className={`${styles.fontLabel} ${fontSize === size ? styles.fontLabelActive : ''}`}>{label}</span>
                    {fontSize === size && (
                      <span className={styles.fontCheckDot}>
                        <IconCheck />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

          </div>
        </div>

        {/* ── INFO CARD ─────────────────────────────────────────── */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardIcon}>ℹ️</div>
          <div className={styles.infoCardText}>
            <p className={styles.infoCardTitle}>Perubahan Otomatis Tersimpan</p>
            <p className={styles.infoCardSub}>Semua pengaturan langsung diterapkan dan disimpan secara otomatis di perangkat Anda.</p>
          </div>
        </div>

        {/* ── RESET BUTTON ──────────────────────────────────────── */}
        <button type="button" className={styles.resetBtn} onClick={handle.reset}>
          <IconReset />
          <span>Reset ke Pengaturan Awal</span>
        </button>

        {/* ── APP VERSION ───────────────────────────────────────── */}
        <div className={styles.versionRow}>
          <div className={styles.versionBadge}>
            <Image
              src="/icons/icon-48.png"
              alt="App Icon"
              width={20}
              height={20}
              className={styles.versionAppIcon}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span>PSMB Al-Istiqomah</span>
          </div>
          <span className={styles.versionText}>v1.0.0</span>
        </div>

      </div>

      {/* ══ BOTTOM NAV ════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconHomeFilled /></div>
          <span>Beranda</span>
        </Link>
        <Link href="/siswa/pembayaran" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconWalletOutline /></div>
          <span>Bayar</span>
        </Link>
        <Link href="/siswa/laporan" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconDocumentOutline /></div>
          <span>Status</span>
        </Link>
        <Link href="/siswa/profile" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconPersonOutline /></div>
          <span>Profil</span>
        </Link>
      </nav>

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