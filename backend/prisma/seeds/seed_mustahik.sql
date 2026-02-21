-- Seed data untuk tabel Mustahik berdasarkan data yang ada
-- Schema: app.Mustahik

SET search_path TO app;

-- Insert data Mustahik
INSERT INTO "Mustahik" (nik, "userId", name, address, phone, "businessStatus", "registeredDate") VALUES
('1607911802330079', NULL, 'Aris Priyadi', 'Jl. Kubang Tuah', '082353198791', 'belum_usaha', NOW() - INTERVAL '30 days'),
('1607913003400786', NULL, 'Dayu Elima', 'Jl. Dupadik Rumbino', '085766843256', 'rintisan', NOW() - INTERVAL '25 days'),
('1607914612010000', NULL, 'Tedi Sartika', 'Jl. Kampung salo Pekan Mungka', '085311267891', 'berkembang', NOW() - INTERVAL '20 days'),
('1607915602170001', NULL, 'Nora Susanti', 'Jl. Marelan Pasar 2', '081267891234', 'belum_usaha', NOW() - INTERVAL '28 days'),
('1607915607170119', NULL, 'Harmi Yanti', 'Jl. Kampung Sungapui', '082156743921', 'rintisan', NOW() - INTERVAL '22 days'),
('1607912011380801', NULL, 'Remi Anita', 'Kampung Olo', '081237654891', 'belum_usaha', NOW() - INTERVAL '27 days'),
('1607911609550074', NULL, 'Eti Hairulaini', 'Jl. Saufinar Gulamat Pekanbaru', '085231789456', 'berkembang', NOW() - INTERVAL '18 days'),
('1607841112010018', NULL, 'Lela Yuslita', 'Jl. Dupadil Rumbino', '082345612789', 'rintisan', NOW() - INTERVAL '24 days'),
('1607911412093001', NULL, 'Mardiana', 'Jl. Pasir Merenti N4', '081298765432', 'belum_usaha', NOW() - INTERVAL '29 days'),
('1607840812092022', NULL, 'Mega Gail', 'Jl. Indra D Losaran', '085123456789', 'berkembang', NOW() - INTERVAL '15 days'),
('1607841008590770', NULL, 'Nadia Yolanda', 'Jl. Kampung Olo', '082314789652', 'rintisan', NOW() - INTERVAL '23 days'),
('1607913012110711', NULL, 'Nuri Santi', 'Jl. Mujahir', '081245678931', 'belum_usaha', NOW() - INTERVAL '26 days'),
('1607912608510006', NULL, 'Nurhayani', 'Jl. Kampung Sukapata', '085234567891', 'berkembang', NOW() - INTERVAL '17 days'),
('1607912508530050', NULL, 'Rizqa Sahar', 'Jl. Garuda Storomomo Manyaran', '082367891245', 'rintisan', NOW() - INTERVAL '21 days'),
('1607910011390050', NULL, 'Rubi Wani', 'Jl. Gamar Sugirat Kampung Olo', '081289453672', 'belum_usaha', NOW() - INTERVAL '31 days'),
('1607920823454950', NULL, 'Sri Nurdin', 'Jl. Haswa Kedingsan Sukapati', '085278934561', 'berkembang', NOW() - INTERVAL '14 days'),
('1607910412080067', NULL, 'Siti Maryam', 'Jl. Pasir Merenti N4', '082345678912', 'rintisan', NOW() - INTERVAL '19 days'),
('1607901810127266', NULL, 'Sri Wahyu', 'Jl. Pasir Pemenahan Manyaran', '081234891567', 'belum_usaha', NOW() - INTERVAL '32 days'),
('1607911301722060', NULL, 'Sri Zulfiani', 'Jl. Kampung Salo Pekan', '085267891234', 'berkembang', NOW() - INTERVAL '16 days'),
('1607910406170079', NULL, 'Sunarti', 'Jl. Batik Meranti N4', '082378945612', 'rintisan', NOW() - INTERVAL '25 days'),
('0805230130302', NULL, 'Dapan rum Tanah Sari', 'Pekanbaru', '081267453891', 'belum_usaha', NOW() - INTERVAL '33 days'),
('1607911510070030', NULL, 'Ade Irma Idayanti', 'Jl.amad Yani Kampar', '082345891267', 'berkembang', NOW() - INTERVAL '13 days'),
('1607911413250054', NULL, 'Veni Hartir', 'Jl. Pesiar Merenti N4', 'Rumah', 'belum_usaha', NOW() - INTERVAL '28 days'),
('1607912801580079', NULL, 'Wueni D', 'Jl. Kampung Salo Pekan', '081234567893', 'rintisan', NOW() - INTERVAL '24 days'),
('1607840206170055', NULL, 'Yulaida', 'Jl. Saidurol Bentran de dewangan', '085298745632', 'belum_usaha', NOW() - INTERVAL '30 days'),
('0805230200201', NULL, 'Yusriani', 'Jl. Kampung Olo', '082367894512', 'berkembang', NOW() - INTERVAL '12 days')
ON CONFLICT (nik) DO NOTHING;

-- Catatan:
-- 1. userId di-set NULL karena tidak ada relasi user yang spesifik
-- 2. businessStatus disesuaikan dengan enum: belum_usaha, rintisan, berkembang, maju
-- 3. registeredDate dibuat bervariasi menggunakan NOW() - INTERVAL untuk simulasi data historis
-- 4. Beberapa nomor telepon yang tidak valid di data asli (mis: "Rumah") dipertahankan untuk keakuratan data
