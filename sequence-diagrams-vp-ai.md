# Sequence Diagram Specification — Visual Paradigm AI Diagram
# Sistem Seleksi Zakat Produktif MOORA
# Format: Natural Language / Structured Text untuk AI Diagram Generator

---

## UC-01: Login

Actors: Surveyor, Manajer, Mustahik, Muzakki
Objects: Login Component, api service, authController, PrismaClient, localStorage

Steps:
1. Surveyor sends "Isi email dan password lalu submit" to Login Component
2. Manajer sends "Isi email dan password lalu submit" to Login Component
3. Mustahik sends "Isi email dan password lalu submit" to Login Component
4. Muzakki sends "Isi email dan password lalu submit" to Login Component
5. Login Component sends "api.login(email, password)" to api service
6. api service sends "POST /api/login" to authController
7. authController sends "user.findUnique(where email)" to PrismaClient
8. PrismaClient returns "User record atau null" to authController

Alternative: Kredensial valid dan akun aktif
9. authController sends "jwt.sign(id, role)" to itself
10. authController returns "200 token dan user" to api service
11. api service returns "token dan user" to Login Component
12. Login Component sends "setItem(token)" to localStorage
13. Login Component returns "navigate ke Dashboard Surveyor" to Surveyor
14. Login Component returns "navigate ke Dashboard Manajer" to Manajer
15. Login Component returns "navigate ke Dashboard Mustahik" to Mustahik
16. Login Component returns "navigate ke Dashboard Muzakki" to Muzakki

Alternative: Kredensial salah
9. authController returns "401 Unauthorized" to api service
10. api service returns "throw Error Login failed" to Login Component
11. Login Component returns "Tampilkan pesan error" to Surveyor

Alternative: Akun nonaktif
9. authController returns "403 Forbidden" to api service
10. Login Component returns "Tampilkan akun tidak aktif" to Surveyor

---

## UC-02: Register Akun

Actors: Mustahik, Muzakki
Objects: Register Component, api service, authController, PrismaClient, localStorage

Steps:
1. Mustahik sends "Pilih role mustahik lalu isi form dan submit" to Register Component
2. Muzakki sends "Pilih role muzakki lalu isi form dan submit" to Register Component
3. Register Component sends "api.register(role, nik, name, email, phone, password)" to api service
4. api service sends "POST /api/register" to authController
5. authController sends "user.findUnique(where email)" to PrismaClient

Alternative: Email unik
6. authController sends "bcrypt.hash(password)" to PrismaClient
7. authController sends "user.create() dan buat profil mustahik atau muzakki" to PrismaClient
8. PrismaClient returns "user dan profile baru" to authController
9. authController sends "jwt.sign(id, role)" to itself
10. authController returns "201 token dan user" to api service
11. api service returns "token dan user" to Register Component
12. Register Component sends "setItem(token)" to localStorage
13. Register Component returns "navigate ke Dashboard Mustahik" to Mustahik
14. Register Component returns "navigate ke Dashboard Muzakki" to Muzakki

Alternative: Email sudah terdaftar
6. authController returns "409 Conflict" to api service
7. api service returns "throw Error email sudah digunakan" to Register Component
8. Register Component returns "Tampilkan pesan error" to Mustahik

Alternative: Field wajib kosong
6. Register Component returns "Validasi client-side per field" to Mustahik

---

## UC-03: Lihat Dashboard

Actors: Surveyor, Manajer, Mustahik, Muzakki
Objects: DashboardModule, SurveyorDashboard, MuzakkiDashboard, api service, muzakkiController, PrismaClient

Steps:
1. DashboardModule sends "Baca role dari token JWT" to itself

Alternative: Role surveyor atau manajer
2. Surveyor sends "Buka Dashboard" to DashboardModule
3. Manajer sends "Buka Dashboard" to DashboardModule
4. DashboardModule sends "getMustahik() dan getPrograms() dan getHistory()" to api service
5. api service sends "Query mustahik dan programs dan history" to PrismaClient
6. PrismaClient returns "Data statistik" to api service
7. api service returns "Return data arrays" to DashboardModule
8. DashboardModule sends "render dengan data" to SurveyorDashboard
9. SurveyorDashboard returns "Tampilkan statistik survei dan program" to Surveyor
10. SurveyorDashboard returns "Tampilkan statistik survei dan program" to Manajer

Alternative: Role mustahik
2. Mustahik sends "Buka Dashboard" to DashboardModule
3. DashboardModule sends "getMustahik() dan getMonitoring() dan getHistory()" to api service
4. api service sends "Query data personal mustahik" to PrismaClient
5. PrismaClient returns "Data personal" to api service
6. api service returns "Return data" to DashboardModule
7. DashboardModule returns "Tampilkan status penerimaan dan monitoring pribadi" to Mustahik

