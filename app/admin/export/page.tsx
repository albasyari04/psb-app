'use client'

import { useState } from 'react'
import AdminPageShell from '../AdminPageShell'

// ── Types ─────────────────────────────────────────────────────────────────────
type ExportTipe = 'pendaftar' | 'verifikasi' | 'pembayaran' | 'rekapitulasi'

interface ExportItem {
  tipe:        ExportTipe
  title:       string
  description: string
  badge:       string
  badgeColor:  string
  icon:        string
  columns:     string[]
  rowMapper:   (item: Record<string, unknown>) => string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(val: unknown): string {
  if (!val || typeof val !== 'string') return '-'
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return String(val) }
}

function fmtRupiah(val: unknown): string {
  if (val === null || val === undefined) return '-'
  const num = typeof val === 'number' ? val : Number(val)
  if (isNaN(num)) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
}

function fmtStatus(val: unknown): string {
  const map: Record<string, string> = {
    menunggu:      'Menunggu',
    diproses:      'Diproses',
    diterima:      'Diterima',
    ditolak:       'Ditolak',
    dikonfirmasi:  'Dikonfirmasi',
  }
  return map[String(val)] ?? String(val ?? '-')
}

function str(val: unknown): string {
  return val !== null && val !== undefined && String(val).trim() !== '' ? String(val) : '-'
}

// ── Export definitions ────────────────────────────────────────────────────────
const exportItems: ExportItem[] = [
  {
    tipe:        'pendaftar',
    title:       'Laporan Pendaftar',
    description: 'Seluruh data pendaftar beserta status pendaftaran',
    badge:       'PDF',
    badgeColor:  '#ef4444',
    icon:        '👥',
    columns: [
      'No', 'Nama Lengkap', 'NISN', 'NIK', 'Tempat Lahir', 'Tgl Lahir',
      'Jenis Kelamin', 'Asal Sekolah', 'Jurusan', 'No HP', 'Email',
      'Status', 'Tgl Daftar',
    ],
    rowMapper: (d) => [
      '', // No — diisi auto
      str(d.nama_lengkap),
      str(d.nisn),
      str(d.nik),
      str(d.tempat_lahir),
      fmtDate(d.tanggal_lahir),
      str(d.jenis_kelamin),
      str(d.asal_sekolah),
      str(d.jurusan_pilihan),
      str(d.no_hp),
      str(d.email),
      fmtStatus(d.status),
      fmtDate(d.created_at),
    ],
  },
  {
    tipe:        'verifikasi',
    title:       'Laporan Verifikasi',
    description: 'Status verifikasi seluruh pendaftar beserta catatan admin',
    badge:       'PDF',
    badgeColor:  '#f59e0b',
    icon:        '✅',
    columns: [
      'No', 'Nama Lengkap', 'NISN', 'Asal Sekolah',
      'Jurusan', 'Status', 'Catatan Admin', 'Tgl Update',
    ],
    rowMapper: (d) => [
      '',
      str(d.nama_lengkap),
      str(d.nisn),
      str(d.asal_sekolah),
      str(d.jurusan_pilihan),
      fmtStatus(d.status),
      str(d.catatan_admin),
      fmtDate(d.updated_at),
    ],
  },
  {
    tipe:        'pembayaran',
    title:       'Laporan Pembayaran',
    description: 'Riwayat pembayaran dan status konfirmasi',
    badge:       'PDF',
    badgeColor:  '#10b981',
    icon:        '💳',
    columns: [
      'No', 'Nama Siswa', 'Jenis', 'Metode',
      'Nominal', 'No Referensi', 'Status', 'Tgl Bayar',
    ],
    rowMapper: (d) => [
      '',
      str(d.nama_siswa),
      str(d.jenis_pembayaran),
      str(d.metode_pembayaran),
      fmtRupiah(d.nominal),
      str(d.no_referensi),
      fmtStatus(d.status),
      fmtDate(d.tanggal_bayar),
    ],
  },
  {
    tipe:        'rekapitulasi',
    title:       'Laporan Rekapitulasi',
    description: 'Ringkasan data keseluruhan untuk laporan resmi',
    badge:       'PDF',
    badgeColor:  '#8b5cf6',
    icon:        '📊',
    columns: [
      'No', 'Kategori', 'Total', 'Terverifikasi', 'Menunggu', 'Ditolak',
    ],
    rowMapper: () => ['', '', '', '', '', ''],
  },
]

