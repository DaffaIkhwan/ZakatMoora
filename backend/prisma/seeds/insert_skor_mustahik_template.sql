-- ============================================================
-- INSERT QUERY LANGSUNG UNTUK TABEL SKOR MUSTAHIK
-- ============================================================
-- PENTING: Jalankan query bagian 1 terlebih dahulu untuk mendapatkan ID SubKriteria
-- Kemudian gunakan ID tersebut untuk query bagian 2
-- ============================================================

SET search_path TO app;

-- ============================================================
-- BAGIAN 1: QUERY UNTUK MENDAPATKAN ID SUB-KRITERIA
-- ============================================================
-- Jalankan query ini terlebih dahulu, copy hasilnya ke notepad
-- Format hasil: aspect | value | id
-- ============================================================

SELECT 
    aspect,
    value,
    id,
    name
FROM "SubKriteria"
ORDER BY aspect, value;

-- ============================================================
-- BAGIAN 2: TEMPLATE INSERT (GANTI [ID] DENGAN ID DARI BAGIAN 1)
-- ============================================================

-- Contoh: Jika dari BAGIAN 1 didapat:
-- C1A | 6 | 123e4567-e89b-12d3-a456-426614174000
-- Maka ganti [ID_C1A_6] dengan '123e4567-e89b-12d3-a456-426614174000'

