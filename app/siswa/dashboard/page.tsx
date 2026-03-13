import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { supabaseAdmin }    from '@/lib/supabase'
import type { Pendaftaran } from '@/types'
import DashboardClient      from './DashboardClient'

async function getPendaftaran(userId: string): Promise<Pendaftaran | null> {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export default async function DashboardPage() {
  const session       = await getServerSession(authOptions)
  const pendaftaran   = session ? await getPendaftaran(session.user.id) : null
  const fullName      = session?.user.name ?? 'Siswa'
  const status        = pendaftaran?.status ?? null
  const avatarUrl     = session?.user.avatar_url ?? null
  // ✅ avatarInitial dihitung di sini, firstName tidak perlu dikirim sebagai prop
  const avatarInitial = fullName.split(' ')[0]?.[0]?.toUpperCase() ?? 'S'

  return (
    <DashboardClient
      fullName={fullName}
      avatarInitial={avatarInitial}
      avatarUrl={avatarUrl}
      pendaftaran={pendaftaran}
      status={status}
    />
  )
}