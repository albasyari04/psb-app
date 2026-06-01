import React from "react";
import AdminPageShell from "@/app/admin/AdminPageShell";

export default function AllMenuPage() {
  return (
    <AdminPageShell title="Semua Menu">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Halaman Semua Menu</h1>
        <p>Konten untuk semua menu akan ditampilkan di sini.</p>
      </div>
    </AdminPageShell>
  );
}