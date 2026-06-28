'use client'
// app/siswa/pendaftaran/page.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// ── Icon set (SVG line-style — profesional, elegant, modern) ───────────────────
type IconProps = { size?: number; color?: string; strokeWidth?: number }

const IconUser = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7" />
  </svg>
)

const IconSchool = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 2 8l10 5 10-5-10-5Z" />
    <path d="M6 10.5V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-5.5" />
  </svg>
)

const IconPin = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

const IconFamily = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8.5" cy="7.5" r="3" />
    <circle cx="16" cy="8.5" r="2.3" />
    <path d="M2.5 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M15 14.2c2.4.3 4.2 2.3 4.2 4.8" />
  </svg>
)

const IconCheckCircle = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3 4.7-5" />
  </svg>
)

const IconAlertTriangle = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2h.01" />
  </svg>
)

const IconSave = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4h11l3 3v13H5V4Z" />
    <path d="M8 4v5h7V4" />
    <path d="M8 14h8v6H8v-6Z" />
  </svg>
)

const IconClipboardEdit = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
    <path d="M9 11h6" />
    <path d="M9 14.5h3" />
  </svg>
)

const IconRocket = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4.5c2.5-1 5-1 5-1s0 2.5-1 5c-1.2 2.9-3.4 5.1-5.6 6.6L9 18l-3-3 2.9-3.9C10.4 11.9 12.6 9.7 15.5 8.5c2-1 5-1 5-1" />
    <path d="M9 15c-2 .3-3.2 1-4 3-1.8-.8-2.5-2-3-4 2-.8 2.7-2 3-4" />
    <circle cx="15.5" cy="8.5" r="1.4" />
  </svg>
)

const IconSpinner = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin .8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" opacity="0.2" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const IconChevronLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5 8 12l7 7" />
  </svg>
)

const IconChevronRight = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
)

const IconX = ({ size = 14, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

const IconMale = ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="6" />
    <path d="M14.5 9.5 20 4M20 4h-4.5M20 4v4.5" />
  </svg>
)

const IconFemale = ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="6" />
    <path d="M12 15v6M9 19h6" />
  </svg>
)

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
  { label: 'Data Diri',       Icon: IconUser },
  { label: 'Asal Sekolah',    Icon: IconSchool },
  { label: 'Alamat & Kontak', Icon: IconPin },
  { label: 'Data Orang Tua',  Icon: IconFamily },
  { label: 'Konfirmasi',      Icon: IconCheckCircle },
]

// ── Ukuran layout tetap (untuk header/footer fixed) ────────────────────────────
const HEADER_HEIGHT = 88      // tinggi header fixed (judul + subtitle + icon), termasuk buffer aman
const ACTION_BAR_HEIGHT = 76  // tinggi bar tombol Lanjut/Kembali, termasuk buffer aman
const SISWA_NAV_HEIGHT = 68   // perkiraan tinggi SiswaBottomNav dari layout induk — SESUAIKAN jika beda

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

