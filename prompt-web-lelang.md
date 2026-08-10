# Prompt: Rancang Web Lelang dengan Sistem Ketik Bid per Post

Gunakan prompt di bawah ini sebagai instruksi untuk merancang/membangun aplikasi web lelang.

---

## Prompt

Buatkan sebuah aplikasi web lelang (auction) dengan spesifikasi berikut:

### 1. Tech Stack
- **Framework**: Next.js (App Router)
- **Bahasa**: TypeScript (.tsx)
- **Styling**: Tailwind CSS
- **Database**: Gunakan ORM (misalnya Prisma) yang terintegrasi dengan Next.js untuk mengelola data lelang, pengguna, dan riwayat penawaran (bid). Struktur skema database harus mendukung:
  - Tabel `User` (id, nama, email, role)
  - Tabel `Post` / `Auction` (id, judul, deskripsi, gambar, harga awal, harga saat ini, waktu mulai, waktu berakhir, status)
  - Tabel `Bid` (id, postId, userId, nominal, waktu submit)

### 2. Fitur Utama — Sistem "Ketik Bid" per Post
- Setiap post lelang memiliki **kolom input teks** tempat pengguna mengetik langsung nominal penawaran mereka (bukan tombol +/- atau slider).
- Validasi input:
  - Nominal harus lebih tinggi dari harga tertinggi saat ini.
  - Format angka otomatis (pemisah ribuan) saat mengetik.
  - Tampilkan pesan error inline jika nominal tidak valid.
- Setelah submit, harga tertinggi pada post ter-update secara real-time (gunakan polling atau websocket/SSE).
- Tampilkan riwayat penawaran terbaru (misalnya 5 bid terakhir) di bawah kolom input.
- Tampilkan hitung mundur (countdown timer) waktu lelang berakhir di setiap post.

### 3. Desain & UI/UX
- **Skema warna**: dominan **hitam-putih dengan gradasi (black & white gradient)**. Hindari warna-warna mencolok atau kombinasi warna yang membingungkan mata.
- **Gaya visual**: minimalis, clean, dan elegan — banyak white space, tipografi tegas dan modern.
- Gunakan komponen UI kekinian (modern), seperti:
  - Card dengan efek glassmorphism/subtle blur untuk setiap post lelang
  - Skeleton loading saat data dimuat
  - Toast notification untuk konfirmasi bid berhasil/gagal
  - Modal/drawer untuk detail post
  - Micro-interaction (hover, transition halus) pada tombol dan card
- Layout responsif (mobile-first), rapi untuk grid daftar lelang maupun halaman detail.

### 4. Struktur Halaman
- **Home / Daftar Lelang**: grid card semua post lelang aktif.
- **Detail Post**: gambar besar, deskripsi, kolom ketik bid, riwayat bid, countdown.
- **Dashboard User**: daftar lelang yang diikuti/dimenangkan.
- **Autentikasi**: login/register sederhana.

### 5. Output yang Diharapkan
- Struktur folder project Next.js App Router lengkap (`app/`, `components/`, `lib/`, `prisma/`).
- Kode komponen dalam `.tsx` dengan Tailwind CSS.
- Skema database (`schema.prisma`) sesuai kebutuhan di atas.
- Pastikan kode rapi, modular, dan mudah dikembangkan.

---

*Catatan: sesuaikan detail (misalnya provider database — PostgreSQL/MySQL/SQLite — dan metode real-time — polling/websocket) sesuai kebutuhan proyek saat implementasi.*
