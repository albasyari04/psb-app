'use client'
// app/siswa/pendaftaran/page.tsx
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendaftaranData {
  id: string
  user_id: string
  nama_lengkap: string
  nik: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama: string
  alamat: string
  alamat_kota?: string
  alamat_kecamatan?: string
  alamat_rt_rw?: string
  no_hp: string
  asal_sekolah: string
  npsn: string
  nama_ayah: string
  nama_ibu: string
  pekerjaan_ayah: string
  pekerjaan_ibu: string
  no_hp_ortu: string
  status: 'menunggu' | 'diproses' | 'diterima' | 'ditolak'
}

interface FormState {
  nama_lengkap: string
  nik: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama: string
  alamat: string
  alamat_kota: string
  alamat_kecamatan: string
  alamat_rt_rw: string
  no_hp: string
  asal_sekolah: string
  npsn: string
  nama_ayah: string
  nama_ibu: string
  pekerjaan_ayah: string
  pekerjaan_ibu: string
  no_hp_ortu: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const AGAMA     = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
const PEKERJAAN = [
  'Petani', 'Nelayan', 'PNS', 'TNI/Polri', 'Guru', 'Pengusaha',
  'Pedagang', 'Tukang', 'Karyawan Swasta', 'Profesional', 'Tidak Bekerja', 'Lainnya',
]

const STEPS = [
  { label: 'Data Diri',       icon: '👤' },
  { label: 'Asal Sekolah',    icon: '🏫' },
  { label: 'Alamat & Kontak', icon: '📍' },
  { label: 'Data Orang Tua',  icon: '👨‍👩‍👧' },
  { label: 'Konfirmasi',      icon: '✅' },
]

const INIT: FormState = {
  nama_lengkap: '', nik: '', nisn: '',
  tempat_lahir: '', tanggal_lahir: '',
  jenis_kelamin: 'L', agama: 'Islam',
  alamat: '', alamat_kota: '', alamat_kecamatan: '', alamat_rt_rw: '',
  no_hp: '',
  asal_sekolah: '', npsn: '',
  nama_ayah: '', nama_ibu: '',
  pekerjaan_ayah: 'Petani', pekerjaan_ibu: 'Tidak Bekerja',
  no_hp_ortu: '',
}

// ── localStorage helpers ───────────────────────────────────────────────────────
// Key di-suffix dengan userId agar draft tidak tercampur antar akun
const getDraftKey = (userId: string) => `pendaftaran_draft_${userId}`
const getStepKey  = (userId: string) => `pendaftaran_step_${userId}`

function saveDraft(userId: string, form: FormState, step: number) {
  try {
    localStorage.setItem(getDraftKey(userId), JSON.stringify(form))
    localStorage.setItem(getStepKey(userId),  String(step))
  } catch { /* kuota penuh atau private mode — abaikan */ }
}

function loadDraft(userId: string): { form: FormState; step: number } | null {
  try {
    const raw  = localStorage.getItem(getDraftKey(userId))
    const rawS = localStorage.getItem(getStepKey(userId))
    if (!raw) return null
    return {
      form: JSON.parse(raw) as FormState,
      step: rawS ? Math.max(1, Math.min(parseInt(rawS, 10), STEPS.length)) : 1,
    }
  } catch {
    return null
  }
}

function clearDraft(userId: string) {
  try {
    localStorage.removeItem(getDraftKey(userId))
    localStorage.removeItem(getStepKey(userId))
  } catch { /* abaikan */ }
}

// ── Validasi hanya saat final submit ──────────────────────────────────────────
function validateAll(form: FormState): string | null {
  // Step 1
  if (!form.nama_lengkap.trim()) return 'Nama lengkap wajib diisi'
  if (!form.nik.trim())          return 'NIK wajib diisi'
  if (!form.nisn.trim())         return 'NISN wajib diisi'
  if (!form.tempat_lahir.trim()) return 'Tempat lahir wajib diisi'
  if (!form.tanggal_lahir)       return 'Tanggal lahir wajib diisi'
  // Step 2
  if (!form.asal_sekolah.trim()) return 'Nama asal sekolah wajib diisi'
  if (!form.npsn.trim())         return 'NPSN wajib diisi'
  // Step 3
  if (!form.alamat.trim())           return 'Alamat wajib diisi'
  if (!form.alamat_kota.trim())      return 'Kota wajib diisi'
  if (!form.alamat_kecamatan.trim()) return 'Kecamatan wajib diisi'
  if (!form.alamat_rt_rw.trim())     return 'RT/RW wajib diisi'
  if (!form.no_hp.trim())            return 'No. HP wajib diisi'
  // Step 4
  if (!form.nama_ayah.trim())  return 'Nama ayah wajib diisi'
  if (!form.nama_ibu.trim())   return 'Nama ibu wajib diisi'
  if (!form.pekerjaan_ayah)    return 'Pekerjaan ayah wajib dipilih'
  if (!form.pekerjaan_ibu)     return 'Pekerjaan ibu wajib dipilih'
  if (!form.no_hp_ortu.trim()) return 'No. HP orang tua wajib diisi'
  return null
}

// ── Hitung field yang sudah diisi per step (untuk indikator) ──────────────────
function getStepCompletion(form: FormState): Record<number, boolean> {
  return {
    1: !!(form.nama_lengkap && form.nik && form.nisn && form.tempat_lahir && form.tanggal_lahir),
    2: !!(form.asal_sekolah && form.npsn),
    3: !!(form.alamat && form.alamat_kota && form.alamat_kecamatan && form.alamat_rt_rw && form.no_hp),
    4: !!(form.nama_ayah && form.nama_ibu && form.pekerjaan_ayah && form.pekerjaan_ibu && form.no_hp_ortu),
    5: true,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder = '', type = 'text', disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
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
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  disabled?: boolean
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

  const [step,        setStep]       = useState(1)
  const [loading,     setLoading]    = useState(false)
  const [fetching,    setFetching]   = useState(true)
  const [existing,    setExisting]   = useState<PendaftaranData | null>(null)
  const [form,        setForm]       = useState<FormState>(INIT)
  const [errorMsg,    setErrorMsg]   = useState<string | null>(null)
  const [successMsg,  setSuccessMsg] = useState<string | null>(null)
  const [draftLoaded, setDraftLoaded] = useState(false) // flag agar auto-save tidak override sebelum load
  const [draftBanner, setDraftBanner] = useState(false) // tampilkan banner "draft dimuat"

  // ── Ref untuk track apakah form sudah di-init dari server/draft ───────────
  const initializedRef = useRef(false)

  // ── Fetch data existing via API Route ──────────────────────────────────────
  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (!session?.user?.id) {
      setFetching(false)
      return
    }

    const fetchExisting = async () => {
      setFetching(true)
      try {
        const res  = await fetch('/api/pendaftaran')
        const json = await res.json()

        if (json.data) {
          // Ada data di server → pakai data server, buang draft lokal
          const d = json.data as PendaftaranData
          setExisting(d)
          const serverForm: FormState = {
            nama_lengkap:     d.nama_lengkap     ?? '',
            nik:              d.nik               ?? '',
            nisn:             d.nisn              ?? '',
            tempat_lahir:     d.tempat_lahir      ?? '',
            tanggal_lahir:    d.tanggal_lahir     ?? '',
            jenis_kelamin:    d.jenis_kelamin     ?? 'L',
            agama:            d.agama             ?? 'Islam',
            alamat:           d.alamat            ?? '',
            alamat_kota:      d.alamat_kota       ?? '',
            alamat_kecamatan: d.alamat_kecamatan  ?? '',
            alamat_rt_rw:     d.alamat_rt_rw      ?? '',
            no_hp:            d.no_hp             ?? '',
            asal_sekolah:     d.asal_sekolah      ?? '',
            npsn:             d.npsn              ?? '',
            nama_ayah:        d.nama_ayah         ?? '',
            nama_ibu:         d.nama_ibu          ?? '',
            pekerjaan_ayah:   d.pekerjaan_ayah    ?? 'Petani',
            pekerjaan_ibu:    d.pekerjaan_ibu     ?? 'Tidak Bekerja',
            no_hp_ortu:       d.no_hp_ortu        ?? '',
          }
          setForm(serverForm)
          // Bersihkan draft karena sudah ada data server
          clearDraft(session.user.id!)
        } else {
          // Belum ada data di server → cek apakah ada draft lokal
          const draft = loadDraft(session.user.id!)
          if (draft) {
            setForm(draft.form)
            setStep(draft.step)
            setDraftBanner(true)
          }
        }
      } catch (err) {
        console.error('Fetch existing error:', err)
        // Gagal fetch server → tetap coba load draft
        if (session?.user?.id) {
          const draft = loadDraft(session.user.id)
          if (draft) {
            setForm(draft.form)
            setStep(draft.step)
            setDraftBanner(true)
          }
        }
      } finally {
        setFetching(false)
        setDraftLoaded(true)
        initializedRef.current = true
      }
    }

    fetchExisting()
  }, [session, sessionStatus])

