'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

// ── Document Types ─────────────────────────────────────────────────────────
const DOCUMENT_TYPES = [
  {
    id: 'kk',
    label: 'Kartu Keluarga (KK)',
    desc: 'Fotokopi KK 2 halaman',
    required: true,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    maxMB: 5,
    accept: '.pdf,.jpg,.jpeg,.png,.webp',
    hint: 'PDF, JPG, PNG • Maks. 5MB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="8" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M13 9.5h5M13 12.5h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'ijazah_smp',
    label: 'Ijazah Terakhir',
    desc: 'Fotokopi ijazah terakhir',
    required: true,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    maxMB: 5,
    accept: '.pdf,.jpg,.jpeg,.png,.webp',
    hint: 'PDF, JPG, PNG • Maks. 5MB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'raport_smp',
    label: 'Surat Keterangan Hasil Ujian',
    desc: 'Fotokopi SKHU / Surat keterangan hasil ujian',
    required: true,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    maxMB: 5,
    accept: '.pdf,.jpg,.jpeg,.png,.webp',
    hint: 'PDF, JPG, PNG • Maks. 5MB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'skhun',
    label: 'SKHU',
    desc: 'Surat keterangan sehat dari dokter/puskesmas',
    required: true,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    maxMB: 5,
    accept: '.pdf,.jpg,.jpeg,.png,.webp',
    hint: 'PDF, JPG, PNG • Maks. 5MB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'akte_lahir',
    label: 'Akte Kelahiran',
    desc: 'AKta Kelahiran ',
    required: true,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    maxMB: 5,
    accept: '.pdf,.jpg,.jpeg,.png,.webp',
    hint: 'PDF, JPG, PNG • Maks. 5MB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="sans-serif">Rp</text>
      </svg>
    ),
  },
  {
    id: 'sertifikat',
    label: 'Sertifikat',
    desc: 'Sertifikat/Piagam yang pernah di raih',
    required: true,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    maxMB: 2,
    accept: '.jpg,.jpeg,.png',
    hint: 'JPG, PNG • Maks. 2MB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M5 20.5c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
] as const

type DocId = (typeof DOCUMENT_TYPES)[number]['id']