// ── Summary builder untuk tiap tipe ─────────────────────────────────────────
function buildSummary(tipe: ExportTipe, data: Record<string, unknown>[]): string {
  if (tipe === 'pendaftar' || tipe === 'verifikasi') {
    const total     = data.length
    const menunggu  = data.filter(d => d.status === 'menunggu').length
    const diproses  = data.filter(d => d.status === 'diproses').length
    const diterima  = data.filter(d => d.status === 'diterima').length
    const ditolak   = data.filter(d => d.status === 'ditolak').length
    return `Total: ${total} | Menunggu: ${menunggu} | Diproses: ${diproses} | Diterima: ${diterima} | Ditolak: ${ditolak}`
  }
  if (tipe === 'pembayaran') {
    const total       = data.length
    const dikonfirmasi = data.filter(d => d.status === 'dikonfirmasi').length
    const menunggu    = data.filter(d => d.status === 'menunggu').length
    const ditolak     = data.filter(d => d.status === 'ditolak').length
    const totalNominal = data
      .filter(d => d.status === 'dikonfirmasi')
      .reduce((sum, d) => sum + (Number(d.nominal) || 0), 0)
    return (
      `Total Transaksi: ${total} | Dikonfirmasi: ${dikonfirmasi} | ` +
      `Menunggu: ${menunggu} | Ditolak: ${ditolak} | ` +
      `Total Terkonfirmasi: ${fmtRupiah(totalNominal)}`
    )
  }
  if (tipe === 'rekapitulasi') {
    return 'Ringkasan keseluruhan data PSB tahun ajaran 2025/2026'
  }
  return ''
}