  // ── Auto-save draft ke localStorage setiap kali form/step berubah ──────────
  // Hanya aktif jika: user belum punya data server (existing === null) DAN draft sudah selesai di-load
  useEffect(() => {
    if (!draftLoaded)           return  // tunggu sampai load selesai
    if (!session?.user?.id)     return
    if (existing)               return  // sudah ada data server, tidak perlu draft
    if (!initializedRef.current) return

    saveDraft(session.user.id, form, step)
  }, [form, step, draftLoaded, existing, session])

  const isEditable = !existing || existing.status === 'menunggu'
  const set = (key: keyof FormState, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  // ── Pindah step TANPA validasi wajib — user bebas lanjut meski belum lengkap ──
  const handleNextStep = () => {
    setErrorMsg(null)
    setStep(s => s + 1)
  }

  // ── Submit: validasi lengkap baru di sini ─────────────────────────────────
  const handleSubmit = async () => {
    if (!isEditable || loading) return

    const err = validateAll(form)
    if (err) {
      setErrorMsg(err)
      // Arahkan user ke step yang bermasalah
      if (['Nama lengkap', 'NIK', 'NISN', 'Tempat lahir', 'Tanggal lahir'].some(k => err.includes(k.toLowerCase()) || err.toLowerCase().includes(k.toLowerCase()))) setStep(1)
      else if (err.includes('sekolah') || err.includes('NPSN')) setStep(2)
      else if (err.includes('Alamat') || err.includes('Kota') || err.includes('Kecamatan') || err.includes('RT/RW') || err.includes('No. HP wajib')) setStep(3)
      else if (err.includes('ayah') || err.includes('ibu') || err.includes('Orang tua') || err.includes('HP orang')) setStep(4)
      return
    }

    setLoading(true)
    setErrorMsg(null)

    const payload: FormState = { ...form }

    try {
      let res: Response

      if (existing) {
        res = await fetch('/api/pendaftaran', {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id: existing.id, ...payload }),
        })
      } else {
        res = await fetch('/api/pendaftaran', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        })
      }

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error ?? 'Terjadi kesalahan. Silakan coba lagi.')
        return
      }

      // Berhasil → hapus draft lokal
      if (session?.user?.id) clearDraft(session.user.id)

      setSuccessMsg('Pendaftaran berhasil dikirim!')
      setTimeout(() => router.push('/siswa/status'), 1000)

    } catch (err) {
      console.error('Submit error:', err)
      setErrorMsg('Gagal mengirim data. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  const stepCompletion = getStepCompletion(form)

  // ── Loading state ─────────────────────────────────────────────────────────
  if (sessionStatus === 'loading' || fetching) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        gap: 12,
      }}>
        <div style={{
          width: 44,
          height: 44,
          border: '4px solid #E2E8F0',
          borderTopColor: '#6366F1',
          borderRadius: '50%',
          animation: 'spin .8s linear infinite',
        }} />
        <p style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
          Memuat data pendaftaran...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell sf-bg">

      {/* ══ HEADER + STEP INDICATOR ══════════════════════════════════════════ */}
      <div className="sf-header">
        <div className="sf-header-grid" />
        <div className="sf-header-orb" />
        <div className="sf-header-content">

          <div className="sf-header-top">
            <Link href="/siswa/dashboard" className="sf-back-btn">←</Link>
            <div>
              <h1 className="sf-header-title">Formulir Pendaftaran</h1>
            </div>
          </div>

          <div className="sf-steps">
            {STEPS.map((s, i) => {
              const idx      = i + 1
              const isDone   = idx < step || (idx !== step && stepCompletion[idx])
              const isActive = idx === step
              const state    = isDone ? 'done' : isActive ? 'active' : 'pending'
              return (
                <div key={s.label} className="sf-step-item">
                  <button
                    className="sf-step-btn"
                    // Bisa klik step mana saja (bukan hanya step sebelumnya)
                    onClick={() => setStep(idx)}
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

      {/* ── Banner: draft dimuat ── */}
      {draftBanner && (
        <div
          className="sf-alert"
          style={{
            background: '#EEF2FF',
            borderColor: '#6366F1',
            color: '#4338CA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>💾 Draft tersimpan sebelumnya telah dimuat. Lanjutkan mengisi formulir.</span>
          <button
            type="button"
            onClick={() => setDraftBanner(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4338CA' }}
          >
            ✕
          </button>
        </div>
      )}

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

      {/* ── Error & Success messages ── */}
      {errorMsg && (
        <div className="sf-alert sf-alert-error">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
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
            <p className="sf-card-title">👤 Identitas Diri Santri</p>
            <Field
              label="Nama Lengkap"
              value={form.nama_lengkap}
              onChange={v => { set('nama_lengkap', v); setErrorMsg(null) }}
              placeholder="Sesuai ijazah"
              disabled={!isEditable}
            />
            <div className="sf-grid-2">
              <Field label="NIK"  value={form.nik}  onChange={v => { set('nik', v);  setErrorMsg(null) }} placeholder="NIK"  disabled={!isEditable} />
              <Field label="NISN" value={form.nisn} onChange={v => { set('nisn', v); setErrorMsg(null) }} placeholder="NISN" disabled={!isEditable} />
            </div>
            <div className="sf-grid-2">
              <Field label="Tempat Lahir"  value={form.tempat_lahir}  onChange={v => { set('tempat_lahir', v);  setErrorMsg(null) }} placeholder="Kota" disabled={!isEditable} />
              <Field label="Tanggal Lahir" value={form.tanggal_lahir} onChange={v => { set('tanggal_lahir', v); setErrorMsg(null) }} type="date"        disabled={!isEditable} />
            </div>
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
            <SelectField label="Agama" value={form.agama} options={AGAMA} onChange={v => set('agama', v)} disabled={!isEditable} />
          </div>
        )}

        {/* ── STEP 2: Asal Sekolah ── */}
        {step === 2 && (
          <div className="sf-card">
            <p className="sf-card-title">🏫 Asal Sekolah Santri</p>
            <Field
              label="Nama SMP / MTs Asal"
              value={form.asal_sekolah}
              onChange={v => { set('asal_sekolah', v); setErrorMsg(null) }}
              placeholder="Nama sekolah asal"
              disabled={!isEditable}
            />
            <Field
              label="NPSN (Nomor Pokok Sekolah Nasional)"
              value={form.npsn}
              onChange={v => { set('npsn', v); setErrorMsg(null) }}
              placeholder="NPSN"
              disabled={!isEditable}
            />
          </div>
        )}

        {/* ── STEP 3: Alamat & Kontak ── */}
        {step === 3 && (
          <div className="sf-card">
            <p className="sf-card-title">📍 Alamat & Kontak Santri</p>
            <Field
              label="Alamat Lengkap"
              value={form.alamat}
              onChange={v => { set('alamat', v); setErrorMsg(null) }}
              placeholder="Jl., Nomor, Gang, dsb"
              disabled={!isEditable}
            />
            <div className="sf-grid-2">
              <Field label="Kota"       value={form.alamat_kota}       onChange={v => { set('alamat_kota', v);       setErrorMsg(null) }} placeholder="Kota"       disabled={!isEditable} />
              <Field label="Kecamatan"  value={form.alamat_kecamatan}  onChange={v => { set('alamat_kecamatan', v);  setErrorMsg(null) }} placeholder="Kecamatan"  disabled={!isEditable} />
            </div>
            <div className="sf-grid-2">
              <Field label="RT/RW" value={form.alamat_rt_rw} onChange={v => { set('alamat_rt_rw', v); setErrorMsg(null) }} placeholder="RT/RW" disabled={!isEditable} />
            </div>
            <Field
              label="No. HP / WA"
              value={form.no_hp}
              onChange={v => { set('no_hp', v); setErrorMsg(null) }}
              placeholder="08xxxxxxxxxx"
              disabled={!isEditable}
            />
            <div className="sf-field">
              <label className="sf-label">Email</label>
              <input
                type="email"
                value={session?.user?.email ?? ''}
                disabled
                className="sf-input"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                Email diambil dari akun Anda dan tidak dapat diubah di sini.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 4: Data Orang Tua ── */}
        {step === 4 && (
          <div className="sf-card">
            <p className="sf-card-title">👨‍👩‍👧 Data Orang Tua & Wali</p>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <p style={{ fontWeight: 600, marginBottom: '1rem' }}>👨 Data Ayah</p>
              <Field label="Nama Ayah" value={form.nama_ayah} onChange={v => { set('nama_ayah', v); setErrorMsg(null) }} placeholder="Nama lengkap ayah" disabled={!isEditable} />
              <SelectField label="Pekerjaan Ayah" value={form.pekerjaan_ayah} options={PEKERJAAN} onChange={v => set('pekerjaan_ayah', v)} disabled={!isEditable} />
            </div>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <p style={{ fontWeight: 600, marginBottom: '1rem' }}>👩 Data Ibu</p>
              <Field label="Nama Ibu" value={form.nama_ibu} onChange={v => { set('nama_ibu', v); setErrorMsg(null) }} placeholder="Nama lengkap ibu" disabled={!isEditable} />
              <SelectField label="Pekerjaan Ibu" value={form.pekerjaan_ibu} options={PEKERJAAN} onChange={v => set('pekerjaan_ibu', v)} disabled={!isEditable} />
            </div>
            <Field label="No. HP Orang Tua" value={form.no_hp_ortu} onChange={v => { set('no_hp_ortu', v); setErrorMsg(null) }} placeholder="08xxxxxxxxxx" disabled={!isEditable} />
          </div>
        )}

        {/* ── STEP 5: Konfirmasi ── */}
        {step === 5 && (
          <div className="sf-card">
            <p className="sf-card-title">📋 Ringkasan Pendaftaran</p>

            {/* Peringatan jika ada step yang belum lengkap */}
            {Object.entries(stepCompletion).some(([k, v]) => Number(k) < 5 && !v) && (
              <div
                className="sf-alert sf-alert-error"
                style={{ marginBottom: '1rem' }}
              >
                <span>⚠️</span>
                <span>
                  Beberapa field belum diisi:{' '}
                  {[
                    !stepCompletion[1] && 'Data Diri',
                    !stepCompletion[2] && 'Asal Sekolah',
                    !stepCompletion[3] && 'Alamat & Kontak',
                    !stepCompletion[4] && 'Data Orang Tua',
                  ].filter(Boolean).join(', ')}
                  . Klik nama step di atas untuk melengkapi.
                </span>
              </div>
            )}

            {/* Data Diri */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <p style={{ fontWeight: 600, marginBottom: '1rem', color: '#1976d2' }}>👤 Data Diri</p>
              {[
                { key: 'Nama Lengkap',      val: form.nama_lengkap },
                { key: 'NIK / NISN',        val: `${form.nik} / ${form.nisn}` },
                { key: 'Tempat, Tgl Lahir', val: `${form.tempat_lahir}, ${form.tanggal_lahir ? new Date(form.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}` },
                { key: 'Jenis Kelamin',     val: form.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' },
                { key: 'Agama',             val: form.agama },
              ].map(({ key, val }) => (
                <div key={key} className="sf-summary-row">
                  <span className="sf-summary-key">{key}</span>
                  <span className="sf-summary-val">{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Asal Sekolah */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <p style={{ fontWeight: 600, marginBottom: '1rem', color: '#1976d2' }}>🏫 Asal Sekolah</p>
              {[
                { key: 'Nama Sekolah', val: form.asal_sekolah },
                { key: 'NPSN',         val: form.npsn },
              ].map(({ key, val }) => (
                <div key={key} className="sf-summary-row">
                  <span className="sf-summary-key">{key}</span>
                  <span className="sf-summary-val">{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Alamat & Kontak */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <p style={{ fontWeight: 600, marginBottom: '1rem', color: '#1976d2' }}>📍 Alamat & Kontak</p>
              {[
                { key: 'Alamat Lengkap', val: form.alamat },
                { key: 'Kota',           val: form.alamat_kota },
                { key: 'Kecamatan',      val: form.alamat_kecamatan },
                { key: 'RT/RW',          val: form.alamat_rt_rw },
                { key: 'No. HP / WA',    val: form.no_hp },
                { key: 'Email',          val: session?.user?.email ?? '-' },
              ].map(({ key, val }) => (
                <div key={key} className="sf-summary-row">
                  <span className="sf-summary-key">{key}</span>
                  <span className="sf-summary-val">{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Data Orang Tua */}
            <div>
              <p style={{ fontWeight: 600, marginBottom: '1rem', color: '#1976d2' }}>👨‍👩‍👧 Data Orang Tua</p>
              {[
                { key: 'Nama Ayah',      val: form.nama_ayah },
                { key: 'Pekerjaan Ayah', val: form.pekerjaan_ayah },
                { key: 'Nama Ibu',       val: form.nama_ibu },
                { key: 'Pekerjaan Ibu',  val: form.pekerjaan_ibu },
                { key: 'No. HP Ortu',    val: form.no_hp_ortu },
              ].map(({ key, val }) => (
                <div key={key} className="sf-summary-row">
                  <span className="sf-summary-key">{key}</span>
                  <span className="sf-summary-val">{val || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ══ BOTTOM NAVIGATION BAR ════════════════════════════════════════════ */}
      <div className="sf-bottom-bar">
        {step > 1 && (
          <button
            type="button"
            onClick={() => { setStep(s => s - 1); setErrorMsg(null) }}
            className="sf-btn-back"
          >
            ← Kembali
          </button>
        )}

        {step < STEPS.length ? (
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
              <><span className="sf-spinner">⏳</span>Menyimpan...</>
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