'use client'

import Image from 'next/image'
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
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  menunggu: { label: 'Menunggu Verifikasi', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  diproses: { label: 'Sedang Diproses',     color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6' },
  diterima: { label: 'Diterima',            color: '#059669', bg: '#d1fae5', dot: '#10b981' },
  ditolak:  { label: 'Ditolak',             color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
}

// ─── Avatar Colors ────────────────────────────────────────────────────────────
const AV_COLORS = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#f0fdf4', text: '#166534' },
]
function getAvatarColor(name: string) {
  return AV_COLORS[(name?.charCodeAt(0) ?? 65) % AV_COLORS.length]
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconXCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)
const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconDots = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
)
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
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
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const NavVerifikasi = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const NavLaporan = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const NavPengaturan = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, sub, value, icon, iconBg, iconColor, onClick, active,
}: {
  label: string; sub: string; value: number
  icon: React.ReactNode; iconBg: string; iconColor: string
  onClick?: () => void; active?: boolean
}) {
  return (
    <button className={`stat-card${active ? ' stat-card--active' : ''}`} onClick={onClick}>
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pnd-root {
  min-height: 100vh;
  background: #f4f5f9;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  padding-bottom: 72px;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
}

/* ── Topbar ── */
.pnd-topbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  position: sticky; top: 0; z-index: 50;
  border-bottom: 1px solid #f1f5f9;
}
.pnd-topbar-back-btn, .pnd-notif-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  text-decoration: none;
  position: relative;
}
.pnd-topbar-title { text-align: center; min-width: 0; }
.pnd-topbar-title h1 { font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.2; }
.pnd-topbar-title p  { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pnd-notif-badge {
  position: absolute; top: 9px; right: 9px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #fff;
}

/* ── Hero Banner ── */
.pnd-hero {
  margin: 14px 16px 0;
  background: linear-gradient(130deg, #eef2ff 0%, #e0e7ff 60%, #ede9fe 100%);
  border-radius: 20px;
  padding: 20px 18px 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  overflow: hidden;
  min-height: 148px;
  position: relative;
  border: 1px solid #c7d2fe;
}
.pnd-hero::before {
  content: '';
  position: absolute; top: -30px; right: 120px;
  width: 8px; height: 8px;
  background: #818cf8; border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(129,140,248,0.2);
}
.pnd-hero-text { flex: 1; padding-bottom: 20px; }
.pnd-hero-text h2 {
  font-size: 16px; font-weight: 700; color: #1e293b; line-height: 1.4;
}
.pnd-hero-text h2 span { color: #6366f1; font-weight: 800; }
.pnd-hero-btn {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 14px;
  background: rgba(255,255,255,0.7);
  border: 1.5px solid #c7d2fe;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 12px; font-weight: 700; color: #4f46e5;
  cursor: pointer; font-family: inherit;
  backdrop-filter: blur(4px);
}
.pnd-hero-img {
  width: 130px;
  flex-shrink: 0;
  align-self: flex-end;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.pnd-hero-img img {
  width: 130px;
  height: auto;
  display: block;
  object-fit: contain;
  object-position: bottom;
}

/* ── Stats Grid ── */
.pnd-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 14px 16px 0;
}
.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 12px 8px 10px;
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  border: 2px solid transparent;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  cursor: pointer; font-family: inherit;
  transition: all 0.18s ease;
  text-align: center;
}
.stat-card:active { transform: scale(0.96); }
.stat-card--active {
  border-color: #6366f1;
  box-shadow: 0 2px 16px rgba(99,102,241,0.18);
}
.stat-icon-wrap {
  width: 38px; height: 38px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.stat-value { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1; }
.stat-label { font-size: 9.5px; font-weight: 700; color: #475569; line-height: 1.3; }
.stat-sub   { font-size: 8.5px; color: #94a3b8; font-weight: 500; }

/* ── Search + Filter + Export ── */
.pnd-search-row {
  display: flex; gap: 8px; align-items: center;
  padding: 14px 16px 0;
}
.pnd-search-box {
  flex: 1; height: 44px;
  display: flex; align-items: center; gap: 9px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: border-color 0.18s;
  color: #94a3b8;
}
.pnd-search-box:focus-within { border-color: #6366f1; color: #6366f1; }
.pnd-search-box input {
  flex: 1; border: none; outline: none;
  font-size: 13px; color: #0f172a;
  font-family: inherit; background: transparent;
}
.pnd-search-box input::placeholder { color: #cbd5e1; }
.pnd-filter-btn {
  height: 44px; padding: 0 13px;
  display: flex; align-items: center; gap: 6px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 12px; font-weight: 700; color: #475569;
  cursor: pointer; font-family: inherit;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.pnd-export-btn {
  height: 44px; padding: 0 13px;
  display: flex; align-items: center; gap: 6px;
  background: #6366f1;
  border: none; border-radius: 12px;
  font-size: 12px; font-weight: 700; color: #fff;
  cursor: pointer; font-family: inherit;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(99,102,241,0.3);
}

/* ── Tabs ── */
.pnd-tabs {
  display: flex; gap: 6px; align-items: center;
  padding: 10px 16px 0;
  overflow-x: auto; scrollbar-width: none;
}
.pnd-tabs::-webkit-scrollbar { display: none; }
.pnd-tab {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 13px;
  border-radius: 20px;
  font-size: 12.5px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  border: 1.5px solid transparent;
  font-family: inherit;
  transition: all 0.18s;
  flex-shrink: 0;
}
.pnd-tab--off  { background: #fff; color: #64748b; border-color: #e2e8f0; }
.pnd-tab--on   { background: #6366f1; color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,0.3); }
.pnd-tab--diterima-on { background: #fff; color: #059669; border-color: #a7f3d0; }
.pnd-tab--ditolak-on  { background: #fff; color: #dc2626; border-color: #fca5a5; }
.pnd-tab-badge {
  min-width: 18px; height: 18px;
  border-radius: 9px; font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; padding: 0 4px;
}
.pnd-tab--on .pnd-tab-badge           { background: rgba(255,255,255,0.25); color: #fff; }
.pnd-tab--off .pnd-tab-badge          { background: #f1f5f9; color: #475569; }
.pnd-tab--diterima-on .pnd-tab-badge  { background: #d1fae5; color: #059669; }
.pnd-tab--ditolak-on .pnd-tab-badge   { background: #fee2e2; color: #dc2626; }

/* Sort bar */
.pnd-sort-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px 0;
}
.pnd-result-text { font-size: 12.5px; color: #64748b; font-weight: 600; }
.pnd-sort-wrap   { position: relative; }
.pnd-sort-btn {
  display: flex; align-items: center; gap: 5px;
  background: #fff; border: 1.5px solid #e2e8f0;
  border-radius: 10px; padding: 6px 11px;
  font-size: 12px; font-weight: 700; color: #475569;
  cursor: pointer; font-family: inherit;
}
.pnd-sort-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: #fff; border: 1.5px solid #e2e8f0;
  border-radius: 12px; overflow: hidden; z-index: 50;
  min-width: 150px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
}
.pnd-sort-opt {
  display: block; width: 100%; text-align: left;
  padding: 10px 15px; border: none; background: none;
  font-size: 12.5px; font-weight: 600; color: #1e293b;
  cursor: pointer; font-family: inherit;
}
.pnd-sort-opt:hover      { background: #f8fafc; }
.pnd-sort-opt--on        { color: #6366f1; font-weight: 700; background: #eef2ff; }

/* ── List ── */
.pnd-list {
  padding: 10px 16px 0;
  display: flex; flex-direction: column; gap: 10px;
}

/* ── Item Card ── */
.pnd-card {
  background: #fff;
  border-radius: 16px;
  padding: 13px 13px;
  display: flex; align-items: center; gap: 11px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  border: 1.5px solid #f1f5f9;
  transition: box-shadow 0.15s;
}
.pnd-card-av {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 900; flex-shrink: 0;
}
.pnd-card-info { flex: 1; min-width: 0; }
.pnd-card-name {
  font-size: 14px; font-weight: 800; color: #0f172a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pnd-card-school {
  font-size: 11.5px; color: #64748b; font-weight: 500; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pnd-card-nisn {
  display: inline-flex; align-items: center;
  background: #f1f5f9; border-radius: 6px;
  padding: 2px 8px; margin-top: 5px;
  font-size: 10.5px; font-weight: 700; color: #475569;
}
.pnd-card-right {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 5px; flex-shrink: 0;
}
.pnd-status-pill {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 4px 9px;
  font-size: 10.5px; font-weight: 700;
}
.pnd-status-pill-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
}
.pnd-card-date {
  font-size: 10.5px; color: #94a3b8; text-align: right;
  white-space: pre-line; line-height: 1.5;
}
.pnd-card-actions {
  display: flex; align-items: center; gap: 5px; margin-top: 1px;
}
.pnd-detail-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: #f1f5f9; border: none; border-radius: 8px;
  padding: 5px 10px;
  font-size: 11px; font-weight: 700; color: #475569;
  cursor: pointer; font-family: inherit;
}
.pnd-detail-btn:hover { background: #e2e8f0; }
.pnd-dots-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8;
}

/* ── Loading & Empty ── */
.pnd-loading-wrap {
  padding: 48px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.pnd-spinner {
  width: 34px; height: 34px;
  border: 3px solid #e2e8f0; border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pnd-loading-text { font-size: 13px; font-weight: 600; color: #94a3b8; }
.pnd-empty {
  padding: 48px 16px; text-align: center;
}
.pnd-empty-icon { font-size: 44px; margin-bottom: 10px; }
.pnd-empty h3   { font-size: 15px; font-weight: 800; color: #475569; }
.pnd-empty p    { font-size: 12.5px; color: #94a3b8; margin-top: 4px; }

/* ── Bottom Nav ── */
.pnd-bottom-nav {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  padding: 6px 0 env(safe-area-inset-bottom, 6px);
  box-shadow: 0 -2px 16px rgba(0,0,0,0.06);
  z-index: 100;
}
.pnd-nav-btn {
  flex: 1; border: none; background: none;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 5px 0; cursor: pointer; font-family: inherit;
  font-size: 10px; font-weight: 600; color: #94a3b8;
}
.pnd-nav-btn--active { color: #6366f1; }
.pnd-nav-icon {
  width: 40px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 13px;
}
.pnd-nav-btn--active .pnd-nav-icon { background: #eef2ff; }
`

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PendaftarPage() {
  const router = useRouter()

  const [items,    setItems]    = useState<PendaftarItem[]>([])
  const [stats,    setStats]    = useState<StatsData>({ total: 0, menunggu: 0, diproses: 0, diterima: 0, ditolak: 0 })
  const [statusTab,setStatusTab]= useState<StatusFilter>('semua')
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState<SortOrder>('terbaru')
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [showSort, setShowSort] = useState(false)

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

        {/* ── Topbar ── */}
        <div className="pnd-topbar">
          <Link href="/admin/dashboard" className="pnd-topbar-back-btn">
            <IconArrowLeft />
          </Link>
          <div className="pnd-topbar-title">
            <h1>Pendaftar</h1>
            <p>Kelola data pendaftar</p>
          </div>
          <Link href="/admin/notifikasi" className="pnd-notif-btn">
            <IconBell />
            {/* <div className="pnd-notif-badge" /> */}
          </Link>
        </div>

        {/* ── Hero Banner ── */}
        <div className="pnd-hero">
          <div className="pnd-hero-text">
            <h2>Kelola data pendaftar dengan<br /><span>mudah dan terstruktur</span></h2>
            <button className="pnd-hero-btn">
              📖 Pelajari Panduan →
            </button>
          </div>
          <div className="pnd-hero-img">
            <Image
                src="/image/pendaftar.gif"
                alt="Kelola Pendaftar"
                width={130}
                height={130}
                style={{ objectFit: 'contain', objectPosition: 'bottom' }}
                priority
              />
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="pnd-stats">
          <StatCard label="Total Pendaftar"     sub="Semua Pendaftar"   value={stats.total}    icon={<IconUsers />}       iconBg="#ede9fe" iconColor="#7c3aed" onClick={() => setStatusTab('semua')}    active={statusTab === 'semua'} />
          <StatCard label="Menunggu Verifikasi" sub="Perlu Diperiksa"   value={stats.menunggu} icon={<IconClock />}       iconBg="#fef3c7" iconColor="#d97706" onClick={() => setStatusTab('menunggu')} active={statusTab === 'menunggu'} />
          <StatCard label="Diterima"            sub="Pendaftar Lolos"   value={stats.diterima} icon={<IconCheckCircle />} iconBg="#d1fae5" iconColor="#059669" onClick={() => setStatusTab('diterima')} active={statusTab === 'diterima'} />
          <StatCard label="Ditolak"             sub="Pendaftar Ditolak" value={stats.ditolak}  icon={<IconXCircle />}     iconBg="#fee2e2" iconColor="#dc2626" onClick={() => setStatusTab('ditolak')}  active={statusTab === 'ditolak'} />
        </div>

        {/* ── Search Row ── */}
        <div className="pnd-search-row">
          <div className="pnd-search-box">
            <IconSearch />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau sekolah..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="pnd-filter-btn"><IconFilter /> Filter</button>
          <button className="pnd-export-btn"><IconDownload /> Export</button>
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
                  <button key={k} className={`pnd-sort-opt${sort === k ? ' pnd-sort-opt--on' : ''}`}
                    onClick={() => { setSort(k); setShowSort(false) }}>
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
                <div className="pnd-card-info">
                  <div className="pnd-card-name">{item.nama_lengkap}</div>
                  <div className="pnd-card-school">{item.asal_sekolah ?? '—'}</div>
                  <div className="pnd-card-nisn">NISN:&nbsp;{item.nisn ?? '—'}</div>
                </div>
                <div className="pnd-card-right">
                  <div className="pnd-status-pill" style={{ background: sc.bg, color: sc.color }}>
                    <div className="pnd-status-pill-dot" style={{ background: sc.dot }} />
                    {sc.label}
                  </div>
                  <div className="pnd-card-date">{dateStr}</div>
                  <div className="pnd-card-actions">
                    <button className="pnd-detail-btn" onClick={() => router.push(`/admin/pendaftar/${item.id}`)}>
                      <IconEye /> Lihat Detail
                    </button>
                    <div className="pnd-dots-btn"><IconDots /></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Bottom Nav ── */}
        <nav className="pnd-bottom-nav">
          <button className="pnd-nav-btn"            onClick={() => router.push('/admin')}>
            <div className="pnd-nav-icon"><NavHome /></div>Dashboard
          </button>
          <button className="pnd-nav-btn pnd-nav-btn--active" onClick={() => router.push('/admin/pendaftar')}>
            <div className="pnd-nav-icon"><NavPendaftar active /></div>Pendaftar
          </button>
          <button className="pnd-nav-btn"            onClick={() => router.push('/admin/verifikasi')}>
            <div className="pnd-nav-icon"><NavVerifikasi /></div>Verifikasi
          </button>
          <button className="pnd-nav-btn"            onClick={() => router.push('/admin/laporan')}>
            <div className="pnd-nav-icon"><NavLaporan /></div>Laporan
          </button>
          <button className="pnd-nav-btn"            onClick={() => router.push('/admin/pengaturan')}>
            <div className="pnd-nav-icon"><NavPengaturan /></div>Pengaturan
          </button>
        </nav>
      </div>
    </>
  )
}