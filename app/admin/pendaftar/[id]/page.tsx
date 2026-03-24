'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import type { Pendaftaran } from '@/types'

type Action = 'diterima' | 'ditolak' | 'diproses' | null

const pillCls: Record<string, string> = {
  menunggu: 'pnd-pill pnd-pill-menunggu',
  diproses: 'pnd-pill pnd-pill-diproses',
  diterima: 'pnd-pill pnd-pill-diterima',
  ditolak:  'pnd-pill pnd-pill-ditolak',
}
const pillLabel: Record<string, string> = {
  menunggu: 'Menunggu', diproses: 'Diproses', diterima: 'Diterima', ditolak: 'Ditolak',
}
const confirmLabel: Record<string, string> = {
  diterima: 'Terima Pendaftar', ditolak: 'Tolak Pendaftar', diproses: 'Tandai Diproses',
}
const confirmIcon: Record<string, string> = {
  diterima: '✅', ditolak: '❌', diproses: '🔄',
}
const confirmSheetCls: Record<string, string> = {
  diterima: 'pnd-sheet-confirm-ok pnd-confirm-accept',
  ditolak:  'pnd-sheet-confirm-ok pnd-confirm-reject',
  diproses: 'pnd-sheet-confirm-ok pnd-confirm-process',
}