// ── Style constants (inline, mengikuti konvensi proyek) ────────────────────────
const styles = {
  field: { marginBottom: 16 } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#1E2233',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#F4F6FA',
    border: '1px solid #E6E9F0',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    color: '#1E2233',
    outline: 'none',
  } as React.CSSProperties,
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  } as React.CSSProperties,
  card: {
    background: '#FFFFFF',
    border: '1px solid #EEF1F6',
    borderRadius: 18,
    padding: 18,
  } as React.CSSProperties,
  cardTitle: {
    margin: '0 0 16px',
    fontSize: 14,
    fontWeight: 800,
    color: '#1E2233',
    letterSpacing: 0.3,
  } as React.CSSProperties,
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 0',
    fontSize: 13.5,
  } as React.CSSProperties,
  summaryKey: {
    color: '#9AA1B1',
    fontWeight: 500,
    flexShrink: 0,
  } as React.CSSProperties,
  summaryVal: {
    color: '#1E2233',
    fontWeight: 600,
    textAlign: 'right',
  } as React.CSSProperties,
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
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ ...styles.input, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
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
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{ ...styles.input, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function CardTitle({ icon: Icon, children }: { icon: React.ComponentType<IconProps>; children: React.ReactNode }) {
  return (
    <p style={{ ...styles.cardTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'flex', color: '#4F46E5' }}><Icon size={16} /></span>
      {children}
    </p>
  )
}

function SectionLabel({ icon: Icon, children, color = '#4F46E5' }: { icon: React.ComponentType<IconProps>; children: React.ReactNode; color?: string }) {
  return (
    <p style={{ fontWeight: 700, marginBottom: '1rem', color, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'flex' }}><Icon size={15} /></span>
      {children}
    </p>
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
    <div
      style={{
        position: 'relative',
        maxWidth: 430,
        margin: '0 auto',
        background: '#F8FAFC',
        minHeight: '100dvh',
      }}
    >

      {/* ══ HEADER (FIXED — tidak ikut scroll, lepas dari scroll context manapun) ══ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          zIndex: 40,
          background: '#FFFFFF',
          borderBottom: '1px solid #EEF1F6',
          padding: '18px 16px 16px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Link
              href="/siswa/dashboard"
              style={{
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: 12,
                background: '#F1F0FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F46E5',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <IconChevronLeft size={20} />
            </Link>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#1E2233',
                  lineHeight: 1.25,
                }}
              >
                Formulir Pendaftaran
              </h1>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 13,
                  color: '#9AA1B1',
                  fontWeight: 500,
                }}
              >
                Lengkapi data diri Anda untuk mendaftar
              </p>
            </div>
          </div>

          {/* Icon Formulir — pojok kanan atas */}
          <Image
            src="/icons/formulir icon.png"
            alt="Formulir"
            width={40}
            height={40}
            style={{ flexShrink: 0, borderRadius: 10, objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* ══ AREA KONTEN (mengalir natural — discroll oleh dokumen/body) ════════ */}
      <div
        style={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: ACTION_BAR_HEIGHT + SISWA_NAV_HEIGHT,
        }}
      >
        {/* ── STEP INDICATOR ── */}
        <div style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #EEF1F6',
              borderRadius: 16,
              padding: '14px 8px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            {STEPS.map((s, i) => {
              const idx      = i + 1
              const isDone   = idx < step || (idx !== step && stepCompletion[idx])
              const isActive = idx === step
              const state    = isDone ? 'done' : isActive ? 'active' : 'pending'
              const circleBg = state === 'active' ? '#4F46E5' : state === 'done' ? '#4F46E5' : '#EFF1F5'
              const circleColor = state === 'pending' ? '#A6ACBC' : '#FFFFFF'
              const labelColor = state === 'active' ? '#4F46E5' : state === 'done' ? '#4F46E5' : '#A6ACBC'
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => setStep(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      width: '100%',
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: circleBg,
                        color: circleColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {state === 'done' ? (
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : idx}
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: labelColor,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        height: 2,
                        flex: 1,
                        marginTop: 16,
                        background: state === 'done' ? '#4F46E5' : '#EFF1F5',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Banner: draft dimuat ── */}
        {draftBanner && (
          <div
            style={{
              margin: '14px 16px 0',
              background: '#EEF2FF',
              border: '1px solid #6366F1',
              borderRadius: 12,
              padding: '12px 14px',
              color: '#4338CA',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconSave size={16} />
              Draft tersimpan sebelumnya telah dimuat. Lanjutkan mengisi formulir.
            </span>
            <button
              type="button"
              onClick={() => setDraftBanner(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4338CA', display: 'flex', flexShrink: 0 }}
            >
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* ── Warning: tidak bisa edit ── */}
        {!isEditable && (
          <div
            style={{
              margin: '14px 16px 0',
              background: '#FEF3D9',
              border: '1px solid #F4D58D',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              color: '#92660B',
              fontSize: 13.5,
              lineHeight: 1.5,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1 }}><IconAlertTriangle size={18} /></span>
            <span>
              Formulir tidak dapat diedit karena status pendaftaran sudah&nbsp;
              <strong>{existing?.status}</strong>.
            </span>
          </div>
        )}

        {/* ── Error & Success messages ── */}
        {errorMsg && (
          <div
            style={{
              margin: '14px 16px 0',
              background: '#FEECEC',
              border: '1px solid #F5A9A9',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              color: '#B42318',
              fontSize: 13.5,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1 }}><IconAlertTriangle size={18} /></span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div
            style={{
              margin: '14px 16px 0',
              background: '#E7F8EE',
              border: '1px solid #86E0AB',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              color: '#067647',
              fontSize: 13.5,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1 }}><IconCheckCircle size={18} /></span>
            <span>{successMsg}</span>
          </div>
        )}

      {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 24px' }} key={step}>

        {/* ── STEP 1: Data Diri ── */}
        {step === 1 && (
          <div style={styles.card}>
            <CardTitle icon={IconUser}>Identitas Diri Santri</CardTitle>
            <Field
              label="Nama Lengkap"
              value={form.nama_lengkap}
              onChange={v => { set('nama_lengkap', v); setErrorMsg(null) }}
              placeholder="Sesuai ijazah"
              disabled={!isEditable}
            />
            <div style={styles.grid2}>
              <Field label="NIK"  value={form.nik}  onChange={v => { set('nik', v);  setErrorMsg(null) }} placeholder="NIK"  disabled={!isEditable} />
              <Field label="NISN" value={form.nisn} onChange={v => { set('nisn', v); setErrorMsg(null) }} placeholder="NISN" disabled={!isEditable} />
            </div>
            <div style={styles.grid2}>
              <Field label="Tempat Lahir"  value={form.tempat_lahir}  onChange={v => { set('tempat_lahir', v);  setErrorMsg(null) }} placeholder="Kota" disabled={!isEditable} />
              <Field label="Tanggal Lahir" value={form.tanggal_lahir} onChange={v => { set('tanggal_lahir', v); setErrorMsg(null) }} type="date"        disabled={!isEditable} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Jenis Kelamin</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['L', 'P'] as const).map(v => {
                  const active = form.jenis_kelamin === v
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => isEditable && set('jenis_kelamin', v)}
                      disabled={!isEditable}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px 0',
                        borderRadius: 12,
                        border: active ? '1px solid #4F46E5' : '1px solid #E6E9F0',
                        background: active ? '#EEF2FF' : '#F4F6FA',
                        color: active ? '#4F46E5' : '#1E2233',
                        fontWeight: 600,
                        fontSize: 13.5,
                        cursor: isEditable ? 'pointer' : 'not-allowed',
                        opacity: isEditable ? 1 : 0.6,
                      }}
                    >
                      <span style={{ display: 'flex' }}>{v === 'L' ? <IconMale size={15} /> : <IconFemale size={15} />}</span>
                      <span>{v === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <SelectField label="Agama" value={form.agama} options={AGAMA} onChange={v => set('agama', v)} disabled={!isEditable} />
          </div>
        )}

        {/* ── STEP 2: Asal Sekolah ── */}
        {step === 2 && (
          <div style={styles.card}>
            <CardTitle icon={IconSchool}>Asal Sekolah Santri</CardTitle>
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
          <div style={styles.card}>
            <CardTitle icon={IconPin}>Alamat & Kontak Santri</CardTitle>
            <Field
              label="Alamat Lengkap"
              value={form.alamat}
              onChange={v => { set('alamat', v); setErrorMsg(null) }}
              placeholder="Jl., Nomor, Gang, dsb"
              disabled={!isEditable}
            />
            <div style={styles.grid2}>
              <Field label="Kota"       value={form.alamat_kota}       onChange={v => { set('alamat_kota', v);       setErrorMsg(null) }} placeholder="Kota"       disabled={!isEditable} />
              <Field label="Kecamatan"  value={form.alamat_kecamatan}  onChange={v => { set('alamat_kecamatan', v);  setErrorMsg(null) }} placeholder="Kecamatan"  disabled={!isEditable} />
            </div>
            <div style={styles.grid2}>
              <Field label="RT/RW" value={form.alamat_rt_rw} onChange={v => { set('alamat_rt_rw', v); setErrorMsg(null) }} placeholder="RT/RW" disabled={!isEditable} />
            </div>
            <Field
              label="No. HP / WA"
              value={form.no_hp}
              onChange={v => { set('no_hp', v); setErrorMsg(null) }}
              placeholder="08xxxxxxxxxx"
              disabled={!isEditable}
            />
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={session?.user?.email ?? ''}
                disabled
                style={{ ...styles.input, opacity: 0.6, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                Email diambil dari akun Anda dan tidak dapat diubah di sini.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 4: Data Orang Tua ── */}
        {step === 4 && (
          <div style={styles.card}>
            <CardTitle icon={IconFamily}>Data Orang Tua & Wali</CardTitle>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <SectionLabel icon={IconUser} color="#1E2233">Data Ayah</SectionLabel>
              <Field label="Nama Ayah" value={form.nama_ayah} onChange={v => { set('nama_ayah', v); setErrorMsg(null) }} placeholder="Nama lengkap ayah" disabled={!isEditable} />
              <SelectField label="Pekerjaan Ayah" value={form.pekerjaan_ayah} options={PEKERJAAN} onChange={v => set('pekerjaan_ayah', v)} disabled={!isEditable} />
            </div>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <SectionLabel icon={IconUser} color="#1E2233">Data Ibu</SectionLabel>
              <Field label="Nama Ibu" value={form.nama_ibu} onChange={v => { set('nama_ibu', v); setErrorMsg(null) }} placeholder="Nama lengkap ibu" disabled={!isEditable} />
              <SelectField label="Pekerjaan Ibu" value={form.pekerjaan_ibu} options={PEKERJAAN} onChange={v => set('pekerjaan_ibu', v)} disabled={!isEditable} />
            </div>
            <Field label="No. HP Orang Tua" value={form.no_hp_ortu} onChange={v => { set('no_hp_ortu', v); setErrorMsg(null) }} placeholder="08xxxxxxxxxx" disabled={!isEditable} />
          </div>
        )}

        {/* ── STEP 5: Konfirmasi ── */}
        {step === 5 && (
          <div style={styles.card}>
            <CardTitle icon={IconClipboardEdit}>Ringkasan Pendaftaran</CardTitle>

            {/* Peringatan jika ada step yang belum lengkap */}
            {Object.entries(stepCompletion).some(([k, v]) => Number(k) < 5 && !v) && (
              <div
                style={{
                  marginBottom: '1rem',
                  background: '#FEECEC',
                  border: '1px solid #F5A9A9',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  color: '#B42318',
                  fontSize: 13.5,
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}><IconAlertTriangle size={18} /></span>
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
              <SectionLabel icon={IconUser}>Data Diri</SectionLabel>
              {[
                { key: 'Nama Lengkap',      val: form.nama_lengkap },
                { key: 'NIK / NISN',        val: `${form.nik} / ${form.nisn}` },
                { key: 'Tempat, Tgl Lahir', val: `${form.tempat_lahir}, ${form.tanggal_lahir ? new Date(form.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}` },
                { key: 'Jenis Kelamin',     val: form.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' },
                { key: 'Agama',             val: form.agama },
              ].map(({ key, val }) => (
                <div key={key} style={styles.summaryRow}>
                  <span style={styles.summaryKey}>{key}</span>
                  <span style={styles.summaryVal}>{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Asal Sekolah */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <SectionLabel icon={IconSchool}>Asal Sekolah</SectionLabel>
              {[
                { key: 'Nama Sekolah', val: form.asal_sekolah },
                { key: 'NPSN',         val: form.npsn },
              ].map(({ key, val }) => (
                <div key={key} style={styles.summaryRow}>
                  <span style={styles.summaryKey}>{key}</span>
                  <span style={styles.summaryVal}>{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Alamat & Kontak */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <SectionLabel icon={IconPin}>Alamat & Kontak</SectionLabel>
              {[
                { key: 'Alamat Lengkap', val: form.alamat },
                { key: 'Kota',           val: form.alamat_kota },
                { key: 'Kecamatan',      val: form.alamat_kecamatan },
                { key: 'RT/RW',          val: form.alamat_rt_rw },
                { key: 'No. HP / WA',    val: form.no_hp },
                { key: 'Email',          val: session?.user?.email ?? '-' },
              ].map(({ key, val }) => (
                <div key={key} style={styles.summaryRow}>
                  <span style={styles.summaryKey}>{key}</span>
                  <span style={styles.summaryVal}>{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Data Orang Tua */}
            <div>
              <SectionLabel icon={IconFamily}>Data Orang Tua</SectionLabel>
              {[
                { key: 'Nama Ayah',      val: form.nama_ayah },
                { key: 'Pekerjaan Ayah', val: form.pekerjaan_ayah },
                { key: 'Nama Ibu',       val: form.nama_ibu },
                { key: 'Pekerjaan Ibu',  val: form.pekerjaan_ibu },
                { key: 'No. HP Ortu',    val: form.no_hp_ortu },
              ].map(({ key, val }) => (
                <div key={key} style={styles.summaryRow}>
                  <span style={styles.summaryKey}>{key}</span>
                  <span style={styles.summaryVal}>{val || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      </div>

      {/* ══ BOTTOM NAVIGATION BAR (fixed, di atas SiswaBottomNav dari layout) ══ */}
      <div
        style={{
          position: 'fixed',
          bottom: SISWA_NAV_HEIGHT,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          zIndex: 40,
          background: '#FFFFFF',
          borderTop: '1px solid #EEF1F6',
          padding: '12px 16px',
          display: 'flex',
          gap: 10,
          boxSizing: 'border-box',
        }}
      >
        {step > 1 && (
          <button
            type="button"
            onClick={() => { setStep(s => s - 1); setErrorMsg(null) }}
            style={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '14px 18px',
              borderRadius: 14,
              border: '1px solid #E6E9F0',
              background: '#F4F6FA',
              color: '#1E2233',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <IconChevronLeft size={16} /> Kembali
          </button>
        )}

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={handleNextStep}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '14px 18px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(90deg, #4338CA, #6D5BF2)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Lanjut <IconChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isEditable}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 18px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(90deg, #4338CA, #6D5BF2)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: loading || !isEditable ? 'not-allowed' : 'pointer',
              opacity: loading || !isEditable ? 0.6 : 1,
            }}
          >
            {loading ? (
              <><IconSpinner size={16} color="#FFFFFF" />Menyimpan...</>
            ) : existing ? (
              <><IconClipboardEdit size={16} />Perbarui Data</>
            ) : (
              <><IconRocket size={16} />Kirim Pendaftaran</>
            )}
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}