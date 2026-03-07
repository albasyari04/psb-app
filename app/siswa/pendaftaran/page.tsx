'use client'
import '@/app/style/siswa.css'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendaftaranData {
  id: string
  user_id: string
  nama_lengkap: string
  nis: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama: string
  alamat: string
  no_hp: string
  asal_sekolah: string
  jurusan_pilihan: string
  nilai_rata_rata: number | string
  status: 'menunggu' | 'diproses' | 'diterima' | 'ditolak'
}

interface FormState {
  nama_lengkap: string
  nis: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama: string
  alamat: string
  no_hp: string
  asal_sekolah: string
  jurusan_pilihan: string
  nilai_rata_rata: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const JURUSAN = ['IPA', 'IPS', 'Bahasa', 'Teknik Komputer', 'Akuntansi', 'Multimedia']
const AGAMA   = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']

const STEPS = [
  { label: 'Data Diri',  icon: '👤' },
  { label: 'Akademik',   icon: '📚' },
  { label: 'Konfirmasi', icon: '✅' },
]

const INIT: FormState = {
  nama_lengkap: '', nis: '', nisn: '',
  tempat_lahir: '', tanggal_lahir: '',
  jenis_kelamin: 'L', agama: 'Islam',
  alamat: '', no_hp: '',
  asal_sekolah: '', jurusan_pilihan: 'IPA',
  nilai_rata_rata: '',
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder = '', type = 'text', disabled = false,
}: {
  label: string; value: string
  onChange: (v: string) => void
  placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div className="sf-field">
      <label className="sf-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="sf-input"
      />
    </div>
  )
}