Alternative: Role muzakki
2. Muzakki sends "Buka Dashboard" to DashboardModule
3. DashboardModule sends "render MuzakkiDashboard" to MuzakkiDashboard
4. MuzakkiDashboard sends "getMuzakkiDashboard()" to api service
5. api service sends "GET /api/muzakki/dashboard" to muzakkiController
6. muzakkiController sends "Query donasi dan program milik muzakki" to PrismaClient
7. PrismaClient returns "globalStats dan personalStats dan myPrograms" to muzakkiController
8. muzakkiController returns "200 dashboard data" to api service
9. api service returns "Return data" to MuzakkiDashboard
10. MuzakkiDashboard returns "Tampilkan ringkasan donasi dan program" to Muzakki

---

## UC-04: Kelola Data Mustahik

Actors: Surveyor, Manajer, Mustahik
Objects: MustahikDatabase, MustahikForm, api service, mustahikController, PrismaClient

Steps:
1. Surveyor sends "Buka menu Mustahik" to MustahikDatabase
2. Manajer sends "Buka menu Mustahik" to MustahikDatabase
3. Mustahik sends "Buka menu Mustahik" to MustahikDatabase
4. MustahikDatabase sends "api.getMustahik()" to api service
5. api service sends "GET /api/mustahik" to mustahikController
6. mustahikController sends "mustahik.findMany(include subCriteriaScores)" to PrismaClient
7. PrismaClient returns "Mustahik array" to mustahikController
8. mustahikController returns "200 list mustahik" to api service
9. api service returns "Return array" to MustahikDatabase
10. MustahikDatabase returns "Render daftar mustahik" to Surveyor
11. MustahikDatabase returns "Render daftar mustahik" to Manajer
12. MustahikDatabase returns "Render data mustahik milik sendiri" to Mustahik

Alternative: Tambah Mustahik oleh Surveyor atau Manajer
13. Surveyor sends "Klik Tambah" to MustahikDatabase
14. MustahikDatabase sends "render MustahikForm" to MustahikForm
15. Surveyor sends "Isi form lalu submit" to MustahikForm
16. MustahikForm sends "api.createMustahik(data)" to api service
17. api service sends "POST /api/mustahik" to mustahikController
18. mustahikController sends "mustahik.create(data)" to PrismaClient
19. PrismaClient returns "Mustahik baru" to mustahikController
20. mustahikController returns "201 mustahik" to api service
21. api service returns "Update state mustahik array" to MustahikDatabase
22. MustahikDatabase returns "Data baru tampil di tabel" to Surveyor

Alternative: Edit Mustahik oleh Surveyor atau Manajer
13. Surveyor sends "Klik Edit pada baris" to MustahikDatabase
14. MustahikDatabase sends "render form dengan data awal" to MustahikForm
15. Surveyor sends "Ubah data lalu submit" to MustahikForm
16. MustahikForm sends "api.updateMustahik(id, data)" to api service
17. api service sends "PUT /api/mustahik/:id" to mustahikController
18. mustahikController sends "mustahik.update(where id)" to PrismaClient
19. PrismaClient returns "Mustahik terupdate" to mustahikController
20. mustahikController returns "200 mustahik" to api service
21. api service returns "Update item di state" to MustahikDatabase
22. MustahikDatabase returns "Data terbaru tampil" to Surveyor

Alternative: Hapus Mustahik oleh Surveyor atau Manajer
13. Manajer sends "Klik Hapus lalu konfirmasi" to MustahikDatabase
14. MustahikDatabase sends "api.deleteMustahik(id)" to api service
15. api service sends "DELETE /api/mustahik/:id" to mustahikController
16. mustahikController sends "mustahik.delete(where id)" to PrismaClient
17. PrismaClient returns "Sukses" to mustahikController
18. mustahikController returns "200 OK" to api service
19. api service returns "Hapus dari state" to MustahikDatabase
20. MustahikDatabase returns "Baris hilang dari tabel" to Manajer

---

## UC-05: Input Survei dan Penilaian Kriteria

Actors: Surveyor, Manajer
Objects: MustahikDatabase, api service, mustahikController, criteriaController, PrismaClient, mooraCalculations

Steps:
1. Surveyor sends "Buka form penilaian mustahik" to MustahikDatabase
2. Manajer sends "Buka form penilaian mustahik" to MustahikDatabase
3. MustahikDatabase sends "api.getCriteria()" to api service
4. api service sends "GET /api/criteria" to criteriaController
5. criteriaController sends "criteria.findMany(include subCriteria)" to PrismaClient
6. PrismaClient returns "Criteria array" to criteriaController
7. criteriaController returns "200 criteria" to api service
8. api service returns "Return criteria" to MustahikDatabase
9. MustahikDatabase returns "Tampilkan form sub-kriteria" to Surveyor
10. MustahikDatabase returns "Tampilkan form sub-kriteria" to Manajer
11. Surveyor sends "Isi nilai sub-kriteria lalu simpan" to MustahikDatabase
12. MustahikDatabase sends "api.updateMustahik(id, subCriteriaScores)" to api service
13. api service sends "PUT /api/mustahik/:id" to mustahikController
14. mustahikController sends "mustahik.update() dan upsert subCriteriaScores" to PrismaClient
15. PrismaClient returns "Mustahik terupdate" to mustahikController
16. mustahikController returns "200 mustahik" to api service
17. api service returns "Update state mustahik array" to MustahikDatabase
18. MustahikDatabase sends "state mustahik berubah re-evaluate rankings" to mooraCalculations
19. mooraCalculations sends "Normalisasi dan bobot dan hitung Yi" to itself
20. mooraCalculations returns "Return rankedMustahik array" to MustahikDatabase
21. MustahikDatabase returns "Tampilkan skor MOORA yang diperbarui" to Surveyor
22. MustahikDatabase returns "Tampilkan skor MOORA yang diperbarui" to Manajer

