'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AktivitasItem,
  SkeletonItem,
  ActivityRow,
  globalKeyframes,
} from './_components/shared'

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AktivitasPage() {
  const [items, setItems]     = useState<AktivitasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/aktivitas?limit=20')
      .then(r => r.json())
      .then(d => {
        setItems(d.data ?? [])
        setError(null)
      })
      .catch(() => {
        setError('Gagal memuat aktivitas')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <style>{globalKeyframes}</style>

      <div style={{ background: '#ffffff', minHeight: '100vh' }}>

        {/* ── HEADER (sticky, tidak ikut scroll) ────────────── */}
        <div style={{
            position: 'sticky', top: 0, zIndex: 20,
            background: '#ffffff',
            padding: '20px 16px 16px',
            borderBottom: '1.5px solid rgba(124, 58, 237, 0.18)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => window.history.back()} style={{ width: 44, height: 44, borderRadius: 16,
                  background: 'white', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1a1033', letterSpacing: '-0.03em' }}>
                  Aktivitas
                </h1>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#7c6fa0', lineHeight: 1.4 }}>
                  Log aktivitas terbaru dan tindakan admin
                </p>
              </div>
            </div>
            <button style={{ width: 44, height: 44, borderRadius: 16, background: 'white',
                border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── KONTEN (scrollable) ────────────────────────────── */}
        <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── TAB: Aktivitas Terbaru / Lihat semua ──────────── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
              boxShadow: '0 2px 8px rgba(15,23,42,0.05)', display: 'flex', overflow: 'hidden' }}>
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 10px',
                borderBottom: '2.5px solid #7c3aed',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: '#6d28d9' }}>Aktivitas Terbaru</span>
            </div>
            <Link href="/admin/aktivitas/semua" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '14px 10px', textDecoration: 'none',
                borderBottom: '2.5px solid transparent',
              }}>
              <span style={{ fontWeight: 600, fontSize: 13.5, color: '#64748b' }}>Lihat semua</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          {/* ── Activity List ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
            ) : error ? (
              <div style={{
                textAlign: 'center', padding: '40px 0',
                color: '#ef4444', fontSize: 14, fontWeight: 500,
                background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
                {error}
              </div>
            ) : items.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 0',
                color: '#94a3b8', fontSize: 14,
                background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                Belum ada aktivitas
              </div>
            ) : (
              items.map((item, i) => (
                <ActivityRow key={item.id} item={item} index={i} />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}