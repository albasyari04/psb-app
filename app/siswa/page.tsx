import { redirect } from 'next/navigation'

// /siswa → redirect ke /siswa/dashboard
export default function SiswaIndexPage() {
  redirect('/siswa/dashboard')
}