'use client'

// app/admin/verifikasi/VerifikasiHeader.tsx
//
// Dipisah dari page.tsx (Server Component) karena useSettings() adalah
// React Context — Context hanya bisa dipakai di Client Component
// ('use client'). Server Component (VerifikasiPage) tetap yang fetch data
// ke Supabase, lalu teks-teks UI-nya dirender lewat komponen client kecil
// ini supaya ikut bahasa & tema aktif.

import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'

export function VerifikasiHeader() {
  const { t } = useSettings()
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        padding: '20px 16px 18px',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 6px 20px rgba(109,61,245,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Link
          href="/admin/dashboard"
          aria-label={t('settings_back_home')}
          className="no-underline"
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: 'var(--purple-lighter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="var(--violet-1)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--ink)',
              letterSpacing: '-0.3px',
            }}
          >
            {t('verifikasi_title')}
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13.5,
              color: 'var(--gray-light)',
            }}
          >
            {t('verifikasi_sub')}
          </p>
        </div>
      </div>
    </div>
  )
}

export function VerifikasiEmptyState() {
  const { t } = useSettings()
  return (
    <div className="vrk-empty">
      <div className="vrk-empty-ring">
        <div className="vrk-empty-inner">🎉</div>
      </div>
      <h2 className="vrk-empty-title">{t('verifikasi_empty_title')}</h2>
      <p className="vrk-empty-sub">{t('verifikasi_empty_sub')}</p>
      <Link href="/admin/pendaftar" className="vrk-btn-outline no-underline">
        <span>📋</span> {t('verifikasi_see_all')}
      </Link>
    </div>
  )
}

export function useVerifikasiLabels() {
  const { t } = useSettings()
  return {
    waiting: t('verifikasi_waiting_label'),
    processing: t('verifikasi_processing_label'),
    badgeWaiting: t('verifikasi_badge_waiting'),
    badgeProcessing: t('verifikasi_badge_processing'),
    cta: t('verifikasi_review_cta'),
  }
}