-- ============================================================
-- QUERY SQL INSERT UNTUK TABEL MUSTAHIK
-- Total: 26 data mustahik berdasarkan screenshot
-- ============================================================

SET search_path TO app;

INSERT INTO "Mustahik" (nik, "userId", name, address, phone, "businessStatus", "registeredDate") VALUES
('1607911802330079', NULL, 'Aris Priyadi', 'Jl. Kubang Tuah', '082353198791', 'belum_usaha', '2026-01-12 16:52:36'),
('1607913003400786', NULL, 'Dayu Elima', 'Jl. Dupadik Rumbino', '085766843256', 'rintisan', '2026-01-17 16:52:36'),
('1607914612010000', NULL, 'Tedi Sartika', 'Jl. Kampung salo Pekan Mungka', '085311267891', 'berkembang', '2026-01-22 16:52:36'),
('1607915602170001', NULL, 'Nora Susanti', 'Jl. Marelan Pasar 2', '081267891234', 'belum_usaha', '2026-01-14 16:52:36'),
('1607915607170119', NULL, 'Harmi Yanti', 'Jl. Kampung Sungapui', '082156743921', 'rintisan', '2026-01-20 16:52:36'),
('1607912011380801', NULL, 'Remi Anita', 'Kampung Olo', '081237654891', 'belum_usaha', '2026-01-15 16:52:36'),
('1607911609550074', NULL, 'Eti Hairulaini', 'Jl. Saufinar Gulamat Pekanbaru', '085231789456', 'berkembang', '2026-01-24 16:52:36'),
('1607841112010018', NULL, 'Lela Yuslita', 'Jl. Dupadil Rumbino', '082345612789', 'rintisan', '2026-01-18 16:52:36'),
('1607911412093001', NULL, 'Mardiana', 'Jl. Pasir Merenti N4', '081298765432', 'belum_usaha', '2026-01-13 16:52:36'),
('1607840812092022', NULL, 'Mega Gail', 'Jl. Indra D Losaran', '085123456789', 'berkembang', '2026-01-27 16:52:36'),
('1607841008590770', NULL, 'Nadia Yolanda', 'Jl. Kampung Olo', '082314789652', 'rintisan', '2026-01-19 16:52:36'),
('1607913012110711', NULL, 'Nuri Santi', 'Jl. Mujahir', '081245678931', 'belum_usaha', '2026-01-16 16:52:36'),
('1607912608510006', NULL, 'Nurhayani', 'Jl. Kampung Sukapata', '085234567891', 'berkembang', '2026-01-25 16:52:36'),
('1607912508530050', NULL, 'Rizqa Sahar', 'Jl. Garuda Storomomo Manyaran', '082367891245', 'rintisan', '2026-01-21 16:52:36'),
('1607910011390050', NULL, 'Rubi Wani', 'Jl. Gamar Sugirat Kampung Olo', '081289453672', 'belum_usaha', '2026-01-11 16:52:36'),
('1607920823454950', NULL, 'Sri Nurdin', 'Jl. Haswa Kedingsan Sukapati', '085278934561', 'berkembang', '2026-01-28 16:52:36'),
('1607910412080067', NULL, 'Siti Maryam', 'Jl. Pasir Merenti N4', '082345678912', 'rintisan', '2026-01-23 16:52:36'),
('1607901810127266', NULL, 'Sri Wahyu', 'Jl. Pasir Pemenahan Manyaran', '081234891567', 'belum_usaha', '2026-01-10 16:52:36'),
('1607911301722060', NULL, 'Sri Zulfiani', 'Jl. Kampung Salo Pekan', '085267891234', 'berkembang', '2026-01-26 16:52:36'),
('1607910406170079', NULL, 'Sunarti', 'Jl. Batik Meranti N4', '082378945612', 'rintisan', '2026-01-17 16:52:36'),
('0805230130302', NULL, 'Dapan rum Tanah Sari', 'Pekanbaru', '081267453891', 'belum_usaha', '2026-01-09 16:52:36'),
('1607911510070030', NULL, 'Ade Irma Idayanti', 'Jl.amad Yani Kampar', '082345891267', 'berkembang', '2026-01-29 16:52:36'),
('1607911413250054', NULL, 'Veni Hartir', 'Jl. Pesiar Merenti N4', 'Rumah', 'belum_usaha', '2026-01-14 16:52:36'),
('1607912801580079', NULL, 'Wueni D', 'Jl. Kampung Salo Pekan', '081234567893', 'rintisan', '2026-01-18 16:52:36'),
('1607840206170055', NULL, 'Yulaida', 'Jl. Saidurol Bentran de dewangan', '085298745632', 'belum_usaha', '2026-01-12 16:52:36'),
('0805230200201', NULL, 'Yusriani', 'Jl. Kampung Olo', '082367894512', 'berkembang', '2026-01-30 16:52:36')
ON CONFLICT (nik) DO NOTHING;

-- Verifikasi hasil insert
SELECT COUNT(*) as "Total Mustahik" FROM "Mustahik";

-- Lihat data yang baru di-insert
SELECT nik, name, address, phone, "businessStatus" FROM "Mustahik" ORDER BY name;
