# 📝 PANDUAN QUERY SQL INSERT LANGSUNG

## 🎯 Yang Sudah Dibuat

Saya telah membuat **file SQL siap pakai** yang bisa Anda copy-paste langsung ke SQL client (pgAdmin, DBeaver, psql, dll).

---

## 📁 FILE-FILE YANG TERSEDIA

### 1. **insert_mustahik_simple.sql** ✅ RECOMMENDED
**Format:** INSERT INTO ... VALUES

**Isi:** 26 data Mustahik dalam format INSERT VALUES sederhana

**Cara Pakai:**
```sql
-- Copy semua isi file dan paste ke SQL client Anda
-- Atau jalankan via command line:
psql -h localhost -U your_user -d your_db -f insert_mustahik_simple.sql
```

---

### 2. **insert_skor_mustahik_ready.sql** ✅ RECOMMENDED
**Format:** INSERT INTO ... SELECT ... UNION ALL

**Isi:** Skor untuk 5 mustahik pertama (total ~95 records)

**Keuntungan:**
- ✅ Tidak perlu replace ID manual
- ✅ Otomatis ambil ID dari tabel SubKriteria
- ✅ Ready to copy-paste

**Cara Pakai:**
```sql
-- Copy semua isi file dan paste ke SQL client Anda
-- Query akan otomatis mencari ID SubKriteria yang sesuai
```

---

### 3. **insert_skor_mustahik_template.sql** ⚠️ ADVANCED
**Format:** INSERT dengan placeholder [ID_xxx]

**Isi:** Template untuk 3 mustahik dengan placeholder ID

**Penggunaan:** Jika ingin kontrol penuh dan manual replace ID

---

## 🚀 QUICK START (COPY-PASTE)

### Step 1: Insert Mustahik (26 data)

**Buka file:** `insert_mustahik_simple.sql`

**Copy query ini dan paste ke SQL client:**

```sql
SET search_path TO app;

INSERT INTO "Mustahik" (nik, "userId", name, address, phone, "businessStatus", "registeredDate") VALUES
('1607911802330079', NULL, 'Aris Priyadi', 'Jl. Kubang Tuah', '082353198791', 'belum_usaha', '2026-01-12 16:41:41'),
('1607913003400786', NULL, 'Dayu Elima', 'Jl. Dupadik Rumbino', '085766843256', 'rintisan', '2026-01-17 16:41:41'),
-- ... dst (26 baris total)
ON CONFLICT (nik) DO NOTHING;
```

---

### Step 2: Insert Skor Mustahik (~95 data)

**Buka file:** `insert_skor_mustahik_ready.sql`

**Copy query ini dan paste ke SQL client:**

```sql
SET search_path TO app;

-- MUSTAHIK 1: Aris Priyadi
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C1A' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C2A' AND value = 10
-- ... dst (19 baris per mustahik)
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;
```

---

## 📊 DATA YANG AKAN DI-INSERT

### Tabel Mustahik (26 records)

| NIK | Nama | Business Status |
|-----|------|-----------------|
| 1607911802330079 | Aris Priyadi | belum_usaha |
| 1607913003400786 | Dayu Elima | rintisan |
| 1607914612010000 | Tedi Sartika | berkembang |
| ... | ... | ... |

### Tabel SkorMustahik (~95 records untuk 5 mustahik)

**Per Mustahik:** 19 sub-kriteria

| Mustahik | Total Skor |
|----------|------------|
| Aris Priyadi | 19 |
| Dayu Elima | 19 |
| Tedi Sartika | 19 |
| Nora Susanti | 19 |
| Harmi Yanti | 19 |

---

## 🔧 CARA PAKAI DENGAN BERBAGAI TOOLS

### 1. **pgAdmin** (GUI)

1. Buka pgAdmin
2. Connect ke database
3. Klik kanan pada database → **Query Tool**
4. Copy-paste isi file SQL
5. Klik **Execute** (F5)

---

### 2. **DBeaver** (GUI)

1. Buka DBeaver
2. Connect ke database
3. Klik **SQL Editor** (Ctrl+])
4. Copy-paste isi file SQL
5. Klik **Execute SQL Statement** (Ctrl+Enter)

---

### 3. **psql** (Command Line)

```bash
# Cara 1: Execute file langsung
psql -h localhost -U your_user -d your_db -f prisma/seeds/insert_mustahik_simple.sql
psql -h localhost -U your_user -d your_db -f prisma/seeds/insert_skor_mustahik_ready.sql

# Cara 2: Copy-paste manual
psql -h localhost -U your_user -d your_db
# Kemudian paste query
```

---

### 4. **Prisma DB Execute**

```bash
cd backend
npx prisma db execute --file prisma/seeds/insert_mustahik_simple.sql --schema prisma/schema.prisma
npx prisma db execute --file prisma/seeds/insert_skor_mustahik_ready.sql --schema prisma/schema.prisma
```

---

## ✅ VERIFIKASI DATA

### Cek Total Mustahik