---

## UC-06: Lihat Detail Mustahik

Actors: Surveyor, Manajer, Mustahik
Objects: MustahikDatabase, api service, monitoringController, PrismaClient

Steps:
1. Surveyor sends "Klik baris mustahik" to MustahikDatabase
2. Manajer sends "Klik baris mustahik" to MustahikDatabase
3. Mustahik sends "Klik data mustahik miliknya" to MustahikDatabase
4. MustahikDatabase returns "Buka panel detail dari state" to Surveyor
5. MustahikDatabase returns "Buka panel detail dari state" to Manajer
6. MustahikDatabase returns "Buka panel detail dari state" to Mustahik
7. MustahikDatabase sends "api.getMonitoring()" to api service
8. api service sends "GET /api/monitoring" to monitoringController
9. monitoringController sends "monitoringRecord.findMany()" to PrismaClient
10. PrismaClient returns "MonitoringRecord array" to monitoringController
11. monitoringController returns "200 monitoring" to api service
12. api service returns "Return monitoring array" to MustahikDatabase
13. MustahikDatabase sends "Filter monitoring by mustahikId" to itself
14. MustahikDatabase sends "Hitung tren profit dari data monitoring" to itself
15. MustahikDatabase returns "Render profil dan kriteria dan skor MOORA dan grafik" to Surveyor
16. MustahikDatabase returns "Render profil dan kriteria dan skor MOORA dan grafik" to Manajer
17. MustahikDatabase returns "Render profil dan kriteria dan skor MOORA dan grafik" to Mustahik

Alternative: Belum ada monitoring
18. MustahikDatabase returns "Grafik kosong - Belum ada data monitoring" to Surveyor

---

## UC-07: Filter dan Cari Mustahik

Actors: Surveyor, Manajer, Mustahik
Objects: MustahikDatabase

Steps:
1. Surveyor sends "Ketik kata kunci di kolom pencarian" to MustahikDatabase
2. Manajer sends "Ketik kata kunci di kolom pencarian" to MustahikDatabase
3. Mustahik sends "Ketik kata kunci di kolom pencarian" to MustahikDatabase
4. MustahikDatabase sends "mustahik.filter(name atau address includes query)" to itself
5. MustahikDatabase returns "Re-render tabel dengan hasil filter" to Surveyor
6. MustahikDatabase returns "Re-render tabel dengan hasil filter" to Manajer
7. MustahikDatabase returns "Re-render tabel dengan hasil filter" to Mustahik

Alternative: Tidak ada hasil
8. MustahikDatabase returns "Render empty state Tidak ada data" to Surveyor

---

## UC-08: Kelola Data Muzakki

Actors: Manajer, Muzakki
Objects: MuzakkiManagement, api service, muzakkiController, PrismaClient

Steps:
1. Manajer sends "Buka menu Muzakki" to MuzakkiManagement
2. Muzakki sends "Buka menu Muzakki untuk lihat dan edit data sendiri" to MuzakkiManagement
3. MuzakkiManagement sends "api.getMuzakkis()" to api service
4. api service sends "GET /api/muzakki" to muzakkiController
5. muzakkiController sends "muzakki.findMany(include donations)" to PrismaClient
6. PrismaClient returns "Muzakki array" to muzakkiController
7. muzakkiController returns "200 list muzakki" to api service
8. api service returns "Return array" to MuzakkiManagement
9. MuzakkiManagement returns "Render tabel semua muzakki" to Manajer
10. MuzakkiManagement returns "Render data muzakki milik sendiri" to Muzakki

Alternative: Tambah Muzakki oleh Manajer
11. Manajer sends "Klik Tambah lalu isi form dan submit" to MuzakkiManagement
12. MuzakkiManagement sends "api.createMuzakki(nik, name, email, phone)" to api service
13. api service sends "POST /api/muzakki" to muzakkiController
14. muzakkiController sends "muzakki.create(data)" to PrismaClient
15. PrismaClient returns "Muzakki baru" to muzakkiController
16. muzakkiController returns "201 muzakki" to api service
17. api service returns "Update state" to MuzakkiManagement
18. MuzakkiManagement returns "Baris baru muncul" to Manajer

