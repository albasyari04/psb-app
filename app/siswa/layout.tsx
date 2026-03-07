import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SiswaBottomNav from '@/components/layouts/SiswaBottomNav'
import '@/app/style/siswa.css'   // ← path sesuai folder aktual: app/style/ (bukan styles)

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'siswa') redirect('/login')

  return (
    <>
      {children}
      <SiswaBottomNav />
    </>
  )
}