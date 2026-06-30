import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminBottomNav from '@/components/layouts/AdminBottomNav'
import PushNotificationManager from '@/components/PushNotificationManager'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  return (
    <>
      {/* Tidak merender apa pun di layar — cuma minta izin notifikasi &
          subscribe push di background begitu admin login. */}
      <PushNotificationManager />
      {children}
      <AdminBottomNav />
    </>
  )
}