Alternative: Edit Muzakki oleh Manajer atau Muzakki sendiri
11. Manajer sends "Klik Edit lalu ubah data dan submit" to MuzakkiManagement
12. Muzakki sends "Edit data diri sendiri lalu submit" to MuzakkiManagement
13. MuzakkiManagement sends "api.updateMuzakki(id, data)" to api service
14. api service sends "PUT /api/muzakki/:id" to muzakkiController
15. muzakkiController sends "muzakki.update(where id)" to PrismaClient
16. PrismaClient returns "Muzakki terupdate" to muzakkiController
17. muzakkiController returns "200 muzakki" to api service
18. api service returns "Update state" to MuzakkiManagement
19. MuzakkiManagement returns "Data terbaru tampil" to Manajer

Alternative: Hapus Muzakki oleh Manajer
11. Manajer sends "Klik Hapus lalu konfirmasi" to MuzakkiManagement
12. MuzakkiManagement sends "api.deleteMuzakki(id)" to api service
13. api service sends "DELETE /api/muzakki/:id" to muzakkiController
14. muzakkiController sends "muzakki.delete(where id)" to PrismaClient
15. PrismaClient returns "Sukses" to muzakkiController
16. muzakkiController returns "200 OK" to api service
17. api service returns "Hapus dari state" to MuzakkiManagement
18. MuzakkiManagement returns "Baris hilang" to Manajer

---

## UC-09: Catat Donasi Muzakki via Midtrans Snap

Actors: Muzakki
Objects: MuzakkiDashboard, api service, paymentController, PrismaClient, Midtrans Snap SDK

Steps:
1. Muzakki sends "Klik Donasi Sekarang" to MuzakkiDashboard
2. MuzakkiDashboard returns "Buka Dialog modal pencatatan donasi" to Muzakki
3. Muzakki sends "Pilih program dan input nominal lalu klik Konfirmasi" to MuzakkiDashboard
4. MuzakkiDashboard sends "Validasi programId dan amount lebih dari 0" to itself
5. MuzakkiDashboard sends "api.donate(amount, programId)" to api service
6. api service sends "POST /api/muzakki/donate" to paymentController
7. paymentController sends "donation.create(status pending)" to PrismaClient
8. PrismaClient returns "donationId" to paymentController
9. paymentController sends "createTransaction(orderId, amount, customer)" to Midtrans Snap SDK
10. Midtrans Snap SDK returns "snapToken" to paymentController
11. paymentController returns "200 token dan donationId" to api service
12. api service returns "Return token dan donationId" to MuzakkiDashboard
13. MuzakkiDashboard sends "setIsDonationModalOpen(false)" to itself
14. MuzakkiDashboard returns "toast verifikasi akad zakat 8 detik" to Muzakki
15. MuzakkiDashboard sends "window.snap.pay(token, callbacks)" to Midtrans Snap SDK
16. Midtrans Snap SDK returns "Render popup pembayaran Midtrans" to Muzakki
17. Muzakki sends "Pilih metode dan selesaikan transaksi" to Midtrans Snap SDK

Alternative: onSuccess - Pembayaran berhasil
18. Midtrans Snap SDK returns "Callback onSuccess(result)" to MuzakkiDashboard
19. MuzakkiDashboard sends "api.verifyPayment(donationId)" to api service
20. api service sends "GET /api/muzakki/verify-payment/:orderId" to paymentController
21. paymentController sends "donation.update(status success)" to PrismaClient
22. PrismaClient returns "Sukses" to paymentController
23. paymentController returns "200 OK" to api service
24. api service returns "resolved" to MuzakkiDashboard
25. MuzakkiDashboard returns "toast Alhamdulillah Donasi berhasil" to Muzakki
26. MuzakkiDashboard sends "window.location.reload()" to itself

Alternative: onPending - Pembayaran tertunda
18. Midtrans Snap SDK returns "Callback onPending(result)" to MuzakkiDashboard
19. MuzakkiDashboard sends "api.verifyPayment(donationId)" to api service
20. api service sends "GET /api/muzakki/verify-payment/:orderId" to paymentController
21. paymentController sends "donation.update(status pending)" to PrismaClient
22. PrismaClient returns "Sukses" to paymentController
23. paymentController returns "200 OK" to api service
24. MuzakkiDashboard returns "toast Pembayaran tertunda" to Muzakki
25. MuzakkiDashboard sends "window.location.reload()" to itself

Alternative: onError - Error pembayaran
18. Midtrans Snap SDK returns "Callback onError(result)" to MuzakkiDashboard
19. MuzakkiDashboard returns "toast error kesalahan pembayaran" to Muzakki

Alternative: onClose - Popup ditutup
18. Midtrans Snap SDK returns "Callback onClose()" to MuzakkiDashboard

---

## UC-09b: Catat Donasi oleh Manajer

Actors: Manajer
Objects: MuzakkiManagement, api service, muzakkiController, PrismaClient

