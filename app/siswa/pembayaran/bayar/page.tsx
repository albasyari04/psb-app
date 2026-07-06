'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/SettingsContext'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Pembayaran {
  id: string
  user_id: string
  nama_siswa: string
  nominal: number
  jenis_pembayaran: string
  metode_pembayaran: string
  status: 'menunggu' | 'dikonfirmasi' | 'ditolak'
  bukti_url?: string | null
  catatan?: string | null
  tanggal_bayar?: string | null
  created_at?: string | null
}

interface BiayaItem {
  no: number
  jenis: string
  jumlah: string
  nominal: number
  kategori: string
}

// ─── Konstanta ─────────────────────────────────────────────────────────────────

const REKENING_INFO = [
  {
    id: 'bri',
    label: 'Bank BRI',
    labelEn: 'BRI Bank',
    number: '5613 0104 4986 539',
    numberRaw: '561301044986539',
    name: 'Ahmad Agus Munif',
    primaryColor: '#003087',
    accentColor: '#0052CC',
    bgGradient: 'linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 100%)',
    borderColor: '#BFDBFE',
    icon: (
      <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#003087"/>
        <text x="20" y="25" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="sans-serif">BRI</text>
      </svg>
    ),
  },
  {
    id: 'dana',
    label: 'DANA',
    labelEn: 'DANA',
    number: '0878 1455 9628',
    numberRaw: '087814559628',
    name: 'Ahmad Agus Munif',
    primaryColor: '#118EEA',
    accentColor: '#0A75C7',
    bgGradient: 'linear-gradient(135deg, #EBF6FF 0%, #DBEAFE 100%)',
    borderColor: '#BAE6FD',
    icon: (
      <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#118EEA"/>
        <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800" fontFamily="sans-serif">DANA</text>
      </svg>
    ),
  },
]

const STATUS_MAP: Record<string, { label: string; labelEn: string; bg: string; bgDark: string; text: string; textDark: string; dot: string; dotDark: string }> = {
  menunggu: { 
    label: 'Menunggu Verifikasi', labelEn: 'Pending Verification',
    bg: '#FFF7ED', bgDark: '#2e2a1a',
    text: '#C2410C', textDark: '#fbbf24',
    dot: '#F97316', dotDark: '#fbbf24' 
  },
  dikonfirmasi: { 
    label: 'Dikonfirmasi', labelEn: 'Confirmed',
    bg: '#F0FDF4', bgDark: '#1a2e1a',
    text: '#15803D', textDark: '#34d399',
    dot: '#22C55E', dotDark: '#34d399' 
  },
  ditolak: { 
    label: 'Ditolak', labelEn: 'Rejected',
    bg: '#FFF1F2', bgDark: '#2e1a1a',
    text: '#BE123C', textDark: '#fca5a5',
    dot: '#F43F5E', dotDark: '#fca5a5' 
  },
}

