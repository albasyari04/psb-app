'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Pembayaran } from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

const REKENING_INFO = [
  {
    id: 'bri',
    label: 'Bank BRI',
    number: '5613 0104 4986 539',
    numberRaw: '561301044986539',
    name: 'Ahmad Agus Munif',
    primaryColor: '#003087',
    accentColor: '#0052CC',
    bgGradient: 'linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 100%)',
    borderColor: '#BFDBFE',
    logoSrc: '/icons/bri-logo.png', // fallback to SVG if not exist
    icon: (
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#003087"/>
        <rect x="6" y="12" width="28" height="18" rx="3" fill="#fff" opacity="0.15"/>
        <text x="20" y="25" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="sans-serif">BRI</text>
      </svg>
    ),
  },
  {
    id: 'dana',
    label: 'DANA',
    number: '0878 1455 9628',
    numberRaw: '087814559628',
    name: 'Ahmad Agus Munif',
    primaryColor: '#118EEA',
    accentColor: '#0A75C7',
    bgGradient: 'linear-gradient(135deg, #EBF6FF 0%, #DBEAFE 100%)',
    borderColor: '#BAE6FD',
    icon: (
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#118EEA"/>
        <circle cx="20" cy="20" r="10" fill="#fff" opacity="0.25"/>
        <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800" fontFamily="sans-serif">DANA</text>
      </svg>
    ),
  },
]

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string; icon: string }> = {
  menunggu:     { label: 'Menunggu Verifikasi', bg: '#FFF7ED', text: '#C2410C', dot: '#F97316', icon: '⏳' },
  dikonfirmasi: { label: 'Dikonfirmasi',         bg: '#F0FDF4', text: '#15803D', dot: '#22C55E', icon: '✅' },
  ditolak:      { label: 'Ditolak',              bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E', icon: '❌' },
}

interface BiayaItem {
  no: number
  jenis: string
  jumlah: string
  nominal: number
  kategori: string
}

const DATA_BIAYA: BiayaItem[] = [
  { no: 1,  jenis: 'Pendaftaran Asrama + Madrasah (Putra)', jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'Putra' },
  { no: 2,  jenis: 'KTS, Buku Pegangan Santri (Putra)',     jumlah: 'Rp. 70.000,-',           nominal: 70000,   kategori: 'Putra' },
  { no: 3,  jenis: 'Raport (Putra)',                        jumlah: 'Rp. 70.000,-',           nominal: 70000,   kategori: 'Putra' },
  { no: 4,  jenis: 'Seragam Madrasah (2 baju) - Putra',    jumlah: 'Rp. 200.000,-',          nominal: 200000,  kategori: 'Putra' },
  { no: 5,  jenis: 'Uang Kos Makan (2x sehari) - Putra',   jumlah: 'Rp. 300.000,-/Bulan',    nominal: 300000,  kategori: 'Putra' },
  { no: 6,  jenis: 'Sahriyah Asrama + Madrasah (Putra)',   jumlah: 'Rp. 180.000,-/3 Bulan',  nominal: 180000,  kategori: 'Putra' },
  { no: 7,  jenis: 'Uang Bangunan (Putra)',                 jumlah: 'Rp. 250.000,-/Tahun',    nominal: 250000,  kategori: 'Putra' },
  { no: 8,  jenis: 'Pendaftaran Asrama + Madrasah (Putri)', jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'Putri' },
  { no: 9,  jenis: 'KTS, Buku Pegangan Santri (Putri)',     jumlah: 'Rp. 70.000,-',           nominal: 70000,   kategori: 'Putri' },
  { no: 10, jenis: 'Raport (Putri)',                        jumlah: 'Rp. 70.000,-',           nominal: 70000,   kategori: 'Putri' },
  { no: 11, jenis: 'Seragam Madrasah (3 baju) - Putri',    jumlah: 'Rp. 300.000,-',          nominal: 300000,  kategori: 'Putri' },
  { no: 12, jenis: 'Uang Kos Makan (2x sehari) - Putri',   jumlah: 'Rp. 300.000,-/Bulan',    nominal: 300000,  kategori: 'Putri' },
  { no: 13, jenis: 'Sahriyah Asrama + Madrasah (Putri)',   jumlah: 'Rp. 180.000,-/3 Bulan',  nominal: 180000,  kategori: 'Putri' },
  { no: 14, jenis: 'Uang Bangunan (Putri)',                 jumlah: 'Rp. 250.000,-',          nominal: 2500000, kategori: 'Putri' },
  { no: 15, jenis: 'Administrasi Pendaftaran (SMP)',        jumlah: 'Rp. 50.000,-',           nominal: 50000,   kategori: 'SMP' },
  { no: 16, jenis: 'Bet Sekolah (SMP)',                     jumlah: 'Rp. 50.000,-',           nominal: 50000,   kategori: 'SMP' },
  { no: 17, jenis: 'Administrasi Bangunan (SMP)',           jumlah: 'Rp. 200.000,-',          nominal: 200000,  kategori: 'SMP' },
  { no: 18, jenis: 'Uang SPP (SMP)',                        jumlah: 'Rp. 300.000,-/Semester', nominal: 300000,  kategori: 'SMP' },
  { no: 19, jenis: 'Seragam Batik (SMP)',                   jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'SMP' },
  { no: 20, jenis: 'Seragam Olahraga (SMP)',                jumlah: 'Rp. 150.000,-',          nominal: 150000,  kategori: 'SMP' },
  { no: 21, jenis: 'Ujian Semester I (SMP)',                jumlah: 'Rp. 50.000,-',           nominal: 50000,   kategori: 'SMP' },
  { no: 22, jenis: 'Ujian Semester II (SMP)',               jumlah: 'Rp. 50.000,-',           nominal: 50000,   kategori: 'SMP' },
  { no: 23, jenis: 'Raport (SMP)',                          jumlah: 'Rp. 80.000,-',           nominal: 80000,   kategori: 'SMP' },
  { no: 24, jenis: 'Administrasi Pendaftaran (SMA)',        jumlah: 'Rp. 50.000,-',           nominal: 50000,   kategori: 'SMA' },
  { no: 25, jenis: 'Bet Sekolah (SMA)',                     jumlah: 'Rp. 75.000,-',           nominal: 75000,   kategori: 'SMA' },
  { no: 26, jenis: 'Cetak Photo 2x3 & 3x4',                jumlah: 'Rp. 50.000,-',           nominal: 50000,   kategori: 'SMA' },
  { no: 27, jenis: 'Raport (SMA)',                          jumlah: 'Rp. 75.000,-',           nominal: 75000,   kategori: 'SMA' },
  { no: 28, jenis: 'Uang SPP (SMA)',                        jumlah: 'Rp. 350.000,-/Semester', nominal: 350000,  kategori: 'SMA' },
  { no: 29, jenis: 'Seragam Batik (SMA)',                   jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'SMA' },
  { no: 30, jenis: 'Seragam Olahraga (SMA)',                jumlah: 'Rp. 150.000,-',          nominal: 150000,  kategori: 'SMA' },
  { no: 31, jenis: 'Administrasi Bangunan (SMA)',           jumlah: 'Rp. 600.000,-/1 Tahun',  nominal: 600000,  kategori: 'SMA' },
]

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatTanggal(t: string | null) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function uploadBukti(file: File, userId: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)
  const res = await fetch('/api/siswa/pembayaran/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal upload gambar')
  }
  const { url } = await res.json()
  return url
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="#6366F1" opacity="0.15"/>
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="#6366F1" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

