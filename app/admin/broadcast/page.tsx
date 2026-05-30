import AdminPageShell from '../AdminPageShell'

const quickActions = [
  { label: 'Semua Pendaftar', note: 'Kirim pesan ke seluruh pendaftar' },
  { label: 'Verifikasi', note: 'Kirim update status verifikasi' },
  { label: 'Pembayaran', note: 'Ingatkan pembayaran tertunda' },
]

export default function BroadcastPage() {
  return (
    <AdminPageShell
      title="Broadcast WA"
      subtitle="Kirim pemberitahuan massal ke orang tua santri dengan cepat."
    >
      <section style={{ background: '#fff', borderRadius: 28, padding: 22, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)', border: '1px solid rgba(226, 232, 240, 1)', marginBottom: 18 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Segera Kirim Pesan</p>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.75 }}>Pilih target yang ingin Anda hubungi dan susun pesan singkat untuk disebarluaskan melalui WhatsApp.</p>
      </section>

      <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        {quickActions.map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 18, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{item.note}</p>
            </div>
            <button style={{ border: 'none', borderRadius: 16, padding: '10px 14px', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Kirim
            </button>
          </div>
        ))}
      </div>

      <section style={{ background: '#fff', borderRadius: 28, padding: 20, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)', border: '1px solid rgba(226, 232, 240, 1)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Contoh Pesan</p>
        <div style={{ padding: 18, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>
            Assalamu&apos;alaikum, Bapak/Ibu. Kami informasikan bahwa verifikasi berkas PSB gelombang 1 akan ditutup pada 25 Mei 2026. Mohon segera melengkapi data apabila belum selesai.
          </p>
        </div>
      </section>
    </AdminPageShell>
  )
}