const DATA_BIAYA: BiayaItem[] = [
  { no: 1,  jenis: 'Pendaftaran Asrama + Madrasah (Putra)', jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'Putra' },
  { no: 2,  jenis: 'KTS, Buku Pegangan Santri (Putra)',     jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putra' },
  { no: 3,  jenis: 'Raport (Putra)',                        jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putra' },
  { no: 4,  jenis: 'Seragam Madrasah (2 baju) - Putra',    jumlah: 'Rp. 200.000,-',           nominal: 200000,  kategori: 'Putra' },
  { no: 5,  jenis: 'Uang Kos Makan (2x sehari) - Putra',   jumlah: 'Rp. 300.000,-/Bulan',     nominal: 300000,  kategori: 'Putra' },
  { no: 6,  jenis: 'Sahriyah Asrama + Madrasah (Putra)',   jumlah: 'Rp. 180.000,-/3 Bulan',   nominal: 180000,  kategori: 'Putra' },
  { no: 7,  jenis: 'Uang Bangunan (Putra)',                 jumlah: 'Rp. 250.000,-/Tahun',     nominal: 250000,  kategori: 'Putra' },
  { no: 8,  jenis: 'Pendaftaran Asrama + Madrasah (Putri)', jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'Putri' },
  { no: 9,  jenis: 'KTS, Buku Pegangan Santri (Putri)',    jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putri' },
  { no: 10, jenis: 'Raport (Putri)',                        jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putri' },
  { no: 11, jenis: 'Seragam Madrasah (3 baju) - Putri',   jumlah: 'Rp. 300.000,-',           nominal: 300000,  kategori: 'Putri' },
  { no: 12, jenis: 'Uang Kos Makan (2x sehari) - Putri',  jumlah: 'Rp. 300.000,-/Bulan',     nominal: 300000,  kategori: 'Putri' },
  { no: 13, jenis: 'Sahriyah Asrama + Madrasah (Putri)',  jumlah: 'Rp. 180.000,-/3 Bulan',   nominal: 180000,  kategori: 'Putri' },
  { no: 14, jenis: 'Uang Bangunan (Putri)',                jumlah: 'Rp. 250.000,-',           nominal: 250000,  kategori: 'Putri' },
  { no: 15, jenis: 'Administrasi Pendaftaran (SMP)',       jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 16, jenis: 'Bet Sekolah (SMP)',                    jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 17, jenis: 'Administrasi Bangunan (SMP)',          jumlah: 'Rp. 200.000,-',           nominal: 200000,  kategori: 'SMP' },
  { no: 18, jenis: 'Uang SPP (SMP)',                       jumlah: 'Rp. 300.000,-/Semester',  nominal: 300000,  kategori: 'SMP' },
  { no: 19, jenis: 'Seragam Batik (SMP)',                  jumlah: 'Rp. 100.000,-',           nominal: 100000,  kategori: 'SMP' },
  { no: 20, jenis: 'Seragam Olahraga (SMP)',               jumlah: 'Rp. 150.000,-',           nominal: 150000,  kategori: 'SMP' },
  { no: 21, jenis: 'Ujian Semester I (SMP)',               jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 22, jenis: 'Ujian Semester II (SMP)',              jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 23, jenis: 'Raport (SMP)',                         jumlah: 'Rp. 80.000,-',            nominal: 80000,   kategori: 'SMP' },
  { no: 24, jenis: 'Administrasi Pendaftaran (SMA)',       jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMA' },
  { no: 25, jenis: 'Bet Sekolah (SMA)',                    jumlah: 'Rp. 75.000,-',            nominal: 75000,   kategori: 'SMA' },
  { no: 26, jenis: 'Cetak Photo 2x3 & 3x4',               jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMA' },
  { no: 27, jenis: 'Raport (SMA)',                         jumlah: 'Rp. 75.000,-',            nominal: 75000,   kategori: 'SMA' },
  { no: 28, jenis: 'Uang SPP (SMA)',                       jumlah: 'Rp. 350.000,-/Semester',  nominal: 350000,  kategori: 'SMA' },
  { no: 29, jenis: 'Seragam Batik (SMA)',                  jumlah: 'Rp. 100.000,-',           nominal: 100000,  kategori: 'SMA' },
  { no: 30, jenis: 'Seragam Olahraga (SMA)',               jumlah: 'Rp. 150.000,-',           nominal: 150000,  kategori: 'SMA' },
  { no: 31, jenis: 'Administrasi Bangunan (SMA)',          jumlah: 'Rp. 600.000,-/1 Tahun',   nominal: 600000,  kategori: 'SMA' },
]

// ─── Layout Constants ────────────────────────────────────────────────────────
const HEADER_HEIGHT = 92

// ─── Utils ─────────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n)
}

function formatTanggal(t: string | null, isEn: boolean = false) {
  if (!t) return '-'
  const locale = isEn ? 'en-US' : 'id-ID'
  return new Date(t).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
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

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

const IcCopy = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth="2"/>
  </svg>
)
const IcCheck = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcUpload = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 8 12 3 7 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="3" x2="12" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IcImage = ({ color = '#6366F1' }: { color?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.5"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
    <path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IcReceipt = ({ color = '#6366F1' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V8z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2v4a2 2 0 0 0 2 2h4" stroke={color} strokeWidth="1.5"/>
    <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="9" y1="17" x2="13" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IcBack = ({ color = '#0F766E' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ─── Copy Button ────────────────────────────────────────────────────────────────

function CopyButton({ text, isEn = false, isDark = false }: { text: string; isEn?: boolean; isDark?: boolean }) {
  const [copied, setCopied] = useState(false)
  const bg = isDark ? '#15131f' : '#F8FAFC'
  const borderColor = copied ? '#BBF7D0' : (isDark ? '#2e2a40' : '#E2E8F0')
  const color = copied ? '#16A34A' : (isDark ? '#94a3b8' : '#64748B')
  
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text.replace(/\s/g, '')); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, padding: '5px 12px', borderRadius: 20,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: borderColor,
        background: bg,
        color: color,
        cursor: 'pointer', transition: 'all .2s', fontWeight: 600,
        fontFamily: 'inherit',
      }}
    >
      {copied ? <IcCheck color={color} /> : <IcCopy color={color} />}
      {copied ? (isEn ? 'Copied!' : 'Disalin!') : (isEn ? 'Copy Number' : 'Salin Nomor')}
    </button>
  )
}

// ─── Rekening Card ──────────────────────────────────────────────────────────────

function RekeningCard({ item, isDark = false, isEn = false }: { item: typeof REKENING_INFO[0]; isDark?: boolean; isEn?: boolean }) {
  const cardBg = isDark ? '#1e1b2e' : '#fff'
  const borderColor = isDark ? '#2e2a40' : '#E8EDF5'
  const textColor = isDark ? '#f1f0f5' : '#1E293B'
  const mutedColor = isDark ? '#94a3b8' : '#64748B'
  
  return (
    <div style={{
      background: cardBg,
      borderRadius: 16,
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: borderColor,
      borderLeftColor: item.primaryColor,
      borderLeftWidth: '4px',
      padding: '14px', flex: 1, minWidth: 0,
      boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: item.bgGradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {item.icon}
        </div>
        <span style={{ fontWeight: 800, fontSize: 13, color: item.primaryColor, fontFamily: 'inherit' }}>
          {isEn ? item.labelEn : item.label}
        </span>
      </div>
      <p style={{ fontWeight: 800, fontSize: 15, color: textColor, letterSpacing: 0.3, margin: '0 0 3px', fontFamily: 'inherit', lineHeight: 1.3 }}>
        {item.number}
      </p>
      <p style={{ fontSize: 10, color: mutedColor, margin: '0 0 12px', fontWeight: 500, fontFamily: 'inherit' }}>
        {item.name}
      </p>
      <CopyButton text={item.numberRaw} isEn={isEn} isDark={isDark} />
    </div>
  )
}

// ─── Cara Pembayaran ────────────────────────────────────────────────────────────

function CaraPembayaran({ isDark = false, isEn = false }: { isDark?: boolean; isEn?: boolean }) {
  const steps = [
    { 
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
      label: isEn ? 'Select payment\ntype' : 'Pilih jenis\npembayaran' 
    },
    { 
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/></svg>, 
      label: isEn ? 'Transfer\naccording to amount' : 'Transfer\nsesuai nominal' 
    },
    { 
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8"/></svg>, 
      label: isEn ? 'Upload payment\nproof' : 'Upload bukti\npembayaran' 
    },
    { 
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
      label: isEn ? 'Wait for admin\nconfirmation' : 'Tunggu\nkonfirmasi admin' 
    },
  ]
  
  const cardBg = isDark ? '#1e1b2e' : '#fff'
  const borderColor = isDark ? '#2e2a40' : '#F1F5F9'
  const textColor = isDark ? '#f1f0f5' : '#1E293B'
  
  return (
    <div style={{ 
      background: cardBg, 
      borderRadius: 20, 
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: borderColor,
      padding: '16px', marginBottom: 20, 
      boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.05)' 
    }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: textColor, margin: '0 0 14px', fontFamily: 'inherit' }}>
        {isEn ? '📋 How to Pay' : '📋 Cara Pembayaran'}
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', top: 18, left: '58%', right: '-42%', height: 2, background: 'linear-gradient(to right, #6366F1 0%, #C7D2FE 100%)', zIndex: 0 }} />
            )}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                {step.icon}
              </div>
              <div style={{ position: 'absolute', bottom: -3, right: -3, width: 15, height: 15, borderRadius: '50%', background: isDark ? '#1e1b2e' : '#fff', borderWidth: '2px', borderStyle: 'solid', borderColor: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: '#6366F1', fontFamily: 'inherit' }}>{i + 1}</span>
              </div>
            </div>
            <p style={{ fontSize: 9, color: isDark ? '#94a3b8' : '#475569', margin: 0, textAlign: 'center', lineHeight: 1.55, fontWeight: 600, whiteSpace: 'pre-line', fontFamily: 'inherit' }}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Security Banner ────────────────────────────────────────────────────────────

function SecurityBanner({ isDark = false, isEn = false }: { isDark?: boolean; isEn?: boolean }) {
  const bg = isDark ? 'linear-gradient(135deg, #1e1b2e 0%, #1a1a3d 100%)' : 'linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 100%)'
  const borderColor = isDark ? '#2e2a40' : '#E0E7FF'
  const titleColor = isDark ? '#a5b4fc' : '#4338CA'
  const subColor = isDark ? '#818cf8' : '#6366F1'
  
  return (
    <div style={{
      background: bg,
      borderRadius: 16,
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: borderColor,
      padding: '12px 14px', marginBottom: 22,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(99,102,241,0.07)',
    }}>
      <div style={{ flexShrink: 0, color: isDark ? '#818cf8' : '#6366F1' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" fill={isDark ? '#1a1a3d' : '#6366F1'} opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: titleColor, margin: 0, fontFamily: 'inherit' }}>
          {isEn ? 'Secure & Verified Payment' : 'Pembayaran Aman & Terverifikasi'}
        </p>
        <p style={{ fontSize: 10, color: subColor, margin: '2px 0 0', fontFamily: 'inherit', fontWeight: 500 }}>
          {isEn ? 'Payment proof is verified directly by the school admin' : 'Bukti pembayaran diverifikasi langsung oleh admin pesantren'}
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SiswaPembayaranBayarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

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
      if (!res.ok) throw new Error(isEn ? 'Failed to fetch data' : 'Gagal mengambil data')
      const json = await res.json()
      const filtered = (json.data as Pembayaran[]).filter((p) => p.user_id === session.user.id)
      setData(filtered)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (isEn ? 'An error occurred' : 'Terjadi kesalahan'))
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, isEn])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, session, fetchData])

  const handlePilihItem = (item: BiayaItem) => {
    setSelectedItem(item)
    setShowPilihModal(false)
    setShowUploadModal(true)
  }

  const handleSubmitBukti = async (file: File, catatan: string, nominal: number, jenisPembayaran: string) => {
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
        throw new Error(errJson.error || (isEn ? 'Failed to send payment data' : 'Gagal mengirim data pembayaran'))
      }
      setShowUploadModal(false)
      setSelectedItem(null)
      showToast(
        isEn ? `Payment proof for ${jenisPembayaran} sent successfully!` : `Bukti pembayaran untuk ${jenisPembayaran} berhasil dikirim!`,
        'success'
      )
      fetchData()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : (isEn ? 'Failed to send proof' : 'Gagal mengirim bukti'), 'error')
    } finally {
      setUploadLoading(false)
    }
  }

  const dikonfirmasiCount = data.filter((d) => d.status === 'dikonfirmasi').length
  const menungguCount = data.filter((d) => d.status === 'menunggu').length

  // ─── i18n helpers ──────────────────────────────────────────────────────────
  const getStatusLabel = (status: string) => {
    const config = STATUS_MAP[status]
    if (!config) return status
    return isEn ? config.labelEn : config.label
  }

  const getStatusStyle = (status: string) => {
    const config = STATUS_MAP[status]
    if (!config) return { bg: '#F8FAFC', text: '#64748B', dot: '#94A3B8' }
    return {
      bg: isDark ? config.bgDark : config.bg,
      text: isDark ? config.textDark : config.text,
      dot: isDark ? config.dotDark : config.dot,
    }
  }

  // ─── Dark mode colors ──────────────────────────────────────────────────────
  const bgColor = isDark ? '#15131f' : '#F4F6FA'
  const cardBg = isDark ? '#1e1b2e' : '#fff'
  const cardBorder = isDark ? '#2e2a40' : '#F1F5F9'
  const textColor = isDark ? '#f1f0f5' : '#0F172A'
  const mutedColor = isDark ? '#94a3b8' : '#94A3B8'
  const headerBg = isDark ? '#1e1b2e' : '#fff'
  const headerBorder = isDark ? '#2e2a40' : '#F1F5F9'
  const backBtnBg = isDark ? '#1a2e1a' : '#ECFDF5'
  const backBtnColor = isDark ? '#34d399' : '#0F766E'

  // ─── Loading state ────────────────────────────────────────────────────────────
  if (status === 'loading' || loading) {
    const spinnerColor = isDark ? '#2e2a40' : '#E0E7FF'
    const spinnerTopColor = isDark ? '#a5b4fc' : '#6366F1'
    const spinnerRightColor = isDark ? '#818cf8' : '#8B5CF6'
    const textColor2 = isDark ? '#6b6885' : '#94A3B8'
    
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: bgColor, gap: 16,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${spinnerColor}` }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: spinnerTopColor, borderRightColor: spinnerRightColor, animation: 'spin .8s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: isDark ? 'linear-gradient(135deg, #1e1b2e, #2e2a40)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcReceipt color={isDark ? '#a5b4fc' : '#fff'} />
          </div>
        </div>
        <p style={{ color: textColor2, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
          {isEn ? 'Loading payment data...' : 'Memuat data pembayaran...'}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: bgColor,
      paddingBottom: 100,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 400, background: toast.type === 'success'
            ? (isDark ? 'linear-gradient(135deg, #065f46, #0A5C46)' : 'linear-gradient(135deg, #1E293B, #0F172A)')
            : (isDark ? 'linear-gradient(135deg, #7f1d1d, #4a1a1a)' : 'linear-gradient(135deg, #BE123C, #9F1239)'),
          color: '#fff', borderRadius: 16, padding: '13px 20px',
          fontSize: 12, fontWeight: 700,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          maxWidth: '88vw', animation: 'fadeInDown .3s ease',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'inherit',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        maxWidth: 520, margin: '0 auto',
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={isEn ? 'Back' : 'Kembali'}
          style={{
            width: 40, height: 40, borderRadius: 14, flexShrink: 0,
            background: backBtnBg, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <IcBack color={backBtnColor} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            color: textColor, fontWeight: 800, fontSize: 20,
            margin: 0, letterSpacing: -0.3, fontFamily: 'inherit', lineHeight: 1.25,
          }}>
            {isEn ? 'Payment' : 'Pembayaran'}
          </h1>
          <p style={{
            color: mutedColor, fontWeight: 500, fontSize: 12.5,
            margin: '2px 0 0', fontFamily: 'inherit',
          }}>
            {isEn ? 'Manage payment transactions' : 'Kelola transaksi pembayaran'}
          </p>
        </div>
      </div>
      <div style={{ height: HEADER_HEIGHT, flexShrink: 0 }} />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '22px 16px', maxWidth: 520, margin: '0 auto' }}>

        {/* ── Tujuan Transfer ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: mutedColor, textTransform: 'uppercase', letterSpacing: 1.3, margin: 0, fontFamily: 'inherit' }}>
            {isEn ? 'Quick Transfer' : 'Transfer Cepat'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"
                fill="#22C55E" opacity="0.15" stroke="#22C55E" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', fontFamily: 'inherit' }}>
              {isEn ? 'Secure & Verified' : 'Aman & Terverifikasi'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
          {REKENING_INFO.map((r) => <RekeningCard key={r.id} item={r} isDark={isDark} isEn={isEn} />)}
        </div>

        {/* ── Info Pembayaran ─────────────────────────────────────────────── */}
        <p style={{ fontSize: 10, fontWeight: 800, color: mutedColor, textTransform: 'uppercase', letterSpacing: 1.3, margin: '0 0 10px', fontFamily: 'inherit' }}>
          {isEn ? 'Payment Information' : 'Informasi Pembayaran'}
        </p>
        <div style={{
          background: cardBg, borderRadius: 20,
          borderWidth: '1.5px', borderStyle: 'solid', borderColor: cardBorder,
          padding: '16px', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
          marginBottom: 20,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: isDark ? '#2e2a40' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={isDark ? '#a5b4fc' : '#6366F1'} strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke={isDark ? '#a5b4fc' : '#6366F1'} strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10, color: mutedColor, fontWeight: 600, margin: '0 0 2px', fontFamily: 'inherit' }}>
                  {isEn ? 'Applicant Name' : 'Nama Pendaftar'}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: 0, fontFamily: 'inherit', lineHeight: 1.3 }}>
                  {session?.user?.name ?? '-'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: isDark ? '#2e2a40' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="3" stroke={isDark ? '#a5b4fc' : '#6366F1'} strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke={isDark ? '#a5b4fc' : '#6366F1'} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke={isDark ? '#a5b4fc' : '#6366F1'} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke={isDark ? '#a5b4fc' : '#6366F1'} strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10, color: mutedColor, fontWeight: 600, margin: '0 0 2px', fontFamily: 'inherit' }}>
                  {isEn ? 'Period' : 'Periode'}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: 0, fontFamily: 'inherit' }}>2025/2026</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: isDark ? '#1a2e1a' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke={isDark ? '#34d399' : '#22C55E'} strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" stroke={isDark ? '#34d399' : '#22C55E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10, color: mutedColor, fontWeight: 600, margin: '0 0 2px', fontFamily: 'inherit' }}>
                  {isEn ? 'Confirmed Total' : 'Total Dikonfirmasi'}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: 0, fontFamily: 'inherit' }}>
                  {dikonfirmasiCount} {isEn ? 'Items' : 'Item'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: isDark ? '#2e2a1a' : '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke={isDark ? '#fbbf24' : '#F97316'} strokeWidth="2"/>
                  <line x1="12" y1="7" x2="12" y2="12" stroke={isDark ? '#fbbf24' : '#F97316'} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="15" x2="12" y2="15.5" stroke={isDark ? '#fbbf24' : '#F97316'} strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10, color: mutedColor, fontWeight: 600, margin: '0 0 2px', fontFamily: 'inherit' }}>
                  {isEn ? 'Pending Verification' : 'Menunggu Verifikasi'}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: 0, fontFamily: 'inherit' }}>
                  {menungguCount} {isEn ? 'Items' : 'Item'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Cara Pembayaran ─────────────────────────────────────────────── */}
        <p style={{ fontSize: 10, fontWeight: 800, color: mutedColor, textTransform: 'uppercase', letterSpacing: 1.3, margin: '0 0 10px', fontFamily: 'inherit' }}>
          {isEn ? 'Payment Steps' : 'Langkah Pembayaran'}
        </p>
        <CaraPembayaran isDark={isDark} isEn={isEn} />

        {/* ── Security Banner ─────────────────────────────────────────────── */}
        <SecurityBanner isDark={isDark} isEn={isEn} />

        {/* ── CTA Button ──────────────────────────────────────────────────── */}
        <button
          onClick={() => setShowPilihModal(true)}
          style={{
            width: '100%', padding: '17px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(79,70,229,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 28, fontFamily: 'inherit', transition: 'all .2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(79,70,229,0.55)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(79,70,229,0.45)' }}
        >
          <IcUpload color="#fff" />
          {isEn ? '+ Pay / Upload Proof' : '+ Bayar / Upload Bukti'}
        </button>

        {/* ── Riwayat ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: mutedColor, textTransform: 'uppercase', letterSpacing: 1.3, margin: 0, fontFamily: 'inherit' }}>
            {isEn ? 'Payment History' : 'Riwayat Pembayaran'}
          </p>
          <span style={{ fontSize: 12, color: isDark ? '#a5b4fc' : '#6366F1', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
            {isEn ? 'View all' : 'Lihat semua'}
          </span>
        </div>

        {error ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', background: cardBg, borderRadius: 18, borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#FEE2E2' }}>
            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>⚠️ {error}</p>
            <button onClick={fetchData} style={{ marginTop: 12, padding: '9px 22px', borderRadius: 12, background: '#6366F1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isEn ? 'Try Again' : 'Coba Lagi'}
            </button>
          </div>
        ) : data.length === 0 ? (
          <div style={{ background: cardBg, borderRadius: 20, padding: '48px 20px', textAlign: 'center', borderWidth: '2px', borderStyle: 'dashed', borderColor: isDark ? '#2e2a40' : '#E2E8F0' }}>
            <div style={{ width: 68, height: 68, borderRadius: 22, margin: '0 auto 16px', background: isDark ? 'linear-gradient(135deg, #1e1b2e, #2e2a40)' : 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.12)' }}>
              🧾
            </div>
            <p style={{ fontWeight: 800, color: textColor, fontSize: 14, margin: '0 0 6px', fontFamily: 'inherit' }}>
              {isEn ? 'No History' : 'Belum Ada Riwayat'}
            </p>
            <p style={{ color: mutedColor, fontSize: 12, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'Click "Pay / Upload Proof" to start' : 'Klik "Bayar / Upload Bukti" untuk memulai'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map((item) => {
              const st = getStatusStyle(item.status)
              const label = getStatusLabel(item.status)
              return (
                <div key={item.id} style={{ background: cardBg, borderRadius: 18, borderWidth: '1.5px', borderStyle: 'solid', borderColor: cardBorder, overflow: 'hidden', boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V8z" stroke={st.text} strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M16 2v4a2 2 0 0 0 2 2h4" stroke={st.text} strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: 0, lineHeight: 1.3, fontFamily: 'inherit' }}>
                        {item.jenis_pembayaran}
                      </p>
                      <p style={{ fontSize: 11, color: mutedColor, margin: '3px 0 0', fontFamily: 'inherit' }}>
                        {formatTanggal(item.tanggal_bayar ?? item.created_at ?? null, isEn)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: textColor, margin: 0, fontFamily: 'inherit' }}>
                        {formatRupiah(item.nominal)}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: st.text, fontFamily: 'inherit' }}>{label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals - simplified for brevity, would need full i18n implementation */}
      {showPilihModal && (
        <PilihPembayaranModal 
          onClose={() => setShowPilihModal(false)} 
          onSelect={handlePilihItem}
          isDark={isDark}
          isEn={isEn}
        />
      )}
      {showUploadModal && (
        <UploadBuktiModal
          onClose={() => { setShowUploadModal(false); setSelectedItem(null) }}
          onSubmit={handleSubmitBukti}
          loading={uploadLoading}
          selectedItem={selectedItem}
          isDark={isDark}
          isEn={isEn}
        />
      )}
    </div>
  )
}

// ─── PilihPembayaranModal ──────────────────────────────────────────────────────

function PilihPembayaranModal({
  onClose,
  onSelect,
  isDark = false,
  isEn = false,
}: {
  onClose: () => void
  onSelect: (item: BiayaItem) => void
  isDark?: boolean
  isEn?: boolean
}) {
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState<string>('Semua')
  const KATEGORI_LIST = ['Putra', 'Putri', 'SMP', 'SMA']
  const KATEGORI_LIST_EN = ['Boys', 'Girls', 'Junior High', 'Senior High']

  const filtered = DATA_BIAYA.filter((b) => {
    const matchKat = kategori === 'Semua' || kategori === 'All' || b.kategori === kategori
    const matchSearch = b.jenis.toLowerCase().includes(search.toLowerCase())
    return matchKat && matchSearch
  })

  const getKategoriLabel = (k: string) => {
    if (k === 'Semua') return isEn ? 'All' : 'Semua'
    const idx = KATEGORI_LIST.indexOf(k)
    return idx >= 0 ? (isEn ? KATEGORI_LIST_EN[idx] : k) : k
  }

  const bgColor = isDark ? '#15131f' : '#fff'
  const textColor = isDark ? '#f1f0f5' : '#1E293B'
  const mutedColor = isDark ? '#94a3b8' : '#94A3B8'
  const borderColor = isDark ? '#2e2a40' : '#E2E8F0'
  const inputBg = isDark ? '#1e1b2e' : '#F8FAFC'
  const inputBorder = isDark ? '#2e2a40' : '#E2E8F0'
  const itemBg = isDark ? '#1e1b2e' : '#FAFBFC'
  const itemBorder = isDark ? '#2e2a40' : '#F1F5F9'
  const itemHoverBg = isDark ? '#2e2a40' : '#F8F7FF'
  const itemHoverBorder = isDark ? '#3d3655' : '#C7D2FE'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 520, background: bgColor,
        borderRadius: '24px 24px 0 0', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        borderTop: isDark ? '1px solid #2e2a40' : 'none',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: isDark ? '#3d3655' : '#E2E8F0', margin: '12px auto 0', flexShrink: 0 }} />

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: textColor, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'Select Payment Type' : 'Pilih Jenis Pembayaran'}
            </p>
            <p style={{ fontSize: 11, color: mutedColor, margin: '2px 0 0', fontFamily: 'inherit' }}>
              {filtered.length} {isEn ? 'items available' : 'item tersedia'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, borderWidth: '1.5px', borderStyle: 'solid', borderColor: borderColor, background: isDark ? '#1e1b2e' : '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#94a3b8' : '#64748B'} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: mutedColor }}>
              <circle cx="11" cy="11" r="8" stroke={mutedColor} strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke={mutedColor} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Search payment type...' : 'Cari jenis pembayaran...'}
              style={{
                width: '100%', padding: '10px 12px 10px 34px', borderRadius: 12,
                borderWidth: '1.5px', borderStyle: 'solid', borderColor: inputBorder,
                fontSize: 12, fontFamily: 'inherit',
                outline: 'none', color: textColor, background: inputBg,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ padding: '10px 20px 0', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, flexShrink: 0, minHeight: 36 }}>
          {['Semua', ...KATEGORI_LIST].map((k) => {
            const label = k === 'Semua' ? (isEn ? 'All' : 'Semua') : (isEn ? KATEGORI_LIST_EN[KATEGORI_LIST.indexOf(k)] : k)
            const isActive = kategori === k || (k === 'Semua' && kategori === 'All')
            return (
              <button
                key={k}
                onClick={() => setKategori(k)}
                style={{
                  padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  borderWidth: '1.5px', borderStyle: 'solid',
                  borderColor: isActive ? '#6366F1' : borderColor,
                  background: isActive ? (isDark ? '#2e2a40' : '#EEF2FF') : (isDark ? '#15131f' : '#F8FAFC'),
                  color: isActive ? (isDark ? '#a5b4fc' : '#4338CA') : (isDark ? '#94a3b8' : '#64748B'),
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '10px 20px 24px' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: mutedColor, fontSize: 12, padding: '24px 0', fontFamily: 'inherit' }}>
              {isEn ? 'No results found' : 'Tidak ditemukan'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((b) => (
                <button
                  key={b.no}
                  onClick={() => onSelect(b)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 14,
                    borderWidth: '1.5px', borderStyle: 'solid', borderColor: itemBorder,
                    background: itemBg,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = itemHoverBorder; e.currentTarget.style.background = itemHoverBg }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = itemBorder; e.currentTarget.style.background = itemBg }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: textColor, margin: 0, fontFamily: 'inherit', lineHeight: 1.35 }}>{b.jenis}</p>
                    <p style={{ fontSize: 10, color: mutedColor, margin: '3px 0 0', fontFamily: 'inherit' }}>
                      {isEn ? 'Category' : 'Kategori'}: {getKategoriLabel(b.kategori)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6366F1', margin: 0, fontFamily: 'inherit' }}>{b.jumlah}</p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 4 }}>
                      <polyline points="9 18 15 12 9 6" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── UploadBuktiModal ────────────────────────────────────────────────────────

function UploadBuktiModal({
  onClose,
  onSubmit,
  loading,
  selectedItem,
  isDark = false,
  isEn = false,
}: {
  onClose: () => void
  onSubmit: (file: File, catatan: string, nominal: number, jenis: string) => void
  loading: boolean
  selectedItem: BiayaItem | null
  isDark?: boolean
  isEn?: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [catatan, setCatatan] = useState('')
  const [nominal, setNominal] = useState(selectedItem?.nominal ?? 0)
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const bgColor = isDark ? '#15131f' : '#fff'
  const textColor = isDark ? '#f1f0f5' : '#1E293B'
  const mutedColor = isDark ? '#94a3b8' : '#64748B'
  const borderColor = isDark ? '#2e2a40' : '#E2E8F0'
  const inputBg = isDark ? '#1e1b2e' : '#FAFBFC'
  const inputBorder = isDark ? '#2e2a40' : '#E2E8F0'
  const dropBg = isDark ? '#1e1b2e' : '#FAFBFC'
  const dropBorder = drag ? '#6366F1' : (isDark ? '#2e2a40' : '#E2E8F0')
  const dropBgDrag = isDark ? '#2e2a40' : '#F8F7FF'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: 520, background: bgColor, borderRadius: '24px 24px 0 0', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderTop: isDark ? '1px solid #2e2a40' : 'none' }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: isDark ? '#3d3655' : '#E2E8F0', margin: '12px auto 0' }} />

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: textColor, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'Upload Payment Proof' : 'Upload Bukti Pembayaran'}
            </p>
            {selectedItem && (
              <p style={{ fontSize: 11, color: '#6366F1', margin: '2px 0 0', fontFamily: 'inherit', fontWeight: 600 }}>
                {selectedItem.jenis}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, borderWidth: '1.5px', borderStyle: 'solid', borderColor: borderColor, background: isDark ? '#1e1b2e' : '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#94a3b8' : '#64748B'} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: mutedColor, fontFamily: 'inherit' }}>
              {isEn ? 'Payment Amount (Rp)' : 'Nominal Pembayaran (Rp)'}
            </label>
            <input
              type="number"
              value={nominal}
              onChange={(e) => setNominal(Number(e.target.value))}
              style={{
                display: 'block', width: '100%', marginTop: 6,
                padding: '12px 14px', borderRadius: 12,
                borderWidth: '1.5px', borderStyle: 'solid', borderColor: inputBorder,
                fontSize: 14, fontWeight: 700, color: textColor, fontFamily: 'inherit',
                outline: 'none', background: inputBg,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: mutedColor, fontFamily: 'inherit' }}>
              {isEn ? 'Transfer Proof *' : 'Bukti Transfer *'}
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              style={{
                marginTop: 6, borderRadius: 16,
                borderWidth: '2px', borderStyle: 'dashed',
                borderColor: dropBorder,
                background: drag ? dropBgDrag : dropBg,
                padding: '20px', textAlign: 'center', cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {preview ? (
                <Image src={preview} alt="preview" width={300} height={180} style={{ maxHeight: 180, borderRadius: 10, objectFit: 'contain', maxWidth: '100%' }} />
              ) : (
                <>
                  <div style={{ marginBottom: 8, color: isDark ? '#a5b4fc' : '#6366F1' }}>
                    <IcImage color={isDark ? '#a5b4fc' : '#6366F1'} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#475569', margin: 0, fontFamily: 'inherit' }}>
                    {isEn ? 'Click or drag transfer proof image' : 'Klik atau drag foto bukti transfer'}
                  </p>
                  <p style={{ fontSize: 10, color: mutedColor, margin: '4px 0 0', fontFamily: 'inherit' }}>
                    JPG, PNG, WEBP – {isEn ? 'max. 5MB' : 'maks. 5MB'}
                  </p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: mutedColor, fontFamily: 'inherit' }}>
              {isEn ? 'Notes (optional)' : 'Catatan (opsional)'}
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder={isEn ? 'e.g., payment stage 1, July...' : 'Misal: pembayaran tahap 1, bulan Juli...'}
              style={{
                display: 'block', width: '100%', marginTop: 6,
                padding: '10px 14px', borderRadius: 12,
                borderWidth: '1.5px', borderStyle: 'solid', borderColor: inputBorder,
                fontSize: 12, color: textColor, fontFamily: 'inherit', resize: 'none',
                outline: 'none', background: inputBg,
              }}
            />
          </div>

          <button
            disabled={!file || loading}
            onClick={() => { if (file && selectedItem) onSubmit(file, catatan, nominal, selectedItem.jenis) }}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 16, border: 'none', cursor: file && !loading ? 'pointer' : 'not-allowed',
              background: file && !loading ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : (isDark ? '#2e2a40' : '#E2E8F0'),
              color: file && !loading ? '#fff' : (isDark ? '#6b6885' : '#94A3B8'),
              fontWeight: 800, fontSize: 14, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: file && !loading ? '0 8px 24px rgba(79,70,229,0.35)' : 'none',
              transition: 'all .2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                {isEn ? 'Sending...' : 'Mengirim...'}
              </>
            ) : (
              <>
                <IcUpload color="#fff" />
                {isEn ? 'Submit Payment Proof' : 'Kirim Bukti Pembayaran'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}