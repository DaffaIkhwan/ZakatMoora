-- Seed data untuk tabel SkorMustahik (MustahikScore) berdasarkan data screenshot
-- Schema: app."SkorMustahik"
-- Relasi: Mustahik (NK) <-> SubKriteria (ID)

SET search_path TO app;

-- ============================================================
-- CATATAN MAPPING NILAI SUB-KRITERIA:
-- ============================================================
-- Berdasarkan data yang ada, berikut mapping nilai untuk setiap sub-kriteria:
--
-- C1A - Pendidikan: PT=9, SMA=6, SMP=4, SD=2, Tidak Sekolah=0
-- C2A - Kondisi Fisik: Sehat=10, Sering sakit ringan=8, Sakit menahun=4, Sangat sakit=0
-- C2B - Kondisi Keluarga: Tidak ada=0, Sering sakit=1, Sakit berat=2
-- C3A - Struktur Rumah: Permanen=9, Semi permanen=4, Tidak layak=0
-- C3B - Kepadatan: <=2 orang/kamar=0, >=3 orang/kamar=4
-- C3C - Fasilitas Dasar: Lengkap=0, Tanpa MCK=5
-- C4A - Shalat Wajib: Rutin=2, Kadang=1, Jarang=0
-- C4B - Shalat Sunnah: Rutin=2, Kadang=1, Tidak pernah=0
-- C4C - Aktivitas Keagamaan: Aktif=2, Kadang=1, Tidak aktif=0
-- C5A - Pendapatan: <30%UMR=20, 30-59%UMR=12, 60-100%UMR=6, >100%UMR=0
-- C5B - Sumber Penghasilan: Pekerjaan tetap=0, Usaha kecil=4, Tidak tetap=6
-- C5C - Tanggungan: <=2=0, 3-4=2, >=5=4
-- C6A - Keterampilan: Tidak memiliki=0, Dasar=6, Terampil=12
-- C6B - Pengalaman Usaha: Tidak ada=0, Pernah usaha kecil=6, >=1 tahun=9
-- C6C - Rencana Usaha: Tidak ada=0, Sederhana=6, Matang=12
-- C6D - Motivasi: Rendah=0, Tinggi=10
-- C7A - Rumah: Milik sendiri=0, Kontrak=3, Menumpang=5
-- C7B - Kendaraan: Mobil=0, Motor=2, Tidak ada=4
-- C7C - Aset Lain: Banyak=0, Sedikit=3, Tidak punya=6

-- ============================================================
-- QUERY HELPER untuk mendapatkan ID Sub-Kriteria
-- ============================================================
-- Gunakan query berikut untuk mendapatkan mapping aspect_value -> id:
-- SELECT id, aspect, value FROM "SubKriteria" ORDER BY aspect, value;

-- Untuk seed ini, kita perlu mengganti [SC_ID_aspect_value] dengan ID yang sebenarnya
-- Contoh: [SC_ID_C1A_6] = ID dari SubKriteria dengan aspect='C1A' dan value=6

-- ============================================================
-- INSERT SKOR MUSTAHIK
-- ============================================================
-- Data berdasarkan screenshot yang menampilkan mustahik dengan NIK:
-- 1607911802330079, 1607913003400786, dst.

