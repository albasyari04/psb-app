// app/admin/aktivitas/semua/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'
import {
  AktivitasItem,
  SkeletonItem,
  ActivityRow,
  globalKeyframes,
} from '../_components/shared'

const PAGE_SIZE = 20

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SemuaAktivitasPage() {
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

  const [items, setItems]             = useState<AktivitasItem[]>([])
  const [limit, setLimit]             = useState(PAGE_SIZE)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [hasMore, setHasMore]         = useState(true)

  const fetchItems = useCallback((currentLimit: number) => {
    return fetch(`/api/admin/aktivitas?limit=${currentLimit}`)
      .then(r => r.json())
      .then(d => {
        const data: AktivitasItem[] = d.data ?? []
        setItems(data)
        setHasMore(data.length >= currentLimit)
        setError(null)
      })
      .catch(() => {
        setError(isEn ? 'Failed to load activities' : 'Gagal memuat aktivitas')
      })
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }, [isEn])

  useEffect(() => {
    fetchItems(PAGE_SIZE)
  }, [fetchItems])

  const handleMuatLebih = () => {
    const next = limit + PAGE_SIZE
    setLimit(next)
    setLoadingMore(true)
    fetchItems(next)
  }

  const bgColor = isDark ? '#15131f' : '#ffffff'
  const textColor = isDark ? '#f1f0f5' : '#1a1033'
  const mutedColor = isDark ? '#94a3b8' : '#7c6fa0'
  const cardBg = isDark ? '#1e1b2e' : 'white'
  const cardBorder = isDark ? '1px solid #2e2a40' : '1px solid #f1f5f9'
  const headerBorder = isDark ? '1.5px solid #2e2a40' : '1.5px solid rgba(124, 58, 237, 0.18)'
  const activeTabColor = isDark ? '#a5b4fc' : '#7c3aed'
  const inactiveTabColor = isDark ? '#6b6885' : '#64748b'
  const backBtnBg = isDark ? '#1e1b2e' : 'white'
  const backBtnBorder = isDark ? '1px solid #2e2a40' : '1px solid #f1f5f9'
  const backBtnColor = isDark ? '#a5b4fc' : '#6d28d9'
  const loadMoreBg = isDark ? '#1e1b2e' : '#faf9ff'
  const loadMoreBorder = isDark ? '1px solid #2e2a40' : '1px solid #ede9fe'
  const loadMoreColor = isDark ? '#a5b4fc' : '#6d28d9'
  const loadMoreDisabledBg = isDark ? '#2e2a40' : '#f5f3ff'
  const errorColor = isDark ? '#fca5a5' : '#ef4444'

  return (
    <div>
      <style>{globalKeyframes}</style>

      <div style={{ background: bgColor, minHeight: '100vh' }}>

        {/* ── HEADER (sticky, tidak ikut scroll) ────────────── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: bgColor,
          padding: '20px 16px 16px',
          borderBottom: headerBorder,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/admin/aktivitas" style={{ 
                width: 44, height: 44, borderRadius: 16,
                background: backBtnBg, 
                border: backBtnBorder, 
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15,23,42,0.05)',
                color: backBtnColor,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </Link>
              <div>
                <h1 style={{ 
                  margin: 0, fontSize: 24, fontWeight: 900, 
                  color: textColor, letterSpacing: '-0.03em' 
                }}>
                  {isEn ? 'All Activities' : 'Semua Aktivitas'}
                </h1>
                <p style={{ 
                  margin: '2px 0 0', fontSize: 12.5, 
                  color: mutedColor, lineHeight: 1.4 
                }}>
                  {isEn ? 'Complete activity history and admin actions' : 'Seluruh riwayat aktivitas dan tindakan admin'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── KONTEN (scrollable) ────────────────────────────── */}
        <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── TAB: Aktivitas Terbaru / Lihat semua ──────────── */}
          <div style={{ 
            background: cardBg, 
            borderRadius: 16, 
            border: cardBorder,
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15,23,42,0.05)', 
            display: 'flex', overflow: 'hidden' 
          }}>
            <Link href="/admin/aktivitas" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 10px', textDecoration: 'none',
              borderBottom: '2.5px solid transparent',
              color: inactiveTabColor,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span style={{ fontWeight: 600, fontSize: 13.5, color: inactiveTabColor }}>
                {isEn ? 'Recent Activities' : 'Aktivitas Terbaru'}
              </span>
            </Link>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '14px 10px',
              borderBottom: `2.5px solid ${activeTabColor}`,
              color: activeTabColor,
            }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: activeTabColor }}>
                {isEn ? 'View all' : 'Lihat semua'}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>

          {/* ── Activity List ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} dark={isDark} />)
            ) : error ? (
              <div style={{
                textAlign: 'center', padding: '40px 0',
                color: errorColor, fontSize: 14, fontWeight: 500,
                background: cardBg, borderRadius: 16, border: cardBorder,
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
                {error}
              </div>
            ) : items.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 0',
                color: mutedColor, fontSize: 14,
                background: cardBg, borderRadius: 16, border: cardBorder,
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                {isEn ? 'No activities yet' : 'Belum ada aktivitas'}
              </div>
            ) : (
              <>
                {items.map((item, i) => (
                  <ActivityRow 
                    key={item.id} 
                    item={item} 
                    index={i % PAGE_SIZE} 
                    dark={isDark}
                    isEn={isEn}
                  />
                ))}

                {hasMore && (
                  <button
                    onClick={handleMuatLebih}
                    disabled={loadingMore}
                    style={{
                      marginTop: 4,
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: loadMoreBorder,
                      background: loadingMore ? loadMoreDisabledBg : loadMoreBg,
                      color: loadMoreColor,
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: loadingMore ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                    }}
                  >
                    {loadingMore 
                      ? (isEn ? 'Loading...' : 'Memuat...') 
                      : (isEn ? 'Load more' : 'Muat lebih banyak')}
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}