-- ============================================================
-- INSERT SKOR UNTUK MUSTAHIK 1: Aris Priyadi (NIK: 1607911802330079)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId") VALUES
(gen_random_uuid(), '1607911802330079', '[ID_C1A_6]'),    -- Pendidikan: SMA
(gen_random_uuid(), '1607911802330079', '[ID_C2A_10]'),   -- Kondisi Fisik: Sehat
(gen_random_uuid(), '1607911802330079', '[ID_C2B_0]'),    -- Kondisi Keluarga: Tidak ada
(gen_random_uuid(), '1607911802330079', '[ID_C3A_4]'),    -- Struktur Rumah: Semi permanen
(gen_random_uuid(), '1607911802330079', '[ID_C3B_4]'),    -- Kepadatan: >=3 orang/kamar
(gen_random_uuid(), '1607911802330079', '[ID_C3C_0]'),    -- Fasilitas: Lengkap
(gen_random_uuid(), '1607911802330079', '[ID_C4A_2]'),    -- Shalat Wajib: Rutin
(gen_random_uuid(), '1607911802330079', '[ID_C4B_0]'),    -- Shalat Sunnah: Tidak pernah
(gen_random_uuid(), '1607911802330079', '[ID_C4C_1]'),    -- Aktivitas Keagamaan: Kadang
(gen_random_uuid(), '1607911802330079', '[ID_C5A_12]'),   -- Pendapatan: 30-59% UMR
(gen_random_uuid(), '1607911802330079', '[ID_C5B_6]'),    -- Sumber Penghasilan: Tidak tetap
(gen_random_uuid(), '1607911802330079', '[ID_C5C_2]'),    -- Tanggungan: 3-4 orang
(gen_random_uuid(), '1607911802330079', '[ID_C6A_12]'),   -- Keterampilan: Terampil
(gen_random_uuid(), '1607911802330079', '[ID_C6B_0]'),    -- Pengalaman: Tidak ada
(gen_random_uuid(), '1607911802330079', '[ID_C6C_6]'),    -- Rencana Usaha: Sederhana
(gen_random_uuid(), '1607911802330079', '[ID_C6D_10]'),   -- Motivasi: Tinggi
(gen_random_uuid(), '1607911802330079', '[ID_C7A_3]'),    -- Status Rumah: Kontrak
(gen_random_uuid(), '1607911802330079', '[ID_C7B_2]'),    -- Kendaraan: Motor
(gen_random_uuid(), '1607911802330079', '[ID_C7C_3]')     -- Aset Lain: Sedikit
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- INSERT SKOR UNTUK MUSTAHIK 2: Dayu Elima (NIK: 1607913003400786)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId") VALUES
(gen_random_uuid(), '1607913003400786', '[ID_C1A_4]'),    -- Pendidikan: SMP
(gen_random_uuid(), '1607913003400786', '[ID_C2A_10]'),   -- Kondisi Fisik: Sehat
(gen_random_uuid(), '1607913003400786', '[ID_C2B_0]'),    -- Kondisi Keluarga: Tidak ada
(gen_random_uuid(), '1607913003400786', '[ID_C3A_4]'),    -- Struktur Rumah: Semi permanen
(gen_random_uuid(), '1607913003400786', '[ID_C3B_0]'),    -- Kepadatan: <=2 orang
(gen_random_uuid(), '1607913003400786', '[ID_C3C_0]'),    -- Fasilitas: Lengkap
(gen_random_uuid(), '1607913003400786', '[ID_C4A_1]'),    -- Shalat Wajib: Kadang
(gen_random_uuid(), '1607913003400786', '[ID_C4B_0]'),    -- Shalat Sunnah: Tidak pernah
(gen_random_uuid(), '1607913003400786', '[ID_C4C_0]'),    -- Aktivitas Keagamaan: Tidak aktif
(gen_random_uuid(), '1607913003400786', '[ID_C5A_20]'),   -- Pendapatan: <30% UMR
(gen_random_uuid(), '1607913003400786', '[ID_C5B_6]'),    -- Sumber Penghasilan: Tidak tetap
(gen_random_uuid(), '1607913003400786', '[ID_C5C_2]'),    -- Tanggungan: 3-4 orang
(gen_random_uuid(), '1607913003400786', '[ID_C6A_6]'),    -- Keterampilan: Dasar
(gen_random_uuid(), '1607913003400786', '[ID_C6B_0]'),    -- Pengalaman: Tidak ada
(gen_random_uuid(), '1607913003400786', '[ID_C6C_6]'),    -- Rencana Usaha: Sederhana
(gen_random_uuid(), '1607913003400786', '[ID_C6D_10]'),   -- Motivasi: Tinggi
(gen_random_uuid(), '1607913003400786', '[ID_C7A_0]'),    -- Status Rumah: Milik sendiri
(gen_random_uuid(), '1607913003400786', '[ID_C7B_2]'),    -- Kendaraan: Motor
(gen_random_uuid(), '1607913003400786', '[ID_C7C_3]')     -- Aset Lain: Sedikit
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- INSERT SKOR UNTUK MUSTAHIK 3: Tedi Sartika (NIK: 1607914612010000)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId") VALUES
(gen_random_uuid(), '1607914612010000', '[ID_C1A_6]'),    -- Pendidikan: SMA
(gen_random_uuid(), '1607914612010000', '[ID_C2A_10]'),   -- Kondisi Fisik: Sehat
(gen_random_uuid(), '1607914612010000', '[ID_C2B_0]'),    -- Kondisi Keluarga: Tidak ada
(gen_random_uuid(), '1607914612010000', '[ID_C3A_4]'),    -- Struktur Rumah: Semi permanen
(gen_random_uuid(), '1607914612010000', '[ID_C3B_4]'),    -- Kepadatan: >=3 orang/kamar
(gen_random_uuid(), '1607914612010000', '[ID_C3C_5]'),    -- Fasilitas: Tanpa MCK
(gen_random_uuid(), '1607914612010000', '[ID_C4A_2]'),    -- Shalat Wajib: Rutin
(gen_random_uuid(), '1607914612010000', '[ID_C4B_1]'),    -- Shalat Sunnah: Kadang
(gen_random_uuid(), '1607914612010000', '[ID_C4C_1]'),    -- Aktivitas Keagamaan: Kadang
(gen_random_uuid(), '1607914612010000', '[ID_C5A_12]'),   -- Pendapatan: 30-59% UMR
(gen_random_uuid(), '1607914612010000', '[ID_C5B_4]'),    -- Sumber Penghasilan: Usaha kecil
(gen_random_uuid(), '1607914612010000', '[ID_C5C_4]'),    -- Tanggungan: >=5 orang
(gen_random_uuid(), '1607914612010000', '[ID_C6A_12]'),   -- Keterampilan: Terampil
(gen_random_uuid(), '1607914612010000', '[ID_C6B_6]'),    -- Pengalaman: Pernah usaha
(gen_random_uuid(), '1607914612010000', '[ID_C6C_12]'),   -- Rencana Usaha: Matang
(gen_random_uuid(), '1607914612010000', '[ID_C6D_10]'),   -- Motivasi: Tinggi
(gen_random_uuid(), '1607914612010000', '[ID_C7A_0]'),    -- Status Rumah: Milik sendiri
(gen_random_uuid(), '1607914612010000', '[ID_C7B_2]'),    -- Kendaraan: Motor
(gen_random_uuid(), '1607914612010000', '[ID_C7C_3]')     -- Aset Lain: Sedikit
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- SISA MUSTAHIK (4-26): Silakan lanjutkan dengan pattern yang sama
-- ============================================================

-- Verifikasi
SELECT m.nik, m.name, COUNT(ms.id) as total_skor
FROM "Mustahik" m
LEFT JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
GROUP BY m.nik, m.name
ORDER BY m.name;
