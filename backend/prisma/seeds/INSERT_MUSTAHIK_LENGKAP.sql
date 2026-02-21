-- ============================================================
-- INSERT LENGKAP 26 DATA MUSTAHIK
-- Copy-paste seluruh query ini ke SQL client Anda
-- ============================================================

INSERT INTO app."Mustahik" (nik, "userId", name, address, phone, "businessStatus", "registeredDate") VALUES
('1607911802330079', NULL, 'Aris Priyadi', 'Jl. Kubang Tuah', '082353198791', 'belum_usaha', '2026-01-12 17:11:26'),
('1607913003400786', NULL, 'Dayu Elima', 'Jl. Dupadik Rumbino', '085766843256', 'rintisan', '2026-01-17 17:11:26'),
('1607914612010000', NULL, 'Tedi Sartika', 'Jl. Kampung salo Pekan Mungka', '085311267891', 'berkembang', '2026-01-22 17:11:26'),
('1607915602170001', NULL, 'Nora Susanti', 'Jl. Marelan Pasar 2', '081267891234', 'belum_usaha', '2026-01-14 17:11:26'),
('1607915607170119', NULL, 'Harmi Yanti', 'Jl. Kampung Sungapui', '082156743921', 'rintisan', '2026-01-20 17:11:26'),
('1607912011380801', NULL, 'Remi Anita', 'Kampung Olo', '081237654891', 'belum_usaha', '2026-01-15 17:11:26'),
('1607911609550074', NULL, 'Eti Hairulaini', 'Jl. Saufinar Gulamat Pekanbaru', '085231789456', 'berkembang', '2026-01-24 17:11:26'),
('1607841112010018', NULL, 'Lela Yuslita', 'Jl. Dupadil Rumbino', '082345612789', 'rintisan', '2026-01-18 17:11:26'),
('1607911412093001', NULL, 'Mardiana', 'Jl. Pasir Merenti N4', '081298765432', 'belum_usaha', '2026-01-13 17:11:26'),
('1607840812092022', NULL, 'Mega Gail', 'Jl. Indra D Losaran', '085123456789', 'berkembang', '2026-01-27 17:11:26'),
('1607841008590770', NULL, 'Nadia Yolanda', 'Jl. Kampung Olo', '082314789652', 'rintisan', '2026-01-19 17:11:26'),
('1607913012110711', NULL, 'Nuri Santi', 'Jl. Mujahir', '081245678931', 'belum_usaha', '2026-01-16 17:11:26'),
('1607912608510006', NULL, 'Nurhayani', 'Jl. Kampung Sukapata', '085234567891', 'berkembang', '2026-01-25 17:11:26'),
('1607912508530050', NULL, 'Rizqa Sahar', 'Jl. Garuda Storomomo Manyaran', '082367891245', 'rintisan', '2026-01-21 17:11:26'),
('1607910011390050', NULL, 'Rubi Wani', 'Jl. Gamar Sugirat Kampung Olo', '081289453672', 'belum_usaha', '2026-01-11 17:11:26'),
('1607920823454950', NULL, 'Sri Nurdin', 'Jl. Haswa Kedingsan Sukapati', '085278934561', 'berkembang', '2026-01-28 17:11:26'),
('1607910412080067', NULL, 'Siti Maryam', 'Jl. Pasir Merenti N4', '082345678912', 'rintisan', '2026-01-23 17:11:26'),
('1607901810127266', NULL, 'Sri Wahyu', 'Jl. Pasir Pemenahan Manyaran', '081234891567', 'belum_usaha', '2026-01-10 17:11:26'),
('1607911301722060', NULL, 'Sri Zulfiani', 'Jl. Kampung Salo Pekan', '085267891234', 'berkembang', '2026-01-26 17:11:26'),
('1607910406170079', NULL, 'Sunarti', 'Jl. Batik Meranti N4', '082378945612', 'rintisan', '2026-01-17 17:11:26'),
('0805230130302', NULL, 'Dapan rum Tanah Sari', 'Pekanbaru', '081267453891', 'belum_usaha', '2026-01-09 17:11:26'),
('1607911510070030', NULL, 'Ade Irma Idayanti', 'Jl.amad Yani Kampar', '082345891267', 'berkembang', '2026-01-29 17:11:26'),
('1607911413250054', NULL, 'Veni Hartir', 'Jl. Pesiar Merenti N4', 'Rumah', 'belum_usaha', '2026-01-14 17:11:26'),
('1607912801580079', NULL, 'Wueni D', 'Jl. Kampung Salo Pekan', '081234567893', 'rintisan', '2026-01-18 17:11:26'),
('1607840206170055', NULL, 'Yulaida', 'Jl. Saidurol Bentran de dewangan', '085298745632', 'belum_usaha', '2026-01-12 17:11:26'),
('0805230200201', NULL, 'Yusriani', 'Jl. Kampung Olo', '082367894512', 'berkembang', '2026-01-30 17:11:26');

-- Verifikasi total data
SELECT COUNT(*) as "Total Mustahik yang Berhasil Ditambahkan" FROM app."Mustahik";

-- Lihat semua data
SELECT nik, name, address, phone, "businessStatus" FROM app."Mustahik" ORDER BY name;