// ─── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        padding: '6px 14px',
        borderRadius: 20,
        border: `1.5px solid ${copied ? '#BBF7D0' : '#E2E8F0'}`,
        background: copied ? '#F0FDF4' : '#F8FAFC',
        color: copied ? '#16A34A' : '#64748B',
        cursor: 'pointer',
        transition: 'all .2s',
        fontWeight: 600,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}
    >
      {copied ? <IconCheck /> : <IconCopy />}
      {copied ? 'Disalin' : 'Salin'}
    </button>
  )
}

// ─── Rekening Card ─────────────────────────────────────────────────────────────

function RekeningCard({ item }: { item: typeof REKENING_INFO[0] }) {
  return (
    <div
      style={{
        background: item.bgGradient,
        borderRadius: 20,
        border: `1.5px solid ${item.borderColor}`,
        padding: '16px',
        flex: 1,
        minWidth: 0,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        transition: 'transform .2s, box-shadow .2s',
      }}
    >
      {/* Header: logo + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            flexShrink: 0,
          }}
        >
          {item.icon}
        </div>
        <span style={{
          fontWeight: 800,
          fontSize: 13,
          color: item.primaryColor,
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          {item.label}
        </span>
      </div>

      {/* Account number */}
      <p style={{
        fontWeight: 800,
        fontSize: 15,
        color: '#1E293B',
        letterSpacing: 0.8,
        margin: '0 0 2px',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        {item.number}
      </p>
      <p style={{
        fontSize: 10,
        color: '#64748B',
        margin: '0 0 12px',
        fontWeight: 600,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        a.n {item.name}
      </p>

      <CopyButton text={item.numberRaw} />
    </div>
  )
}

// ─── Hero Banner (image only, no text) ────────────────────────────────────────

function HeroBanner() {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          borderRadius: 22,
          overflow: 'hidden',
          height: 170,
          position: 'relative',
          boxShadow: '0 12px 36px rgba(79,70,229,0.30)',
        }}
      >
        {/* Background: icon pembayaran.png sebagai latar penuh */}
        <img
          src="/icons/pembayaran-banner.png"
          alt="Banner Pembayaran"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }}
        />

        {/* Overlay ringan agar terlihat lebih menarik */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(55,48,163,0.35) 0%, rgba(109,40,217,0.18) 60%, rgba(109,40,217,0.05) 100%)',
        }} />
      </div>
    </div>
  )
}