function SelectField({
  label, value, options, onChange, disabled = false,
}: {
  label: string; value: string; options: string[]
  onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <div className="sf-field">
      <label className="sf-label">{label}</label>
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="sf-input"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PendaftaranPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [step,      setStep]     = useState(1)
  const [loading,   setLoading]  = useState(false)
  const [fetching,  setFetching] = useState(true)
  const [existing,  setExisting] = useState<PendaftaranData | null>(null)
  const [form,      setForm]     = useState<FormState>(INIT)
  const [errorMsg,  setErrorMsg] = useState<string | null>(null)
  const [successMsg,setSuccessMsg] = useState<string | null>(null)

  // ── Fetch data existing via API Route ──────────────────────────────────────
  // PERBAIKAN: Tidak lagi menggunakan supabase client (anon) langsung dari browser
  // karena tunduk RLS. Sekarang lewat API route yang menggunakan supabaseAdmin.
  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (!session?.user?.id) {
      setFetching(false)
      return
    }

    const fetchExisting = async () => {
      setFetching(true)
      try {
        const res = await fetch('/api/pendaftaran')
        const json = await res.json()
        if (json.data) {
          const d = json.data as PendaftaranData
          setExisting(d)
          setForm({ ...d, nilai_rata_rata: String(d.nilai_rata_rata) })
        }
      } catch (err) {
        console.error('Fetch existing error:', err)
      } finally {
        setFetching(false)
      }
    }

    fetchExisting()
  }, [session, sessionStatus])

  const set = (key: keyof FormState, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const isEditable = !existing || existing.status === 'menunggu'
  const nilai      = parseFloat(form.nilai_rata_rata)
  const nilaiValid = !isNaN(nilai) && nilai >= 0 && nilai <= 100

  // ── Validasi sebelum lanjut step ──────────────────────────────────────────
  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 1) {
      if (!form.nama_lengkap.trim()) return 'Nama lengkap wajib diisi'
      if (!form.nis.trim())          return 'NIS wajib diisi'
      if (!form.nisn.trim())         return 'NISN wajib diisi'
      if (!form.tempat_lahir.trim()) return 'Tempat lahir wajib diisi'
      if (!form.tanggal_lahir)       return 'Tanggal lahir wajib diisi'
      if (!form.alamat.trim())       return 'Alamat wajib diisi'
      if (!form.no_hp.trim())        return 'No. HP wajib diisi'
    }
    if (currentStep === 2) {
      if (!form.asal_sekolah.trim()) return 'Nama sekolah asal wajib diisi'
      if (!form.nilai_rata_rata)     return 'Nilai rata-rata wajib diisi'
      if (!nilaiValid)               return 'Nilai rata-rata harus antara 0–100'
      if (!form.jurusan_pilihan)     return 'Pilihan jurusan wajib dipilih'
    }
    return null
  }

  const handleNextStep = () => {
    const err = validateStep(step)
    if (err) {
      setErrorMsg(err)
      return
    }
    setErrorMsg(null)
    setStep(s => s + 1)
  }

  // ── Submit via API Route ───────────────────────────────────────────────────
  // PERBAIKAN: Insert/Update sekarang lewat API route (supabaseAdmin)
  // agar tidak terblokir RLS Supabase.
  const handleSubmit = async () => {
    if (!isEditable || loading) return

    const err = validateStep(step)
    if (err) { setErrorMsg(err); return }

    setLoading(true)
    setErrorMsg(null)

    const payload = {
      ...form,
      nilai_rata_rata: parseFloat(form.nilai_rata_rata),
    }

    try {
      let res: Response

      if (existing) {
        // UPDATE
        res = await fetch('/api/pendaftaran', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: existing.id, ...payload }),
        })
      } else {
        // INSERT
        res = await fetch('/api/pendaftaran', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error ?? 'Terjadi kesalahan. Silakan coba lagi.')
        return
      }

      setSuccessMsg('Pendaftaran berhasil dikirim!')
      // Delay sebentar agar user melihat pesan sukses
      setTimeout(() => router.push('/siswa/status'), 1000)

    } catch (err) {
      console.error('Submit error:', err)
      setErrorMsg('Gagal mengirim data. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  // ── Session loading state ─────────────────────────────────────────────────
  if (sessionStatus === 'loading' || fetching) {
    return (
      <div className="app-shell sf-bg sf-loading-screen">
        <div className="sf-loading-inner">
          <div className="sf-loading-icon">⏳</div>
          <p className="sf-loading-text">Memuat data...</p>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell sf-bg">

      {/* ══ HEADER + STEP INDICATOR ══════════════════════════════════════════ */}
      <div className="sf-header">
        <div className="sf-header-grid" />
        <div className="sf-header-orb" />
        <div className="sf-header-content">

          {/* Back + Title */}
          <div className="sf-header-top">
            <Link href="/siswa/dashboard" className="sf-back-btn">←</Link>
            <div>
              <h1 className="sf-header-title">Formulir Pendaftaran</h1>
              <p className="sf-header-sub">Tahun Ajaran 2025/2026 · SMA Negeri 1</p>
            </div>
          </div>

          {/* Steps */}
          <div className="sf-steps">
            {STEPS.map((s, i) => {
              const idx   = i + 1
              const state = idx < step ? 'done' : idx === step ? 'active' : 'pending'
              return (
                <div key={s.label} className="sf-step-item">
                  <button
                    className="sf-step-btn"
                    onClick={() => idx < step && setStep(idx)}
                    type="button"
                  >
                    <div className={`sf-step-circle ${state}`}>
                      {state === 'done' ? '✓' : idx}
                    </div>
                    <span className={`sf-step-label ${state}`}>{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`sf-step-line ${state === 'done' ? 'done' : 'pending'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Warning: tidak bisa edit ── */}
      {!isEditable && (
        <div className="sf-warning">
          <span className="sf-warning-icon">⚠️</span>
          <span>
            Formulir tidak dapat diedit karena status pendaftaran sudah&nbsp;
            <strong>{existing?.status}</strong>.
          </span>
        </div>
      )}

      {/* ── Error message ── */}
      {errorMsg && (
        <div className="sf-alert sf-alert-error">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Success message ── */}
      {successMsg && (
        <div className="sf-alert sf-alert-success">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
      <div className="sf-body" key={step}>

        {/* ── STEP 1: Data Diri ── */}
        {step === 1 && (
          <div className="sf-card">
            <p className="sf-card-title">👤 Identitas Diri</p>

            <Field
              label="Nama Lengkap"
              value={form.nama_lengkap}
              onChange={v => { set('nama_lengkap', v); setErrorMsg(null) }}
              placeholder="Sesuai ijazah"
              disabled={!isEditable}
            />

            <div className="sf-grid-2">
              <Field label="NIS"  value={form.nis}  onChange={v => { set('nis', v); setErrorMsg(null) }}  placeholder="NIS"  disabled={!isEditable} />
              <Field label="NISN" value={form.nisn} onChange={v => { set('nisn', v); setErrorMsg(null) }} placeholder="NISN" disabled={!isEditable} />
            </div>

            <div className="sf-grid-2">
              <Field label="Tempat Lahir"  value={form.tempat_lahir}  onChange={v => { set('tempat_lahir', v); setErrorMsg(null) }}  placeholder="Kota"   disabled={!isEditable} />
              <Field label="Tanggal Lahir" value={form.tanggal_lahir} onChange={v => { set('tanggal_lahir', v); setErrorMsg(null) }} type="date"          disabled={!isEditable} />
            </div>

            {/* Jenis Kelamin */}
            <div className="sf-field">
              <label className="sf-label">Jenis Kelamin</label>
              <div className="sf-gender-wrap">
                {(['L', 'P'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => isEditable && set('jenis_kelamin', v)}
                    disabled={!isEditable}
                    className={`sf-gender-btn${form.jenis_kelamin === v ? ' active' : ''}`}
                  >
                    <span>{v === 'L' ? '♂' : '♀'}</span>
                    <span>{v === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </button>
                ))}
              </div>
            </div>

            <SelectField label="Agama"         value={form.agama}  options={AGAMA}  onChange={v => set('agama', v)}  disabled={!isEditable} />
            <Field       label="Alamat Lengkap" value={form.alamat} onChange={v => { set('alamat', v); setErrorMsg(null) }} placeholder="Jl. Contoh No. 1, RT/RW, Kecamatan" disabled={!isEditable} />
            <Field       label="No. HP / WA"    value={form.no_hp}  onChange={v => { set('no_hp', v); setErrorMsg(null) }}  placeholder="08xxxxxxxxxx" disabled={!isEditable} />
          </div>
        )}

        {/* ── STEP 2: Data Akademik ── */}
        {step === 2 && (
          <>
            <div className="sf-card">
              <p className="sf-card-title">🏫 Asal Sekolah</p>
              <Field
                label="Nama SMP / MTs Asal"
                value={form.asal_sekolah}
                onChange={v => { set('asal_sekolah', v); setErrorMsg(null) }}
                placeholder="Nama sekolah asal"
                disabled={!isEditable}
              />
              <div className="sf-field">
                <label className="sf-label">Nilai Rata-rata Rapor (Semester 1–5)</label>
                <input
                  type="number"
                  min={0} max={100} step={0.1}
                  value={form.nilai_rata_rata}
                  onChange={e => { set('nilai_rata_rata', e.target.value); setErrorMsg(null) }}
                  placeholder="Contoh: 85.50"
                  disabled={!isEditable}
                  className="sf-input"
                />
              </div>

              {/* Nilai preview */}
              {nilaiValid && (
                <div className="sf-nilai-preview">
                  <div>
                    <span className="sf-nilai-number">{nilai.toFixed(1)}</span>
                    <span className="sf-nilai-of">/ 100</span>
                  </div>
                  <div className="sf-nilai-bar-wrap">
                    <div className="sf-nilai-bar-track">
                      <div
                        className="sf-nilai-bar-fill"
                        data-width={Math.min(nilai, 100)}
                        ref={(el) => { if (el) el.style.setProperty('--nilai-width', `${Math.min(nilai, 100)}%`) }}
                      />
                    </div>
                  </div>
                  <span className={`sf-nilai-badge ${nilai >= 80 ? 'ok' : 'low'}`}>
                    {nilai >= 80 ? '✓ Memenuhi' : '✗ Di bawah'}
                  </span>
                </div>
              )}
            </div>

            <div className="sf-card">
              <p className="sf-card-title">📚 Pilihan Jurusan</p>
              <div className="sf-jurusan-grid">
                {JURUSAN.map(j => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => isEditable && set('jurusan_pilihan', j)}
                    disabled={!isEditable}
                    className={`sf-jurusan-btn${form.jurusan_pilihan === j ? ' active' : ''}`}
                  >
                    {j}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: Konfirmasi ── */}
        {step === 3 && (
          <div className="sf-card">
            <p className="sf-card-title">📋 Ringkasan Pendaftaran</p>

            {[
              { key: 'Nama Lengkap',      val: form.nama_lengkap },
              { key: 'NIS / NISN',        val: `${form.nis} / ${form.nisn}` },
              { key: 'Tempat, Tgl Lahir', val: `${form.tempat_lahir}, ${form.tanggal_lahir ? new Date(form.tanggal_lahir).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}` },
              { key: 'Jenis Kelamin',     val: form.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' },
              { key: 'Agama',             val: form.agama },
              { key: 'Alamat',            val: form.alamat },
              { key: 'No. HP / WA',       val: form.no_hp },
              { key: 'Asal Sekolah',      val: form.asal_sekolah },
              { key: 'Jurusan Pilihan',   val: form.jurusan_pilihan },
              { key: 'Nilai Rata-rata',   val: form.nilai_rata_rata ? `${parseFloat(form.nilai_rata_rata).toFixed(2)} / 100` : '-' },
            ].map(({ key, val }) => (
              <div key={key} className="sf-summary-row">
                <span className="sf-summary-key">{key}</span>
                <span className="sf-summary-val">{val || '-'}</span>
              </div>
            ))}

            {/* Syarat minimum */}
            <div className={`sf-syarat-card ${nilaiValid && nilai >= 80 ? 'ok' : 'low'}`}>
              <p className={`sf-syarat-text ${nilaiValid && nilai >= 80 ? 'ok' : 'low'}`}>
                {nilaiValid && nilai >= 80
                  ? '✅ Nilai memenuhi syarat minimum (≥ 80)'
                  : '⚠️ Nilai di bawah syarat minimum (80)'}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ══ BOTTOM NAVIGATION BAR ════════════════════════════════════════════ */}
      <div className="sf-bottom-bar">
        {step > 1 && (
          <button type="button" onClick={() => { setStep(s => s - 1); setErrorMsg(null) }} className="sf-btn-back">
            ← Kembali
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="sf-btn-next"
          >
            Lanjut →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isEditable}
            className="sf-btn-submit"
          >
            {loading ? (
              <>
                <span className="sf-spinner">⏳</span>
                Menyimpan...
              </>
            ) : existing ? (
              <>✏️ Perbarui Data</>
            ) : (
              <>🚀 Kirim Pendaftaran</>
            )}
          </button>
        )}
      </div>

    </div>
  )
}