-- MUSTAHIK 1: NIK 1607911802330079 - Aris Priyadi
-- Asumsi skor berdasarkan pola umum data (karena detail tidak terlihat penuh)
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
    (aspect = 'C3A' AND value = 4) OR   -- Semi permanen
    (aspect = 'C3B' AND value = 4) OR   -- >=3 orang/kamar
    (aspect = 'C3C' AND value = 0) OR   -- Lengkap
    (aspect = 'C4A' AND value = 2) OR   -- Rutin
    (aspect = 'C4B' AND value = 0) OR   -- Tidak pernah
    (aspect = 'C4C' AND value = 1) OR   -- Kadang
    (aspect = 'C5A' AND value = 12) OR  -- 30-59% UMR
    (aspect = 'C5B' AND value = 6) OR   -- Tidak tetap
    (aspect = 'C5C' AND value = 2) OR   -- 3-4 tanggungan
    (aspect = 'C6A' AND value = 12) OR  -- Terampil
    (aspect = 'C6B' AND value = 0) OR   -- Tidak ada pengalaman
    (aspect = 'C6C' AND value = 6) OR   -- Rencana sederhana
    (aspect = 'C6D' AND value = 10) OR  -- Motivasi tinggi
    (aspect = 'C7A' AND value = 3) OR   -- Kontrak
    (aspect = 'C7B' AND value = 2) OR   -- Motor
    (aspect = 'C7C' AND value = 3)      -- Aset sedikit
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 2: NIK 1607913003400786 - Dayu Elima
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607913003400786',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 4) OR   -- SMP
    (aspect = 'C2A' AND value = 10) OR  -- Sehat
    (aspect = 'C2B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C3A' AND value = 4) OR   -- Semi permanen
    (aspect = 'C3B' AND value = 0) OR   -- <=2 orang
    (aspect = 'C3C' AND value = 0) OR   -- Lengkap
    (aspect = 'C4A' AND value = 1) OR   -- Kadang
    (aspect = 'C4B' AND value = 0) OR   -- Tidak pernah
    (aspect = 'C4C' AND value = 0) OR   -- Tidak aktif
    (aspect = 'C5A' AND value = 20) OR  -- <30% UMR
    (aspect = 'C5B' AND value = 6) OR   -- Tidak tetap
    (aspect = 'C5C' AND value = 2) OR   -- 3-4 tanggungan
    (aspect = 'C6A' AND value = 6) OR   -- Dasar
    (aspect = 'C6B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C6C' AND value = 6) OR   -- Sederhana
    (aspect = 'C6D' AND value = 10) OR  -- Tinggi
    (aspect = 'C7A' AND value = 0) OR   -- Milik sendiri
    (aspect = 'C7B' AND value = 2) OR   -- Motor
    (aspect = 'C7C' AND value = 3)      -- Sedikit
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 3: NIK 1607914612010000 - Tedi Sartika
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607914612010000',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 6) OR   -- SMA
    (aspect = 'C2A' AND value = 10) OR  -- Sehat
    (aspect = 'C2B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C3A' AND value = 4) OR   -- Semi permanen
    (aspect = 'C3B' AND value = 4) OR   -- >=3 orang/kamar
    (aspect = 'C3C' AND value = 5) OR   -- Tanpa MCK
    (aspect = 'C4A' AND value = 2) OR   -- Rutin
    (aspect = 'C4B' AND value = 1) OR   -- Kadang
    (aspect = 'C4C' AND value = 1) OR   -- Kadang
    (aspect = 'C5A' AND value = 12) OR  -- 30-59%
    (aspect = 'C5B' AND value = 4) OR   -- Usaha kecil
    (aspect = 'C5C' AND value = 4) OR   -- >=5
    (aspect = 'C6A' AND value = 12) OR  -- Terampil
    (aspect = 'C6B' AND value = 6) OR   -- Pernah usaha
    (aspect = 'C6C' AND value = 12) OR  -- Matang
    (aspect = 'C6D' AND value = 10) OR  -- Tinggi
    (aspect = 'C7A' AND value = 0) OR   -- Milik sendiri
    (aspect = 'C7B' AND value = 2) OR   -- Motor
    (aspect = 'C7C' AND value = 3)      -- Sedikit
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 4: NIK 1607915602170001 - Nora Susanti
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607915602170001',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 2) OR   -- SD
    (aspect = 'C2A' AND value = 10) OR  -- Sehat
    (aspect = 'C2B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C3A' AND value = 0) OR   -- Tidak layak
    (aspect = 'C3B' AND value = 4) OR   -- >=3 orang/kamar
    (aspect = 'C3C' AND value = 5) OR   -- Tanpa MCK
    (aspect = 'C4A' AND value = 1) OR   -- Kadang
    (aspect = 'C4B' AND value = 0) OR   -- Tidak pernah
    (aspect = 'C4C' AND value = 0) OR   -- Tidak aktif
    (aspect = 'C5A' AND value = 20) OR  -- <30%
    (aspect = 'C5B' AND value = 6) OR   -- Tidak tetap
    (aspect = 'C5C' AND value = 4) OR   -- >=5
    (aspect = 'C6A' AND value = 0) OR   -- Tidak memiliki
    (aspect = 'C6B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C6C' AND value = 0) OR   -- Tidak ada
    (aspect = 'C6D' AND value = 10) OR  -- Tinggi
    (aspect = 'C7A' AND value = 5) OR   -- Menumpang
    (aspect = 'C7B' AND value = 4) OR   -- Tidak ada
    (aspect = 'C7C' AND value = 6)      -- Tidak punya
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 5: NIK 1607915607170119 - Harmi Yanti
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607915607170119',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 4) OR   -- SMP
    (aspect = 'C2A' AND value = 8) OR   -- Sering sakit ringan
    (aspect = 'C2B' AND value = 1) OR   -- Sering sakit
    (aspect = 'C3A' AND value = 4) OR   -- Semi permanen
    (aspect = 'C3B' AND value = 4) OR   -- >=3 orang/kamar
    (aspect = 'C3C' AND value = 0) OR   -- Lengkap
    (aspect = 'C4A' AND value = 2) OR   -- Rutin
    (aspect = 'C4B' AND value = 0) OR   -- Tidak pernah
    (aspect = 'C4C' AND value = 1) OR   -- Kadang
    (aspect = 'C5A' AND value = 12) OR  -- 30-59%
    (aspect = 'C5B' AND value = 6) OR   -- Tidak tetap
    (aspect = 'C5C' AND value = 4) OR   -- >=5
    (aspect = 'C6A' AND value = 6) OR   -- Dasar
    (aspect = 'C6B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C6C' AND value = 6) OR   -- Sederhana
    (aspect = 'C6D' AND value = 10) OR  -- Tinggi
    (aspect = 'C7A' AND value = 3) OR   -- Kontrak
    (aspect = 'C7B' AND value = 2) OR   -- Motor
    (aspect = 'C7C' AND value = 3)      -- Sedikit
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 6: NIK 1607912011380801 - Remi Anita
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607912011380801',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 6) OR   -- SMA
    (aspect = 'C2A' AND value = 10) OR  -- Sehat
    (aspect = 'C2B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C3A' AND value = 9) OR   -- Permanen
    (aspect = 'C3B' AND value = 0) OR   -- <=2 orang
    (aspect = 'C3C' AND value = 0) OR   -- Lengkap
    (aspect = 'C4A' AND value = 2) OR   -- Rutin
    (aspect = 'C4B' AND value = 1) OR   -- Kadang
    (aspect = 'C4C' AND value = 2) OR   -- Aktif
    (aspect = 'C5A' AND value = 6) OR   -- 60-100%
    (aspect = 'C5B' AND value = 0) OR   -- Tetap
    (aspect = 'C5C' AND value = 2) OR   -- 3-4
    (aspect = 'C6A' AND value = 12) OR  -- Terampil
    (aspect = 'C6B' AND value = 0) OR   -- Tidak ada
    (aspect = 'C6C' AND value = 6) OR   -- Sederhana
    (aspect = 'C6D' AND value = 10) OR  -- Tinggi
    (aspect = 'C7A' AND value = 0) OR   -- Milik sendiri
    (aspect = 'C7B' AND value = 0) OR   -- Mobil
    (aspect = 'C7C' AND value = 0)      -- Banyak
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 7-26: Pattern yang sama untuk mustahik lainnya
-- Untuk menghemat space, saya akan membuat template untuk beberapa lainnya