// ─── Info Pembayaran Card ──────────────────────────────────────────────────────

function InfoPembayaranItem({
  icon, label, value, valueStyle,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(99,102,241,0.10)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, margin: '0 0 2px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', ...valueStyle }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function InfoPembayaranCard({
  session,
}: {
  session: { user: { name?: string | null; nomor_pendaftaran?: string } } | null
}) {
  const nama = session?.user?.name ?? 'M. Naufal Al Basyari'
  const nomorPendaftaran = 'PSB250612-001'
  const totalBiaya = 2500000
  const batasPembayaran = '30 Juni 2025'

  const hariLagi = (() => {
    const target = new Date('2025-06-30')
    const now = new Date()
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  })()

  const isUrgent = hariLagi <= 7

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: '1.5px solid #F1F5F9',
      padding: '18px 16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      marginBottom: 20,
    }}>
      {/* Grid 2 column info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 12px' }}>
        <InfoPembayaranItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="#6366F1" strokeWidth="1.8"/>
            </svg>
          }
          label="Nama Pendaftar"
          value={nama ?? ''}
          valueStyle={{ fontWeight: 700, fontSize: 13, color: '#1E293B' }}
        />
        <InfoPembayaranItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="#6366F1" strokeWidth="1.8"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          }
          label="Nomor Pendaftaran"
          value={nomorPendaftaran}
          valueStyle={{ fontWeight: 700, fontSize: 13, color: '#1E293B' }}
        />
        <InfoPembayaranItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="#6366F1" strokeWidth="1.8"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          }
          label="Periode Pembayaran"
          value="2025/2026"
          valueStyle={{ fontWeight: 700, fontSize: 13, color: '#1E293B' }}
        />
        <InfoPembayaranItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="1" x2="12" y2="23" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          }
          label="Total Biaya"
          value={formatRupiah(totalBiaya)}
          valueStyle={{ fontWeight: 800, fontSize: 15, color: '#6366F1' }}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#F1F5F9', margin: '14px 0' }} />

      {/* Batas & countdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#6366F1" strokeWidth="1.8"/>
              <path d="M12 7v5l3 3" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              Batas Pembayaran
            </p>
            <p style={{ fontSize: 13, color: '#1E293B', fontWeight: 700, margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              {batasPembayaran}
            </p>
          </div>
        </div>

        {/* Countdown pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isUrgent ? '#FFF7ED' : '#F0FDF4',
          border: `1.5px solid ${isUrgent ? '#FED7AA' : '#BBF7D0'}`,
          borderRadius: 20,
          padding: '6px 14px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={isUrgent ? '#F97316' : '#22C55E'} strokeWidth="2"/>
            <path d="M12 7v5l3 3" stroke={isUrgent ? '#F97316' : '#22C55E'} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: isUrgent ? '#C2410C' : '#15803D',
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}>
            {hariLagi} Hari Lagi
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Cara Pembayaran Steps ─────────────────────────────────────────────────────

function CaraPembayaran() {
  const steps = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Pilih tujuan\npembayaran',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
      ),
      label: 'Lakukan transfer\nsesuai nominal',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
      ),
      label: 'Upload bukti\npembayaran',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Verifikasi\noleh admin',
    },
  ]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: '1.5px solid #F1F5F9',
      padding: '16px',
      marginBottom: 20,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div style={{
                position: 'absolute',
                top: 18,
                left: '58%',
                right: '-42%',
                height: 2,
                background: 'linear-gradient(to right, #6366F1 0%, #C7D2FE 100%)',
                zIndex: 0,
              }} />
            )}

            {/* Step circle */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(99,102,241,0.40)',
              }}>
                {step.icon}
              </div>
              {/* Number badge */}
              <div style={{
                position: 'absolute', bottom: -3, right: -3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff',
                border: '2px solid #6366F1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(99,102,241,0.2)',
              }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: '#6366F1', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                  {i + 1}
                </span>
              </div>
            </div>

            <p style={{
              fontSize: 9,
              color: '#475569',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.55,
              fontWeight: 600,
              whiteSpace: 'pre-line',
              fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            }}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Security Banner ───────────────────────────────────────────────────────────

function SecurityBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 100%)',
      borderRadius: 18,
      border: '1.5px solid #E0E7FF',
      padding: '14px 16px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      transition: 'box-shadow .2s',
      boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(99,102,241,0.18)',
      }}>
        <IconShield />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 12, fontWeight: 800, color: '#4338CA',
          margin: '0 0 4px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          Transaksi Anda Aman
        </p>
        <p style={{
          fontSize: 10, color: '#6366F1', margin: 0,
          lineHeight: 1.55, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          Semua pembayaran dienkripsi dan diverifikasi secara ketat untuk menjaga keamanan data dan transaksi Anda.
        </p>
      </div>
      <div style={{ color: '#6366F1', flexShrink: 0 }}>
        <IconChevronRight />
      </div>
    </div>
  )
}

