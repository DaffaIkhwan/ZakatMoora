# 📊 Summary: SQL Seed Files untuk Database Mustahik

## ✅ File-file yang Sudah Dibuat

### 1. **seed_mustahik.sql** ✓
**Lokasi:** `backend/prisma/seeds/seed_mustahik.sql`

**Deskripsi:** File SQL seed untuk tabel `Mustahik` (26 records)

**Data yang di-insert:**
- 26 data mustahik lengkap dengan NIK, nama, alamat, telepon
- Business status yang bervariasi (belum_usaha, rintisan, berkembang)
- Tanggal registrasi yang bervariasi (simulasi data historis)

**Status:** ✅ **BERHASIL DI-EXECUTE**

---

### 2. **seed_skor_mustahik.sql** ✓
**Lokasi:** `backend/prisma/seeds/seed_skor_mustahik.sql`

**Deskripsi:** File SQL seed untuk tabel `SkorMustahik` (MustahikScore)

**Data yang di-insert:**
- Skor untuk 10 mustahik pertama (dapat diperluas untuk semua 26 mustahik)
- Setiap mustahik memiliki 17-19 skor berdasarkan sub-kriteria
- Total sub-kriteria mencakup: C1A, C2A, C2B, C3A, C3B, C3C, C4A, C4B, C4C, C5A, C5B, C5C, C6A, C6B, C6C, C6D, C7A, C7B, C7C

**Kriteria Penilaian:**
1. **C1** - Pendidikan & Literasi
2. **C2** - Kesehatan
3. **C3** - Kondisi Tempat Tinggal
4. **C4** - Religiusitas
5. **C5** - Kondisi Ekonomi
6. **C6** - Kesiapan Berusaha
7. **C7** - Aset & Kepemilikan

**Status:** ✅ **BERHASIL DI-EXECUTE**

---

### 3. **README.md** ✓
**Lokasi:** `backend/prisma/seeds/README.md`

**Deskripsi:** Dokumentasi lengkap tentang cara menggunakan file seed

**Konten:**
- ✅ Penjelasan struktur file
- ✅ Mapping lengkap nilai sub-kriteria (tabel referensi)
- ✅ Cara menggunakan (3 metode)
- ✅ Query verifikasi data
- ✅ Troubleshooting guide
- ✅ Cara extend/modifikasi data
- ✅ Backup & restore guide

---

### 4. **verify_scores.sql** ✓
**Lokasi:** `backend/prisma/seeds/verify_scores.sql`

**Deskripsi:** Query SQL untuk verifikasi data yang sudah di-seed

**Fungsi:**
- Menampilkan jumlah skor per mustahik
- Membantu validasi bahwa data sudah ter-insert dengan benar

---

## 📋 Cara Menggunakan (Quick Start)

### Step 1: Seed Tabel Mustahik
```bash
cd backend
npx prisma db execute --file prisma/seeds/seed_mustahik.sql --schema prisma/schema.prisma
```

### Step 2: Seed Skor Mustahik
```bash
npx prisma db execute --file prisma/seeds/seed_skor_mustahik.sql --schema prisma/schema.prisma
```

### Step 3: Verifikasi Data
```bash
npx prisma db execute --file prisma/seeds/verify_scores.sql --schema prisma/schema.prisma
```

**Atau gunakan Prisma Studio untuk melihat data:**
```bash
npx prisma studio
```

---

## 🎯 Data Yang Sudah Di-Insert

### Tabel Mustahik
| NIK | Nama | Business Status |
|-----|------|----------------|
| 1607911802330079 | Aris Priyadi | belum_usaha |
| 1607913003400786 | Dayu Elima | rintisan |
| 1607914612010000 | Tedi Sartika | berkembang |
| 1607915602170001 | Nora Susanti | belum_usaha |
| 1607915607170119 | Harmi Yanti | rintisan |
| ... (21 data lainnya) | ... | ... |

**Total:** 26 mustahik

### Tabel SkorMustahik
Setiap mustahik memiliki skor untuk berbagai sub-kriteria:

**Contoh untuk Aris Priyadi (NIK: 1607911802330079):**
- C1A (Pendidikan): SMA (6)
- C2A (Kondisi Fisik): Sehat (10)
- C2B (Kondisi Keluarga): Tidak ada anggota sakit (0)
- C3A (Struktur Rumah): Semi permanen (4)
- C3B (Kepadatan): >4 orang (4)
- C3C (Fasilitas): Lengkap (0)
- C4A (Shalat Wajib): Rutin (2)
- C4B (Shalat Sunnah): Tidak pernah (0)
- C4C (Aktivitas Keagamaan): Kadang (1)
- C5A (Pendapatan): 30-59% UMR (12)
- C5B (Sumber Penghasilan): Tidak tetap (6)
- C5C (Tanggungan): 3-4 orang (2)
- C6A (Keterampilan): Terampil (12)
- C6B (Pengalaman): Tidak ada (0)
- C6C (Rencana Usaha): Sederhana (6)
- C6D (Motivasi): Tinggi (10)
- C7A (Status Rumah): Kontrak (3)
- C7B (Kendaraan): Motor (2)
- C7C (Aset Lain): Sedikit (3)

**Total Skor:** 19 sub-kriteria per mustahik (rata-rata 17-19)

---

## 📊 Mapping Nilai Sub-Kriteria (Referensi Cepat)

