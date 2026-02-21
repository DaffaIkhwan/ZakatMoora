# SQL Seed Files untuk Database Mustahik

Dokumentasi ini menjelaskan cara menggunakan file-file SQL seed yang telah dibuat untuk mengisi tabel `Mustahik` dan `SkorMustahik` (MustahikScore).

## File-file yang Tersedia

### 1. `seed_mustahik.sql`
File ini berisi data seed untuk tabel **Mustahik** dengan 26 records berdasarkan data dari screenshot spreadsheet.

**Kolom yang di-isi:**
- `nik` (Primary Key) - Nomor Induk Kependudukan
- `userId` - NULL (tidak ada relasi user spesifik)
- `name` - Nama lengkap mustahik
- `address` - Alamat lengkap
- `phone` - Nomor telepon
- `businessStatus` - Status usaha (belum_usaha, rintisan, berkembang, maju)
- `registeredDate` - Tanggal registrasi (bervariasi untuk simulasi data historis)

**Contoh data:**
```sql
INSERT INTO "Mustahik" VALUES
('1607911802330079', NULL, 'Aris Priyadi', 'Jl. Kubang Tuah', '082353198791', 'belum_usaha', NOW() - INTERVAL '30 days'),
('1607913003400786', NULL, 'Dayu Elima', 'Jl. Dupadik Rumbino', '085766843256', 'rintisan', NOW() - INTERVAL '25 days'),
...
```

### 2. `seed_skor_mustahik.sql`
File ini berisi data seed untuk tabel **SkorMustahik** (MustahikScore) yang merelasikan mustahik dengan sub-kriteria penilaian mereka.

**Struktur relasi:**
- `mustahikId` (Foreign Key) → `Mustahik.nik`
- `subCriterionId` (Foreign Key) → `SubKriteria.id`

**Mapping Nilai Sub-Kriteria:**

| Kriteria | Kode | Nilai | Deskripsi |
|----------|------|-------|-----------|
| **Pendidikan** | C1A | 9 | Perguruan Tinggi |
| | | 6 | SMA |
| | | 4 | SMP |
| | | 2 | SD |
| | | 0 | Tidak Sekolah |
| **Kondisi Fisik** | C2A | 10 | Sehat |
| | | 8 | Sering sakit ringan |
| | | 4 | Sakit menahun |
| | | 0 | Sangat sakit |
| **Kondisi Keluarga** | C2B | 0 | Tidak ada anggota sakit |
| | | 1 | Sering sakit |
| | | 2 | Sakit berat |
| **Struktur Rumah** | C3A | 9 | Permanen |
| | | 4 | Semi permanen |
| | | 0 | Tidak layak |
| **Kepadatan** | C3B | 0 | ≤2 orang/kamar |
| | | 4 | >4 orang/kamar |
| **Fasilitas Dasar** | C3C | 0 | Lengkap |
| | | 5 | Tanpa MCK |
| **Shalat Wajib** | C4A | 2 | Rutin |
| | | 1 | Kadang |
| | | 0 | Jarang |
| **Shalat Sunnah** | C4B | 2 | Rutin |
| | | 1 | Kadang |
| | | 0 | Tidak pernah |
| **Aktivitas Keagamaan** | C4C | 2 | Aktif |
| | | 1 | Kadang |
| | | 0 | Tidak aktif |
| **Pendapatan** | C5A | 20 | <30% UMR |
| | | 12 | 30-59% UMR |
| | | 6 | 60-100% UMR |
| | | 0 | >100% UMR |
| **Sumber Penghasilan** | C5B | 0 | Pekerjaan tetap |
| | | 4 | Usaha kecil |
| | | 6 | Tidak tetap |
| **Tanggungan** | C5C | 0 | ≤2 orang |
| | | 2 | 3-4 orang |
| | | 4 | ≥5 orang |
| **Keterampilan** | C6A | 12 | Terampil |
| | | 6 | Dasar |
| | | 0 | Tidak memiliki |
| **Pengalaman Usaha** | C6B | 9 | ≥1 tahun |
| | | 6 | Pernah usaha kecil |
| | | 0 | Tidak ada |
| **Rencana Usaha** | C6C | 12 | Matang |
| | | 6 | Sederhana |
| | | 0 | Tidak ada |
| **Motivasi** | C6D | 10 | Tinggi |
| | | 0 | Rendah |
| **Status Rumah** | C7A | 0 | Milik sendiri |
| | | 3 | Kontrak |
| | | 5 | Menumpang |
| **Kendaraan** | C7B | 0 | Mobil |
| | | 2 | Motor |
| | | 4 | Tidak ada |
| **Aset Lain** | C7C | 0 | Banyak |
| | | 3 | Sedikit |
| | | 6 | Tidak punya |

**Contoh query untuk mustahik pertama:**
```sql
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607911802330079',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 6) OR   -- SMA
    (aspect = 'C2A' AND value = 10) OR  -- Sehat
    (aspect = 'C2B' AND value = 0) OR   -- Tidak ada anggota sakit
    ...
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;
```

## Cara Menggunakan

### Metode 1: Menggunakan Prisma CLI (Recommended)

1. **Jalankan seed untuk tabel Mustahik:**
```bash
npx prisma db execute --file prisma/seeds/seed_mustahik.sql --schema prisma/schema.prisma
```

