import AdminPageShell from '../AdminPageShell'

const tips = [
  { title: 'Periksa kualitas scan dokumen', body: 'Pastikan semua dokumen di-scan minimal 300 DPI dan tulisan tidak blur agar verifikasi berjalan lancar.' },
  { title: 'Uji nomor kontak orang tua', body: 'Verifikasi nomor telepon dan WhatsApp agar pemberitahuan tiba dengan baik.' },
  { title: 'Konsistensi data', body: 'Pastikan nama dan NISN sesuai dokumen resmi untuk menghindari penolakan.' },
  { title: 'Gunakan label yang jelas', body: 'Beri keterangan pada berkas (KK, Akte, Raport) agar reviewer cepat memeriksa.' },
]

export default function TipsPage() {
  return (
    <AdminPageShell title="Tips Admin" subtitle="Panduan singkat untuk menjalankan proses verifikasi dan penerimaan">
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {tips.map((t, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 18, boxShadow: '0 18px 40px rgba(15,23,42,0.06)', border: '1px solid #eef2ff' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{t.title}</h3>
              <p style={{ marginTop: 8, color: '#475569', fontSize: 13 }}>{t.body}</p>
            </div>
          ))}
        </div>

        <section style={{ background: 'linear-gradient(135deg,#eff6ff,#fff)', borderRadius: 20, padding: 18, boxShadow: '0 12px 28px rgba(59,130,246,0.06)', border: '1px solid #e0f2fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Checklist Verifikasi</p>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', marginTop: 6 }}>Langkah cepat untuk tim verifikator</p>
            </div>
            <button style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 12, fontWeight: 800 }}>Unduh Checklist</button>
          </div>
        </section>
      </div>
    </AdminPageShell>
  )
}