### Kriteria Benefit (nilai lebih tinggi = lebih baik)
| Kriteria | Kode | Range Nilai | Keterangan |
|----------|------|-------------|------------|
| Pendidikan | C1A | 0-9 | 9=PT, 6=SMA, 4=SMP, 2=SD, 0=Tidak Sekolah |
| Kondisi Fisik | C2A | 0-10 | 10=Sehat, 8=Sakit Ringan, 4=Menahun, 0=Sangat Sakit |
| Shalat Wajib | C4A | 0-2 | 2=Rutin, 1=Kadang, 0=Jarang |
| Keterampilan | C6A | 0-12 | 12=Terampil, 6=Dasar, 0=Tidak Ada |
| Motivasi | C6D | 0-10 | 10=Tinggi, 0=Rendah |

### Kriteria Cost (nilai lebih tinggi = lebih membutuhkan)
| Kriteria | Kode | Range Nilai | Keterangan |
|----------|------|-------------|------------|
| Kondisi Keluarga | C2B | 0-2 | 2=Sakit Berat, 1=Sering Sakit, 0=Tidak Ada |
| Fasilitas | C3C | 0-5 | 5=Tanpa MCK, 0=Lengkap |
| Pendapatan | C5A | 0-20 | 20=<30%UMR, 12=30-59%, 6=60-100%, 0=>100% |
| Sumber Penghasilan | C5B | 0-6 | 6=Tidak Tetap, 4=Usaha Kecil, 0=Tetap |
| Tanggungan | C5C | 0-4 | 4=≥5 orang, 2=3-4, 0=≤2 |
| Status Rumah | C7A | 0-5 | 5=Menumpang, 3=Kontrak, 0=Milik |
| Kendaraan | C7B | 0-4 | 4=Tidak Ada, 2=Motor, 0=Mobil |
| Aset Lain | C7C | 0-6 | 6=Tidak Punya, 3=Sedikit, 0=Banyak |

---

## 🔍 Query Verifikasi Yang Berguna

### 1. Cek Total Mustahik
```sql
SET search_path TO app;
SELECT COUNT(*) as total FROM "Mustahik";
```
**Expected:** 26

### 2. Cek Distribusi Business Status
```sql
SET search_path TO app;
SELECT "businessStatus", COUNT(*) as jumlah
FROM "Mustahik"
GROUP BY "businessStatus"
ORDER BY jumlah DESC;
```

### 3. Cek Skor Per Mustahik
```sql
SET search_path TO app;
SELECT m.name, COUNT(ms.id) as total_skor
FROM "Mustahik" m
LEFT JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
GROUP BY m.nik, m.name
ORDER BY m.name;
```

### 4. Lihat Detail Skor Mustahik
```sql
SET search_path TO app;
SELECT 
    m.name,
    c.name as kriteria,
    sc.aspect,
    sc.name as sub_kriteria,
    sc.value
FROM "Mustahik" m
JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
JOIN "SubKriteria" sc ON ms."subCriterionId" = sc.id
JOIN "Kriteria" c ON sc."criterionId" = c.id
WHERE m.name = 'Aris Priyadi'
ORDER BY sc.aspect;
```

---

## ⚠️ Catatan Penting

1. **Sequence Eksekusi:**
   - ✅ Pastikan tabel `Kriteria` dan `SubKriteria` sudah terisi
   - ✅ Jalankan `seed_mustahik.sql` terlebih dahulu
   - ✅ Baru jalankan `seed_skor_mustahik.sql`

2. **Idempotency:**
   - Kedua file menggunakan `ON CONFLICT DO NOTHING`
   - Aman untuk dijalankan berulang kali tanpa duplikasi

3. **Ekstensi PostgreSQL:**
   - Script menggunakan `gen_random_uuid()`
   - Pastikan database mendukung UUID generation

4. **Schema:**
   - Semua query menggunakan schema `app`
   - Sesuaikan jika database Anda menggunakan schema berbeda

---

## 🚀 Next Steps

### Opsional: Extend Seed Data

Jika ingin menambahkan skor untuk 16 mustahik lainnya:

1. Edit `seed_skor_mustahik.sql`
2. Copy pattern INSERT yang sudah ada
3. Ganti NIK mustahik dan nilai sub-kriteria sesuai kebutuhan
4. Execute ulang file SQL

**Template INSERT untuk mustahik baru:**
```sql
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '[NIK_MUSTAHIK]',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = [NILAI]) OR
    (aspect = 'C2A' AND value = [NILAI]) OR
    -- ... dst untuk semua kriteria
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;
```

---

## 📁 Struktur File

```
backend/prisma/seeds/
├── README.md                    # Dokumentasi lengkap
├── seed_mustahik.sql           # Seed data Mustahik (26 records)
├── seed_skor_mustahik.sql      # Seed skor untuk 10 mustahik
├── verify_scores.sql           # Query verifikasi
└── SUMMARY.md                  # File ini (ringkasan)
```

---

## ✅ Checklist Completion

- [x] File seed untuk tabel Mustahik dibuat
- [x] File seed berhasil di-execute (26 data mustahik ter-insert)
- [x] File seed untuk tabel SkorMustahik dibuat
- [x] File seed skor berhasil di-execute
- [x] Dokumentasi lengkap (README.md)
- [x] Query verifikasi
- [x] Data mapping & reference table
- [x] Troubleshooting guide
- [ ] **Opsional:** Extend skor untuk 16 mustahik lainnya (bisa dilakukan nanti jika diperlukan)

---

**Status:** ✅ **SELESAI - READY TO USE**

**Dibuat:** 2026-02-11  
**Total Files:** 4 files  
**Total Records:** 26 Mustahik + ~190 Skor (10 mustahik × 19 sub-kriteria)