// ── Component ──────────────────────────────────────────────────────────────
export default function BerkasPage() {
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({})

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  function handleFileSelect(docId: string, file: File | null, maxMB: number, accept: string) {
    if (!file) { setFiles(prev => ({ ...prev, [docId]: null })); return }
    if (file.size > maxMB * 1024 * 1024) { showToast(`Ukuran file maksimal ${maxMB}MB`, false); return }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { showToast('Format file tidak didukung', false); return }
    setFiles(prev => ({ ...prev, [docId]: file }))
  }

  async function handleUpload() {
    if (uploadedCount === 0) { showToast('Pilih minimal 1 dokumen untuk dikirim', false); return }
    setUploading(true)
    try {
      const formData = new FormData()
      Object.entries(files).forEach(([id, f]) => { if (f) formData.append(id, f) })
      const res = await fetch('/api/siswa/berkas', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload gagal')
      showToast('Berkas berhasil diunggah!', true)
      setFiles({})
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Terjadi kesalahan', false)
    } finally {
      setUploading(false)
    }
  }

  const totalCount = DOCUMENT_TYPES.length
  const uploadedCount = Object.values(files).filter(Boolean).length
  const isComplete = uploadedCount >= 1   // ✅ cukup 1 file untuk bisa kirim
  const pct = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0

  return (
    <div className="up-page">
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={`up-toast ${toast.ok ? 'up-toast-ok' : 'up-toast-err'}`}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* ══════ HERO HEADER ══════ */}
      <div className="up-header">
        <div className="up-hero">
          <div className="up-hero-text">
            <h1 className="up-hero-title">Upload Berkas<br />Santri</h1>
            <p className="up-hero-sub">
              Unggah dokumen yang diperlukan sesuai persyaratan dengan mudah, cepat dan aman.
            </p>
          </div>
          <div className="up-hero-img">
            <img
              src="/icons/upload-berkas.png"
              alt="Upload Berkas"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      {/* ══════ PROGRESS CARD ══════ */}
      <div className="up-body">
        <div className="up-progress-card">
          <div className="up-progress-left">
            <div className="up-progress-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <polyline points="16 13 12 17 8 13"/>
                <line x1="12" y1="12" x2="12" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="up-progress-label">Progress Upload</p>
              <p className="up-progress-sub">Lengkapi semua dokumen wajib diunggah</p>
            </div>
          </div>
          <div className="up-progress-right">
            <span className="up-progress-num">{uploadedCount}/{totalCount}</span>
            <span className="up-progress-unit">Dokumen</span>
          </div>
        </div>
        <div className="up-progress-track-wrap">
          <div className="up-progress-track">
            <div className="up-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* ══════ SECTION HEADER ══════ */}
        <div className="up-section-row">
          <div className="up-section-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <p className="up-section-title">Dokumen Wajib Diunggah</p>
              <p className="up-section-desc">Pastikan dokumen terbaca dengan jelas.</p>
            </div>
          </div>
          <div className="up-section-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Data aman &amp;<br/>terenkripsi</span>
          </div>
        </div>

        {/* ══════ DOC GRID ══════ */}
        <div className="up-doc-grid">
          {DOCUMENT_TYPES.map(doc => {
            const file = files[doc.id]
            const uploaded = !!file

            return (
              <div key={doc.id} className={`up-doc-card ${uploaded ? 'up-doc-done' : ''}`}>
                {/* Top: icon + label */}
                <div className="up-doc-top">
                  <div className="up-doc-iconbox" style={{ background: doc.iconBg, color: doc.iconColor }}>
                    {doc.icon}
                  </div>
                  <div className="up-doc-meta">
                    <div className="up-doc-name-row">
                      <span className="up-doc-name">{doc.label}</span>
                      <span className="up-doc-badge">WAJIB</span>
                    </div>
                    <p className="up-doc-desc">{doc.desc}</p>
                  </div>
                </div>

                {/* Upload area */}
                {uploaded ? (
                  <div className="up-uploaded-row">
                    <div className="up-uploaded-info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#16A34A"/>
                        <polyline points="8 12 11 15 16 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div style={{ minWidth: 0 }}>
                        <p className="up-uploaded-name">{file.name}</p>
                        <p className="up-uploaded-size">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button
                      className="up-change-btn"
                      onClick={() => fileInputsRef.current[doc.id]?.click()}
                      type="button"
                    >Ubah</button>
                  </div>
                ) : (
                  <button
                    className="up-drop-area"
                    onClick={() => fileInputsRef.current[doc.id]?.click()}
                    type="button"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                    <span className="up-drop-text">Klik untuk pilih atau drag file</span>
                    <span className="up-drop-hint">{doc.hint}</span>
                  </button>
                )}

                {/* Hidden input */}
                <input
                  ref={el => { if (el) fileInputsRef.current[doc.id] = el }}
                  type="file"
                  accept={doc.accept}
                  onChange={e => handleFileSelect(doc.id, e.target.files?.[0] ?? null, doc.maxMB, doc.accept)}
                  style={{ display: 'none' }}
                />
              </div>
            )
          })}
        </div>

        {/* ══════ SECURITY BANNER ══════ */}
        <div className="up-security-banner">
          <div className="up-security-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2"/>
              <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="up-security-title">Keamanan Data Terjamin</p>
            <p className="up-security-desc">Semua dokumen yang Anda unggah dienkripsi dan hanya digunakan untuk keperluan administrasi.</p>
          </div>
        </div>

        {/* ══════ TIPS ══════ */}
        <div className="up-tips-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="#0284C7" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#0284C7"/>
          </svg>
          <p className="up-tips-text"><strong>Tips:</strong> Anda bisa mengirim dokumen secara bertahap. Cukup pilih minimal 1 dokumen lalu klik kirim — dokumen lainnya bisa menyusul.</p>
        </div>

        {/* ══════ ACTIONS ══════ */}
        <div className="up-actions">
          <button
            className="up-btn-submit"
            onClick={handleUpload}
            disabled={!isComplete || uploading}
            type="button"
          >
            {uploading ? (
              <><span className="up-spinner" /> Mengunggah {uploadedCount} Dokumen...</>
            ) : (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Kirim {uploadedCount > 0 ? `${uploadedCount} ` : ''} Dokumen
              </>
            )}
          </button>
          <Link href="/siswa/dashboard" className="up-btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

.up-page {
  min-height: 100dvh;
  background: #F0F4F0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Toast ── */
.up-toast {
  position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
  z-index: 9999; padding: 11px 22px; border-radius: 30px;
  font-size: 13px; font-weight: 700;
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  animation: upIn .3s cubic-bezier(.16,1,.3,1) both;
  white-space: nowrap; pointer-events: none;
}
@keyframes upIn {
  from { opacity:0; transform: translateX(-50%) translateY(-10px); }
  to   { opacity:1; transform: translateX(-50%) translateY(0); }
}
.up-toast-ok  { background:#ECFDF5; color:#065F46; border:1px solid #BBF7D0; }
.up-toast-err { background:#FEF2F2; color:#991B1B; border:1px solid #FECACA; }

/* ══════ HERO HEADER ══════ */
.up-header {
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%);
  position: relative;
  overflow: hidden;
  padding-top: 48px;
}
.up-header::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}
.up-header::after {
  content: '';
  position: absolute;
  bottom: -40px; left: -40px;
  width: 150px; height: 150px;
  background: rgba(255,255,255,0.04);
  border-radius: 50%;
}

.up-hero {
  display: flex;
  align-items: flex-end;
  padding: 20px 20px 0;
  gap: 8px;
  min-height: 160px;
  position: relative;
  z-index: 1;
}
.up-hero-text { flex: 1; padding-bottom: 20px; }
.up-hero-title {
  font-size: 28px; font-weight: 900; color: #fff;
  margin: 0 0 10px; letter-spacing: -.5px; line-height: 1.15;
}
.up-hero-sub {
  font-size: 12.5px; color: rgba(255,255,255,0.8); margin: 0;
  line-height: 1.6; font-weight: 500; max-width: 200px;
}
.up-hero-img {
  flex-shrink: 0; width: 140px; height: 140px;
  filter: drop-shadow(0 12px 24px rgba(0,0,0,0.25));
  align-self: flex-end;
}

/* ══════ BODY ══════ */
.up-body {
  max-width: 480px; margin: 0 auto;
  padding: 0 14px 100px;
  display: flex; flex-direction: column; gap: 14px;
}

/* ══════ PROGRESS CARD ══════ */
.up-progress-card {
  margin-top: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.up-progress-left {
  display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;
}
.up-progress-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: #DCFCE7;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.up-progress-label {
  font-size: 13px; font-weight: 800; color: #1F2937; margin: 0 0 3px;
}
.up-progress-sub {
  font-size: 10.5px; color: #9CA3AF; margin: 0; font-weight: 500;
}
.up-progress-right {
  display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;
}
.up-progress-num {
  font-size: 22px; font-weight: 900; color: #16A34A; line-height: 1;
}
.up-progress-unit {
  font-size: 10px; color: #9CA3AF; font-weight: 600; margin-top: 2px;
}

.up-progress-track-wrap {
  margin: -8px 0 0;
  background: #fff;
  border-radius: 0 0 16px 16px;
  padding: 0 16px 14px;
  margin-top: -14px;
  padding-top: 0;
}
.up-progress-track {
  width: 100%; height: 7px; background: #E5E7EB; border-radius: 100px; overflow: hidden;
}
.up-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #16A34A, #4ADE80);
  border-radius: 100px;
  transition: width .4s cubic-bezier(.4,0,.2,1);
  min-width: 0%;
}

/* ══════ SECTION HEADER ══════ */
.up-section-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
  margin-top: 2px;
}
.up-section-left {
  display: flex; align-items: flex-start; gap: 8px;
}
.up-section-title {
  font-size: 14px; font-weight: 800; color: #1F2937; margin: 0 0 2px;
}
.up-section-desc {
  font-size: 11.5px; color: #6B7280; margin: 0; font-weight: 500;
}
.up-section-badge {
  display: flex; align-items: center; gap: 5px;
  background: #F0FDF4; border: 1.5px solid #BBF7D0;
  border-radius: 10px; padding: 6px 10px;
  font-size: 10px; font-weight: 700; color: #16A34A;
  flex-shrink: 0; line-height: 1.4;
  white-space: nowrap;
}

/* ══════ DOC GRID ══════ */
.up-doc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.up-doc-card {
  background: #fff;
  border-radius: 16px;
  padding: 13px;
  border: 1.5px solid #E8ECF4;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: border-color .2s, box-shadow .2s;
  display: flex; flex-direction: column; gap: 10px;
}
.up-doc-card:hover {
  border-color: #86EFAC;
  box-shadow: 0 4px 16px rgba(22,163,74,0.10);
}
.up-doc-card.up-doc-done {
  border-color: #86EFAC;
  background: #FAFFFE;
}

.up-doc-top {
  display: flex; align-items: flex-start; gap: 8px;
}
.up-doc-iconbox {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.up-doc-meta { flex: 1; min-width: 0; }
.up-doc-name-row {
  display: flex; align-items: center; gap: 5px;
  margin-bottom: 3px; flex-wrap: wrap;
}
.up-doc-name {
  font-size: 12px; font-weight: 800; color: #111827; line-height: 1.3;
}
.up-doc-badge {
  font-size: 8px; font-weight: 800; letter-spacing: .05em;
  padding: 2px 6px; border-radius: 4px;
  text-transform: uppercase; flex-shrink: 0;
  background: #DCFCE7; color: #16A34A;
}
.up-doc-desc {
  font-size: 10.5px; color: #9CA3AF; margin: 0; font-weight: 500; line-height: 1.4;
}

/* drop area */
.up-drop-area {
  width: 100%; background: #F8FFF8;
  border: 1.5px dashed #86EFAC;
  border-radius: 10px;
  padding: 10px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s, border-color .2s;
}
.up-drop-area:hover {
  background: #DCFCE7; border-color: #16A34A;
}
.up-drop-text {
  font-size: 10.5px; font-weight: 700; color: #16A34A; text-align: center; line-height: 1.3;
}
.up-drop-hint {
  font-size: 9.5px; color: #9CA3AF; font-weight: 500; text-align: center;
}

/* uploaded row */
.up-uploaded-row {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
  background: #F0FDF4; border: 1.5px solid #86EFAC;
  border-radius: 10px; padding: 8px 10px;
}
.up-uploaded-info {
  display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1;
}
.up-uploaded-name {
  font-size: 10px; font-weight: 700; color: #14532D;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0;
}
.up-uploaded-size { font-size: 9px; color: #4ADE80; margin: 1px 0 0; }
.up-change-btn {
  font-size: 10px; font-weight: 700; color: #16A34A;
  background: #fff; border: 1.5px solid #86EFAC;
  border-radius: 7px; padding: 4px 8px; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .15s;
}
.up-change-btn:hover { background: #DCFCE7; }

/* ══════ SECURITY BANNER ══════ */
.up-security-banner {
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
  border-radius: 16px;
  padding: 18px 16px;
  display: flex; align-items: center; gap: 14px;
}
.up-security-icon {
  width: 50px; height: 50px; border-radius: 14px;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.up-security-title {
  font-size: 13px; font-weight: 800; color: #fff; margin: 0 0 4px;
}
.up-security-desc {
  font-size: 11px; color: rgba(255,255,255,0.75); margin: 0;
  font-weight: 500; line-height: 1.5;
}

/* ══════ TIPS ROW ══════ */
.up-tips-row {
  display: flex; align-items: flex-start; gap: 7px;
  background: #fff; border-radius: 12px; padding: 12px 14px;
  border: 1.5px solid #E0F2FE;
}
.up-tips-text {
  font-size: 11.5px; color: #374151; margin: 0; font-weight: 500; line-height: 1.5;
}

/* ══════ ACTIONS ══════ */
.up-actions {
  display: flex; flex-direction: column; gap: 10px;
}

.up-btn-submit {
  background: linear-gradient(135deg, #16A34A 0%, #4ADE80 100%);
  border: none; border-radius: 14px;
  padding: 16px; color: #fff;
  font-size: 14px; font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 6px 24px rgba(22,163,74,0.35);
  transition: all .2s cubic-bezier(.4,0,.2,1);
  letter-spacing: -.1px;
}
.up-btn-submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(22,163,74,0.45);
}
.up-btn-submit:disabled { opacity: .5; cursor: not-allowed; }

.up-spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  animation: upSpin .7s linear infinite;
  display: inline-block; flex-shrink: 0;
}
@keyframes upSpin { to { transform: rotate(360deg); } }

.up-btn-back {
  background: #fff; border: 1.5px solid #E4E8F2;
  border-radius: 14px; padding: 15px;
  color: #374151; font-size: 13px; font-weight: 700;
  text-align: center; text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: all .15s;
}
.up-btn-back:hover { background: #F4F6FB; border-color: #86EFAC; }
`