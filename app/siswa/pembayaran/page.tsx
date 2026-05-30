'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Pembayaran } from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

const REKENING_INFO = [
  {
    icon: '🏦',
    label: 'Bank BRI',
    number: '561301044986539',
    name: 'Ahmad Agus Munif',
    color: '#003087',
    bg: '#EEF2FF',
  },
  {
    icon: '💙',
    label: 'DANA',
    number: '087814559628',
    name: 'Ahmad Agus Munif',
    color: '#118EEA',
    bg: '#EBF6FF',
  },
]

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  menunggu: { label: 'Menunggu Verifikasi', bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
  dikonfirmasi: { label: 'Dikonfirmasi', bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  ditolak: { label: 'Ditolak', bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E' },
}

// ─── Data Biaya Berdasarkan Gambar ───────────────────────────────────────────

interface BiayaItem {
  no: number
  jenis: string
  jumlah: string
  nominal: number
  kategori: string
}

const DATA_BIAYA: BiayaItem[] = [
  // Pondok Pesantren Putra
  { no: 1, jenis: 'Pendaftaran Asrama + Madrasah (Putra)', jumlah: 'Rp. 100.000,-', nominal: 100000, kategori: 'Putra' },
  { no: 2, jenis: 'KTS, Buku Pegangan Santri (Putra)', jumlah: 'Rp. 70.000,-', nominal: 70000, kategori: 'Putra' },
  { no: 3, jenis: 'Raport (Putra)', jumlah: 'Rp. 70.000,-', nominal: 70000, kategori: 'Putra' },
  { no: 4, jenis: 'Seragam Madrasah (2 baju) - Putra', jumlah: 'Rp. 200.000,-', nominal: 200000, kategori: 'Putra' },
  { no: 5, jenis: 'Uang Kos Makan (2x sehari) - Putra', jumlah: 'Rp. 300.000,-/Bulan', nominal: 300000, kategori: 'Putra' },
  { no: 6, jenis: 'Sahriyah Asrama + Madrasah (Putra)', jumlah: 'Rp. 180.000,-/3 Bulan', nominal: 180000, kategori: 'Putra' },
  { no: 7, jenis: 'Uang Bangunan (Putra)', jumlah: 'Rp. 250.000,-/Tahun', nominal: 250000, kategori: 'Putra' },
  // Pondok Pesantren Putri
  { no: 8, jenis: 'Pendaftaran Asrama + Madrasah (Putri)', jumlah: 'Rp. 100.000,-', nominal: 100000, kategori: 'Putri' },
  { no: 9, jenis: 'KTS, Buku Pegangan Santri (Putri)', jumlah: 'Rp. 70.000,-', nominal: 70000, kategori: 'Putri' },
  { no: 10, jenis: 'Raport (Putri)', jumlah: 'Rp. 70.000,-', nominal: 70000, kategori: 'Putri' },
  { no: 11, jenis: 'Seragam Madrasah (3 baju) - Putri', jumlah: 'Rp. 300.000,-', nominal: 300000, kategori: 'Putri' },
  { no: 12, jenis: 'Uang Kos Makan (2x sehari) - Putri', jumlah: 'Rp. 300.000,-/Bulan', nominal: 300000, kategori: 'Putri' },
  { no: 13, jenis: 'Sahriyah Asrama + Madrasah (Putri)', jumlah: 'Rp. 180.000,-/3 Bulan', nominal: 180000, kategori: 'Putri' },
  { no: 14, jenis: 'Uang Bangunan (Putri)', jumlah: 'Rp. 250.000,-', nominal: 2500000, kategori: 'Putri' },
  // SMP
  { no: 15, jenis: 'Administrasi Pendaftaran (SMP)', jumlah: 'Rp. 50.000,-', nominal: 50000, kategori: 'SMP' },
  { no: 16, jenis: 'Bet Sekolah (SMP)', jumlah: 'Rp. 50.000,-', nominal: 50000, kategori: 'SMP' },
  { no: 17, jenis: 'Administrasi Bangunan (SMP)', jumlah: 'Rp. 200.000,-', nominal: 200000, kategori: 'SMP' },
  { no: 18, jenis: 'Uang SPP (SMP)', jumlah: 'Rp. 300.000,-/Semester', nominal: 300000, kategori: 'SMP' },
  { no: 19, jenis: 'Seragam Batik (SMP)', jumlah: 'Rp. 100.000,-', nominal: 100000, kategori: 'SMP' },
  { no: 20, jenis: 'Seragam Olahraga (SMP)', jumlah: 'Rp. 150.000,-', nominal: 150000, kategori: 'SMP' },
  { no: 21, jenis: 'Ujian Semester I (SMP)', jumlah: 'Rp. 50.000,-', nominal: 50000, kategori: 'SMP' },
  { no: 22, jenis: 'Ujian Semester II (SMP)', jumlah: 'Rp. 50.000,-', nominal: 50000, kategori: 'SMP' },
  { no: 23, jenis: 'Raport  (SMP)', jumlah: 'Rp. 80.000,-', nominal: 80000, kategori: 'SMP' },
  // SMA
  { no: 24, jenis: 'Administrasi Pendaftaran (SMA)', jumlah: 'Rp. 50.000,-', nominal: 50000, kategori: 'SMA' },
  { no: 25, jenis: 'Bet Sekolah (SMA)', jumlah: 'Rp. 75.000,-', nominal: 75000, kategori: 'SMA' },
  { no: 26, jenis: 'Cetak Photo 2x3 & 3x4', jumlah: 'Rp. 50.000,-', nominal: 50000, kategori: 'SMA' },
  { no: 27, jenis: 'Raport (SMA)', jumlah: 'Rp. 75.000,-', nominal: 75000, kategori: 'SMA' },
  { no: 28, jenis: 'Uang SPP (SMA)', jumlah: 'Rp. 350.000,-/Semester', nominal: 350000, kategori: 'SMA' },
  { no: 29, jenis: 'Seragam Batik (SMA)', jumlah: 'Rp. 100.000,-', nominal: 100000, kategori: 'SMA' },
  { no: 30, jenis: 'Seragam Olahraga (SMA)', jumlah: 'Rp. 150.000,-', nominal: 150000, kategori: 'SMA' },
  { no: 31, jenis: 'Administrasi Bangunan (SMA)', jumlah: 'Rp. 600.000,-/1 Tahun', nominal: 600000, kategori: 'SMA' },
]

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatTanggal(t: string | null) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Upload bukti ke Supabase Storage via API ─────────────────────────────────

async function uploadBukti(file: File, userId: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)

  const res = await fetch('/api/siswa/pembayaran/upload', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal upload gambar')
  }

  const { url } = await res.json()
  return url
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text.replace(/-/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        padding: '3px 10px',
        borderRadius: 20,
        border: '1px solid #CBD5E1',
        background: copied ? '#F0FDF4' : '#F8FAFC',
        color: copied ? '#16A34A' : '#64748B',
        cursor: 'pointer',
        transition: 'all .2s',
        fontWeight: 500,
      }}
    >
      {copied ? '✓ Disalin' : '⎘ Salin'}
    </button>
  )
}

