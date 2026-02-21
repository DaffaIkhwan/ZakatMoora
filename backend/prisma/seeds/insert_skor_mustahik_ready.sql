-- ============================================================
-- INSERT QUERY SKOR MUSTAHIK - VERSI MUDAH (TANPA REPLACE ID)
-- Copy-paste langsung query ini ke SQL client
-- ============================================================

SET search_path TO app;

-- ============================================================
-- MUSTAHIK 1: Aris Priyadi (NIK: 1607911802330079)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C1A' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C2A' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C2B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C3A' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C3B' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C3C' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C4A' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C4B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C4C' AND value = 1
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C5A' AND value = 12
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C5B' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C5C' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C6A' AND value = 12
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C6B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C6C' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C6D' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C7A' AND value = 3
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C7B' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607911802330079', id FROM "SubKriteria" WHERE aspect = 'C7C' AND value = 3
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- MUSTAHIK 2: Dayu Elima (NIK: 1607913003400786)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C1A' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C2A' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C2B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C3A' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C3B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C3C' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C4A' AND value = 1
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C4B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C4C' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C5A' AND value = 20
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C5B' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C5C' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C6A' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C6B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C6C' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C6D' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C7A' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C7B' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607913003400786', id FROM "SubKriteria" WHERE aspect = 'C7C' AND value = 3
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- MUSTAHIK 3: Tedi Sartika (NIK: 1607914612010000)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C1A' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C2A' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C2B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C3A' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C3B' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C3C' AND value = 5
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C4A' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C4B' AND value = 1
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C4C' AND value = 1
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C5A' AND value = 12
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C5B' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C5C' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C6A' AND value = 12
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C6B' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C6C' AND value = 12
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C6D' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C7A' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C7B' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607914612010000', id FROM "SubKriteria" WHERE aspect = 'C7C' AND value = 3
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- MUSTAHIK 4: Nora Susanti (NIK: 1607915602170001)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C1A' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C2A' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C2B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C3A' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C3B' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C3C' AND value = 5
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C4A' AND value = 1
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C4B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C4C' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C5A' AND value = 20
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C5B' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C5C' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C6A' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C6B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C6C' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C6D' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C7A' AND value = 5
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C7B' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607915602170001', id FROM "SubKriteria" WHERE aspect = 'C7C' AND value = 6
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- MUSTAHIK 5: Harmi Yanti (NIK: 1607915607170119)
-- ============================================================

INSERT INTO "SkorMustahik" (id, "mustahikId", "subCriterionId")
SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C1A' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C2A' AND value = 8
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C2B' AND value = 1
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C3A' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C3B' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C3C' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C4A' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C4B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C4C' AND value = 1
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C5A' AND value = 12
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C5B' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C5C' AND value = 4
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C6A' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C6B' AND value = 0
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C6C' AND value = 6
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C6D' AND value = 10
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C7A' AND value = 3
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C7B' AND value = 2
UNION ALL SELECT gen_random_uuid(), '1607915607170119', id FROM "SubKriteria" WHERE aspect = 'C7C' AND value = 3
ON CONFLICT ("mustahikId", "subCriterionId") DO NOTHING;

-- ============================================================
-- VERIFIKASI
-- ============================================================

SELECT 
    m.nik, 
    m.name, 
    COUNT(ms.id) as total_skor
FROM "Mustahik" m
LEFT JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
GROUP BY m.nik, m.name
ORDER BY m.name;