Steps:
1. Manajer sends "Input donasi mewakili muzakki" to MuzakkiManagement
2. MuzakkiManagement sends "api.createDonation(muzakkiId, programId, amount)" to api service
3. api service sends "POST /api/donations" to muzakkiController
4. muzakkiController sends "donation.create(status success)" to PrismaClient
5. PrismaClient returns "Donation baru" to muzakkiController
6. muzakkiController returns "201 donation" to api service
7. api service returns "Update state donasi" to MuzakkiManagement
8. MuzakkiManagement returns "Donasi berhasil dicatat" to Manajer

---

## UC-10: Lihat Riwayat Donasi

Actors: Manajer, Muzakki
Objects: MuzakkiDashboard, MuzakkiManagement, api service, muzakkiController, PrismaClient

Alternative: Role muzakki - lihat riwayat pribadi
1. Muzakki sends "Buka Dashboard" to MuzakkiDashboard
2. MuzakkiDashboard sends "api.getMuzakkiDashboard()" to api service
3. api service sends "GET /api/muzakki/dashboard" to muzakkiController
4. muzakkiController sends "Query donasi milik muzakki yang login" to PrismaClient
5. PrismaClient returns "personalStats dan myPrograms" to muzakkiController
6. muzakkiController returns "200 dashboard data" to api service
7. api service returns "Return data" to MuzakkiDashboard
8. MuzakkiDashboard returns "Render riwayat donasi pribadi" to Muzakki

Alternative: Role manajer - lihat semua donasi
1. Manajer sends "Buka menu Muzakki" to MuzakkiManagement
2. MuzakkiManagement sends "api.getMuzakkis()" to api service
3. api service sends "GET /api/muzakki" to muzakkiController
4. muzakkiController sends "muzakki.findMany(include donations)" to PrismaClient
5. PrismaClient returns "Muzakki beserta donasi" to muzakkiController
6. muzakkiController returns "200 list muzakki" to api service
7. api service returns "Return data" to MuzakkiManagement
8. MuzakkiManagement returns "Render tabel donasi semua muzakki" to Manajer

---

## UC-11: Kelola Program Bantuan

Actors: Manajer
Objects: AidPrograms, AidProgramForm, api service, programController, PrismaClient

Steps:
1. Manajer sends "Buka menu Program" to AidPrograms
2. AidPrograms sends "api.getPrograms()" to api service
3. api service sends "GET /api/programs" to programController
4. programController sends "aidProgram.findMany(include donations dan recipientHistory)" to PrismaClient
5. PrismaClient returns "AidProgram array" to programController
6. programController returns "200 list programs" to api service
7. api service returns "Return array" to AidPrograms
8. AidPrograms returns "Render daftar program" to Manajer

Alternative: Tambah Program
9. Manajer sends "Klik Tambah Program" to AidPrograms
10. AidPrograms sends "render AidProgramForm" to AidProgramForm
11. Manajer sends "Isi form lalu submit" to AidProgramForm
12. AidProgramForm sends "api.createProgram(name, budget, quota, periode)" to api service
13. api service sends "POST /api/programs" to programController
14. programController sends "aidProgram.create(data)" to PrismaClient
15. PrismaClient returns "Program baru" to programController
16. programController returns "201 program" to api service
17. api service returns "Update state" to AidPrograms
18. AidPrograms returns "Program baru tampil di daftar" to Manajer

Alternative: Edit Program
9. Manajer sends "Klik Edit" to AidPrograms
10. AidPrograms sends "render form dengan data awal" to AidProgramForm
11. Manajer sends "Ubah data lalu submit" to AidProgramForm
12. AidProgramForm sends "api.updateProgram(id, data)" to api service
13. api service sends "PUT /api/programs/:id" to programController
14. programController sends "aidProgram.update(where id)" to PrismaClient
15. PrismaClient returns "Program terupdate" to programController
16. programController returns "200 program" to api service
17. api service returns "Update state" to AidPrograms
18. AidPrograms returns "Data terbaru tampil" to Manajer

Alternative: Hapus Program
9. Manajer sends "Klik Hapus lalu ConfirmDialog" to AidPrograms
10. AidPrograms sends "api.deleteProgram(id)" to api service
11. api service sends "DELETE /api/programs/:id" to programController
12. programController sends "aidProgram.delete(where id)" to PrismaClient
13. PrismaClient returns "Sukses" to programController
14. programController returns "200 OK" to api service
15. api service returns "Hapus dari state" to AidPrograms
16. AidPrograms returns "Program hilang dari daftar" to Manajer

---

## UC-12: Kelola Calon dan Penerima Program

Actors: Manajer
Objects: ProgramCandidates, CandidateForm, api service, historyController, mustahikController, PrismaClient, mooraCalculations

