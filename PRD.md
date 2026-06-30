# PRD — Citrus

**Product Requirements Document**

| | |
|---|---|
| **Nama Proyek** | Citrus — *Creative Operations* |
| **Jenis** | Aplikasi web (ERP ringan untuk studio kreatif) |
| **Versi** | 1.0 |
| **Tanggal** | 9 Juni 2026 |
| **Penyusun** | _[Nama / NIM]_ |

---

## 1. Ringkasan

Citrus adalah aplikasi web "ERP ringan" untuk studio kreatif. Aplikasi ini
membantu studio mengelola **klien, proyek, anggota tim, dan tugas** dalam satu
sistem, dilengkapi **dashboard** yang menampilkan pekerjaan yang butuh
perhatian. Tampilannya menyesuaikan peran pengguna dan mendukung mode
terang/gelap.

## 2. Masalah & Tujuan

**Masalah.** Studio kreatif sering mengelola pekerjaan secara terpisah-pisah
(spreadsheet, chat, catatan), sehingga sulit melihat status proyek dan tenggat
secara menyeluruh.

**Tujuan.** Menyediakan satu tempat untuk mengelola alur klien → proyek → tugas,
dan menampilkan ringkasan yang langsung menunjukkan apa yang perlu dikerjakan.

## 3. Pengguna & Peran

Aplikasi memiliki empat sudut pandang sesuai peran pengguna:

| Peran | Yang diutamakan |
|---|---|
| **Owner / Admin** | Gambaran seluruh studio: klien, proyek, dan tenggat |
| **Project Manager** | Proyek berjalan, beban kerja tim, dan item yang menunggu review |
| **Creative** | Antrian tugas pribadi ("yang harus saya kerjakan") |
| **Finance** | Sisi anggaran proyek |

*Catatan: belum ada sistem login — peran diganti lewat dropdown untuk keperluan
demo.*

## 4. Ruang Lingkup — Fitur Utama

- **Dashboard** — ringkasan pekerjaan + navigasi cepat
- **Klien** — kelola data klien
- **Proyek** — kelola proyek beserta status & anggaran
- **Tim** — kelola anggota tim
- **Tugas** — kelola tugas (assign, tenggat, prioritas, status)
- **Pencarian cepat** — command palette (⌘K / Ctrl+K)
- **Mode terang/gelap**

## 5. Kebutuhan Fungsional

- **Dashboard.** Menampilkan jumlah tugas **terlambat (overdue)**, **jatuh tempo
  minggu ini**, **menunggu review**, dan **belum ada penanggung jawab**. Setiap
  kartu bisa diklik untuk membuka daftar terkait. Juga menampilkan proyek yang
  sedang berjalan beserta progres dan tenggatnya.
- **Klien.** Tambah, lihat, ubah, dan hapus data klien. Halaman detail
  menampilkan proyek milik klien tersebut.
- **Proyek.** Tambah/ubah/hapus proyek. Memiliki status (planning, active,
  review, completed, cancelled), anggaran, tenggat, manajer, dan klien. Halaman
  detail menampilkan daftar tugas.
- **Tim.** Tambah/ubah/hapus anggota tim beserta perannya.
- **Tugas.** Tambah/ubah/hapus tugas. Memiliki penanggung jawab, tenggat,
  prioritas, dan status. Dapat **diedit langsung di tempat (inline)** dan
  **difilter** (mis. overdue, due soon, review, unassigned).
- **Pencarian cepat.** Buka command palette dengan ⌘K untuk lompat ke halaman
  atau data tertentu.
- **Tema.** Pengguna dapat beralih antara mode terang dan gelap.

## 6. Kebutuhan Non-Fungsional / Batasan

- **Teknologi:** Next.js (React) + TypeScript, Tailwind CSS, Prisma + PostgreSQL.
- **Tanpa autentikasi** — peran diganti via dropdown (sesuai konteks proyek
  kuliah).
- **Responsif** (diutamakan untuk desktop) dan memperhatikan **aksesibilitas**
  (kontras warna, navigasi keyboard).
- **Design system konsisten** (token warna & tipografi), termasuk dukungan mode
  gelap.
- **Data demo** otomatis dimuat setiap kali aplikasi dijalankan.

## 7. Kriteria Keberhasilan

- Pengguna dapat menjalankan alur lengkap: **buat klien → buat proyek → buat &
  kelola tugas**.
- Dashboard menampilkan angka yang benar (mis. jumlah tugas overdue sesuai data)
  dan tautannya mengarah ke daftar yang tepat.
- Aplikasi berjalan lancar pada mode terang & gelap tanpa error.

## 8. Pengembangan ke Depan *(opsional)*

- Sistem login/autentikasi sungguhan
- Fitur invoice & pembayaran
- Unggah berkas/aset
- Notifikasi