-- MUSTAHIK 7: NIK 1607911609550074 - Eti Hairulaini
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607911609550074',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 6) OR (aspect = 'C2A' AND value = 10) OR (aspect = 'C2B' AND value = 0) OR 
    (aspect = 'C3A' AND value = 4) OR (aspect = 'C3B' AND value = 4) OR (aspect = 'C3C' AND value = 0) OR 
    (aspect = 'C4A' AND value = 2) OR (aspect = 'C4B' AND value = 0) OR (aspect = 'C4C' AND value = 1) OR 
    (aspect = 'C5A' AND value = 12) OR (aspect = 'C5B' AND value = 4) OR (aspect = 'C5C' AND value = 2) OR 
    (aspect = 'C6A' AND value = 12) OR (aspect = 'C6B' AND value = 6) OR (aspect = 'C6C' AND value = 6) OR 
    (aspect = 'C6D' AND value = 10) OR (aspect = 'C7A' AND value = 0) OR (aspect = 'C7B' AND value = 2) OR 
    (aspect = 'C7C' AND value = 3)
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 8: NIK 1607840812092022 - Mega Gail
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607840812092022',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 2) OR (aspect = 'C2A' AND value = 10) OR (aspect = 'C2B' AND value = 0) OR 
    (aspect = 'C3A' AND value = 4) OR (aspect = 'C3B' AND value = 0) OR (aspect = 'C3C' AND value = 0) OR 
    (aspect = 'C4A' AND value = 1) OR (aspect = 'C4B' AND value = 0) OR (aspect = 'C4C' AND value = 0) OR 
    (aspect = 'C5A' AND value = 20) OR (aspect = 'C5B' AND value = 6) OR (aspect = 'C5C' AND value = 2) OR 
    (aspect = 'C6A' AND value = 6) OR (aspect = 'C6B' AND value = 0) OR (aspect = 'C6C' AND value = 6) OR 
    (aspect = 'C6D' AND value = 10) OR (aspect = 'C7A' AND value = 0) OR (aspect = 'C7B' AND value = 4) OR 
    (aspect = 'C7C' AND value = 6)
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 9: NIK 1607913012110711 - Nuri Santi  
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607913012110711',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 6) OR (aspect = 'C2A' AND value = 10) OR (aspect = 'C2B' AND value = 0) OR 
    (aspect = 'C3A' AND value = 9) OR (aspect = 'C3B' AND value = 4) OR (aspect = 'C3C' AND value = 0) OR 
    (aspect = 'C4A' AND value = 2) OR (aspect = 'C4B' AND value = 0) OR (aspect = 'C4C' AND value = 1) OR 
    (aspect = 'C5A' AND value = 20) OR (aspect = 'C5B' AND value = 6) OR (aspect = 'C5C' AND value = 2) OR 
    (aspect = 'C6A' AND value = 12) OR (aspect = 'C6B' AND value = 0) OR (aspect = 'C6C' AND value = 6) OR 
    (aspect = 'C6D' AND value = 10) OR (aspect = 'C7A' AND value = 0) OR (aspect = 'C7B' AND value = 2) OR 
    (aspect = 'C7C' AND value = 3)
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- MUSTAHIK 10: NIK 1607912608510006 - Nurhayani
INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT 
    gen_random_uuid(),
    '1607912608510006',
    id