Steps:
1. Manajer sends "Buka program lalu tab Pilih Calon" to ProgramCandidates
2. ProgramCandidates sends "api.getMustahik()" to api service
3. api service sends "GET /api/mustahik" to mustahikController
4. mustahikController sends "mustahik.findMany(include subCriteriaScores)" to PrismaClient
5. PrismaClient returns "Mustahik array" to mustahikController
6. mustahikController returns "200 mustahik" to api service
7. api service returns "Return mustahik array" to ProgramCandidates
8. ProgramCandidates sends "computeRankings(mustahik, criteria)" to mooraCalculations
9. mooraCalculations returns "rankedMustahik array sort by yi DESC" to ProgramCandidates
10. ProgramCandidates returns "Render tabel kandidat berurut skor MOORA" to Manajer
11. CandidateForm sends "setSelectedIds(array)" to ProgramCandidates
12. Manajer sends "Klik Tetapkan Penerima" to ProgramCandidates
13. ProgramCandidates sends "api.createHistory(programId, mustahikIds, amount)" to api service
14. api service sends "POST /api/history" to historyController
15. historyController sends "recipientHistory.createMany(data per penerima)" to PrismaClient
16. historyController sends "aidProgram.update(status completed)" to PrismaClient
17. PrismaClient returns "Sukses" to historyController
18. historyController returns "201 recipients" to api service
19. api service returns "Update state program" to ProgramCandidates
20. ProgramCandidates returns "Penerima berhasil ditetapkan" to Manajer

Alternative: Program sudah completed
21. ProgramCandidates returns "Tombol Tetapkan disabled" to Manajer

---

## UC-13: Hitung Perangkingan MOORA

Objects: React State, useMemo Hook, mooraCalculations, Komponen UI
Note: Tidak ada actor. Proses otomatis dipicu saat state berubah.

Steps:
1. React State sends "Dependency array berubah" to useMemo Hook
2. useMemo Hook sends "computeRankings(mustahik, criteria)" to mooraCalculations
3. mooraCalculations sends "Step 1 Bangun matriks keputusan xij dari subCriteriaScores" to itself
4. mooraCalculations sends "Step 2 Normalisasi vektor xij dibagi akar jumlah xij kuadrat" to itself
5. mooraCalculations sends "Step 3 Rata-rata normalisasi per kriteria utama" to itself
6. mooraCalculations sends "Step 4 Bobot normalisasi dikali criteria weight" to itself
7. mooraCalculations sends "Step 5 Yi sama dengan jumlah benefit dikurangi jumlah cost" to itself
8. mooraCalculations sends "Step 6 Sort DESC by Yi lalu assign rank" to itself
9. mooraCalculations returns "Return rankedMustahik array" to useMemo Hook
10. useMemo Hook returns "Memoized result" to Komponen UI
11. Komponen UI sends "Re-render tabel perangkingan reactif" to itself

---

## UC-14: Lihat Hasil Perangkingan

Actors: Manajer
Objects: ProgramCandidates, ResultsTable, api service, mustahikController, criteriaController, PrismaClient, mooraCalculations

Steps:
1. Manajer sends "Buka program lalu tab Hasil MOORA" to ProgramCandidates
2. ProgramCandidates sends "getMustahik() dan getCriteria()" to api service
3. api service sends "GET /api/mustahik" to mustahikController
4. api service sends "GET /api/criteria" to criteriaController
5. mustahikController sends "mustahik.findMany(include subCriteriaScores)" to PrismaClient
6. criteriaController sends "criteria.findMany(include subCriteria)" to PrismaClient
7. PrismaClient returns "Mustahik array" to mustahikController
8. PrismaClient returns "Criteria array" to criteriaController
9. mustahikController returns "200 mustahik" to api service
10. criteriaController returns "200 criteria" to api service
11. api service returns "Return data" to ProgramCandidates
12. ProgramCandidates sends "computeRankings(mustahik, criteria)" to mooraCalculations
13. mooraCalculations returns "rankedMustahik array" to ProgramCandidates
14. ProgramCandidates sends "render ResultsTable dengan rankings" to ResultsTable
15. ResultsTable returns "Tabel rank dan nama dan skor Yi" to Manajer

Optional: Filter atau pencarian client-side
16. Manajer sends "Input filter" to ResultsTable
17. ResultsTable sends "filter dari rankedMustahik" to itself
18. ResultsTable returns "Tabel diperbarui" to Manajer

---

## UC-15: Lihat Detail Perhitungan

Actors: Manajer
Objects: ResultsTable, mooraCalculations

Steps:
1. Manajer sends "Klik baris mustahik" to ResultsTable
2. ResultsTable sends "computeDetail(mustahikId)" to mooraCalculations
3. mooraCalculations sends "Step 1 Nilai asli xij matriks keputusan" to itself
4. mooraCalculations sends "Step 2 Normalisasi vektor per sub-kriteria" to itself
5. mooraCalculations sends "Step 3 Rata-rata normalisasi per kriteria" to itself
6. mooraCalculations sends "Step 4 Matriks ternormalisasi terbobot" to itself
7. mooraCalculations sends "Step 5 Yi rinci per kriteria benefit dan cost" to itself
8. mooraCalculations sends "Step 6 Peringkat akhir" to itself
9. mooraCalculations returns "Return step 1 sampai step 6" to ResultsTable
10. ResultsTable returns "Render tabel detail tiap tahapan MOORA" to Manajer

