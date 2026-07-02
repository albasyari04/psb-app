// app/admin/verifikasi/page.tsx
import { supabaseAdmin } from '@/lib/supabase'
import type { Pendaftaran } from '@/types'
import { VerifikasiHeader, VerifikasiEmptyState } from './VerifikasiHeader'
import { VerifikasiSection } from './VerifikasiSection'

export const dynamic = 'force-dynamic'

export default async function VerifikasiPage() {
  const { data: pending, error } = await supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .in('status', ['menunggu', 'diproses'])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Verifikasi page error:', error.message)
  }

  const list = (pending ?? []) as Pendaftaran[]

  const menunggu = list.filter(p => p.status === 'menunggu')
  const diproses = list.filter(p => p.status === 'diproses')

  return (
    <div className="app-shell vrk-page-bg admin-zoom-scope" style={{ background: 'var(--admin-page-bg)' }}>
      {/* Header — client component, ikut bahasa & tema aktif */}
      <VerifikasiHeader />

      {/* Spacer pengganti tinggi header fixed di atas */}
      <div style={{ height: 90 }} />

      <div className="vrk-body">
        {list.length === 0 && <VerifikasiEmptyState />}

        <VerifikasiSection
          urgency="high"
          count={menunggu.length}
          items={menunggu}
          offsetIdx={0}
        />

        <VerifikasiSection
          urgency="medium"
          count={diproses.length}
          items={diproses}
          offsetIdx={menunggu.length}
        />
      </div>
    </div>
  )
}