'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

// ── Document Types ─────────────────────────────────────────────────────────
const DOCUMENT_TYPES = [
  { id: 'kk', label: 'Kartu Keluarga (KK)', desc: 'Fotokopi KK 2 halaman', required: true, icon: '🆔' },
  { id: 'akte_lahir', label: 'Akta Lahir', desc: 'Fotokopi akta lahir', required: true, icon: '📋' },
  { id: 'ijazah_smp', label: 'Ijazah SMP', desc: 'Fotokopi ijazah SMP', required: true, icon: '🎓' },
  { id: 'raport_smp', label: 'Raport SMP Kelas 9', desc: 'Fotokopi raport semester ganjil kelas 9', required: true, icon: '📊' },
  { id: 'skhun', label: 'SKHUN', desc: 'Fotokopi SKHUN (Surat Keterangan Hasil Ujian Nasional)', required: true, icon: '✅' },
  { id: 'sertifikat', label: 'Sertifikat Prestasi (Opsional)', desc: 'Fotokopi sertifikat/penghargaan jika ada', required: false, icon: '🏆' },
] as const

// ── Icons ──────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
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
    setTimeout(() => setToast(null), 3000)
  }

  function handleFileSelect(docId: string, file: File | null) {
    if (!file) {
      setFiles(prev => ({ ...prev, [docId]: null }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', false)
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showToast('Format file hanya PDF, JPG, PNG, atau WebP', false)
      return
    }

    setFiles(prev => ({ ...prev, [docId]: file }))
  }

  async function handleUpload() {
    // Check required files
    const requiredDocs = DOCUMENT_TYPES.filter(d => d.required).map(d => d.id)
    const missingDocs = requiredDocs.filter(id => !files[id])

    if (missingDocs.length > 0) {
      showToast(`Dokumen wajib belum lengkap: ${missingDocs.length} dokumen`, false)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      Object.entries(files).forEach(([docId, file]) => {
        if (file) {
          formData.append(`${docId}`, file)
        }
      })

      const res = await fetch('/api/siswa/berkas', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload gagal')

      showToast('Berkas berhasil diunggah!', true)
      setFiles({}) // Reset form
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Terjadi kesalahan', false)
    } finally {
      setUploading(false)
    }
  }

  const requiredCount = DOCUMENT_TYPES.filter(d => d.required).length
  const uploadedCount = Object.values(files).filter(Boolean).length
  const isComplete = DOCUMENT_TYPES.filter(d => d.required).every(d => files[d.id])

  return (
    <div className="berkas-page">
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={'berkas-toast' + (toast.ok ? ' berkas-toast-ok' : ' berkas-toast-err')}>
          <span className="berkas-toast-icon">{toast.ok ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ══ Header ════════════════════════════════════════════════════ */}
      <div className="berkas-header">
        <Link href="/siswa/dashboard" className="berkas-back">
          <IconBack />
        </Link>
        <div>
          <p className="berkas-header-sub">Unggah Dokumen</p>
          <p className="berkas-header-title">Upload Berkas</p>
        </div>
      </div>

      {/* ══ Content ═══════════════════════════════════════════════════ */}
      <div className="berkas-content">

        {/* ── Progress ── */}
        <div className="berkas-progress-card">
          <div className="berkas-progress-header">
            <span className="berkas-progress-title">Progress Upload</span>
            <span className="berkas-progress-count">{uploadedCount}/{requiredCount}</span>
          </div>
          <div className="berkas-progress-bar">
            <div 
              className="berkas-progress-fill" 
              style={{ width: `${(uploadedCount / requiredCount) * 100}%` }}
            />
          </div>
          <p className="berkas-progress-text">
            {uploadedCount === 0 && 'Mulai unggah dokumen'} 
            {uploadedCount > 0 && uploadedCount < requiredCount && `${requiredCount - uploadedCount} dokumen lagi`}
            {uploadedCount === requiredCount && '✓ Semua dokumen wajib sudah diupload!'}
          </p>
        </div>

        {/* ── Document Types ── */}
        <div className="berkas-section">
          <h2 className="berkas-section-title">Dokumen Wajib Diunggah</h2>
          <div className="berkas-docs">
            {DOCUMENT_TYPES.map(doc => {
              const file = files[doc.id]
              const isRequiredMissing = doc.required && !file
              return (
                <div key={doc.id} className={`berkas-doc-card ${isRequiredMissing ? 'berkas-doc-missing' : ''} ${file ? 'berkas-doc-uploaded' : ''}`}>
                  {/* Top: Icon + Status */}
                  <div className="berkas-doc-top">
                    <span className="berkas-doc-icon">{doc.icon}</span>
                    {file && <IconCheck />}
                  </div>

                  {/* Middle: Label + Desc */}
                  <div className="berkas-doc-info">
                    <h3 className="berkas-doc-label">{doc.label}</h3>
                    <p className="berkas-doc-desc">{doc.desc}</p>
                    {doc.required && <span className="berkas-doc-required">Wajib</span>}
                  </div>

                  {/* Bottom: File Info + Upload Button */}
                  <div className="berkas-doc-file">
                    {file ? (
                      <div className="berkas-file-info">
                        <p className="berkas-file-name">{file.name}</p>
                        <p className="berkas-file-size">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <p className="berkas-file-placeholder">Pilih file...</p>
                    )}
                  </div>

                  {/* Hidden input */}
                  <input
                    ref={el => { if (el) fileInputsRef.current[doc.id] = el }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={e => handleFileSelect(doc.id, e.target.files?.[0] ?? null)}
                    style={{ display: 'none' }}
                  />

                  {/* Upload Button */}
                  <button
                    className="berkas-doc-btn"
                    onClick={() => fileInputsRef.current[doc.id]?.click()}
                    type="button"
                  >
                    {file ? 'Ubah File' : 'Pilih File'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="berkas-actions">
          <button 
            className="berkas-btn-submit"
            onClick={handleUpload}
            disabled={!isComplete || uploading}
            type="button"
          >
            {uploading ? (
              <>
                <span className="berkas-spinner">⟳</span> Mengunggah...
              </>
            ) : (
              <>
                <span>✓</span> Unggah Semua Dokumen
              </>
            )}
          </button>
          <Link href="/siswa/dashboard" className="berkas-btn-back">
            Kembali ke Dashboard
          </Link>
        </div>

        {/* ── Info ── */}
        <div className="berkas-info">
          <h3 className="berkas-info-title">ℹ️ Informasi Penting</h3>
          <ul className="berkas-info-list">
            <li>Semua dokumen harus berupa fotokopi dan jelas terlihat</li>
            <li>Format file yang diterima: PDF, JPG, PNG, WebP</li>
            <li>Ukuran file maksimal 5MB per dokumen</li>
            <li>Pastikan semua teks pada dokumen dapat dibaca dengan jelas</li>
            <li>Dokumen dengan label &quot;Wajib&quot; harus diserahkan sebelum dapat diserahkan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SCOPED CSS
═════════════════════════════════════════════════════════════════════════════ */
const css = `

/* ── Page ── */
.berkas-page {
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%);
  min-height: 100dvh;
  font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
}

/* ── Toast ── */
.berkas-toast {
  position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
  z-index: 9999; display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 20px; border-radius: 12px;
  font-size: 13px; font-weight: 700;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  animation: berkasToastIn 0.3s cubic-bezier(.16,1,.3,1) both;
  white-space: nowrap; pointer-events: none;
}
@keyframes berkasToastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
.berkas-toast-ok { background: #ecfdf5; color: #065f46; border: 1px solid #86efac; }
.berkas-toast-err { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
.berkas-toast-icon { font-size: 14px; font-weight: 900; }

/* ── Header ── */
.berkas-header {
  background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%);
  padding: 16px 20px;
  display: flex; gap: 12px; align-items: center;
  border-bottom: 1px solid rgba(167,139,250,0.2);
  position: sticky; top: 0; z-index: 10;
  box-shadow: 0 4px 20px rgba(99,102,241,0.15);
}

.berkas-back {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(255,255,255,0.1);
  border: 1.5px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  text-decoration: none;
}
.berkas-back:hover { 
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.35);
  transform: translateX(-2px);
}

.berkas-header-sub {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  color: rgba(255,255,255,0.6); text-transform: uppercase; margin: 0;
}

.berkas-header-title {
  font-size: 18px; font-weight: 900; color: #fff;
  margin: 0; letter-spacing: -.3px;
}

/* ── Content ── */
.berkas-content {
  max-width: 480px; margin: 0 auto; padding: 20px 16px 80px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Progress Card ── */
.berkas-progress-card {
  background: #fff; border-radius: 20px;
  padding: 20px; border: 1.5px solid rgba(167,139,250,0.15);
  box-shadow: 0 4px 20px rgba(99,102,241,0.1);
}

.berkas-progress-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}

.berkas-progress-title {
  font-size: 13px; font-weight: 700; color: #1e1b4b;
}

.berkas-progress-count {
  font-size: 14px; font-weight: 900; color: #7c3aed;
  background: #ede9fe; padding: 4px 10px; border-radius: 8px;
}

.berkas-progress-bar {
  width: 100%; height: 8px; background: #f0f0f6;
  border-radius: 100px; overflow: hidden; margin-bottom: 10px;
}

.berkas-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 100px;
  transition: width .3s ease-out;
}

.berkas-progress-text {
  font-size: 12px; color: #64748b; margin: 0;
  text-align: center; font-weight: 600;
}

/* ── Section ── */
.berkas-section {
  display: flex; flex-direction: column; gap: 12px;
}

.berkas-section-title {
  font-size: 13px; font-weight: 800; letter-spacing: .08em;
  color: #7c3aed; text-transform: uppercase; margin: 0; padding: 0 4px;
}

/* ── Document Cards Grid ── */
.berkas-docs {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}

.berkas-doc-card {
  background: #fff; border-radius: 16px; padding: 14px;
  border: 1.5px solid rgba(167,139,250,0.12);
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; gap: 8px;
  cursor: pointer; position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.berkas-doc-card:hover {
  border-color: rgba(167,139,250,0.3);
  box-shadow: 0 6px 16px rgba(99,102,241,0.12);
  transform: translateY(-2px);
}

.berkas-doc-card.berkas-doc-missing {
  border-color: #fca5a5;
  background: #fef2f2;
}

.berkas-doc-card.berkas-doc-uploaded {
  border-color: #86efac;
  background: #f0fdf4;
}

.berkas-doc-top {
  display: flex; justify-content: space-between; align-items: center;
}

.berkas-doc-icon {
  font-size: 28px;
}

.berkas-doc-info {
  display: flex; flex-direction: column; gap: 2px;
}

.berkas-doc-label {
  font-size: 12px; font-weight: 700; color: #1e1b4b; margin: 0;
}

.berkas-doc-desc {
  font-size: 10px; color: #94a3b8; margin: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.berkas-doc-required {
  display: inline-block; font-size: 8px; font-weight: 700;
  color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 4px;
  width: fit-content; letter-spacing: .05em; text-transform: uppercase;
}

.berkas-doc-file {
  min-height: 32px; background: #f9fafb; border-radius: 8px;
  padding: 6px 8px; display: flex; align-items: center;
}

.berkas-file-info {
  flex: 1;
}

.berkas-file-name {
  font-size: 10px; font-weight: 700; color: #1e1b4b;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0;
}

.berkas-file-size {
  font-size: 8px; color: #94a3b8; margin: 1px 0 0;
}

.berkas-file-placeholder {
  font-size: 10px; color: #c4b5fd; margin: 0;
}

.berkas-doc-btn {
  background: #ede9fe; border: 1px solid #d8b4fe;
  color: #7c3aed; font-size: 10px; font-weight: 700;
  padding: 6px 8px; border-radius: 6px; cursor: pointer;
  transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif;
  text-transform: uppercase; letter-spacing: .05em;
}

.berkas-doc-btn:hover {
  background: #ddd6fe; border-color: #c4b5fd;
}

.berkas-doc-btn:active { transform: scale(0.95); }

/* ── Actions ── */
.berkas-actions {
  display: flex; flex-direction: column; gap: 10px;
  margin-top: 12px;
}

.berkas-btn-submit {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  border: none; border-radius: 12px;
  padding: 14px; color: #fff;
  font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(34,197,94,0.3);
}

.berkas-btn-submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(34,197,94,0.4);
}

.berkas-btn-submit:disabled {
  opacity: 0.6; cursor: not-allowed;
}

.berkas-spinner { 
  display: inline-block; 
  animation: berkasSpin .7s linear infinite; 
}
@keyframes berkasSpin { to { transform: rotate(360deg); } }

.berkas-btn-back {
  background: #f3f4f6; border: 1.5px solid #e5e7eb;
  border-radius: 12px; padding: 12px;
  color: #374151; font-size: 13px; font-weight: 700;
  text-align: center; text-decoration: none;
  transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif;
}

.berkas-btn-back:hover {
  background: #e5e7eb; border-color: #d1d5db;
}

/* ── Info ── */
.berkas-info {
  background: #fffbeb; border-radius: 16px;
  padding: 16px; border: 1.5px solid #fcd34d;
  margin-top: 8px;
}

.berkas-info-title {
  font-size: 13px; font-weight: 800; color: #92400e;
  margin: 0 0 8px; letter-spacing: -.2px;
}

.berkas-info-list {
  margin: 0; padding: 0 0 0 16px; list-style: disc;
}

.berkas-info-list li {
  font-size: 11px; color: #b45309; margin-bottom: 4px;
  line-height: 1.5;
}

.berkas-info-list li:last-child { margin-bottom: 0; }

/* ── Responsive ── */
@media (max-width: 480px) {
  .berkas-docs {
    grid-template-columns: 1fr;
  }
}
`