```sql
SET search_path TO app;
SELECT COUNT(*) as total FROM "Mustahik";
-- Expected: 26
```

### Cek Total Skor

```sql
SET search_path TO app;
SELECT COUNT(*) as total FROM "SkorMustahik";
-- Expected: ~95 (5 mustahik × 19 kriteria)
```

### Cek Detail Per Mustahik

```sql
SET search_path TO app;
SELECT 
    m.nik, 
    m.name, 
    COUNT(ms.id) as total_skor
FROM "Mustahik" m
LEFT JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
GROUP BY m.nik, m.name
ORDER BY total_skor DESC, m.name;
```

**Expected Output:**
```
        nik        |      name      | total_skor
-------------------+----------------+------------
 1607911802330079  | Aris Priyadi   | 19
 1607913003400786  | Dayu Elima     | 19
 1607914612010000  | Tedi Sartika   | 19
 1607915602170001  | Nora Susanti   | 19
 1607915607170119  | Harmi Yanti    | 19
 ... (21 lainnya)  | ...            | 0
```

---

## 🎯 MAPPING NILAI SUB-KRITERIA

### Benefit Criteria (semakin tinggi semakin baik)

- **C1A** - Pendidikan: 0=Tidak Sekolah, 2=SD, 4=SMP, 6=SMA, 9=PT
- **C2A** - Kondisi Fisik: 0=Sangat Sakit, 4=Menahun, 8=Sakit Ringan, 10=Sehat
- **C4A** - Shalat Wajib: 0=Jarang, 1=Kadang, 2=Rutin
- **C4B** - Shalat Sunnah: 0=Tidak Pernah, 1=Kadang, 2=Rutin
- **C4C** - Aktivitas Keagamaan: 0=Tidak Aktif, 1=Kadang, 2=Aktif
- **C6A** - Keterampilan: 0=Tidak Ada, 6=Dasar, 12=Terampil
- **C6B** - Pengalaman: 0=Tidak Ada, 6=Pernah Usaha, 9=≥1 Tahun
- **C6C** - Rencana Usaha: 0=Tidak Ada, 6=Sederhana, 12=Matang
- **C6D** - Motivasi: 0=Rendah, 10=Tinggi

### Cost Criteria (semakin tinggi semakin membutuhkan)

- **C2B** - Kondisi Keluarga: 0=Tidak Ada, 1=Sering Sakit, 2=Sakit Berat
- **C3A** - Struktur Rumah: 0=Tidak Layak, 4=Semi Permanen, 9=Permanen
- **C3B** - Kepadatan: 0=≤2 orang, 4=>4 orang
- **C3C** - Fasilitas: 0=Lengkap, 5=Tanpa MCK
- **C5A** - Pendapatan: 0=>100%UMR, 6=60-100%, 12=30-59%, 20=<30%
- **C5B** - Sumber Penghasilan: 0=Tetap, 4=Usaha Kecil, 6=Tidak Tetap
- **C5C** - Tanggungan: 0=≤2, 2=3-4, 4=≥5
- **C7A** - Status Rumah: 0=Milik, 3=Kontrak, 5=Menumpang
- **C7B** - Kendaraan: 0=Mobil, 2=Motor, 4=Tidak Ada
- **C7C** - Aset Lain: 0=Banyak, 3=Sedikit, 6=Tidak Punya

---

## ⚠️ TROUBLESHOOTING

### Error: "relation does not exist"
**Solusi:** Pastikan schema sudah benar
```sql
SET search_path TO app;
```

### Error: "foreign key constraint"
**Solusi:** Pastikan tabel SubKriteria sudah terisi
```sql
SELECT COUNT(*) FROM app."SubKriteria";
-- Harus ada data (minimal 19+ sub-kriteria)
```

### Error: "duplicate key value"
**Solusi:** Data sudah ada, query menggunakan `ON CONFLICT DO NOTHING` jadi aman

---

## 🎨 EXTEND UNTUK MUSTAHIK LAINNYA

### Template untuk Mustahik Baru

```sql
-- Copy pattern ini dan ganti NIK serta nilai
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT gen_random_uuid(), '[NIK_BARU]', id FROM "SubKriteria" WHERE aspect = 'C1A' AND value = [NILAI]
UNION ALL SELECT gen_random_uuid(), '[NIK_BARU]', id FROM "SubKriteria" WHERE aspect = 'C2A' AND value = [NILAI]
-- ... (19 baris untuk semua kriteria)
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;
```

---

## 📌 SUMMARY

✅ **File Mustahik:** `insert_mustahik_simple.sql` (26 data)  
✅ **File Skor:** `insert_skor_mustahik_ready.sql` (5 mustahik × 19 kriteria)  
✅ **Format:** Simple INSERT VALUES & INSERT SELECT  
✅ **Ready:** Copy-paste langsung  
✅ **Safe:** Menggunakan ON CONFLICT DO NOTHING  

---

**Status:** ✅ READY TO USE  
**Last Update:** 2026-02-11
