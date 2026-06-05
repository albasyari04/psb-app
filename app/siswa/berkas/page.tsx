'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ── Document Types ─────────────────────────────────────────────────────────
const DOCUMENT_TYPES = [
  {
    id: 'kk',
    label: 'Kartu Keluarga (KK)',
    desc: 'Fotokopi KK 2 halaman',
    required: true,
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="8" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M13 9.5h5M13 12.5h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'akte_lahir',
    label: 'Akta Lahir',
    desc: 'Fotokopi akta lahir',
    required: true,
    iconBg: '#FFF3E8',
    iconColor: '#EA580C',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8"/>
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="8" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'ijazah_smp',
    label: 'Ijazah Terakhir',
    desc: 'Fotokopi ijazah terakhir',
    required: true,
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    iconBg: '#FDE8F0',
    iconColor: '#DB2777',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'skhun',
    label: 'Pas Foto',
    desc: 'Pas foto terbaru latar belakang merah',
    required: true,
    iconBg: '#E0FFF4',
    iconColor: '#059669',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M5 20.5c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'sertifikat',
    label: 'Sertifikat Prestasi',
    desc: 'Fotokopi sertifikat/penghargaan jika ada',
    required: false,
    iconBg: '#FEF9C3',
    iconColor: '#CA8A04',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
] as const

type DocId = (typeof DOCUMENT_TYPES)[number]['id']

// ── SVG Icons ──────────────────────────────────────────────────────────────

function IconCloud() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  )
}