// ── PDF Generator ─────────────────────────────────────────────────────────────
async function generatePDF(
  item: ExportItem,
  data: Record<string, unknown>[]
): Promise<void> {
  const jsPDFModule      = await import('jspdf')
  const autoTableModule  = await import('jspdf-autotable')

  const jsPDF    = jsPDFModule.default
  const autoTable = autoTableModule.default

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const now    = new Date()
  const nowStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) +
                 ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, 297, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PON-PES AL ISTIQOMAH', 14, 11)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistem Penerimaan Santri Baru (PSB) 2025/2026', 14, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(item.title.toUpperCase(), 283, 11, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Dicetak: ${nowStr}`, 283, 18, { align: 'right' })

  // ── Sub-header info ──────────────────────────────────────────────────────────
  doc.setFillColor(237, 233, 254)
  doc.rect(0, 28, 297, 14, 'F')

  doc.setTextColor(109, 40, 217)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('RINGKASAN:', 14, 36)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 48, 163)
  doc.text(buildSummary(item.tipe, data), 42, 36)

  doc.setTextColor(100, 116, 139)
  doc.text(`Total data: ${data.length} record`, 283, 36, { align: 'right' })

  // ── Table ───────────────────────────────────────────────────────────────────
  let rows: string[][] = []
  
  if (item.tipe === 'rekapitulasi') {
    // Generate rekapitulasi data
    const pendaftarCount = data.filter(d => d.hasOwnProperty('status')).length
    const verifikasiData = data.filter(d => d.status === 'diterima').length
    const menungguData = data.filter(d => d.status === 'menunggu').length
    const ditolakData = data.filter(d => d.status === 'ditolak').length
    
    rows = [
      ['1', 'Total Pendaftar', String(pendaftarCount || data.length), '-', '-', '-'],
      ['2', 'Terverifikasi', String(verifikasiData), '-', '-', '-'],
      ['3', 'Menunggu Verifikasi', String(menungguData), '-', '-', '-'],
      ['4', 'Ditolak', String(ditolakData), '-', '-', '-'],
    ]
  } else {
    rows = data.map((d, i) => {
      const row = item.rowMapper(d)
      row[0] = String(i + 1)
      return row
    })
  }

  const colStyles: Record<number, { cellWidth: number; halign?: 'left' | 'center' | 'right' }> = {
    0: { cellWidth: 10, halign: 'center' },
  }

  autoTable(doc, {
    head:         [item.columns],
    body:         rows,
    startY:       44,
    margin:       { left: 14, right: 14 },
    styles: {
      fontSize:    8,
      cellPadding: 3,
      overflow:    'linebreak',
      lineColor:   [226, 232, 240],
      lineWidth:   0.2,
    },
    headStyles: {
      fillColor:   [124, 58, 237],
      textColor:   [255, 255, 255],
      fontStyle:   'bold',
      fontSize:    8,
      halign:      'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: colStyles,
    didDrawPage: (pageData) => {
      const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } })
        .internal.getNumberOfPages()
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Halaman ${pageData.pageNumber} dari ${pageCount}  •  ${item.title}  •  PSB 2025/2026  •  PON-PES AL ISTIQOMAH`,
        148.5,
        205,
        { align: 'center' }
      )
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.3)
      doc.line(14, 202, 283, 202)
    },
  })

  const filename = `${item.tipe}_psb_${now.toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ExportPage() {
  const [loading, setLoading] = useState<ExportTipe | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleExport(item: ExportItem) {
    setLoading(item.tipe)
    setError(null)
    setSuccess(null)

    try {
      // Untuk rekapitulasi, kita perlu mengambil semua data
      let allData: Record<string, unknown>[] = []
      
      if (item.tipe === 'rekapitulasi') {
        // Fetch all data types for rekapitulasi
        const [pendaftarRes, verifikasiRes, pembayaranRes] = await Promise.all([
          fetch('/api/admin/export?tipe=pendaftar'),
          fetch('/api/admin/export?tipe=verifikasi'),
          fetch('/api/admin/export?tipe=pembayaran'),
        ])
        
        const pendaftarJson = await pendaftarRes.json()
        const verifikasiJson = await verifikasiRes.json()
        const pembayaranJson = await pembayaranRes.json()
        
        allData = [
          ...(pendaftarJson.data ?? []),
          ...(verifikasiJson.data ?? []),
          ...(pembayaranJson.data ?? []),
        ]
      } else {
        const res = await fetch(`/api/admin/export?tipe=${item.tipe}`)
        const json = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error((json as { error?: string }).error ?? 'Gagal mengambil data')
        }
        allData = (json as { data: Record<string, unknown>[] }).data ?? []
      }

      if (allData.length === 0 && item.tipe !== 'rekapitulasi') {
        setError(`Tidak ada data ${item.title} untuk diekspor.`)
        return
      }

      await generatePDF(item, allData)
      setSuccess(`${item.title} berhasil diunduh (${allData.length} data).`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(null)
    }
  }

  return (
    <AdminPageShell
      title="Export Data"
      subtitle="Unduh laporan resmi PSB dalam format PDF yang siap dibagikan."
    >
      {/* Info Box - Data Siap Ekspor */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderRadius: 20,
        padding: '20px 24px',
        marginBottom: 28,
        border: '1px solid #bae6fd',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 80, opacity: 0.1, pointerEvents: 'none' }}>
          📄
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            background: '#0284c7',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
          }}>
            📋
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', margin: '0 0 6px 0' }}>
              Data Siap Ekspor
            </h3>
            <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>
              Klik tombol <strong style={{ color: '#0284c7' }}>PDF</strong> untuk mengunduh laporan langsung ke perangkat Anda. 
              Data diambil secara real-time dari database dan disusun otomatis dalam format PDF landscape A4 
              lengkap dengan ringkasan statistik.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          borderLeft: '4px solid #ef4444',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0, flex: 1, fontWeight: 500 }}>{error}</p>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#991b1b',
              fontSize: 16,
              padding: 4,
              borderRadius: 8,
            }}
          >✕</button>
        </div>
      )}

      {/* Alert Success */}
      {success && (
        <div style={{
          background: '#f0fdf4',
          borderLeft: '4px solid #22c55e',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <p style={{ fontSize: 13, color: '#166534', margin: 0, flex: 1, fontWeight: 500 }}>{success}</p>
          <button
            onClick={() => setSuccess(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#166534',
              fontSize: 16,
              padding: 4,
              borderRadius: 8,
            }}
          >✕</button>
        </div>
      )}

      {/* Pilih Jenis Laporan */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 16,
          letterSpacing: '-0.3px',
        }}>
          Pilih Jenis Laporan
        </h2>
      </div>

      {/* Export Cards Grid - 2x2 Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        {exportItems.map((item) => {
          const isLoading = loading === item.tipe

          return (
            <div
              key={item.tipe}
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: '20px',
                border: `1.5px solid ${isLoading ? '#c4b5fd' : '#e2e8f0'}`,
                boxShadow: isLoading 
                  ? '0 4px 20px rgba(124,58,237,0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative icon background */}
              <div style={{
                position: 'absolute',
                right: -16,
                top: -16,
                fontSize: 80,
                opacity: 0.05,
                pointerEvents: 'none',
              }}>
                {item.icon}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${item.badgeColor}15, ${item.badgeColor}08)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {item.icon}
                </div>
                <button
                  onClick={() => handleExport(item)}
                  disabled={loading !== null}
                  style={{
                    background: isLoading ? '#f3e8ff' : `linear-gradient(135deg, ${item.badgeColor}, ${item.badgeColor}dd)`,
                    border: 'none',
                    borderRadius: 40,
                    padding: '8px 20px',
                    color: isLoading ? item.badgeColor : '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: loading !== null ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: isLoading ? 'none' : `0 2px 8px ${item.badgeColor}40`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        border: `2px solid ${item.badgeColor}40`,
                        borderTopColor: item.badgeColor,
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Proses...
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      {item.badge}
                    </>
                  )}
                </button>
              </div>

              <h3 style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 6px 0',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: 12,
                color: '#64748b',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {item.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Informasi Tambahan */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 16,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Informasi Ekspor PDF
          </h4>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12 }}>📄</span>
            <span style={{ fontSize: 11.5, color: '#475569' }}>Format PDF Landscape A4</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12 }}>📊</span>
            <span style={{ fontSize: 11.5, color: '#475569' }}>Lengkap dengan ringkasan statistik</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12 }}>🔢</span>
            <span style={{ fontSize: 11.5, color: '#475569' }}>Nomor halaman otomatis</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12 }}>⚡</span>
            <span style={{ fontSize: 11.5, color: '#475569' }}>Data real-time dari database</span>
          </div>
        </div>
      </div>

      {/* CSS animasi spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </AdminPageShell>
  )
}