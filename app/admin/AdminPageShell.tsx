'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useSettings } from '@/contexts/SettingsContext'

interface AdminPageShellProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function AdminPageShell({ title, subtitle, actions, children }: AdminPageShellProps) {
  const { t } = useSettings()

  return (
    <div className="app-shell" style={{ padding: '20px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 22 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: '#64748b', fontSize: 12, letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
            {t('settings_admin_label')}
          </p>
          <h1 style={{ fontSize: 28, lineHeight: 1.05, margin: 0, fontWeight: 800, color: '#111827' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: '#475569', fontSize: 13, marginTop: 10, maxWidth: 360, lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          {actions}
          <Link href="/admin/dashboard" style={{ color: '#7c3aed', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            {t('settings_back_home')}
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}