function IconCheckGreen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function IconCheckCircleFill() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#22C55E"/>
      <polyline points="8 12 11 15 16 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

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

  function handleFileSelect(docId: string, file: File | null) {
    if (!file) { setFiles(prev => ({ ...prev, [docId]: null })); return }
    if (file.size > 5 * 1024 * 1024) { showToast('Ukuran file maksimal 5MB', false); return }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { showToast('Format file: PDF, JPG, PNG, WebP', false); return }
    setFiles(prev => ({ ...prev, [docId]: file }))
  }

  async function handleUpload() {
    const required = DOCUMENT_TYPES.filter(d => d.required)
    const missing = required.filter(d => !files[d.id])
    if (missing.length > 0) { showToast(`${missing.length} dokumen wajib belum dilengkapi`, false); return }
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

  const requiredDocs = DOCUMENT_TYPES.filter(d => d.required)
  const totalCount = DOCUMENT_TYPES.length
  const uploadedAll = Object.values(files).filter(Boolean).length
  const isComplete = requiredDocs.every(d => files[d.id])
  const pct = totalCount > 0 ? Math.round((uploadedAll / totalCount) * 100) : 0

  return (
    <div className="up-page">
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={`up-toast ${toast.ok ? 'up-toast-ok' : 'up-toast-err'}`}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════════════
          HEADER — white background, big title
      ══════════════════════════════════════ */}
      <div className="up-header">

        {/* Hero row: text left, image right */}
        <div className="up-hero">
          <div className="up-hero-text">
            <h1 className="up-hero-title">Upload Berkas</h1>
            <p className="up-hero-sub">
              Unggah dokumen yang diperlukan sesuai persyaratan yang tertera.
            </p>
          </div>
          <div className="up-hero-img">
            <Image
              src="/image/icon upload berkas.png"
              alt="Upload Berkas"
              width={160}
              height={160}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
            />
          </div>
        </div>

        {/* Progress card */}
        <div className="up-progress-card">
          <div className="up-progress-row">
            <div>
              <p className="up-progress-label">Progress Upload</p>
              <p className="up-progress-sub">Lengkapi semua dokumen yang wajib diunggah</p>
            </div>
            <span className="up-progress-count">{uploadedAll}/{totalCount}</span>
          </div>
          <div className="up-progress-track">
            <div className="up-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CONTENT
      ══════════════════════════════════════ */}
      <div className="up-content">

        {/* Section title */}
        <div className="up-section-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="up-section-title">DOKUMEN WAJIB DIUNGGAH</span>
        </div>
        <p className="up-section-desc">Pastikan dokumen terbaca dengan jelas</p>

        {/* Document cards */}
        <div className="up-doc-list">
          {DOCUMENT_TYPES.map(doc => {
            const file = files[doc.id]
            const uploaded = !!file

            return (
              <div key={doc.id} className={`up-doc-card ${uploaded ? 'up-doc-done' : ''}`}>

                {/* Top row: icon + label + badge */}
                <div className="up-doc-top">
                  <div className="up-doc-iconbox" style={{ background: doc.iconBg, color: doc.iconColor }}>
                    {doc.icon}
                  </div>
                  <div className="up-doc-meta">
                    <div className="up-doc-name-row">
                      <span className="up-doc-name">{doc.label}</span>
                      <span className={`up-doc-badge ${doc.required ? 'up-badge-wajib' : 'up-badge-opt'}`}>
                        {doc.required ? 'WAJIB' : 'OPSIONAL'}
                      </span>
                    </div>
                    <p className="up-doc-desc">{doc.desc}</p>
                  </div>
                </div>

                {/* Uploaded state */}
                {uploaded ? (
                  <div className="up-uploaded-row">
                    <div className="up-uploaded-info">
                      <span className="up-uploaded-check"><IconCheckCircleFill /></span>
                      <div>
                        <p className="up-uploaded-name">{file.name}</p>
                        <p className="up-uploaded-size">Berhasil diunggah &nbsp;·&nbsp; {(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button
                      className="up-lihat-btn"
                      onClick={() => fileInputsRef.current[doc.id]?.click()}
                      type="button"
                    >
                      Ubah File
                    </button>
                  </div>
                ) : (
                  /* Upload area dashed */
                  <button
                    className="up-drop-area"
                    onClick={() => fileInputsRef.current[doc.id]?.click()}
                    type="button"
                  >
                    <span className="up-drop-cloud"><IconCloud /></span>
                    <span className="up-drop-text">Pilih file untuk diunggah</span>
                    <span className="up-drop-hint">PDF, JPG, PNG &nbsp;•&nbsp; Maks. 5MB</span>
                  </button>
                )}

                {/* Hidden input */}
                <input
                  ref={el => { if (el) fileInputsRef.current[doc.id] = el }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={e => handleFileSelect(doc.id, e.target.files?.[0] ?? null)}
                  style={{ display: 'none' }}
                />
              </div>
            )
          })}
        </div>

        {/* Tips Upload */}
        <div className="up-tips">
          <div className="up-tips-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="up-tips-title">Tips Upload</span>
          </div>
          <ul className="up-tips-list">
            {[
              'Pastikan dokumen jelas dan tidak buram',
              'Gunakan format file: PDF, JPG, atau PNG',
              'Ukuran maksimal per file adalah 5MB',
              'Periksa kembali sebelum mengunggah',
            ].map((t, i) => (
              <li key={i}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#22C55E"/>
                  <polyline points="8 12 11 15 16 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="up-actions">
          <button
            className="up-btn-submit"
            onClick={handleUpload}
            disabled={!isComplete || uploading}
            type="button"
          >
            {uploading ? (
              <><span className="up-spinner" /> Mengunggah...</>
            ) : (
              <><IconUpload /> Unggah Semua Dokumen</>
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

/* ── Reset / Page ── */
.up-page {
  min-height: 100dvh;
  background: #F0F2F8;
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

/* ══════════════════════════════
   HEADER (white)
══════════════════════════════ */
.up-header {
  background: #fff;
  position: sticky; top: 0; z-index: 20;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

/* hero */
.up-hero {
  display: flex; align-items: center;
  padding: 52px 20px 0;
  gap: 8px;
  min-height: 150px;
}
.up-hero-text { flex: 1; }
.up-hero-title {
  font-size: 26px; font-weight: 900; color: #111827;
  margin: 0 0 6px; letter-spacing: -.6px; line-height: 1.15;
}
.up-hero-sub {
  font-size: 12.5px; color: #6B7280; margin: 0;
  line-height: 1.55; font-weight: 500;
}
.up-hero-img {
  flex-shrink: 0; width: 150px; height: 150px;
  margin-top: -10px;
  filter: drop-shadow(0 8px 20px rgba(99,102,241,0.25));
}

/* progress */
.up-progress-card {
  margin: 16px 20px 20px;
  background: #fff;
  border: 1.5px solid #E8ECF4;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.up-progress-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 10px;
}
.up-progress-label {
  font-size: 13px; font-weight: 700; color: #1F2937; margin: 0 0 2px;
}
.up-progress-sub {
  font-size: 11px; color: #9CA3AF; margin: 0; font-weight: 500;
}
.up-progress-count {
  font-size: 14px; font-weight: 900; color: #4F46E5;
  background: #EEF2FF; padding: 4px 12px; border-radius: 20px;
  white-space: nowrap; flex-shrink: 0;
}
.up-progress-track {
  width: 100%; height: 8px; background: #E8ECF4; border-radius: 100px; overflow: hidden;
}
.up-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366F1, #8B5CF6);
  border-radius: 100px;
  transition: width .4s cubic-bezier(.4,0,.2,1);
  min-width: 0%;
}

/* ══════════════════════════════
   CONTENT
══════════════════════════════ */
.up-content {
  max-width: 480px; margin: 0 auto;
  padding: 16px 16px 100px;
  display: flex; flex-direction: column; gap: 10px;
}

/* section header */
.up-section-row {
  display: flex; align-items: center; gap: 6px; margin-top: 2px;
}
.up-section-title {
  font-size: 11px; font-weight: 800; color: #4F46E5;
  letter-spacing: .1em; text-transform: uppercase;
}
.up-section-desc {
  font-size: 12px; color: #9CA3AF; margin: 0 0 4px; font-weight: 500;
}

/* ── Doc List ── */
.up-doc-list {
  display: flex; flex-direction: column; gap: 10px;
}

.up-doc-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  border: 1.5px solid #E8ECF4;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: border-color .2s, box-shadow .2s;
  display: flex; flex-direction: column; gap: 12px;
}
.up-doc-card:hover {
  border-color: #C7D2FE;
  box-shadow: 0 4px 20px rgba(99,102,241,0.10);
}
.up-doc-card.up-doc-done {
  border-color: #BBF7D0;
  background: #FAFFFD;
}

/* doc top row */
.up-doc-top {
  display: flex; align-items: flex-start; gap: 12px;
}
.up-doc-iconbox {
  width: 46px; height: 46px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.up-doc-meta { flex: 1; min-width: 0; }
.up-doc-name-row {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px; flex-wrap: wrap;
}
.up-doc-name {
  font-size: 13.5px; font-weight: 800; color: #111827;
}
.up-doc-badge {
  font-size: 9px; font-weight: 800; letter-spacing: .06em;
  padding: 3px 8px; border-radius: 5px;
  text-transform: uppercase; flex-shrink: 0;
}
.up-badge-wajib { background: #FEE2E2; color: #DC2626; }
.up-badge-opt   { background: #DBEAFE; color: #1D4ED8; }
.up-doc-desc {
  font-size: 11.5px; color: #9CA3AF; margin: 0; font-weight: 500;
}

/* drop area */
.up-drop-area {
  width: 100%; background: #F8FAFF;
  border: 1.5px dashed #A5B4FC;
  border-radius: 12px;
  padding: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s, border-color .2s;
}
.up-drop-area:hover {
  background: #EEF2FF; border-color: #6366F1;
}
.up-drop-cloud { color: #6366F1; }
.up-drop-text {
  font-size: 12.5px; font-weight: 700; color: #4F46E5;
}
.up-drop-hint {
  font-size: 10.5px; color: #9CA3AF; font-weight: 500;
}

/* uploaded row */
.up-uploaded-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  background: #F0FDF4; border: 1.5px solid #86EFAC;
  border-radius: 12px; padding: 10px 14px;
}
.up-uploaded-info {
  display: flex; align-items: center; gap: 10px; min-width: 0;
}
.up-uploaded-check { flex-shrink: 0; }
.up-uploaded-name {
  font-size: 11.5px; font-weight: 700; color: #14532D;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0;
}
.up-uploaded-size { font-size: 10px; color: #4ADE80; margin: 2px 0 0; }

.up-lihat-btn {
  font-size: 11px; font-weight: 700; color: #16A34A;
  background: #fff; border: 1.5px solid #86EFAC;
  border-radius: 8px; padding: 5px 12px; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .15s;
}
.up-lihat-btn:hover { background: #DCFCE7; }

/* ── Tips ── */
.up-tips {
  background: #fff; border: 1.5px solid #E8ECF4;
  border-radius: 16px; padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.up-tips-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.up-tips-title {
  font-size: 13px; font-weight: 800; color: #1F2937;
}
.up-tips-list {
  margin: 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 9px;
}
.up-tips-list li {
  display: flex; align-items: flex-start; gap: 9px;
  font-size: 12.5px; color: #374151; font-weight: 500; line-height: 1.4;
}
.up-tips-list li svg { flex-shrink: 0; margin-top: 1px; }

/* ── Actions ── */
.up-actions {
  display: flex; flex-direction: column; gap: 10px; margin-top: 4px;
}

.up-btn-submit {
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  border: none; border-radius: 14px;
  padding: 16px; color: #fff;
  font-size: 14px; font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 6px 24px rgba(99,102,241,0.38);
  transition: all .2s cubic-bezier(.4,0,.2,1);
  letter-spacing: -.1px;
}
.up-btn-submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(99,102,241,0.45);
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
.up-btn-back:hover { background: #F4F6FB; border-color: #C7D2FE; }
`