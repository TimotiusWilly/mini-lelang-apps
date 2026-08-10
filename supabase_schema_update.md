# Panduan Update Database Supabase

Karena ada penambahan fitur Nomor HP (Phone Number), Anda wajib menjalankan perintah SQL ini di **Supabase SQL Editor** Anda agar sistem tidak error saat menyimpan nomor HP:

```sql
-- 1. Tambahkan kolom phone di tabel users
ALTER TABLE public.users ADD COLUMN phone TEXT;

-- 2. Tambahkan kolom user_phone di tabel comments (untuk admin dashboard)
ALTER TABLE public.comments ADD COLUMN user_phone TEXT;
```

**Cara Menjalankan:**
1. Buka dashboard proyek Supabase Anda.
2. Di menu sebelah kiri, klik **SQL Editor**.
3. Klik **New query**.
4. *Copy-paste* kode di atas ke dalam editor.
5. Klik tombol **Run** (warna hijau) di pojok kanan bawah.
6. Selesai! Fitur nomor HP akan langsung berfungsi dengan sempurna.
