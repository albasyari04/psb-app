'use client'

// contexts/SettingsContext.tsx
//
// Context global untuk Theme (light/dark), Language (id/en), dan FontSize.
// Wrap komponen ini di root layout (app/layout.tsx) agar semua halaman
// bisa baca & ubah setting yang sama.
//
// Cara pakai di komponen lain:
//   const { theme, language, fontSize, setTheme, setLanguage, setFontSize, t } = useSettings()
//   <p>{t('nav_beranda')}</p>

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translations, type Language, type TranslationKey } from '@/lib/i18n'

// ── Types ───────────────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark'
export type FontSize = 'small' | 'medium' | 'large'

interface SettingsState {
  theme: Theme
  language: Language
  fontSize: FontSize
}

interface SettingsContextValue extends SettingsState {
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  setFontSize: (fontSize: FontSize) => void
  resetSettings: () => void
  t: (key: TranslationKey) => string
  ready: boolean
}

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'light',
  language: 'id',
  fontSize: 'medium',
}

const STORAGE_KEY = 'psb_admin_settings'

const FONT_SCALE: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

// ── Provider ─────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)

  // Load tersimpan dari localStorage sekali saat mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // localStorage tidak tersedia / data korup — pakai default
    } finally {
      setReady(true)
    }
  }, [])

  // Terapkan ke DOM (attribute di <html>) + simpan ke localStorage
  useEffect(() => {
    if (!ready) return

    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme)
    root.setAttribute('data-font-size', settings.fontSize)
    root.style.setProperty('--app-font-size-base', FONT_SCALE[settings.fontSize])
    root.setAttribute('lang', settings.language)

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore write errors (private mode, storage full, dll)
    }
  }, [settings, ready])

  const setTheme = useCallback((theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }))
  }, [])

  const setLanguage = useCallback((language: Language) => {
    setSettings((prev) => ({ ...prev, language }))
  }, [])

  const setFontSize = useCallback((fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[settings.language][key] ?? translations.id[key] ?? key
    },
    [settings.language]
  )

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setTheme,
      setLanguage,
      setFontSize,
      resetSettings,
      t,
      ready,
    }),
    [settings, setTheme, setLanguage, setFontSize, resetSettings, t, ready]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings() harus dipakai di dalam <SettingsProvider>')
  }
  return ctx
}