function RekeningCard({ item }: { item: typeof REKENING_INFO[0] }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1.5px solid #E2E8F0',
        padding: '16px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: item.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          {item.icon}
        </div>
        <span style={{ fontWeight: 700, fontSize: 13, color: item.color }}>{item.label}</span>
      </div>
      <p style={{ fontWeight: 800, fontSize: 13, color: '#1E293B', letterSpacing: 0.3, margin: 0, wordBreak: 'break-all' }}>
        {item.number}
      </p>
      <p style={{ fontSize: 10, color: '#94A3B8', margin: '3px 0 10px', fontWeight: 500, lineHeight: 1.4 }}>
        a/n {item.name}
      </p>
      <CopyButton text={item.number} />
    </div>
  )
}

// ─── Komponen Pilih Jenis Pembayaran ─────────────────────────────────────────

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            padding: '20px 20px 16px',
            borderRadius: '28px 28px 0 0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                Pilih Jenis Pembayaran
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                Pilih biaya yang ingin Anda bayar
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setIsMultipleMode(false)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 12,
                background: !isMultipleMode ? '#fff' : 'rgba(255,255,255,0.15)',
                color: !isMultipleMode ? '#4F46E5' : '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Bayar Satu Item
            </button>
            <button
              onClick={() => setIsMultipleMode(true)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 12,
                background: isMultipleMode ? '#fff' : 'rgba(255,255,255,0.15)',
                color: isMultipleMode ? '#4F46E5' : '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Bayar Banyak Item
            </button>
          </div>
        </div>

        {/* Filter Kategori */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {kategoriList.map((kat) => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: selectedKategori === kat ? '#4F46E5' : '#F1F5F9',
                  color: selectedKategori === kat ? '#fff' : '#475569',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>

        {/* List Items */}
        <div style={{ padding: '16px 20px' }}>
          {filteredBiaya.map((item: BiayaItem) => (
            <div
              key={item.no}
              onClick={() => handleSelectItem(item.no)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid #F1F5F9',
                cursor: 'pointer',
                background: isMultipleMode && selectedItems.includes(item.no) ? '#F5F3FF' : 'transparent',
                borderRadius: 12,
                marginBottom: 4,
                paddingLeft: isMultipleMode && selectedItems.includes(item.no) ? 12 : 0,
                paddingRight: isMultipleMode && selectedItems.includes(item.no) ? 12 : 0,
              }}
            >
              {isMultipleMode && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: '2px solid',
                    borderColor: selectedItems.includes(item.no) ? '#4F46E5' : '#CBD5E1',
                    background: selectedItems.includes(item.no) ? '#4F46E5' : '#fff',
                    marginRight: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selectedItems.includes(item.no) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: '0 0 4px' }}>
                  {item.jenis}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5' }}>
                    {item.jumlah}
                  </span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#F1F5F9',
                    color: '#64748B',
                  }}>
                    {item.kategori}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer untuk mode multiple */}
        {isMultipleMode && selectedItems.length > 0 && (
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: '#fff',
              borderTop: '1px solid #E2E8F0',
              padding: '16px 20px',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>Total yang dipilih:</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#4F46E5' }}>{formatRupiah(totalNominal)}</span>
            </div>
            <button
              onClick={handleSubmitMultiple}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Lanjutkan ke Upload ({selectedItems.length} item)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

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
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = () => {
    if (file && selectedItem) {
      onSubmit(file, catatan, selectedItem.nominal, selectedItem.jenis)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '8px 20px 44px',
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          animation: 'slideUp .3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{ width: 40, height: 4, background: '#E2E8F0', borderRadius: 99, margin: '12px auto 20px' }} />

        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1E293B', margin: '0 0 4px' }}>
          Upload Bukti Pembayaran
        </h2>
        <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 18 }}>
          Foto atau screenshot bukti transfer harus jelas dan terbaca
        </p>

        {/* Info item yang dibayar */}
        {selectedItem && (
          <div
            style={{
              background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 10, color: '#6366F1', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>
              Yang Akan Dibayar
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', margin: '0 0 4px' }}>
              {selectedItem.jenis}
            </p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#4F46E5', margin: 0 }}>
              {selectedItem.jumlah}
            </p>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed',
            borderColor: preview ? '#6366F1' : '#CBD5E1',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            cursor: 'pointer',
            background: preview ? '#F8F7FF' : '#FAFBFC',
            marginBottom: 14,
            transition: 'all .2s',
          }}
        >
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Preview"
                width={300}
                height={220}
                style={{ width: '100%', height: 'auto', maxHeight: 220, objectFit: 'contain', borderRadius: 10 }}
              />
              <p style={{ fontSize: 11, color: '#6366F1', marginTop: 8, fontWeight: 600 }}>
                ✓ {file?.name}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }}
                style={{ fontSize: 11, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                Ganti foto
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🖼️</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>
                Tap atau seret foto di sini
              </p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
                JPG, PNG, WEBP · Maks. 5MB
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </div>

        {/* Catatan */}
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Catatan (opsional) — contoh: transfer via BRI, tanggal 25 Mei"
          rows={2}
          style={{
            width: '100%',
            borderRadius: 12,
            border: '1.5px solid #E2E8F0',
            padding: '10px 14px',
            fontSize: 13,
            color: '#1E293B',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            marginBottom: 16,
            background: '#FAFBFC',
          }}
        />

        <button
          disabled={!file || loading || !selectedItem}
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            background: !file || loading || !selectedItem
              ? '#CBD5E1'
              : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            cursor: !file || loading || !selectedItem ? 'not-allowed' : 'pointer',
            boxShadow: !file || loading || !selectedItem ? 'none' : '0 6px 20px rgba(99,102,241,0.38)',
            transition: 'all .2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span>{loading ? '⏳' : '📤'}</span>
          {loading ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function PembayaranCard({ item }: { item: Pembayaran }) {
  const s = STATUS_MAP[item.status] ?? {
    label: item.status,
    bg: '#F1F5F9',
    text: '#475569',
    dot: '#94A3B8',
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1.5px solid #F1F5F9',
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#1E293B', margin: 0 }}>
            {item.jenis_pembayaran}
          </p>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0', fontWeight: 500 }}>
            {item.metode_pembayaran ?? '—'}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: s.bg,
            borderRadius: 20,
            padding: '4px 10px',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: s.text }}>{s.label}</span>
        </div>
      </div>

      {item.nominal > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 12,
          }}
        >
          <p style={{ fontSize: 10, color: '#6366F1', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Nominal
          </p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#4338CA', margin: 0 }}>
            {formatRupiah(item.nominal)}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: 12 }}>
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

      {item.bukti_url && (
        <a
          href={item.bukti_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 12,
            padding: '9px 12px',
            borderRadius: 10,
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            textDecoration: 'none',
            color: '#6366F1',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span>🖼️</span>
          Lihat Bukti Pembayaran
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94A3B8' }}>↗</span>
        </a>
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </p>
      <p style={{ fontSize: 12, color: '#334155', fontWeight: 600, margin: 0 }}>{value}</p>
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
      setLoading(true)
      setError(null)
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
    if (status === 'authenticated') {
      fetchData()
    }
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
          user_id:           session.user.id,
          nama_siswa:        session.user.name,
          nominal:           nominal,
          jenis_pembayaran:  jenisPembayaran,
          metode_pembayaran: 'Transfer Bank',
          bukti_url:         buktiUrl,
          status:            'menunggu',
          catatan:           catatan || null,
          tanggal_bayar:     new Date().toISOString().split('T')[0],
        }),
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Gagal mengirim data pembayaran')
      }

      setShowUploadModal(false)
      setSelectedItem(null)
      showToast(`Bukti pembayaran untuk ${jenisPembayaran} berhasil dikirim! Admin akan memverifikasi segera.`, 'success')
      fetchData()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Gagal mengirim bukti', 'error')
    } finally {
      setUploadLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', gap: 12 }}>
        <div style={{ width: 44, height: 44, border: '4px solid #E2E8F0', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <p style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>Memuat data pembayaran...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: 100, fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: toast.type === 'success' ? '#1E293B' : '#BE123C',
          color: '#fff', borderRadius: 14, padding: '12px 18px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', maxWidth: '90vw', animation: 'fadeIn .25s ease',
        }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        padding: '52px 20px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 60, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, backdropFilter: 'blur(4px)' }}>
              💳
            </div>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: 0 }}>Pembayaran</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0, fontWeight: 500 }}>
                Penerimaan Santri Baru 2025/2026
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 20, padding: '6px 14px', marginTop: 16,
          backdropFilter: 'blur(4px)',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {data.filter(d => d.status === 'dikonfirmasi').length} dikonfirmasi
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {data.filter(d => d.status === 'menunggu').length} menunggu
          </span>
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>

        {/* Info Rekening */}
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
          Tujuan Transfer
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {REKENING_INFO.map((r) => <RekeningCard key={r.label} item={r} />)}
        </div>

        {/* Petunjuk langkah */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1.5px solid #F1F5F9',
          padding: '16px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📋</span> Cara Pembayaran
          </p>
          {[
            { icon: '📋', text: 'Pilih jenis pembayaran yang ingin Anda bayar' },
            { icon: '💸', text: 'Transfer sesuai nominal yang ditampilkan ke rekening di atas' },
            { icon: '📸', text: 'Screenshot atau foto bukti transfer dengan jelas' },
            { icon: '📤', text: 'Upload bukti dan tunggu verifikasi dari admin (1x24 jam)' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 12 : 0, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>
                {s.icon}
              </div>
              <p style={{ fontSize: 12, color: '#475569', margin: 0, paddingTop: 4, lineHeight: 1.55 }}>{s.text}</p>
            </div>
          ))}
        </div>

        {/* CTA Upload - Pilih Jenis Pembayaran */}
        <button
          onClick={() => setShowPilihModal(true)}
          style={{
            width: '100%', padding: '16px',
            borderRadius: 16, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(99,102,241,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 18 }}>📤</span>
          + Bayar / Upload Bukti
        </button>

        {/* Riwayat header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            Riwayat Pembayaran
          </p>
          {data.length > 0 && (
            <span style={{ fontSize: 11, color: '#6366F1', fontWeight: 700 }}>
              {data.length} transaksi
            </span>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', background: '#fff', borderRadius: 16 }}>
            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 13 }}>⚠️ {error}</p>
            <button onClick={fetchData} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, background: '#6366F1', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Coba Lagi
            </button>
          </div>
        ) : data.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 18, padding: '40px 16px', textAlign: 'center', border: '1.5px dashed #E2E8F0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
            <p style={{ fontWeight: 700, color: '#1E293B', fontSize: 14, margin: '0 0 6px' }}>Belum Ada Riwayat</p>
            <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>
              Klik tombol &quot;Bayar / Upload Bukti&quot; untuk memulai
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map((item) => <PembayaranCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Modal Pilih Jenis Pembayaran */}
      {showPilihModal && (
        <PilihPembayaranModal
          onClose={() => setShowPilihModal(false)}
          onSelect={handlePilihItem}
        />
      )}

      {/* Modal Upload Bukti */}
      {showUploadModal && (
        <UploadBuktiModal
          onClose={() => {
            setShowUploadModal(false)
            setSelectedItem(null)
          }}
          onSubmit={handleSubmitBukti}
          loading={uploadLoading}
          selectedItem={selectedItem}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}