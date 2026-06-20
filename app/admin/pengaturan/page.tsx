'use client'

import { useEffect, useState } from 'react'
import AdminPageShell from '../AdminPageShell'
import { useSettings, type FontSize, type Theme } from '@/contexts/SettingsContext'
import type { Language } from '@/lib/i18n'
import styles from './pengaturan.module.css'

// ── Icons (inline SVG, ikut pola AdminBottomNav) ────────────────────────────
function IconLanguage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="1.8" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="#7c3aed" strokeWidth="1.8" />
    </svg>
  )
}

function IconTheme() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"
        fill="rgba(124,58,237,0.16)"
        stroke="#7c3aed"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFont() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 19 9.5 6h1L15 19M6.2 15.5h7.6" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 19l3-7 3 7M17 16.5h4" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.5" stroke="#f59e0b" strokeWidth="2" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

function IconReset() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 1 0 2.6-6.3M3 4v5h5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PengaturanPage() {
  // Semua state sekarang datang dari context global, BUKAN useState lokal.
  // Perubahan di sini langsung terlihat di seluruh aplikasi (lewat
  // data-theme & data-font-size di <html>), bukan hanya di halaman ini.
  const {
    theme,
    language,
    fontSize,
    setTheme,
    setLanguage,
    setFontSize,
    resetSettings,
    t,
    ready,
  } = useSettings()

  const [showToast, setShowToast] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Tampilkan toast setiap kali salah satu setting berubah (bukan saat load awal)
  useEffect(() => {
    if (!ready || !hasInteracted) return
    setShowToast(true)
    const timer = setTimeout(() => setShowToast(false), 1600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, language, fontSize, ready])

  const handleSetTheme = (value: Theme) => {
    setHasInteracted(true)
    setTheme(value)
  }

  const handleSetLanguage = (value: Language) => {
    setHasInteracted(true)
    setLanguage(value)
  }

  const handleSetFontSize = (value: FontSize) => {
    setHasInteracted(true)
    setFontSize(value)
  }

  const handleReset = () => {
    setHasInteracted(true)
    resetSettings()
  }

  // Belum siap (localStorage belum dibaca) — render shell kosong agar tidak flicker
  if (!ready) {
    return (
      <AdminPageShell title={t('settings_title')} subtitle={t('settings_subtitle')}>
        <div style={{ minHeight: 200 }} />
      </AdminPageShell>
    )
  }

  const fontPreviewTextClass =
    fontSize === 'small'
      ? styles.previewBoxTextSmall
      : fontSize === 'large'
      ? styles.previewBoxTextLarge
      : styles.previewBoxTextMedium

  const fontPreviewSubClass =
    fontSize === 'small'
      ? styles.previewBoxSubSmall
      : fontSize === 'large'
      ? styles.previewBoxSubLarge
      : styles.previewBoxSubMedium

  return (
    <AdminPageShell title={t('settings_title')} subtitle={t('settings_subtitle')}>
      {/* ── Bahasa ─────────────────────────────────────────────── */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>{t('settings_section_language')}</p>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardIconWrap}>
              <IconLanguage />
            </div>
            <div className={styles.cardTextWrap}>
              <p className={styles.cardTitle}>{t('settings_language_title')}</p>
              <p className={styles.cardSub}>{t('settings_language_sub')}</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.segment} role="tablist" aria-label="Pilih bahasa">
              <button
                type="button"
                role="tab"
                aria-selected={language === 'id'}
                className={`${styles.segmentBtn} ${language === 'id' ? styles.segmentBtnActive : ''}`}
                onClick={() => handleSetLanguage('id')}
              >
                🇮🇩 Indonesia
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={language === 'en'}
                className={`${styles.segmentBtn} ${language === 'en' ? styles.segmentBtnActive : ''}`}
                onClick={() => handleSetLanguage('en')}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tampilan (Tema) ───────────────────────────────────────── */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>{t('settings_section_display')}</p>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardIconWrap}>
              <IconTheme />
            </div>
            <div className={styles.cardTextWrap}>
              <p className={styles.cardTitle}>{t('settings_theme_title')}</p>
              <p className={styles.cardSub}>{t('settings_theme_sub')}</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.themeGrid}>
              <div
                role="button"
                tabIndex={0}
                aria-pressed={theme === 'light'}
                className={`${styles.themeOption} ${theme === 'light' ? styles.themeOptionActive : ''}`}
                onClick={() => handleSetTheme('light')}
                onKeyDown={(e) => e.key === 'Enter' && handleSetTheme('light')}
              >
                <div className={`${styles.themePreview} ${styles.themePreviewLight}`}>
                  <span className={styles.themePreviewBar} />
                  <span className={styles.themePreviewLine} style={{ top: 22 }} />
                  <span className={styles.themePreviewLine} style={{ top: 30 }} />
                </div>
                <div className={styles.themeOptionLabelRow}>
                  <IconSun />
                  <span className={styles.themeOptionLabel}>{t('settings_theme_light')}</span>
                  {theme === 'light' && (
                    <span className={styles.themeCheck}>
                      <IconCheck />
                    </span>
                  )}
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-pressed={theme === 'dark'}
                className={`${styles.themeOption} ${theme === 'dark' ? styles.themeOptionActive : ''}`}
                onClick={() => handleSetTheme('dark')}
                onKeyDown={(e) => e.key === 'Enter' && handleSetTheme('dark')}
              >
                <div className={`${styles.themePreview} ${styles.themePreviewDark}`}>
                  <span className={styles.themePreviewBar} />
                  <span className={styles.themePreviewLine} style={{ top: 22 }} />
                  <span className={styles.themePreviewLine} style={{ top: 30 }} />
                </div>
                <div className={styles.themeOptionLabelRow}>
                  <IconMoon />
                  <span className={styles.themeOptionLabel}>{t('settings_theme_dark')}</span>
                  {theme === 'dark' && (
                    <span className={styles.themeCheck}>
                      <IconCheck />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ukuran Font ────────────────────────────────────────────── */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>{t('settings_section_text')}</p>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardIconWrap}>
              <IconFont />
            </div>
            <div className={styles.cardTextWrap}>
              <p className={styles.cardTitle}>{t('settings_font_title')}</p>
              <p className={styles.cardSub}>{t('settings_font_sub')}</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.fontGroup} role="radiogroup" aria-label="Pilih ukuran font">
              <button
                type="button"
                role="radio"
                aria-checked={fontSize === 'small'}
                className={`${styles.fontBtn} ${fontSize === 'small' ? styles.fontBtnActive : ''}`}
                onClick={() => handleSetFontSize('small')}
              >
                <span className={`${styles.fontBtnGlyph} ${styles.fontBtnGlyphSmall}`}>A</span>
                <span className={styles.fontBtnLabel}>{t('settings_font_small')}</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={fontSize === 'medium'}
                className={`${styles.fontBtn} ${fontSize === 'medium' ? styles.fontBtnActive : ''}`}
                onClick={() => handleSetFontSize('medium')}
              >
                <span className={`${styles.fontBtnGlyph} ${styles.fontBtnGlyphMedium}`}>A</span>
                <span className={styles.fontBtnLabel}>{t('settings_font_medium')}</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={fontSize === 'large'}
                className={`${styles.fontBtn} ${fontSize === 'large' ? styles.fontBtnActive : ''}`}
                onClick={() => handleSetFontSize('large')}
              >
                <span className={`${styles.fontBtnGlyph} ${styles.fontBtnGlyphLarge}`}>A</span>
                <span className={styles.fontBtnLabel}>{t('settings_font_large')}</span>
              </button>
            </div>

            {/* Live preview */}
            <div className={styles.previewBox}>
              <p className={styles.previewBoxLabel}>{t('settings_preview_label')}</p>
              <p className={`${styles.previewBoxText} ${fontPreviewTextClass}`}>
                {t('settings_preview_title')}
              </p>
              <p className={`${styles.previewBoxSub} ${fontPreviewSubClass}`}>
                {t('settings_preview_sub')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reset ──────────────────────────────────────────────────── */}
      <button type="button" className={styles.resetBtn} onClick={handleReset}>
        <IconReset />
        {t('settings_reset')}
      </button>

      {/* ── Toast konfirmasi tersimpan ───────────────────────────────── */}
      {showToast && (
        <div className={styles.saveToast} role="status">
          ✓ {t('settings_saved_toast')}
        </div>
      )}
    </AdminPageShell>
  )
}