'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusFilter = 'semua' | 'menunggu' | 'diproses' | 'diterima' | 'ditolak'
type SortOrder    = 'terbaru' | 'terlama' | 'nama'

interface PendaftarItem {
  id:           string
  nama_lengkap: string
  nisn:         string
  asal_sekolah: string
  status:       string
  created_at:   string
}

interface StatsData {
  total:    number
  menunggu: number
  diproses: number
  diterima: number
  ditolak:  number
}

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  menunggu: { label: 'Menunggu',  color: '#d97706', bg: '#fffbeb', dot: '#f59e0b', border: '#fde68a' },
  diproses: { label: 'Diproses',  color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6', border: '#bfdbfe' },
  diterima: { label: 'Diterima',  color: '#059669', bg: '#f0fdf4', dot: '#10b981', border: '#a7f3d0' },
  ditolak:  { label: 'Ditolak',   color: '#dc2626', bg: '#fff5f5', dot: '#ef4444', border: '#fca5a5' },
}

// ─── Avatar Colors ────────────────────────────────────────────────────────────
const AV_COLORS = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#e0f2fe', text: '#0369a1' },
]
function getAvatarColor(name: string) {
  return AV_COLORS[(name?.charCodeAt(0) ?? 65) % AV_COLORS.length]
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconXCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconDots = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
)

// ─── Nav SVG Icons ─────────────────────────────────────────────────────────────
const NavHome = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const NavPendaftar = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#6366f1' : 'none'} stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none"/>
  </svg>
)
const NavPendaftaran = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
)
const NavLaporan = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const NavProfil = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, sub, value, icon, iconBg, iconColor, borderColor, onClick, active,
}: {
  label: string; sub: string; value: number
  icon: React.ReactNode; iconBg: string; iconColor: string; borderColor: string
  onClick?: () => void; active?: boolean
}) {
  return (
    <button
      className={`stat-card${active ? ' stat-card--active' : ''}`}
      style={active ? { borderColor } : {}}
      onClick={onClick}
    >
      <div className="stat-icon-wrap" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </button>
  )
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  background: #f0f2f8;
  overflow-x: hidden;
  width: 100%;
}

.pnd-root {
  height: 100dvh;
  background: #f0f2f8;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 430px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Topbar ── */
.pnd-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem 0.85rem;
  background: #ffffff;
  border-bottom: 1px solid #e9eef2;
  box-shadow: 0 2px 12px rgba(109, 40, 217, 0.06);
  flex-shrink: 0;
}

/* ── Sticky header wrapper ── */
.pnd-sticky-header {
  flex-shrink: 0;
  background: #ffffff;
  z-index: 50;
}