Alternative: Nilai sub-kriteria kosong
11. ResultsTable returns "Detail perhitungan tidak tersedia" to Manajer

---

## UC-16: Kelola Kriteria dan Bobot

Actors: Manajer
Objects: CriteriaManager, CriteriaInfo, api service, criteriaController, PrismaClient

Steps:
1. Manajer sends "Buka menu Kriteria" to CriteriaManager
2. CriteriaManager sends "api.getCriteria()" to api service
3. api service sends "GET /api/criteria" to criteriaController
4. criteriaController sends "criteria.findMany(include subCriteria dan options)" to PrismaClient
5. PrismaClient returns "Criteria array" to criteriaController
6. criteriaController returns "200 criteria" to api service
7. api service returns "Return array" to CriteriaManager
8. CriteriaManager sends "render CriteriaInfo dengan criteria" to CriteriaInfo
9. CriteriaInfo returns "Tampilkan daftar kriteria dan sub-kriteria" to Manajer
10. Manajer sends "Klik Kelola Kriteria lalu ubah bobot atau nama" to CriteriaManager
11. CriteriaManager sends "Validasi total bobot sama dengan 100 persen" to itself

Alternative: Bobot valid
12. CriteriaManager sends "api.updateCriteria(criteria array)" to api service
13. api service sends "PUT /api/criteria" to criteriaController
14. criteriaController sends "prisma.transaction() update semua criteria sekaligus" to PrismaClient
15. PrismaClient returns "Semua terupdate" to criteriaController
16. criteriaController returns "200 criteria terupdate" to api service
17. api service returns "Update state criteria" to CriteriaManager
18. CriteriaManager returns "Perubahan berhasil disimpan" to Manajer

Alternative: Total bobot tidak valid
12. CriteriaManager returns "Total bobot harus 100 persen" to Manajer

---

## UC-17: Input Data Monitoring

Actors: Surveyor, Manajer, Mustahik
Objects: MonitoringModule, MonitoringForm, api service, monitoringController, PrismaClient

Steps:
1. Surveyor sends "Buka menu Monitoring lalu klik Tambah" to MonitoringModule
2. Manajer sends "Buka menu Monitoring lalu klik Tambah" to MonitoringModule
3. Mustahik sends "Buka menu Monitoring lalu klik Tambah" to MonitoringModule
4. MonitoringModule sends "render MonitoringForm" to MonitoringForm
5. MonitoringForm returns "Tampilkan formulir monitoring" to Surveyor
6. MonitoringForm returns "Tampilkan formulir monitoring" to Manajer
7. MonitoringForm returns "Tampilkan formulir monitoring" to Mustahik

Alternative: Role Surveyor atau Manajer
8. Surveyor sends "Pilih mustahik dari dropdown lalu isi form dan simpan" to MonitoringForm
9. Manajer sends "Pilih mustahik dari dropdown lalu isi form dan simpan" to MonitoringForm

Alternative: Role Mustahik
8. Mustahik sends "Isi form langsung - mustahikId dari token JWT" to MonitoringForm

Continuation:
9. MonitoringForm sends "api.createMonitoring(mustahikId, programId, data)" to api service
10. api service sends "POST /api/monitoring" to monitoringController
11. monitoringController sends "monitoringRecord.create(data)" to PrismaClient
12. PrismaClient returns "MonitoringRecord baru" to monitoringController
13. monitoringController returns "201 monitoring" to api service
14. api service returns "Update state monitoring array" to MonitoringModule
15. MonitoringModule returns "Data baru muncul di daftar" to Surveyor
16. MonitoringModule returns "Data baru muncul di daftar" to Manajer
17. MonitoringModule returns "Data baru muncul di daftar" to Mustahik

---

## UC-18: Lihat Riwayat Monitoring

Actors: Surveyor, Manajer, Mustahik
Objects: MonitoringModule, api service, monitoringController, PrismaClient

Steps:
1. Surveyor sends "Buka menu Monitoring" to MonitoringModule
2. Manajer sends "Buka menu Monitoring" to MonitoringModule
3. Mustahik sends "Buka menu Monitoring" to MonitoringModule
4. MonitoringModule sends "api.getMonitoring()" to api service
5. api service sends "GET /api/monitoring" to monitoringController
6. monitoringController sends "monitoringRecord.findMany(include mustahik dan program)" to PrismaClient
7. PrismaClient returns "MonitoringRecord array" to monitoringController
8. monitoringController returns "200 monitoring" to api service
9. api service returns "Return array" to MonitoringModule
10. MonitoringModule sends "Filter by role - Mustahik hanya lihat miliknya" to itself
11. MonitoringModule returns "Render semua riwayat monitoring" to Surveyor
12. MonitoringModule returns "Render semua riwayat monitoring" to Manajer
13. MonitoringModule returns "Render riwayat monitoring milik sendiri" to Mustahik

Optional: Filter atau pencarian client-side
14. Surveyor sends "Input filter" to MonitoringModule
15. MonitoringModule sends "filter dari monitoring array di state" to itself
16. MonitoringModule returns "Daftar diperbarui" to Surveyor