// ─── Pilih Pembayaran Modal ────────────────────────────────────────────────────

function PilihPembayaranModal({
  onClose,
  onSelect,
}: {
  onClose: () => void
  onSelect: (item: BiayaItem) => void
}) {
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isMultipleMode, setIsMultipleMode] = useState(false)

  const filteredBiaya = selectedKategori === 'Semua'
    ? DATA_BIAYA
    : DATA_BIAYA.filter((item: BiayaItem) => item.kategori === selectedKategori)

  const totalNominal = selectedItems.reduce((sum: number, id: number) => {
    const item = DATA_BIAYA.find((i: BiayaItem) => i.no === id)
    return sum + (item?.nominal || 0)
  }, 0)

  const handleSelectItem = (no: number) => {
    if (isMultipleMode) {
      setSelectedItems((prev: number[]) =>
        prev.includes(no) ? prev.filter((i: number) => i !== no) : [...prev, no]
      )
    } else {
      const item = DATA_BIAYA.find((i: BiayaItem) => i.no === no)
      if (item) onSelect(item)
    }
  }

  const handleSubmitMultiple = () => {
    if (selectedItems.length === 0) return
    const items = DATA_BIAYA.filter((i: BiayaItem) => selectedItems.includes(i.no))
    onSelect(items[0])
  }

  const kategoriList = ['Semua', 'Putra', 'Putri', 'SMP', 'SMA']
  const kategoriColors: Record<string, string> = {
    Putra: '#3B82F6', Putri: '#EC4899', SMP: '#10B981', SMA: '#F59E0B', Semua: '#6366F1',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.80)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 28,
          width: '100%',
          maxWidth: 500,
          maxHeight: '88vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 32px 64px rgba(0,0,0,0.20)',
        }}
      >
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          padding: '20px 20px 16px',
          borderRadius: '28px 28px 0 0',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                Pilih Jenis Pembayaran
              </h2>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                Pilih biaya yang ingin Anda bayar
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 11,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex', gap: 6,
            background: 'rgba(255,255,255,0.10)',
            borderRadius: 14, padding: 4,
          }}>
            {['Bayar Satu Item', 'Bayar Banyak Item'].map((label, i) => {
              const isActive = i === 0 ? !isMultipleMode : isMultipleMode
              return (
                <button
                  key={label}
                  onClick={() => { setIsMultipleMode(i === 1); setSelectedItems([]) }}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 10,
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? '#4F46E5' : 'rgba(255,255,255,0.8)',
                    border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                    transition: 'all .2s',
                    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Kategori */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', gap: 6, overflowX: 'auto',
        }}>
          {kategoriList.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              style={{
                padding: '5px 14px', borderRadius: 20, flexShrink: 0,
                background: selectedKategori === kat ? (kategoriColors[kat] ?? '#6366F1') : '#F8FAFC',
                color: selectedKategori === kat ? '#fff' : '#64748B',
                border: `1.5px solid ${selectedKategori === kat ? 'transparent' : '#E2E8F0'}`,
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              }}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div style={{ padding: '8px 16px 16px' }}>
          {filteredBiaya.map((item: BiayaItem, i: number) => {
            const isSelected = selectedItems.includes(item.no)
            return (
              <div
                key={item.no}
                onClick={() => handleSelectItem(item.no)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 10px',
                  borderRadius: 14, marginBottom: 4, cursor: 'pointer',
                  background: isSelected ? '#F5F3FF' : i % 2 === 0 ? '#FAFBFC' : '#fff',
                  border: `1.5px solid ${isSelected ? '#C4B5FD' : 'transparent'}`,
                  transition: 'all .15s',
                }}
              >
                {isMultipleMode && (
                  <div style={{
                    width: 22, height: 22, borderRadius: 7,
                    border: `2px solid ${isSelected ? '#6366F1' : '#CBD5E1'}`,
                    background: isSelected ? '#6366F1' : '#fff',
                    marginRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', margin: '0 0 3px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                    {item.jenis}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: isSelected ? '#6366F1' : '#475569',
                      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                    }}>
                      {item.jumlah}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: kategoriColors[item.kategori] ?? '#64748B',
                      background: kategoriColors[item.kategori]? `${kategoriColors[item.kategori]}15`: '#F8FAFC',
                      padding: '2px 8px', borderRadius: 20,
                      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                    }}>
                      {item.kategori}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Multi-select footer */}
        {isMultipleMode && selectedItems.length > 0 && (
          <div style={{
            position: 'sticky', bottom: 0, background: '#fff',
            borderTop: '1px solid #E2E8F0', padding: '14px 20px',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, margin: '0 0 2px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                  {selectedItems.length} item dipilih
                </p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#4F46E5', margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                  {formatRupiah(totalNominal)}
                </p>
              </div>
              <button
                onClick={handleSubmitMultiple}
                style={{
                  padding: '12px 20px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.38)',
                  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                }}
              >
                Lanjutkan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Upload Bukti Modal ────────────────────────────────────────────────────────

function UploadBuktiModal({
  onClose,
  onSubmit,
  loading,
  selectedItem,
}: {
  onClose: () => void
  onSubmit: (file: File, catatan: string, nominal: number, jenisPembayaran: string) => void
  loading: boolean
  selectedItem: BiayaItem | null
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [catatan, setCatatan] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = () => {
    if (file && selectedItem) onSubmit(file, catatan, selectedItem.nominal, selectedItem.jenis)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '28px 28px 0 0',
          padding: '0 20px 48px', width: '100%', maxWidth: 500,
          boxShadow: '0 -16px 48px rgba(0,0,0,0.18)',
          animation: 'slideUp .35s cubic-bezier(0.34,1.56,0.64,1)',
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 4, background: '#E2E8F0', borderRadius: 99 }} />
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <IconUpload />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              Upload Bukti Pembayaran
            </h2>
            <p style={{ fontSize: 10, color: '#94A3B8', margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              Foto atau screenshot yang jelas dan terbaca
            </p>
          </div>
        </div>

        {/* Item yang dibayar */}
        {selectedItem && (
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
            borderRadius: 16, padding: '14px 16px', marginBottom: 16, marginTop: 16,
            border: '1.5px solid #E0E7FF',
          }}>
            <p style={{ fontSize: 9, color: '#6366F1', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              Yang Akan Dibayar
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: '0 0 4px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              {selectedItem.jenis}
            </p>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#4F46E5', margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              {selectedItem.jumlah}
            </p>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#4F46E5' : preview ? '#6366F1' : '#CBD5E1'}`,
            borderRadius: 18, padding: 16, textAlign: 'center', cursor: 'pointer',
            background: isDragging ? '#EEF2FF' : preview ? '#F8F7FF' : '#FAFBFC',
            marginBottom: 14, transition: 'all .2s',
            transform: isDragging ? 'scale(1.01)' : 'scale(1)',
          }}
        >
          {preview ? (
            <>
              <Image
                src={preview} alt="Preview" width={300} height={220}
                style={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'contain', borderRadius: 12 }}
              />
              <p style={{ fontSize: 11, color: '#6366F1', marginTop: 8, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                ✓ {file?.name}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }}
                style={{ fontSize: 11, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}
              >
                Ganti foto
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 56, height: 56, borderRadius: 18, margin: '0 auto 10px',
                background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99,102,241,0.12)',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '0 0 4px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                Tap atau seret foto di sini
              </p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                JPG, PNG, WEBP · Maks. 5MB
              </p>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>

        {/* Catatan */}
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Catatan (opsional) — contoh: transfer via BRI Mobile, 25 Mei 2025"
          rows={2}
          style={{
            width: '100%', borderRadius: 14,
            border: '1.5px solid #E2E8F0', padding: '12px 14px',
            fontSize: 12, color: '#1E293B', resize: 'none', outline: 'none',
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            boxSizing: 'border-box', marginBottom: 16, background: '#FAFBFC',
            lineHeight: 1.6, transition: 'border-color .2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#6366F1' }}
          onBlur={(e) => { e.target.style.borderColor = '#E2E8F0' }}
        />

        {/* Submit button */}
        <button
          disabled={!file || loading || !selectedItem}
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '16px',
            borderRadius: 16,
            background: !file || loading || !selectedItem
              ? '#E2E8F0'
              : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: !file || loading || !selectedItem ? '#94A3B8' : '#fff',
            fontWeight: 700, fontSize: 14, border: 'none',
            cursor: !file || loading || !selectedItem ? 'not-allowed' : 'pointer',
            boxShadow: !file || loading || !selectedItem ? 'none' : '0 8px 24px rgba(99,102,241,0.38)',
            transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 16, height: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin .8s linear infinite',
              }} />
              Mengirim...
            </>
          ) : (
            <>
              <IconUpload />
              Kirim Bukti Pembayaran
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Pembayaran Card ───────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{
        fontSize: 9, color: '#94A3B8', fontWeight: 700, margin: '0 0 2px',
        textTransform: 'uppercase', letterSpacing: 0.5,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 12, color: '#334155', fontWeight: 600, margin: 0,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        {value}
      </p>
    </div>
  )
}

function PembayaranCard({ item }: { item: Pembayaran }) {
  const s = STATUS_MAP[item.status] ?? {
    label: item.status, bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', icon: '📄',
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: '1.5px solid #F1F5F9',
      padding: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: `linear-gradient(to bottom, ${s.dot}, ${s.dot}88)`,
        borderRadius: '4px 0 0 4px',
      }} />

      {/* Header row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 12, paddingLeft: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <p style={{
            fontWeight: 700, fontSize: 13, color: '#1E293B',
            margin: '0 0 3px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}>
            {item.jenis_pembayaran}
          </p>
          <p style={{
            fontSize: 10, color: '#94A3B8', margin: 0, fontWeight: 600,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}>
            {item.metode_pembayaran ?? '—'}
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: s.bg, borderRadius: 20, padding: '4px 10px', flexShrink: 0,
          border: `1.5px solid ${s.dot}30`,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
          <span style={{
            fontSize: 10, fontWeight: 700, color: s.text,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}>
            {s.label}
          </span>
        </div>
      </div>

      {/* Nominal */}
      {item.nominal > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
          borderRadius: 14, padding: '10px 14px', marginBottom: 12, marginLeft: 10,
          border: '1.5px solid #E0E7FF',
        }}>
          <p style={{
            fontSize: 9, color: '#6366F1', fontWeight: 700, margin: '0 0 2px',
            textTransform: 'uppercase', letterSpacing: 0.5,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}>
            Nominal
          </p>
          <p style={{
            fontSize: 20, fontWeight: 800, color: '#4338CA', margin: 0,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}>
            {formatRupiah(item.nominal)}
          </p>
        </div>
      )}

      {/* Info grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px',
        fontSize: 12, paddingLeft: 10,
      }}>
        <InfoItem label="Tanggal Bayar" value={formatTanggal(item.tanggal_bayar)} />
        <InfoItem label="No. Referensi" value={item.no_referensi ?? '—'} />
        {item.status === 'dikonfirmasi' && item.confirmed_at && (
          <InfoItem label="Dikonfirmasi Pada" value={formatTanggal(item.confirmed_at)} />
        )}
        {item.catatan && (
          <div style={{ gridColumn: '1 / -1' }}>
            <InfoItem label="Catatan" value={item.catatan} />
          </div>
        )}
      </div>

      {/* Bukti link */}
      {item.bukti_url && (
        <a
          href={item.bukti_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            marginTop: 12, marginLeft: 10,
            padding: '10px 14px', borderRadius: 12,
            background: '#F8FAFC', border: '1.5px solid #E2E8F0',
            textDecoration: 'none', color: '#6366F1', fontSize: 12, fontWeight: 700,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}
        >
          <IconEye />
          Lihat Bukti Pembayaran
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94A3B8' }}>↗</span>
        </a>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SiswaPembayaranPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [data, setData] = useState<Pembayaran[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPilihModal, setShowPilihModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BiayaItem | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/admin/pembayaran')
      if (!res.ok) throw new Error('Gagal mengambil data')
      const json = await res.json()
      const filtered = (json.data as Pembayaran[]).filter((p) => p.user_id === session.user.id)
      setData(filtered)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, session, fetchData])

  const handlePilihItem = (item: BiayaItem) => {
    setSelectedItem(item)
    setShowPilihModal(false)
    setShowUploadModal(true)
  }

  const handleSubmitBukti = async (
    file: File,
    catatan: string,
    nominal: number,
    jenisPembayaran: string,
  ) => {
    if (!session?.user?.id) return
    try {
      setUploadLoading(true)
      const buktiUrl = await uploadBukti(file, session.user.id)
      const res = await fetch('/api/admin/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          nama_siswa: session.user.name,
          nominal,
          jenis_pembayaran: jenisPembayaran,
          metode_pembayaran: 'Transfer Bank',
          bukti_url: buktiUrl,
          status: 'menunggu',
          catatan: catatan || null,
          tanggal_bayar: new Date().toISOString().split('T')[0],
        }),
      })
      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Gagal mengirim data pembayaran')
      }
      setShowUploadModal(false)
      setSelectedItem(null)
      showToast(`Bukti pembayaran untuk ${jenisPembayaran} berhasil dikirim!`, 'success')
      fetchData()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Gagal mengirim bukti', 'error')
    } finally {
      setUploadLoading(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#F4F6FA', gap: 16,
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        {/* Spinner ring — sama seperti halaman pendaftaran */}
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          {/* Track */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid #E0E7FF',
          }} />
          {/* Spinning arc */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#6366F1',
            borderRightColor: '#8B5CF6',
            animation: 'spin .8s linear infinite',
          }} />
          {/* Center icon */}
          <div style={{
            position: 'absolute', inset: 6,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"
                fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <p style={{
          color: '#94A3B8', fontSize: 13, fontWeight: 600,
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          Memuat data pembayaran...
        </p>
      </div>
    )
  }

  const dikonfirmasiCount = data.filter(d => d.status === 'dikonfirmasi').length
  const menungguCount = data.filter(d => d.status === 'menunggu').length

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F6FA',
      paddingBottom: 100,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    }}>
      {/* ── Global styles & fonts ─────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200,
          background: toast.type === 'success'
            ? 'linear-gradient(135deg, #1E293B, #0F172A)'
            : 'linear-gradient(135deg, #BE123C, #9F1239)',
          color: '#fff', borderRadius: 16, padding: '13px 20px',
          fontSize: 12, fontWeight: 700,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          maxWidth: '88vw', animation: 'fadeInDown .3s ease',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6D28D9 100%)',
        padding: '52px 20px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dekorasi lingkaran */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 40, left: 160, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Ilustrasi icon-pembayaran.png — pojok kanan bawah */}
        <img
          src="/icons/icon-pembayaran.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            height: '100%',
            maxHeight: 180,
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'right bottom',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: 0.95,
          }}
        />

        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Icon avatar */}
            <div style={{
              width: 50, height: 50, borderRadius: 16,
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(255,255,255,0.25)',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}>
              <img
                src="/image/pembayaran santri.png"
                alt="Pembayaran"
                style={{ width: 38, height: 38, objectFit: 'contain' }}
              />
            </div>
            <div>
              <h1 style={{
                color: '#fff', fontWeight: 800, fontSize: 22,
                margin: 0, letterSpacing: -0.3,
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              }}>
                Pembayaran
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.65)', fontSize: 11,
                margin: 0, fontWeight: 500,
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              }}>
                Penerimaan Santri Baru 2025/2026
              </p>
            </div>
          </div>
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '6px 14px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              {dikonfirmasiCount} dikonfirmasi
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '6px 14px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FBBF24', boxShadow: '0 0 6px #FBBF24' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              {menungguCount} menunggu
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '22px 16px', maxWidth: 520, margin: '0 auto' }}>

        {/* ── Banner Carousel ── */}
        <HeroBanner />

        {/* ── TUJUAN TRANSFER ── */}
        <p style={{
          fontSize: 10, fontWeight: 800, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: 1.3, margin: '0 0 10px',
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          Tujuan Transfer
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
          {REKENING_INFO.map((r) => <RekeningCard key={r.id} item={r} />)}
        </div>

        {/* ── INFORMASI PEMBAYARAN ── */}
        <p style={{
          fontSize: 10, fontWeight: 800, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: 1.3, margin: '0 0 10px',
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          Informasi Pembayaran
        </p>
        <InfoPembayaranCard session={session as { user: { name?: string | null; nomor_pendaftaran?: string } } | null} />

        {/* ── CARA PEMBAYARAN ── */}
        <p style={{
          fontSize: 10, fontWeight: 800, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: 1.3, margin: '0 0 10px',
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          Cara Pembayaran
        </p>
        <CaraPembayaran />

        {/* ── SECURITY BANNER ── */}
        <SecurityBanner />

        {/* ── CTA BUTTON ── */}
        <button
          onClick={() => setShowPilihModal(true)}
          style={{
            width: '100%', padding: '17px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(79,70,229,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 28,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            transition: 'all .2s',
            letterSpacing: 0.2,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 36px rgba(79,70,229,0.55)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(79,70,229,0.45)' }}
        >
          <IconUpload />
          + Bayar / Upload Bukti
        </button>

        {/* ── RIWAYAT PEMBAYARAN ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 800, color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: 1.3, margin: 0,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          }}>
            Riwayat Pembayaran
          </p>
          {data.length > 0 && (
            <span style={{
              fontSize: 11, color: '#6366F1', fontWeight: 800,
              background: '#EEF2FF', borderRadius: 20, padding: '3px 10px',
              fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            }}>
              {data.length} transaksi
            </span>
          )}
        </div>

        {/* Riwayat content */}
        {error ? (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            background: '#fff', borderRadius: 18,
            border: '1.5px solid #FEE2E2',
          }}>
            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
              ⚠️ {error}
            </p>
            <button
              onClick={fetchData}
              style={{
                marginTop: 12, padding: '9px 22px', borderRadius: 12,
                background: '#6366F1', color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              }}
            >
              Coba Lagi
            </button>
          </div>
        ) : data.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 20px',
            textAlign: 'center', border: '2px dashed #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: 22, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
              boxShadow: '0 4px 16px rgba(99,102,241,0.12)',
            }}>
              🧾
            </div>
            <p style={{
              fontWeight: 800, color: '#1E293B', fontSize: 14,
              margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            }}>
              Belum Ada Riwayat
            </p>
            <p style={{
              color: '#94A3B8', fontSize: 12, margin: 0,
              fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            }}>
              Klik tombol &quot;Bayar / Upload Bukti&quot; untuk memulai
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map((item) => <PembayaranCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showPilihModal && (
        <PilihPembayaranModal
          onClose={() => setShowPilihModal(false)}
          onSelect={handlePilihItem}
        />
      )}
      {showUploadModal && (
        <UploadBuktiModal
          onClose={() => { setShowUploadModal(false); setSelectedItem(null) }}
          onSubmit={handleSubmitBukti}
          loading={uploadLoading}
          selectedItem={selectedItem}
        />
      )}
    </div>
  )
}