// app/admin/pengumuman/page.tsx
import AdminPageShell from '../AdminPageShell'
import PengumumanClient from './Pengumumanclient'

export const metadata = {
  title: 'Pengumuman — Admin PSB',
}

export default function PengumumanPage() {
  return (
    <AdminPageShell
      title="Pengumuman"
      subtitle="Buat dan kelola pengumuman yang dibagikan ke orang tua dan santri."
    >
      <PengumumanClient />
    </AdminPageShell>
  )
}