'use client'

// app/admin/verifikasi/VerifikasiSection.tsx
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'
import type { Pendaftaran } from '@/types'

const avatarGradients = [
  'vrk-av-violet',
  'vrk-av-amber',
  'vrk-av-blue',
  'vrk-av-rose',
  'vrk-av-emerald',
]

export function VerifikasiSection({
  urgency,
  count,
  items,
  offsetIdx = 0,
}: {
  urgency: 'high' | 'medium'
  count: number
  items: Pendaftaran[]
  offsetIdx?: number
}) {
  const { t } = useSettings()
  if (count === 0) return null

  const isHigh = urgency === 'high'

  return (
    <section className="vrk-section">
      <div className="vrk-section-head">
        <div className={`vrk-section-label ${isHigh ? 'vrk-label-amber' : 'vrk-label-blue'}`}>
          <span className={`vrk-label-dot ${isHigh ? 'vrk-label-dot-amber' : 'vrk-label-dot-blue'}`} />
          {isHigh ? t('verifikasi_waiting_label') : t('verifikasi_processing_label')}
        </div>
        <span className={`vrk-count-badge ${isHigh ? 'vrk-count-amber' : 'vrk-count-blue'}`}>{count}</span>
      </div>
      <div className="vrk-cards">
        {items.map((p, i) => (
          <VerifikasiCard
            key={p.id}
            p={p}
            avatarIdx={i + offsetIdx}
            urgency={urgency}
            isLast={i === count - 1}
          />
        ))}
      </div>
    </section>
  )
}

function VerifikasiCard({
  p, avatarIdx, urgency, isLast,
}: {
  p: Pendaftaran
  avatarIdx: number
  urgency: 'high' | 'medium'
  isLast: boolean
}) {
  const { t } = useSettings()
  const avatarCls = avatarGradients[avatarIdx % avatarGradients.length]
  const isHigh = urgency === 'high'

  const date = p.created_at
    ? new Date(p.created_at).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '-'

  return (
    <Link
      href={'/admin/pendaftar/' + p.id}
      className={'vrk-card no-underline' + (!isLast ? ' vrk-card-divider' : '')}
    >
      <div className={'vrk-avatar ' + avatarCls}>
        {p.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
      <div className="vrk-card-info">
        <p className="vrk-card-name">{p.nama_lengkap}</p>
        <div className="vrk-card-meta">
          <span className="vrk-meta-date">{date}</span>
        </div>
      </div>
      <div className="vrk-card-right">
        {isHigh ? (
          <span className="vrk-badge vrk-badge-amber">
            <span className="vrk-badge-dot vrk-badge-dot-amber" />
            {t('verifikasi_badge_waiting')}
          </span>
        ) : (
          <span className="vrk-badge vrk-badge-blue">
            <span className="vrk-badge-dot vrk-badge-dot-blue" />
            {t('verifikasi_badge_processing')}
          </span>
        )}
        <span className="vrk-cta">{t('verifikasi_review_cta')}</span>
      </div>
    </Link>
  )
}