export default function DetailPendaftarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const router = useRouter()
  const [data,     setData]     = useState<Pendaftaran | null>(null)
  const [catatan,  setCatatan]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [confirm,  setConfirm]  = useState<Action>(null)
  const [fetchErr, setFetchErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchDetail = async () => {
      try {
        const res  = await fetch(`/api/admin/pendaftaran?id=${id}`)
        const json = await res.json()
        if (!res.ok) { setFetchErr(json.error ?? 'Gagal memuat data'); return }
        setData(json.data as Pendaftaran)
        setCatatan(json.data?.catatan_admin || '')
      } catch (err) {
        console.error('Fetch detail error:', err)
        setFetchErr('Gagal memuat data')
      }
    }
    fetchDetail()
  }, [id])

  const updateStatus = async (action: Action) => {
    if (!action) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/pendaftaran', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: action,
          catatan_admin: catatan,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error('Update error:', json.error)
        return
      }
      setConfirm(null)
      router.push('/admin/pendaftar')
    } catch (err) {
      console.error('Update status error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!data && !fetchErr) return (
    <div className="pnd-loading-screen">
      <div className="pnd-loading-inner">
        <div className="pnd-loading-icon">⏳</div>
        <p className="pnd-loading-text">Memuat data...</p>
      </div>
    </div>
  )

  if (fetchErr) return (
    <div className="pnd-loading-screen">
      <div className="pnd-loading-inner">
        <div className="pnd-loading-icon">⚠️</div>
        <p className="pnd-loading-text">{fetchErr}</p>
        <button onClick={() => router.back()} className="pnd-back-btn pnd-back-btn--mt">
          ← Kembali
        </button>
      </div>
    </div>
  )

  const isFinished = data!.status === 'diterima' || data!.status === 'ditolak'

  // ✅ Hapus 'nis' dan 'nilai_rata_rata' — field ini tidak ada di database
  const infoRows: [string, string | number | undefined | null][] = [
    ['NISN',          data!.nisn],
    ['NIK',           data!.nik],
    ['Tempat Lahir',  data!.tempat_lahir],
    ['Tanggal Lahir', data!.tanggal_lahir
      ? new Date(data!.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
      : undefined],
    ['Jenis Kelamin', data!.jenis_kelamin],
    ['Agama',         data!.agama],
    ['No. HP / WA',   data!.no_hp],
    ['Alamat',        data!.alamat],
  ]

  // ✅ Hapus 'nilai_rata_rata' — field ini tidak ada di database
  const akademikRows: [string, string | number | undefined | null][] = [
    ['Asal Sekolah',    data!.asal_sekolah],
    ['NPSN',            data!.npsn],
    ['Jurusan Pilihan', data!.jurusan_pilihan],
  ]

  // ✅ Tambah data orang tua
  const orangtuaRows: [string, string | number | undefined | null][] = [
    ['Nama Ayah',       data!.nama_ayah],
    ['Nama Ibu',        data!.nama_ibu],
    ['Pekerjaan Ayah',  data!.pekerjaan_ayah],
    ['Pekerjaan Ibu',   data!.pekerjaan_ibu],
    ['No. HP Orang Tua', data!.no_hp_ortu],
  ]

  return (
    <div className="pnd-detail-bg">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="pnd-detail-hero">
        <div className="pnd-detail-hero-glow" />
        <div className="pnd-detail-hero-inner">

          <button className="pnd-back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Kembali ke Daftar
          </button>

          <div className="pnd-detail-identity">
            <div className="pnd-detail-av">
              {data!.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="pnd-detail-id-info">
              <p className="pnd-detail-name">{data!.nama_lengkap}</p>
              <p className="pnd-detail-school">🏫 {data!.asal_sekolah ?? '-'}</p>
              <div className={pillCls[data!.status] ?? 'pnd-pill pnd-pill-menunggu'}>
                <div className="pnd-pill-dot" />
                {pillLabel[data!.status] ?? data!.status}
              </div>
            </div>
          </div>

          {data!.status === 'diterima' && (
            <div className="pnd-status-banner pnd-banner-diterima pnd-banner-mt">
              <span className="pnd-status-banner-icon">🎉</span>
              <div>
                <p className="pnd-status-banner-title">Pendaftar Diterima</p>
                <p className="pnd-status-banner-sub">Keputusan sudah final dan tidak dapat diubah</p>
              </div>
            </div>
          )}
          {data!.status === 'ditolak' && (
            <div className="pnd-status-banner pnd-banner-ditolak pnd-banner-mt">
              <span className="pnd-status-banner-icon">📋</span>
              <div>
                <p className="pnd-status-banner-title">Pendaftar Ditolak</p>
                <p className="pnd-status-banner-sub">Keputusan sudah final dan tidak dapat diubah</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="pnd-detail-content">

        {/* Data Pribadi */}
        <div className="pnd-info-card">
          <div className="pnd-info-header">
            <div className="pnd-info-header-dot pnd-dot-indigo" />
            <p className="pnd-info-title">Data Pribadi</p>
          </div>
          <div className="pnd-info-body">
            {infoRows.map(([k, v]) => (
              <div key={k} className="pnd-info-row">
                <span className="pnd-info-label">{k}</span>
                <span className="pnd-info-val">{v ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Akademik */}
        <div className="pnd-info-card">
          <div className="pnd-info-header">
            <div className="pnd-info-header-dot pnd-dot-green" />
            <p className="pnd-info-title">Akademik</p>
          </div>
          <div className="pnd-info-body">
            {akademikRows.map(([k, v]) => (
              <div key={k} className="pnd-info-row">
                <span className="pnd-info-label">{k}</span>
                <span className="pnd-info-val">{v ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Orang Tua */}
        <div className="pnd-info-card">
          <div className="pnd-info-header">
            <div className="pnd-info-header-dot pnd-dot-violet" />
            <p className="pnd-info-title">Data Orang Tua</p>
          </div>
          <div className="pnd-info-body">
            {orangtuaRows.map(([k, v]) => (
              <div key={k} className="pnd-info-row">
                <span className="pnd-info-label">{k}</span>
                <span className="pnd-info-val">{v ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div className="pnd-info-card">
          <div className="pnd-info-header">
            <div className="pnd-info-header-dot pnd-dot-amber" />
            <p className="pnd-info-title">Catatan Panitia</p>
          </div>
          <div className="pnd-catatan-wrap">
            <textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              rows={3}
              disabled={isFinished}
              placeholder={isFinished
                ? 'Tidak dapat diubah setelah keputusan final'
                : 'Tambahkan catatan untuk pendaftar ini...'}
              className={isFinished ? 'pnd-textarea pnd-textarea--disabled' : 'pnd-textarea'}
            />
          </div>
        </div>

        {/* Actions */}
        {!isFinished && (
          <div className="pnd-actions">
            {data!.status === 'menunggu' && (
              <button
                onClick={() => setConfirm('diproses')}
                disabled={loading}
                className="pnd-action-process pnd-action-btn"
              >
                🔄 &nbsp;Tandai Sedang Diproses
              </button>
            )}
            <div className="pnd-action-grid">
              <button
                onClick={() => setConfirm('diterima')}
                disabled={loading}
                className="pnd-action-accept pnd-action-btn"
              >
                ✅ &nbsp;Terima
              </button>
              <button
                onClick={() => setConfirm('ditolak')}
                disabled={loading}
                className="pnd-action-reject pnd-action-btn"
              >
                ❌ &nbsp;Tolak
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm Bottom Sheet ──────────────────────────────────────── */}
      {confirm && (
        <div className="pnd-sheet-overlay" onClick={() => setConfirm(null)}>
          <div className="pnd-sheet" onClick={e => e.stopPropagation()}>
            <div className="pnd-sheet-handle" />
            <p className="pnd-sheet-icon">{confirmIcon[confirm]}</p>
            <p className="pnd-sheet-title">{confirmLabel[confirm]}</p>
            <p className="pnd-sheet-sub">
              Apakah Anda yakin ingin{' '}
              <strong>
                {confirm === 'diterima' ? 'menerima' : confirm === 'ditolak' ? 'menolak' : 'memproses'}
              </strong>{' '}
              pendaftaran <strong>{data!.nama_lengkap}</strong>?
              {confirm !== 'diproses' && ' Keputusan ini tidak dapat diubah.'}
            </p>
            <div className="pnd-sheet-btns">
              <button onClick={() => setConfirm(null)} className="pnd-sheet-cancel">
                Batal
              </button>
              <button
                onClick={() => updateStatus(confirm)}
                disabled={loading}
                className={`${confirmSheetCls[confirm]}${loading ? ' pnd-loading-btn' : ''}`}
              >
                {loading ? 'Menyimpan...' : 'Ya, Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}