/* ── Scrollable content ── */
.pnd-scroll-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}
.pnd-topbar-left { display: flex; align-items: center; gap: 12px; }
.pnd-topbar-back-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: #f5f3ff;
  border: 1.5px solid #ede9fe;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #6d28d9;
  text-decoration: none;
  flex-shrink: 0;
  transition: background 0.18s, transform 0.18s;
}
.pnd-topbar-back-btn:hover { background: #ede9fe; transform: translateX(-2px); }
.pnd-topbar-menu-btn {
  width: 38px; height: 38px; border-radius: 12px;
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.pnd-topbar-title-wrap h1 { font-size: 1.05rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; line-height: 1.2; margin: 0; }
.pnd-topbar-title-wrap p  { font-size: 0.68rem; color: #94a3b8; font-weight: 500; margin: 0.1rem 0 0; }
.pnd-notif-btn {
  width: 38px; height: 38px; border-radius: 12px;
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  text-decoration: none;
  position: relative;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.pnd-notif-badge {
  position: absolute; top: 7px; right: 7px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #6366f1;
  border: 1.5px solid #fff;
}

/* ── Stats Grid ── */
.pnd-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 18px 16px 0;
}
.stat-card {
  background: #fff;
  border-radius: 18px;
  padding: 13px 8px 11px;
  display: flex; flex-direction: column;
  align-items: center; gap: 5px;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  text-align: center;
  min-width: 0;
}
.stat-card:active { transform: scale(0.95); }
.stat-card--active {
  box-shadow: 0 4px 16px rgba(99,102,241,0.15);
}
.stat-icon-wrap {
  width: 36px; height: 36px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-value { font-size: 21px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-top: 2px; }
.stat-label { font-size: 9px; font-weight: 700; color: #374151; line-height: 1.3; }
.stat-sub   { font-size: 8px; color: #94a3b8; font-weight: 500; line-height: 1.2; }

/* ── Search ── */
.pnd-search-row {
  display: flex; gap: 8px; align-items: center;
  padding: 14px 16px 0;
}
.pnd-search-box {
  flex: 1; width: 100%; height: 46px;
  display: flex; align-items: center; gap: 9px;
  background: #fff;
  border: 1.5px solid #e8ecf2;
  border-radius: 14px;
  padding: 0 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: border-color 0.18s, box-shadow 0.18s;
  color: #c4cdd6;
}
.pnd-search-box:focus-within {
  border-color: #6366f1;
  color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
}
.pnd-search-box input {
  flex: 1; border: none; outline: none;
  font-size: 13px; color: #0f172a;
  font-family: inherit; background: transparent;
}
.pnd-search-box input::placeholder { color: #c4cdd6; font-weight: 500; }

/* ── Tabs ── */
.pnd-tabs {
  display: flex; gap: 7px; align-items: center;
  padding: 12px 16px 0;
  overflow-x: auto; scrollbar-width: none;
}
.pnd-tabs::-webkit-scrollbar { display: none; }
.pnd-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 22px;
  font-size: 12.5px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  border: 1.5px solid transparent;
  font-family: inherit;
  transition: all 0.2s;
  flex-shrink: 0;
}
.pnd-tab--off  { background: #fff; color: #64748b; border-color: #e8ecf2; }
.pnd-tab--off:hover { border-color: #c7d2fe; color: #4f46e5; }
.pnd-tab--on   { background: #6366f1; color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.35); }
.pnd-tab--diterima-on { background: #fff; color: #059669; border-color: #a7f3d0; }
.pnd-tab--ditolak-on  { background: #fff; color: #dc2626; border-color: #fca5a5; }
.pnd-tab-badge {
  min-width: 20px; height: 20px;
  border-radius: 10px; font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; padding: 0 5px;
}
.pnd-tab--on .pnd-tab-badge           { background: rgba(255,255,255,0.22); color: #fff; }
.pnd-tab--off .pnd-tab-badge          { background: #f1f5f9; color: #475569; }
.pnd-tab--diterima-on .pnd-tab-badge  { background: #d1fae5; color: #059669; }
.pnd-tab--ditolak-on .pnd-tab-badge   { background: #fee2e2; color: #dc2626; }

/* Sort bar */
.pnd-sort-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 0;
}
.pnd-result-text { font-size: 12.5px; color: #64748b; font-weight: 600; }
.pnd-sort-wrap   { position: relative; }
.pnd-sort-btn {
  display: flex; align-items: center; gap: 5px;
  background: #fff;
  border: 1.5px solid #e8ecf2;
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 12px; font-weight: 700; color: #475569;
  cursor: pointer; font-family: inherit;
  transition: all 0.18s;
}
.pnd-sort-btn:hover { border-color: #6366f1; color: #4f46e5; }
.pnd-sort-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: #fff;
  border: 1.5px solid #e8ecf2;
  border-radius: 14px;
  overflow: hidden; z-index: 50;
  min-width: 150px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.10);
}
.pnd-sort-opt {
  display: block; width: 100%; text-align: left;
  padding: 11px 16px; border: none; background: none;
  font-size: 12.5px; font-weight: 600; color: #1e293b;
  cursor: pointer; font-family: inherit; transition: background 0.12s;
}
.pnd-sort-opt:hover  { background: #f8fafc; }
.pnd-sort-opt--on    { color: #6366f1; font-weight: 700; background: #eef2ff; }

/* ── List ── */
.pnd-list {
  padding: 10px 16px 0;
  display: flex; flex-direction: column; gap: 10px;
}

/* ── Item Card ── */
.pnd-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 14px;
  display: flex; align-items: flex-start; gap: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.055);
  border: 1.5px solid #f1f5f9;
  transition: box-shadow 0.2s, transform 0.2s;
}
.pnd-card:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.09);
  transform: translateY(-1px);
}
.pnd-card-av {
  width: 46px; height: 46px; border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 900; flex-shrink: 0;
}
.pnd-card-body { flex: 1; min-width: 0; }
.pnd-card-top-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 6px;
}
.pnd-card-name-wrap { flex: 1; min-width: 0; }
.pnd-card-name {
  font-size: 14px; font-weight: 800; color: #0f172a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pnd-card-school {
  font-size: 11.5px; color: #64748b; font-weight: 500; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pnd-card-right-col {
  display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0;
}
.pnd-status-pill {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 4px 9px;
  font-size: 10.5px; font-weight: 700;
  border: 1px solid transparent;
}
.pnd-status-pill-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
}
.pnd-card-date {
  font-size: 10px; color: #94a3b8; text-align: right;
  white-space: pre-line; line-height: 1.5; font-weight: 500;
}
.pnd-card-bottom-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 8px;
}
.pnd-card-nisn {
  display: inline-flex; align-items: center;
  background: #f4f6fa;
  border-radius: 7px;
  padding: 3px 9px;
  font-size: 10.5px; font-weight: 700; color: #475569;
  letter-spacing: 0.2px;
}
.pnd-card-actions {
  display: flex; align-items: center; gap: 5px;
}
.pnd-detail-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: #f4f6fa;
  border: 1.5px solid #e8ecf2;
  border-radius: 9px;
  padding: 5px 11px;
  font-size: 11px; font-weight: 700; color: #475569;
  cursor: pointer; font-family: inherit;
  transition: all 0.18s;
}
.pnd-detail-btn:hover { background: #eef2ff; border-color: #c7d2fe; color: #4f46e5; }
.pnd-dots-btn {
  width: 30px; height: 30px; border-radius: 9px;
  background: #f4f6fa;
  border: 1.5px solid #e8ecf2;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8;
  transition: all 0.18s;
}
.pnd-dots-btn:hover { background: #eef2ff; border-color: #c7d2fe; color: #6366f1; }

/* ── Loading & Empty ── */
.pnd-loading-wrap {
  padding: 56px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.pnd-spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0; border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pnd-loading-text { font-size: 13px; font-weight: 600; color: #94a3b8; }
.pnd-empty {
  padding: 56px 16px; text-align: center;
}
.pnd-empty-icon { font-size: 48px; margin-bottom: 12px; }
.pnd-empty h3   { font-size: 15px; font-weight: 800; color: #475569; }
.pnd-empty p    { font-size: 12.5px; color: #94a3b8; margin-top: 6px; font-weight: 500; }

/* ── Bottom Nav ── */
.pnd-bottom-nav {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 430px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  padding: 8px 0 env(safe-area-inset-bottom, 8px);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.07);
  z-index: 100;
}
.pnd-nav-btn {
  flex: 1; border: none; background: none;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 4px 0 2px; cursor: pointer; font-family: inherit;
  font-size: 10px; font-weight: 600; color: #94a3b8;
  transition: color 0.18s;
}
.pnd-nav-btn--active { color: #6366f1; }
.pnd-nav-icon {
  width: 42px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px;
  transition: background 0.18s;
}
.pnd-nav-btn--active .pnd-nav-icon {
  background: #eef2ff;
}
`

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PendaftarPage() {
  const router = useRouter()

  const [items,     setItems]     = useState<PendaftarItem[]>([])
  const [stats,     setStats]     = useState<StatsData>({ total: 0, menunggu: 0, diproses: 0, diterima: 0, ditolak: 0 })
  const [statusTab, setStatusTab] = useState<StatusFilter>('semua')
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState<SortOrder>('terbaru')
  const [page,      setPage]      = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [showSort,  setShowSort]  = useState(false)

  const limit = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), status: statusTab })
      const res  = await fetch(`/api/admin/pendaftaran?${params}`)
      const json = await res.json()
      if (!res.ok) return
      setItems(json.data ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, statusTab])

  const fetchStats = useCallback(async () => {
    try {
      const statuses: StatusFilter[] = ['semua', 'menunggu', 'diproses', 'diterima', 'ditolak']
      const results = await Promise.all(
        statuses.map(s => fetch(`/api/admin/pendaftaran?status=${s}&limit=1`).then(r => r.json()))
      )
      setStats({
        total:    results[0].total ?? 0,
        menunggu: results[1].total ?? 0,
        diproses: results[2].total ?? 0,
        diterima: results[3].total ?? 0,
        ditolak:  results[4].total ?? 0,
      })
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => { fetchData(); fetchStats() }, [fetchData, fetchStats])

  const filtered = items.filter(it =>
    it.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
    it.nisn?.includes(search) ||
    it.asal_sekolah?.toLowerCase().includes(search.toLowerCase())
  )
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'nama')    return a.nama_lengkap.localeCompare(b.nama_lengkap)
    if (sort === 'terlama') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'semua',    label: 'Semua',    count: stats.total    },
    { key: 'menunggu', label: 'Menunggu', count: stats.menunggu },
    { key: 'diterima', label: 'Diterima', count: stats.diterima },
    { key: 'ditolak',  label: 'Ditolak',  count: stats.ditolak  },
  ]

  function tabCls(key: StatusFilter) {
    if (statusTab !== key) return 'pnd-tab pnd-tab--off'
    if (key === 'diterima') return 'pnd-tab pnd-tab--diterima-on'
    if (key === 'ditolak')  return 'pnd-tab pnd-tab--ditolak-on'
    return 'pnd-tab pnd-tab--on'
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="pnd-root">

        {/* ── STICKY HEADER (tidak ikut scroll) ── */}
        <div className="pnd-sticky-header">

        {/* ── Topbar ── */}
        <div className="pnd-topbar">
          <div className="pnd-topbar-left">
            <Link href="/admin" className="pnd-topbar-back-btn">
              <IconArrowLeft />
            </Link>
            <div className="pnd-topbar-title-wrap">
              <h1>Pendaftar</h1>
              <p>Kelola data pendaftar</p>
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f8fafc',
            border: '1.5px solid #e9eef2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#6d28d9', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
        </div>

        </div>{/* end pnd-sticky-header */}

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="pnd-scroll-content">

        {/* ── Stats ── */}
        <div className="pnd-stats">
          <StatCard
            label="Total Pendaftar" sub="Semua data"
            value={stats.total} icon={<IconUsers />}
            iconBg="#ede9fe" iconColor="#7c3aed" borderColor="#a78bfa"
            onClick={() => setStatusTab('semua')} active={statusTab === 'semua'}
          />
          <StatCard
            label="Menunggu Verifikasi" sub="Perlu diperiksa"
            value={stats.menunggu} icon={<IconClock />}
            iconBg="#fef3c7" iconColor="#d97706" borderColor="#fbbf24"
            onClick={() => setStatusTab('menunggu')} active={statusTab === 'menunggu'}
          />
          <StatCard
            label="Diterima" sub="Pendaftar lulus"
            value={stats.diterima} icon={<IconCheckCircle />}
            iconBg="#d1fae5" iconColor="#059669" borderColor="#34d399"
            onClick={() => setStatusTab('diterima')} active={statusTab === 'diterima'}
          />
          <StatCard
            label="Ditolak" sub="Pendaftar ditolak"
            value={stats.ditolak} icon={<IconXCircle />}
            iconBg="#fee2e2" iconColor="#dc2626" borderColor="#f87171"
            onClick={() => setStatusTab('ditolak')} active={statusTab === 'ditolak'}
          />
        </div>

        {/* ── Search Row ── */}
        <div className="pnd-search-row">
          <div className="pnd-search-box">
            <IconSearch />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau sekolah"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="pnd-tabs">
          {tabs.map(t => (
            <button key={t.key} className={tabCls(t.key)} onClick={() => { setStatusTab(t.key); setPage(1) }}>
              {t.label}
              <span className="pnd-tab-badge">{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── Sort Bar ── */}
        <div className="pnd-sort-bar">
          <span className="pnd-result-text">
            {loading ? '—' : `${sorted.length} pendaftar ditemukan`}
          </span>
          <div className="pnd-sort-wrap">
            <button className="pnd-sort-btn" onClick={() => setShowSort(v => !v)}>
              {sort === 'terbaru' ? 'Terbaru' : sort === 'terlama' ? 'Terlama' : 'Nama A–Z'}
              <IconChevronDown />
            </button>
            {showSort && (
              <div className="pnd-sort-dropdown">
                {([['terbaru', 'Terbaru'], ['terlama', 'Terlama'], ['nama', 'Nama A–Z']] as [SortOrder, string][]).map(([k, l]) => (
                  <button
                    key={k}
                    className={`pnd-sort-opt${sort === k ? ' pnd-sort-opt--on' : ''}`}
                    onClick={() => { setSort(k); setShowSort(false) }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── List ── */}
        <div className="pnd-list">
          {loading ? (
            <div className="pnd-loading-wrap">
              <div className="pnd-spinner" />
              <span className="pnd-loading-text">Memuat data...</span>
            </div>
          ) : sorted.length === 0 ? (
            <div className="pnd-empty">
              <div className="pnd-empty-icon">📭</div>
              <h3>Tidak ada pendaftar</h3>
              <p>Belum ada data yang sesuai filter ini</p>
            </div>
          ) : sorted.map(item => {
            const sc  = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.menunggu
            const av  = getAvatarColor(item.nama_lengkap ?? 'A')
            const d   = item.created_at ? new Date(item.created_at) : null
            const dateStr = d
              ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                + '\n' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              : '—'

            return (
              <div key={item.id} className="pnd-card">
                <div className="pnd-card-av" style={{ background: av.bg, color: av.text }}>
                  {item.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="pnd-card-body">
                  <div className="pnd-card-top-row">
                    <div className="pnd-card-name-wrap">
                      <div className="pnd-card-name">{item.nama_lengkap}</div>
                      <div className="pnd-card-school">{item.asal_sekolah ?? '—'}</div>
                    </div>
                    <div className="pnd-card-right-col">
                      <div
                        className="pnd-status-pill"
                        style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
                      >
                        <div className="pnd-status-pill-dot" style={{ background: sc.dot }} />
                        {sc.label}
                      </div>
                      <div className="pnd-card-date">{dateStr}</div>
                    </div>
                  </div>
                  <div className="pnd-card-bottom-row">
                    <div className="pnd-card-nisn">NISN: {item.nisn ?? '—'}</div>
                    <div className="pnd-card-actions">
                      <button
                        className="pnd-detail-btn"
                        onClick={() => router.push(`/admin/pendaftar/${item.id}`)}
                      >
                        <IconEye /> Lihat Detail
                      </button>
                      <div className="pnd-dots-btn"><IconDots /></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Bottom Nav ── */}
        <nav className="pnd-bottom-nav">
          <button className="pnd-nav-btn" onClick={() => router.push('/admin')}>
            <div className="pnd-nav-icon"><NavHome /></div>
            Beranda
          </button>
          <button className="pnd-nav-btn pnd-nav-btn--active" onClick={() => router.push('/admin/pendaftar')}>
            <div className="pnd-nav-icon"><NavPendaftar active /></div>
            Pendaftar
          </button>
          <button className="pnd-nav-btn" onClick={() => router.push('/admin/pendaftaran')}>
            <div className="pnd-nav-icon"><NavPendaftaran /></div>
            Pendaftaran
          </button>
          <button className="pnd-nav-btn" onClick={() => router.push('/admin/laporan')}>
            <div className="pnd-nav-icon"><NavLaporan /></div>
            Laporan
          </button>
          <button className="pnd-nav-btn" onClick={() => router.push('/admin/profil')}>
            <div className="pnd-nav-icon"><NavProfil /></div>
            Profil
          </button>
        </nav>
        </div>{/* end pnd-scroll-content */}

      </div>
    </>
  )
}