2. **Jalankan seed untuk tabel SkorMustahik:**
```bash
npx prisma db execute --file prisma/seeds/seed_skor_mustahik.sql --schema prisma/schema.prisma
```

### Metode 2: Menggunakan psql (PostgreSQL CLI)

1. **Connect ke database:**
```bash
psql -h localhost -U your_username -d your_database
```

2. **Jalankan file SQL:**
```sql
\i prisma/seeds/seed_mustahik.sql
\i prisma/seeds/seed_skor_mustahik.sql
```

### Metode 3: Melalui pgAdmin atau Database GUI

1. Buka pgAdmin atau database GUI favorit Anda
2. Connect ke database
3. Buka Query Tool
4. Copy-paste isi file SQL
5. Execute query

## Verifikasi Data

### Cek jumlah data Mustahik:
```sql
SET search_path TO app;
SELECT COUNT(*) as total_mustahik FROM "Mustahik";
```

**Expected result:** 26 records

### Cek jumlah skor per mustahik:
```sql
SET search_path TO app;
SELECT m.nik, m.name, COUNT(ms.id) as total_scores
FROM "Mustahik" m
LEFT JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
GROUP BY m.nik, m.name
ORDER BY m.name;
```

**Expected result:** Setiap mustahik harus memiliki 17-19 scores (tergantung kriteria yang applicable)

### Cek detail skor mustahik tertentu:
```sql
SET search_path TO app;
SELECT 
    m.name,
    sc.aspect,
    sc.name as subcriteria_name,
    sc.value
FROM "Mustahik" m
JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
JOIN "SubKriteria" sc ON ms."subCriterionId" = sc.id
WHERE m.nik = '1607911802330079'
ORDER BY sc.aspect;
```

### Cek distribusi Business Status:
```sql
SET search_path TO app;
SELECT "businessStatus", COUNT(*) as count
FROM "Mustahik"
GROUP BY "businessStatus"
ORDER BY count DESC;
```

## Catatan Penting

1. **Data Duplikasi**: Kedua file SQL menggunakan `ON CONFLICT DO NOTHING` untuk mencegah error jika data sudah ada.

2. **Foreign Key Constraints**: 
   - Pastikan tabel `SubKriteria` sudah terisi sebelum menjalankan `seed_skor_mustahik.sql`
   - Jika tidak, query akan gagal karena tidak dapat menemukan sub-kriteria yang sesuai

3. **Schema PostgreSQL**: 
   - Semua query menggunakan `SET search_path TO app;` karena schema database adalah `app`
   - Pastikan Anda menggunakan schema yang benar sesuai konfigurasi database Anda

4. **UUID Generation**: 
   - File seed menggunakan `gen_random_uuid()` dari PostgreSQL untuk generate ID unik
   - Pastikan ekstensi UUID sudah aktif di database Anda:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

5. **Data Timestamps**:
   - `registeredDate` menggunakan `NOW() - INTERVAL 'X days'` untuk membuat data yang bervariasi
   - Ini membantu dalam testing fitur yang bergantung pada tanggal registrasi

## Troubleshooting

### Error: "relation SubKriteria does not exist"
**Solusi:** Pastikan sudah menjalankan migration Prisma:
```bash
npx prisma migrate dev
```

### Error: "foreign key constraint"
**Solusi:** Jalankan seed dalam urutan yang benar:
1. Seed untuk tabel `Kriteria` dan `SubKriteria` (jika belum ada)
2. Seed untuk tabel `Mustahik`
3. Seed untuk tabel `SkorMustahik`

### Tidak ada data yang ter-insert
**Solusi:** 
1. Cek apakah schema sudah benar: `SET search_path TO app;`
2. Cek apakah ada conflict dengan data existing
3. Jalankan query manual untuk debug

## Extend/Modifikasi Data

Jika Anda ingin menambahkan mustahik baru atau mengubah skor:

1. **Tambah Mustahik Baru:**
   - Edit `seed_mustahik.sql`
   - Tambahkan baris INSERT baru dengan NIK unik
   - Pastikan `businessStatus` menggunakan enum yang valid

2. **Ubah Skor Mustahik:**
   - Edit `seed_skor_mustahik.sql`
   - Sesuaikan nilai pada klausa WHERE untuk sub-kriteria yang diinginkan
   - Pastikan nilai yang digunakan sesuai dengan mapping di tabel di atas

3. **Batch Update:**
   - Anda bisa membuat file SQL baru untuk update data
   - Contoh: `UPDATE "SkorMustahik" SET ... WHERE ...`

## Backup & Restore

### Backup data sebelum seed:
```bash
pg_dump -h localhost -U username -d database_name -t app."Mustahik" -t app."SkorMustahik" > backup_before_seed.sql
```

### Restore jika ada masalah:
```bash
psql -h localhost -U username -d database_name < backup_before_seed.sql
```

## File Terkait

- `verify_scores.sql` - Query untuk verifikasi jumlah skor per mustahik
- `seed_mustahik_new.js` - Script Node.js alternatif untuk seeding (sudah ada sebelumnya)

---

**Dibuat:** 2026-02-11  
**Author:** AI Assistant  
**Versi:** 1.0