---

## UC-19: Lihat Detail Monitoring

Actors: Surveyor, Manajer, Mustahik
Objects: MonitoringModule

Steps:
1. Surveyor sends "Klik baris monitoring" to MonitoringModule
2. Manajer sends "Klik baris monitoring" to MonitoringModule
3. Mustahik sends "Klik baris monitoring miliknya" to MonitoringModule
4. MonitoringModule sends "setSelectedMonitoring(record)" to itself
5. MonitoringModule sends "Filter monitoring by mustahikId" to itself
6. MonitoringModule sends "Map omzet dan profit per tanggal untuk chart" to itself
7. MonitoringModule returns "Render detail usaha dan sosek dan grafik tren profit dan catatan" to Surveyor
8. MonitoringModule returns "Render detail usaha dan sosek dan grafik tren profit dan catatan" to Manajer
9. MonitoringModule returns "Render detail usaha dan sosek dan grafik tren profit milik sendiri" to Mustahik

---

## UC-20: Kelola Pengguna

Actors: Manajer
Objects: UserManagement, api service, userController, PrismaClient

Steps:
1. Manajer sends "Buka menu Pengguna" to UserManagement
2. UserManagement sends "api.getUsers()" to api service
3. api service sends "GET /api/users" to userController
4. userController sends "user.findMany(select id name email role isActive)" to PrismaClient
5. PrismaClient returns "User array" to userController
6. userController returns "200 users" to api service
7. api service returns "Return array" to UserManagement
8. UserManagement returns "Render daftar pengguna" to Manajer

Alternative: Tambah Pengguna
9. Manajer sends "Klik Tambah lalu isi form dan submit" to UserManagement
10. UserManagement sends "api.addUser(name, email, password, role)" to api service
11. api service sends "POST /api/users" to userController
12. userController sends "bcrypt.hash(password) lalu user.create(data)" to PrismaClient
13. PrismaClient returns "User baru" to userController
14. userController returns "201 user" to api service
15. api service returns "Update state" to UserManagement
16. UserManagement returns "Pengguna baru ditambahkan" to Manajer

Alternative: Edit atau Toggle isActive
9. Manajer sends "Klik Edit lalu ubah data dan submit" to UserManagement
10. UserManagement sends "api.updateUser(id, data, isActive)" to api service
11. api service sends "PUT /api/users/:id" to userController
12. userController sends "user.update(where id)" to PrismaClient
13. PrismaClient returns "User terupdate" to userController
14. userController returns "200 user" to api service
15. api service returns "Update state" to UserManagement
16. UserManagement returns "Data terbaru tampil" to Manajer

Alternative: Hapus Pengguna
9. Manajer sends "Klik Hapus lalu ConfirmDialog" to UserManagement
10. UserManagement sends "api.deleteUser(id)" to api service
11. api service sends "DELETE /api/users/:id" to userController
12. userController sends "user.delete(where id)" to PrismaClient
13. PrismaClient returns "Sukses" to userController
14. userController returns "200 OK" to api service
15. api service returns "Hapus dari state" to UserManagement
16. UserManagement returns "Pengguna dihapus" to Manajer

---

## UC-21: Lihat Riwayat Penerimaan

Actors: Surveyor, Manajer, Mustahik, Muzakki
Objects: RecipientTracking, api service, historyController, PrismaClient

Steps:
1. Surveyor sends "Buka menu Tracking" to RecipientTracking
2. Manajer sends "Buka menu Tracking" to RecipientTracking
3. Mustahik sends "Buka menu Tracking" to RecipientTracking
4. Muzakki sends "Buka menu Tracking" to RecipientTracking
5. RecipientTracking sends "api.getHistory()" to api service
6. api service sends "GET /api/history" to historyController
7. historyController sends "recipientHistory.findMany(include mustahik dan program, orderBy receivedDate)" to PrismaClient
8. PrismaClient returns "RecipientHistory array" to historyController
9. historyController returns "200 history" to api service
10. api service returns "Return array" to RecipientTracking
11. RecipientTracking sends "Filter by role - Mustahik dan Muzakki hanya lihat miliknya" to itself
12. RecipientTracking returns "Render semua riwayat penerimaan bantuan" to Surveyor
13. RecipientTracking returns "Render semua riwayat penerimaan bantuan" to Manajer
14. RecipientTracking returns "Render riwayat penerimaan bantuan milik sendiri" to Mustahik
15. RecipientTracking returns "Render riwayat penerimaan bantuan yang terhubung donasinya" to Muzakki

Optional: Pencarian client-side
16. Surveyor sends "Input kata kunci" to RecipientTracking
17. RecipientTracking sends "filter by mustahik.name atau program.name" to itself
18. RecipientTracking returns "Tabel diperbarui" to Surveyor

Alternative: Belum ada penerima ditetapkan
19. RecipientTracking returns "Render empty state dengan keterangan" to Mustahik
