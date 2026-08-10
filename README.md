# 🏷️ Willy Consign - Live Auction & Consignment Platform

Willy Consign adalah platform lelang dan titip jual (consignment) barang koleksi berbasis web yang interaktif dan *real-time*. Platform ini dirancang untuk memberikan pengalaman *booking* barang (rebutan/war) secara instan layaknya fitur *live streaming*, dilengkapi dengan sistem keamanan yang kokoh dan dasbor admin yang komprehensif.

## ✨ Fitur Utama

### 🛒 Untuk Pengguna (Pembeli)
- **Real-time Live Comments**: Melihat komentar dan status pemenang secara *real-time* tanpa perlu me-*refresh* halaman (menggunakan Supabase Realtime).
- **Sistem "War" Barang (Booking)**: Sistem otomatis memprioritaskan dan mencatat komentar `book`, `buk`, atau `b` tercepat sebagai pemenang.
- **Nego Fleksibel**: Pengguna dapat melakukan tawar-menawar (misal: "Nego 50k" atau "Try 50k") yang nantinya dapat disetujui langsung oleh Admin.
- **Invoice Pribadi**: Pengguna dapat melihat daftar barang yang berhasil dimenangkan beserta total tagihan di halaman *Invoice Saya*.
- **Integrasi WhatsApp**: Tombol *Checkout* langsung terhubung ke WhatsApp Admin dengan format pesanan yang sudah terisi otomatis (Nama & Total Tagihan).

### 👑 Untuk Admin
- **Manajemen Inventaris**: Dasbor khusus (`/admin`) untuk mengelola daftar barang (tambah, edit, hapus, update harga awal).
- **Live Moderation**: Admin dapat memantau, menyetujui pemenang *nego*, atau menghapus komentar langsung dari *feed* komentar.
- **Tabel Rekap (Bookings & Invoices)**: Memantau daftar seluruh barang yang sedang di-*booking* dan barang yang transaksinya sudah selesai secara mendetail.

### 🛡️ Keamanan & Performa
- **Enkripsi JWT**: Sistem otentikasi *cookie* terlindungi dengan JSON Web Tokens.
- **Bcrypt Hashing**: Kata sandi (password) disimpan secara acak dan tidak dapat dibaca oleh siapa pun.
- **Row Level Security (RLS)**: Database dilindungi dari akses publik ilegal; manipulasi data hanya dapat dilakukan melalui *Server Actions* Next.js yang aman.
- **Optimasi Gambar**: *Load* gambar super cepat dengan Next.js Image dan fitur *Zoom/Modal Hover* interaktif.

---

## 🛠️ Tech Stack

Platform ini dibangun menggunakan teknologi web modern:
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) (Animasi)
- **Database & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Security**: `jose` (JWT) & `bcryptjs` (Password Hashing)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Panduan Setup & Instalasi (Local Development)

Jika Anda ingin menjalankan proyek ini di komputer lokal Anda, ikuti langkah-langkah berikut:

### 1. Kloning Repositori
```bash
git clone https://github.com/UsernameAnda/willy-consign.git
cd willy-consign
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat sebuah file bernama `.env.local` di *root folder* proyek Anda, dan isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_SUPABASE_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
JWT_SECRET=KataSandiRahasiaBebasApaSaja123!
```

### 4. Setup Database (Supabase)
1. Buka Supabase SQL Editor Anda.
2. *Copy* dan *paste* isi dari file `schema.sql` lalu jalankan (Run).
3. Setelah tabel terbuat, *copy* dan *paste* isi dari file `secure-rls.sql` lalu jalankan (Run) untuk mengaktifkan sistem keamanan.

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📝 Catatan Penting
- **Akun Admin**: Untuk masuk sebagai admin, lakukan pendaftaran (Register) dengan nama `WillyAdmin` (pastikan tidak ada yang menggunakan nama ini sebelumnya, atau atur langsung di database).

---
*Didesain dan dikembangkan dengan ❤️ untuk pengalaman lelang yang lebih baik.*