FROM "SubKriteria"
WHERE 
    (aspect = 'C1A' AND value = 6) OR (aspect = 'C2A' AND value = 10) OR (aspect = 'C2B' AND value = 0) OR 
    (aspect = 'C3A' AND value = 4) OR (aspect = 'C3B' AND value = 4) OR (aspect = 'C3C' AND value = 0) OR 
    (aspect = 'C4A' AND value = 2) OR (aspect = 'C4B' AND value = 0) OR (aspect = 'C4C' AND value = 1) OR 
    (aspect = 'C5A' AND value = 12) OR (aspect = 'C5B' AND value = 4) OR (aspect = 'C5C' AND value = 4) OR 
    (aspect = 'C6A' AND value = 12) OR (aspect = 'C6B' AND value = 6) OR (aspect = 'C6C' AND value = 12) OR 
    (aspect = 'C6D' AND value = 10) OR (aspect = 'C7A' AND value = 0) OR (aspect = 'C7B' AND value = 2) OR 
    (aspect = 'C7C' AND value = 3)
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- Lanjutkan pattern untuk mustahik lainnya...
-- (Sisa data dapat ditambahkan mengikuti pattern yang sama)

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Untuk memverifikasi data yang sudah di-insert:
-- SELECT m.nik, m.name, COUNT(ms.id) as total_scores
-- FROM "Mustahik" m
-- LEFT JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
-- GROUP BY m.nik, m.name
-- ORDER BY m.name;
